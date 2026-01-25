import {
	BaseNode,
	BaseNodeContent,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/nodes/base-node";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { memo } from "react";
import { BlockPreview } from "@/components/content-blocks/preview/block-preview";
import { StageNodeData } from "@/types/flow/nodes";
import { Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowContext } from "@/providers/flow/flow-context";

function StageNode({ id, data }: NodeProps<StageNodeData>) {
	const { duplicateNode, deleteNode } = useFlowContext();

	return (
		<BaseNode className={`w-[768px]`}>
			<BaseNodeHeader className="border-b">
				<BaseNodeHeaderTitle>{data.title}</BaseNodeHeaderTitle>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={(e) => {
							e.stopPropagation();
							duplicateNode(id);
						}}
						title="Duplicate node"
					>
						<Copy className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={(e) => {
							e.stopPropagation();
							deleteNode(id);
						}}
						title="Delete node"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
					<p className="text-xs text-muted-foreground border px-1 rounded-full">
						Stage
					</p>
				</div>
			</BaseNodeHeader>
			<BaseNodeContent className="flex min-h-[600px]   flex-col">
				{data.blocks.length === 0 && (
					<div className="flex-1 flex h-full items-center justify-center text-muted-foreground">
						<p>No content</p>
					</div>
				)}
				{data.blocks &&
					data.blocks
						.filter((block) => block != null)
						.map((block, i) => {
							return (
								<BlockPreview block={block} key={block.id ?? `block-${i}`} />
							);
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
