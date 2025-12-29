import { NodeProps, Handle, Position } from "@xyflow/react";
import { memo } from "react";
import {
	BaseNode,
	BaseNodeContent,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/nodes/base-node";
import { CriteriaNodeData } from "@/types/flow/nodes";

function CriteriaNode(props: NodeProps<CriteriaNodeData>) {
	const { data } = props;

	return (
		<BaseNode className="w-[400px] min-h-[500px]">
			<BaseNodeHeader className="border-b">
				<BaseNodeHeaderTitle>Criteria Node</BaseNodeHeaderTitle>
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
