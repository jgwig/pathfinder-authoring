import { PathwayFlowData } from "@/types/flow/flow";
import { StageNodeData } from "@/types/flow/nodes";
import { Node } from "@xyflow/react";
import { ContentBlock, RecommendationBlockData } from "@/types/content";

/**
 * Sanitizes flow data before saving to remove non-serializable properties.
 * This ensures that class instances and other non-JSON-serializable data
 * don't cause issues when persisting to the database.
 */
export function sanitizeFlowData(flowData: PathwayFlowData): PathwayFlowData {
	return {
		...flowData,
		nodes: flowData.nodes.map((node) => sanitizeNode(node)),
	};
}

/**
 * Sanitizes a single node by removing non-serializable properties from its data
 */
function sanitizeNode(node: Node): Node {
	if (node.type === "stageNode") {
		const stageNode = node as Node<StageNodeData>;
		return {
			...stageNode,
			data: {
				...stageNode.data,
				blocks: stageNode.data.blocks.map((block) => sanitizeBlock(block)),
			},
		};
	}
	return node;
}

/**
 * Sanitizes a content block by removing non-serializable properties
 */
function sanitizeBlock<T>(block: ContentBlock<T>): ContentBlock<T> {
	// For recommendation blocks, remove the 'test' property which contains Service class instances
	// but preserve the metadata field which contains serializable data
	if (block.type === "recommendation" && block.data) {
		const recommendationData = block.data as unknown as RecommendationBlockData;
		const { test, ...sanitizedData } = recommendationData;
		return {
			...block,
			data: sanitizedData as T,
		};
	}
	return block;
}
