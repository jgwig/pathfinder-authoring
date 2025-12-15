import { StageNodeData } from "@/nodes/stage-node";
import {
	ConditionGroup,
	Condition,
	Operator,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { X, Plus, Edit, Check } from "lucide-react";

export type CriteriaEdgeData = {
	criteria: ConditionGroup;
};

const operators: Operator[] = [
	"equals",
	"not_equals",
	"greater_than",
	"less_than",
	"greater_than_equal",
	"less_than_equal",
	"in",
	"not_in",
	"matches_regex",
	"not_matches_regex",
];

export function CriteriaEdge({
	id,
	data,
	source,
	target,
	...props
}: EdgeProps<Edge<CriteriaEdgeData>>) {
	const [valid, setValid] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editedCriteria, setEditedCriteria] = useState<
		ConditionGroup | undefined
	>(data?.criteria);
	const { getNode, setEdges } = useReactFlow();

	// Subscribe to source node data changes - this will re-render when data changes
	const sourceNodeData = useNodesData(source);
	const sourceNodeState = (sourceNodeData?.data as StageNodeData)?.state;

	// Get the target node data (if needed) - also reactive
	const targetNodeData = useNodesData(target);

	const [edgePath, labelX, labelY] = getSimpleBezierPath(props);

	const criteria: ConditionGroup | undefined = data?.criteria;

	// Sync edited criteria with data changes
	useEffect(() => {
		setEditedCriteria(data?.criteria);
	}, [data?.criteria]);

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
	}, [sourceNodeState, criteria]);

	const updateCriteria = () => {
		setEdges((edges) =>
			edges.map((edge) => {
				if (edge.id === id) {
					return {
						...edge,
						data: {
							...edge.data,
							criteria: editedCriteria,
						},
					};
				}
				return edge;
			})
		);
		setIsEditing(false);
	};

	const addCondition = () => {
		const newCondition: Condition = {
			key: "",
			operator: "equals",
			value: "",
		};

		setEditedCriteria((prev) => {
			if (!prev) {
				return {
					type: "and",
					conditions: [newCondition],
				};
			}
			return {
				...prev,
				conditions: [...prev.conditions, newCondition],
			};
		});
	};

	const removeCondition = (index: number) => {
		setEditedCriteria((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				conditions: prev.conditions.filter((_, i) => i !== index),
			};
		});
	};

	const updateCondition = (
		index: number,
		field: keyof Condition,
		value: any
	) => {
		setEditedCriteria((prev) => {
			if (!prev) return prev;
			const newConditions = [...prev.conditions];
			const condition = newConditions[index];

			// Only update if it's a Condition (not a nested ConditionGroup)
			if (condition && "key" in condition) {
				newConditions[index] = {
					...condition,
					[field]: value,
				};
			}

			return {
				...prev,
				conditions: newConditions,
			};
		});
	};

	const updateGroupType = (type: "and" | "or") => {
		setEditedCriteria((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				type,
			};
		});
	};

	return (
		<>
			<BaseEdge id={id} path={edgePath} />
			<EdgeLabelRenderer>
				<div
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
					}}
					className={`flex flex-col max-w-[600px] p-4 border ${
						valid ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"
					} rounded-lg absolute shadow-lg bg-white pointer-events-auto nodrag nopan`}
				>
					<div className="flex justify-between items-center mb-3">
						<div className="flex items-center gap-2">
							<p className="font-semibold text-lg">Criteria</p>
							<span
								className={`text-xs px-2 py-1 rounded ${
									valid
										? "bg-green-200 text-green-800"
										: "bg-red-200 text-red-800"
								}`}
							>
								{valid ? "Valid" : "Invalid"}
							</span>
						</div>
						<Button
							size="sm"
							variant={isEditing ? "default" : "outline"}
							onClick={() => {
								if (isEditing) {
									updateCriteria();
								} else {
									setIsEditing(true);
								}
							}}
						>
							{isEditing ? (
								<Check className="h-4 w-4 mr-1" />
							) : (
								<Edit className="h-4 w-4 mr-1" />
							)}
							{isEditing ? "Save" : "Edit"}
						</Button>
					</div>

					{isEditing ? (
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<label className="text-sm font-medium">Group Type:</label>
								<Select
									value={editedCriteria?.type || "and"}
									onValueChange={(value: "and" | "or") =>
										updateGroupType(value)
									}
								>
									<SelectTrigger className="w-24">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="and">AND</SelectItem>
										<SelectItem value="or">OR</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								{editedCriteria?.conditions.map((condition, index) => {
									// Only render simple conditions, not nested groups
									if ("key" in condition) {
										return (
											<div
												key={index}
												className="flex gap-2 items-start p-2 bg-gray-50 rounded"
											>
												<div className="flex-1 space-y-2">
													<Input
														placeholder="Key (e.g., age, score)"
														value={condition.key}
														onChange={(e) =>
															updateCondition(index, "key", e.target.value)
														}
														className="text-sm"
													/>
													<div className="flex gap-2">
														<Select
															value={condition.operator}
															onValueChange={(value: Operator) =>
																updateCondition(index, "operator", value)
															}
														>
															<SelectTrigger className="flex-1">
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																{operators.map((op) => (
																	<SelectItem key={op} value={op}>
																		{op.replace(/_/g, " ")}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<Input
															placeholder="Value"
															value={condition.value}
															onChange={(e) => {
																const val = e.target.value;
																// Try to parse as number if possible
																const numVal = Number(val);
																updateCondition(
																	index,
																	"value",
																	!isNaN(numVal) && val !== "" ? numVal : val
																);
															}}
															className="flex-1"
														/>
													</div>
												</div>
												<Button
													size="sm"
													variant="ghost"
													onClick={() => removeCondition(index)}
													className="text-red-600 hover:text-red-800 hover:bg-red-50"
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										);
									}
									return null;
								})}
							</div>

							<Button
								size="sm"
								variant="outline"
								onClick={addCondition}
								className="w-full"
							>
								<Plus className="h-4 w-4 mr-1" />
								Add Condition
							</Button>
						</div>
					) : (
						<div className="space-y-2">
							{criteria?.conditions && criteria.conditions.length > 0 ? (
								<>
									<div className="text-xs font-medium text-gray-500 uppercase">
										Type: {criteria.type || "and"}
									</div>
									<div className="space-y-1 text-sm">
										{criteria.conditions.map((condition, index) => {
											if ("key" in condition) {
												return (
													<div key={index} className="p-2 bg-gray-50 rounded">
														<span className="font-mono text-xs">
															{condition.key} {condition.operator}{" "}
															{JSON.stringify(condition.value)}
														</span>
													</div>
												);
											}
											return null;
										})}
									</div>
								</>
							) : (
								<p className="text-sm text-gray-500 italic">
									No criteria defined
								</p>
							)}

							<details className="text-xs mt-3">
								<summary className="cursor-pointer font-medium text-gray-600">
									Debug Info
								</summary>
								<div className="mt-2 space-y-2 p-2 bg-gray-50 rounded">
									<div>
										<p className="font-semibold">State:</p>
										<pre className="text-xs overflow-auto max-h-32">
											{sourceNodeState
												? JSON.stringify(sourceNodeState, null, 2)
												: "None"}
										</pre>
									</div>
								</div>
							</details>
						</div>
					)}
				</div>
			</EdgeLabelRenderer>
		</>
	);
}
