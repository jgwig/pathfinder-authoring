import type { ContentBlock, ContentBlockType, AnyBlockData } from "./content";

/**
 * Block library item - represents a saved content block template
 */
export interface BlockLibraryItem {
	id: string;
	name: string;
	description?: string;
	user: string | { id: string; email?: string };
	blockData: ContentBlock<AnyBlockData>;
	blockType: ContentBlockType;
	tags?: { tag: string; id?: string }[];
	thumbnail?: string | { id: string; url?: string };
	createdAt: string;
	updatedAt: string;
}

/**
 * Serialized stage data stored in page library
 */
export interface LibraryStageData {
	title: string;
	blocks: ContentBlock<AnyBlockData>[];
	state?: Record<string, unknown>;
}

/**
 * Page library item - represents a saved stage node template
 */
export interface PageLibraryItem {
	id: string;
	name: string;
	description?: string;
	user: string | { id: string; email?: string };
	stageData: LibraryStageData;
	blockCount: number;
	blockTypes: ContentBlockType[];
	tags?: { tag: string; id?: string }[];
	thumbnail?: string | { id: string; url?: string };
	createdAt: string;
	updatedAt: string;
}

/**
 * Filters for querying library items
 */
export interface LibraryFilters {
	search?: string;
	blockType?: ContentBlockType;
	tags?: string[];
	sortBy?: "createdAt" | "name" | "updatedAt";
	sortOrder?: "asc" | "desc";
}

/**
 * Result from library query operations
 */
export interface LibraryQueryResult<T> {
	docs: T[];
	totalDocs: number;
	page?: number;
	totalPages?: number;
	hasNextPage?: boolean;
	hasPrevPage?: boolean;
}

/**
 * Input for saving a block to library
 */
export interface SaveBlockInput {
	name: string;
	description?: string;
	block: ContentBlock<AnyBlockData>;
	tags?: string[];
}

/**
 * Input for saving a page to library
 */
export interface SavePageInput {
	name: string;
	description?: string;
	stageData: LibraryStageData;
	tags?: string[];
}
