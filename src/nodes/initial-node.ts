import { StageNodeData } from "@/types/content";
import { Node } from "@xyflow/react";

export const initialNodes: Node<StageNodeData>[] = [
	{
		id: "s1",
		position: { x: 0, y: 0 },
		data: {
			blocks: [],
			title: "Introduction",
		},
		type: "stageNode",
	},
];
