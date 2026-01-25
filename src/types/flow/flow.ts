import { Edge, Node, Viewport } from "@xyflow/react";
import { CriteriaNodeData, PathwayNodeData, StageNodeData } from "./nodes";

/**
 * Typed representation of the flow snapshot persisted in PayloadCMS.
 */
export interface PathwayFlowData {
	nodes: Node<PathwayNodeData>[];
	edges: Edge[];
	viewport: Viewport;
}

/**
 * Default initial viewport for new pathways.
 */
export const DEFAULT_VIEWPORT: Viewport = {
	x: 0,
	y: 0,
	zoom: 1,
};

/**
 * Default initial node for new pathways.
 */
export const DEFAULT_INITIAL_NODE: Node<StageNodeData> = {
	id: "s1",
	position: { x: 0, y: 0 },
	data: {
		blocks: [
			{
				id: crypto.randomUUID(),
				type: "title",
				data: {
					text: "Welcome to Pathfinder",
					level: 1,
				},
			},
			{
				id: crypto.randomUUID(),
				type: "paragraph",
				data: {
					text: "Welcome to the Pathfinder authoring tool!\n\n- Drag an edge from this stage to create a new stage.\n- Use the Inspector sidebar (right) to add or edit content blocks.\n- Click on a stage to select it and view its details.\n- Connect stages to define the flow of your pathway.\n\nGet started by exploring the canvas and building your pathway!",
				},
			},
		],
		title: "Introduction",
	},
	type: "stageNode",
};

/**
 * Creates the default initial flow data for new pathways.
 */
export function createInitialFlowData(): PathwayFlowData {
	return {
		nodes: [DEFAULT_INITIAL_NODE],
		edges: [],
		viewport: DEFAULT_VIEWPORT,
	};
}

/**
 * Type guard to check if data is valid PathwayFlowData.
 */
export function isValidPathwayFlowData(data: unknown): data is PathwayFlowData {
	if (!data || typeof data !== "object") return false;

	const obj = data as Record<string, unknown>;

	return (
		Array.isArray(obj.nodes) &&
		Array.isArray(obj.edges) &&
		obj.viewport !== undefined &&
		typeof obj.viewport === "object"
	);
}

/**
 * Safely parses pathway data, returning default flow if invalid.
 */
export function parsePathwayFlowData(data: unknown): PathwayFlowData {
	if (isValidPathwayFlowData(data)) {
		return data;
	}
	return createInitialFlowData();
}

export type { StageNodeData, CriteriaNodeData, PathwayNodeData };
