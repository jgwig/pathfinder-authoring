import { StageNodeData } from "@/nodes/stage-node";
import {
	ConditionGroup,
	evaluateCriteriaConditions,
} from "@/utils/criteria/evaluate";
import {
	BaseEdge,
	Edge,
	EdgeLabelRenderer,
	EdgeProps,
	getBezierPath,
	getSimpleBezierPath,
	getSmoothStepPath,
	getStraightPath,
	useReactFlow,
	useNodesData,
} from "@xyflow/react";
import { useEffect, useState } from "react";

export type CriteriaEdgeData = {
	criteria: ConditionGroup;
};

export function CriteriaEdge({
	id,
	data,
	source,
	target,
	...props
}: EdgeProps<Edge<CriteriaEdgeData>>) {
	const [valid, setValid] = useState(false);
	const { getNode } = useReactFlow();

	// Subscribe to source node data changes - this will re-render when data changes
	const sourceNodeData = useNodesData(source);
	const sourceNodeState = (sourceNodeData?.data as StageNodeData)?.state;

	// Get the target node data (if needed) - also reactive
	const targetNodeData = useNodesData(target);

	const [edgePath, labelX, labelY] = getSimpleBezierPath(props);

	const criteria: ConditionGroup | undefined = data?.criteria;

	const validate = (): boolean => {
		if (!criteria) return true;
		if (!sourceNodeData?.data) return false;

		if (!sourceNodeState) return false;

		const validateResult = evaluateCriteriaConditions(
			criteria,
			sourceNodeState
		);
		return validateResult;
	};

	useEffect(() => {
		setValid(validate());
	}, [sourceNodeState]);

	return (
		<>
			<BaseEdge id={id} path={edgePath} />
			<EdgeLabelRenderer>
				<div
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
					}}
					className={`flex flex-col max-w-[500px] p-4 border ${
						valid
							? "border-green-600 bg-green-200"
							: "border-red-600 bg-red-200"
					} rounded-lg absolute`}
				>
					<p className="font-semibold">Criteria</p>
					<p>{criteria ? JSON.stringify(data?.criteria, null, 2) : "None"}</p>
					<p className="font-semibold">State</p>
					<p>
						{sourceNodeState
							? JSON.stringify(sourceNodeState, null, 2)
							: "None"}
					</p>
					<p className="font-semibold">Result</p>
					{valid ? "Valid" : "Invalid"}
				</div>
			</EdgeLabelRenderer>
		</>
	);
}
