"use server";

import { getPayload, Where } from "payload";
import config from "@/payload.config";
import { User } from "@/payload-types";
import type { ContentBlock, AnyBlockData, ContentBlockType } from "@/types/content";
import type { StageNodeData } from "@/types/flow/nodes";
import type {
	PageLibraryItem,
	LibraryFilters,
	LibraryQueryResult,
	LibraryStageData,
} from "@/types/library";

/**
 * Deep clone a block and regenerate its UUID
 */
function cloneBlockWithNewId(
	block: ContentBlock<AnyBlockData>
): ContentBlock<AnyBlockData> {
	const cloned = JSON.parse(JSON.stringify(block));
	cloned.id = crypto.randomUUID();

	// Handle nested blocks in Column and Dropdown types
	if (cloned.type === "column" && cloned.data) {
		if (cloned.data.leftColumn) {
			cloned.data.leftColumn = cloned.data.leftColumn.map(cloneBlockWithNewId);
		}
		if (cloned.data.rightColumn) {
			cloned.data.rightColumn = cloned.data.rightColumn.map(cloneBlockWithNewId);
		}
	}
	if (cloned.type === "dropdown" && cloned.data?.content) {
		cloned.data.content = cloned.data.content.map(cloneBlockWithNewId);
	}

	return cloned;
}

/**
 * Clone stage data with regenerated UUIDs for all blocks
 */
function cloneStageDataWithNewIds(stageData: StageNodeData): LibraryStageData {
	return {
		title: stageData.title,
		blocks: stageData.blocks.map(cloneBlockWithNewId),
		state: {}, // Clear form state
	};
}

/**
 * Extract unique block types from blocks (including nested)
 */
function extractBlockTypes(blocks: ContentBlock<AnyBlockData>[]): ContentBlockType[] {
	const types = new Set<ContentBlockType>();

	function collectTypes(block: ContentBlock<AnyBlockData>) {
		types.add(block.type);

		// Handle nested blocks
		if (block.type === "column" && block.data) {
			const data = block.data as { leftColumn?: ContentBlock<AnyBlockData>[]; rightColumn?: ContentBlock<AnyBlockData>[] };
			data.leftColumn?.forEach(collectTypes);
			data.rightColumn?.forEach(collectTypes);
		}
		if (block.type === "dropdown") {
			const data = block.data as { content?: ContentBlock<AnyBlockData>[] };
			data.content?.forEach(collectTypes);
		}
	}

	blocks.forEach(collectTypes);
	return Array.from(types);
}

/**
 * Count total blocks including nested
 */
function countBlocks(blocks: ContentBlock<AnyBlockData>[]): number {
	let count = 0;

	function countRecursive(block: ContentBlock<AnyBlockData>) {
		count++;

		// Handle nested blocks
		if (block.type === "column" && block.data) {
			const data = block.data as { leftColumn?: ContentBlock<AnyBlockData>[]; rightColumn?: ContentBlock<AnyBlockData>[] };
			data.leftColumn?.forEach(countRecursive);
			data.rightColumn?.forEach(countRecursive);
		}
		if (block.type === "dropdown") {
			const data = block.data as { content?: ContentBlock<AnyBlockData>[] };
			data.content?.forEach(countRecursive);
		}
	}

	blocks.forEach(countRecursive);
	return count;
}

/**
 * Save a page (stage node) to the user's library
 */
export async function savePageToLibrary(
	user: User,
	name: string,
	stageData: StageNodeData,
	description?: string,
	tags?: string[]
): Promise<{ success: boolean; item?: PageLibraryItem; error?: string }> {
	const payload = await getPayload({ config });

	try {
		// Clone stage data with new IDs and clear state
		const clonedStageData = cloneStageDataWithNewIds(stageData);

		// Calculate metadata
		const blockCount = countBlocks(stageData.blocks);
		const blockTypes = extractBlockTypes(stageData.blocks);

		const item = await payload.create({
			collection: "page-library",
			overrideAccess: false,
			user: user,
			data: {
				name,
				description: description || undefined,
				user: user.id,
				stageData: clonedStageData as unknown as Record<string, unknown>,
				blockCount,
				blockTypes,
				tags: tags?.map((tag) => ({ tag })) || [],
			},
		});

		return { success: true, item: item as unknown as PageLibraryItem };
	} catch (error) {
		console.error("Error saving page to library:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to save page to library",
		};
	}
}

/**
 * Get pages from the user's library with optional filters
 */
export async function getPageLibrary(
	user: User,
	filters?: LibraryFilters
): Promise<LibraryQueryResult<PageLibraryItem>> {
	const payload = await getPayload({ config });

	try {
		// Build where clause based on filters
		const whereConditions: Where[] = [];

		// Filter by block type (pages containing this block type)
		if (filters?.blockType) {
			whereConditions.push({
				blockTypes: { contains: filters.blockType },
			});
		}

		// Filter by search term (search in name and description)
		if (filters?.search) {
			whereConditions.push({
				or: [
					{ name: { contains: filters.search } },
					{ description: { contains: filters.search } },
				],
			});
		}

		// Filter by tags
		if (filters?.tags && filters.tags.length > 0) {
			whereConditions.push({
				"tags.tag": { in: filters.tags },
			});
		}

		const where: Where | undefined =
			whereConditions.length > 0 ? { and: whereConditions } : undefined;

		// Determine sort
		const sortField = filters?.sortBy || "createdAt";
		const sortOrder = filters?.sortOrder === "asc" ? "" : "-";
		const sort = `${sortOrder}${sortField}`;

		const result = await payload.find({
			collection: "page-library",
			overrideAccess: false,
			user: user,
			where,
			sort,
			pagination: false,
		});

		return {
			docs: result.docs as unknown as PageLibraryItem[],
			totalDocs: result.totalDocs,
		};
	} catch (error) {
		console.error("Error fetching page library:", error);
		return { docs: [], totalDocs: 0 };
	}
}

/**
 * Get a single page from the library by ID
 */
export async function getPageFromLibrary(
	user: User,
	itemId: string
): Promise<{ success: boolean; item?: PageLibraryItem; error?: string }> {
	const payload = await getPayload({ config });

	try {
		const item = await payload.findByID({
			collection: "page-library",
			id: itemId,
			overrideAccess: false,
			user: user,
		});

		return { success: true, item: item as unknown as PageLibraryItem };
	} catch (error) {
		console.error("Error fetching page from library:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to fetch page from library",
		};
	}
}

/**
 * Delete a page from the user's library
 */
export async function deletePageFromLibrary(
	user: User,
	itemId: string
): Promise<{ success: boolean; error?: string }> {
	const payload = await getPayload({ config });

	try {
		await payload.delete({
			collection: "page-library",
			id: itemId,
			overrideAccess: false,
			user: user,
		});

		return { success: true };
	} catch (error) {
		console.error("Error deleting page from library:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to delete page from library",
		};
	}
}

/**
 * Update a page in the user's library
 */
export async function updatePageInLibrary(
	user: User,
	itemId: string,
	updates: {
		name?: string;
		description?: string;
		tags?: string[];
	}
): Promise<{ success: boolean; item?: PageLibraryItem; error?: string }> {
	const payload = await getPayload({ config });

	try {
		const data: Record<string, unknown> = {};

		if (updates.name !== undefined) {
			data.name = updates.name;
		}
		if (updates.description !== undefined) {
			data.description = updates.description;
		}
		if (updates.tags !== undefined) {
			data.tags = updates.tags.map((tag) => ({ tag }));
		}

		const item = await payload.update({
			collection: "page-library",
			id: itemId,
			overrideAccess: false,
			user: user,
			data,
		});

		return { success: true, item: item as unknown as PageLibraryItem };
	} catch (error) {
		console.error("Error updating page in library:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to update page in library",
		};
	}
}
