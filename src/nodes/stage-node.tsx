import {
	BaseNode,
	BaseNodeContent,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/nodes/base-node";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { memo } from "react";
import { BlockPreview } from "@/components/content-blocks/preview/block-preview";
import { ContentBlock } from "@/types/content";

// Reusable type for React Flow node data representing a stage
export type StageNodeData = {
	blocks: ContentBlock<any>[];
	title: string;
	state?: Record<string, any>;
};

function StageNode({ id, data }: NodeProps<Node<StageNodeData>>) {
	return (
		<BaseNode className={`w-[768px]`}>
			<BaseNodeHeader className="border-b">
				<BaseNodeHeaderTitle>{data.title}</BaseNodeHeaderTitle>
				<p className="text-xs text-muted-foreground border px-1 rounded-full">
					Stage
				</p>
			</BaseNodeHeader>
			<BaseNodeContent className="flex min-h-[600px]   flex-col">
				{data.blocks.length === 0 && (
					<div className="flex-1 flex h-full items-center justify-center text-muted-foreground">
						<p>No content</p>
					</div>
				)}
				{data.blocks &&
					data.blocks.map((block, i) => {
						return <BlockPreview block={block} key={block.id} />;
					})}
			</BaseNodeContent>
			{id === "s1" ? (
				<Handle
					type="source"
					position={Position.Right}
					className="bg-green-500"
					style={{ width: "20px", height: "20px" }}
				/>
			) : (
				<>
					<Handle
						type="target"
						position={Position.Left}
						style={{ width: "20px", height: "20px" }}
					/>
					<Handle
						type="source"
						position={Position.Right}
						style={{ width: "20px", height: "20px" }}
					/>
				</>
			)}
		</BaseNode>
	);
}

export default memo(StageNode);

StageNode.displayName = "StageNode";
