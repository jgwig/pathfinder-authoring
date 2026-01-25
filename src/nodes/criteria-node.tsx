import { NodeProps, Handle, Position } from "@xyflow/react";
import { memo } from "react";
import {
	BaseNode,
	BaseNodeContent,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/nodes/base-node";
import { CriteriaNodeData } from "@/types/flow/nodes";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlowContext } from "@/providers/flow/flow-context";

// @ts-expect-error - Type issue with CriteriaNodeData and NodeProps, but works at runtime
function CriteriaNode(props: NodeProps<Record<string, unknown>>) {
	const { data, id } = props;
	const { duplicateNode } = useFlowContext();

	const handleDuplicate = () => {
		duplicateNode(String(id));
	};

	return (
		<BaseNode className="w-[400px] min-h-[500px]">
			<BaseNodeHeader className="border-b">
				<BaseNodeHeaderTitle>Criteria Node</BaseNodeHeaderTitle>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7"
					onClick={(e) => {
						e.stopPropagation();
						handleDuplicate();
					}}
					title="Duplicate node"
				>
					<Copy className="h-4 w-4" />
				</Button>
			</BaseNodeHeader>

			<BaseNodeContent className="space-y-3">
				{JSON.stringify(data, null, 2)}
			</BaseNodeContent>

			{/* React Flow Handles */}
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
		</BaseNode>
	);
}

export default memo(CriteriaNode);

CriteriaNode.displayName = "CriteriaNode";
