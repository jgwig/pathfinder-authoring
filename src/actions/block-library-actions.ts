"use server";

import { getPayload, Where } from "payload";
import config from "@/payload.config";
import { User } from "@/payload-types";
import type { ContentBlock, AnyBlockData } from "@/types/content";
import type {
	BlockLibraryItem,
	LibraryFilters,
	LibraryQueryResult,
} from "@/types/library";

/**
 * Deep clone a block and regenerate its UUID
 */
function cloneBlockWithNewId(
	block: ContentBlock<AnyBlockData>
): ContentBlock<AnyBlockData> {
	const cloned = JSON.parse(JSON.stringify(block));
	cloned.id = crypto.randomUUID();
	return cloned;
}

/**
 * Save a content block to the user's library
 */
export async function saveBlockToLibrary(
	user: User,
	name: string,
	block: ContentBlock<AnyBlockData>,
	description?: string,
	tags?: string[]
): Promise<{ success: boolean; item?: BlockLibraryItem; error?: string }> {
	const payload = await getPayload({ config });

	try {
		// Deep clone the block with a new ID
		const clonedBlock = cloneBlockWithNewId(block);

		const item = await payload.create({
			collection: "block-library",
			overrideAccess: false,
			user: user,
			data: {
				name,
				description: description || undefined,
				user: user.id,
				blockData: clonedBlock as unknown as Record<string, unknown>,
				blockType: block.type,
				tags: tags?.map((tag) => ({ tag })) || [],
			},
		});

		return { success: true, item: item as unknown as BlockLibraryItem };
	} catch (error) {
		console.error("Error saving block to library:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to save block to library",
		};
	}
}

/**
 * Get blocks from the user's library with optional filters
 */
export async function getBlockLibrary(
	user: User,
	filters?: LibraryFilters
): Promise<LibraryQueryResult<BlockLibraryItem>> {
	const payload = await getPayload({ config });

	try {
		// Build where clause based on filters
		const whereConditions: Where[] = [];

		// Filter by block type
		if (filters?.blockType) {
			whereConditions.push({
				blockType: { equals: filters.blockType },
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
			collection: "block-library",
			overrideAccess: false,
			user: user,
			where,
			sort,
			pagination: false,
		});

		return {
			docs: result.docs as unknown as BlockLibraryItem[],
			totalDocs: result.totalDocs,
		};
	} catch (error) {
		console.error("Error fetching block library:", error);
		return { docs: [], totalDocs: 0 };
	}
}

/**
 * Get a single block from the library by ID
 */
export async function getBlockFromLibrary(
	user: User,
	itemId: string
): Promise<{ success: boolean; item?: BlockLibraryItem; error?: string }> {
	const payload = await getPayload({ config });

	try {
		const item = await payload.findByID({
			collection: "block-library",
			id: itemId,
			overrideAccess: false,
			user: user,
		});

		return { success: true, item: item as unknown as BlockLibraryItem };
	} catch (error) {
		console.error("Error fetching block from library:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to fetch block from library",
		};
	}
}

/**
 * Delete a block from the user's library
 */
export async function deleteBlockFromLibrary(
	user: User,
	itemId: string
): Promise<{ success: boolean; error?: string }> {
	const payload = await getPayload({ config });

	try {
		await payload.delete({
			collection: "block-library",
			id: itemId,
			overrideAccess: false,
			user: user,
		});

		return { success: true };
	} catch (error) {
		console.error("Error deleting block from library:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to delete block from library",
		};
	}
}

/**
 * Update a block in the user's library
 */
export async function updateBlockInLibrary(
	user: User,
	itemId: string,
	updates: {
		name?: string;
		description?: string;
		tags?: string[];
	}
): Promise<{ success: boolean; item?: BlockLibraryItem; error?: string }> {
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
			collection: "block-library",
			id: itemId,
			overrideAccess: false,
			user: user,
			data,
		});

		return { success: true, item: item as unknown as BlockLibraryItem };
	} catch (error) {
		console.error("Error updating block in library:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to update block in library",
		};
	}
}
