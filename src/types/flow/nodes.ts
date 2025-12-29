import { AnyBlockData, ContentBlock } from "@/types/content";

/**
 * Data shape for a Stage node in the flow canvas.
 */
export type StageNodeData = {
	blocks: ContentBlock<AnyBlockData>[];
	title: string;
	state?: Record<string, unknown>;
};

/**
 * Data shape for a Criteria node. This will evolve as criteria UI matures.
 */
export type CriteriaNodeData = Record<string, unknown>;

/**
 * Union of all node data types used in the flow.
 */
export type PathwayNodeData = StageNodeData | CriteriaNodeData;
