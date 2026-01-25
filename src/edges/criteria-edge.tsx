import { StageNodeData } from "@/types/flow/nodes";
import {
	ConditionGroup,
	Condition,
	Operator,
	Calculation,
	evaluateCriteriaConditions,
	runCalculations,
	CriteriaData,
} from "@/utils/criteria/evaluate";
import {
	BaseEdge,
	Edge,
	EdgeLabelRenderer,
	EdgeProps,
	getSimpleBezierPath,
	useReactFlow,
	useNodesData,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
	AssessmentBlockData,
	ContentBlock,
	AnyBlockData,
} from "@/types/content";

export type CriteriaEdgeData = {
	criteria: ConditionGroup;
	calculations?: Calculation[];
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

/**
 * Helper function to extract all available form field keys from a stage node's blocks
 */
function extractAvailableFormFields(
	blocks: ContentBlock<AnyBlockData>[]
): string[] {
	const fields: string[] = [];

	for (const block of blocks) {
		if (block.type === "assessment" && block.data) {
			const assessmentData = block.data as AssessmentBlockData;
			const formId = assessmentData.formId;

			if (formId && assessmentData.form && Array.isArray(assessmentData.form)) {
				for (const formItem of assessmentData.form) {
					// Create the key in the format: formId.fieldName
					fields.push(`${formId}.${formItem.name}`);
				}
			}
		}
	}

	return fields;
}

/**
 * Helper function to parse string values to arrays for 'in' and 'not_in' operators
 */
function parseCriteriaForValidation(
	conditionGroup: ConditionGroup
): ConditionGroup {
	const parseConditionOrGroup = (
		item: Condition | ConditionGroup
	): Condition | ConditionGroup => {
		// If it's a group, recursively parse
		if ("conditions" in item && Array.isArray(item.conditions)) {
			return {
				...item,
				conditions: item.conditions.map(parseConditionOrGroup) as (
					| Condition
					| ConditionGroup
				)[],
			};
		}

		// If it's a condition with 'in' or 'not_in' operator and string value
		const condition = item as Condition;
		if (
			(condition.operator === "in" || condition.operator === "not_in") &&
			typeof condition.value === "string"
		) {
			const arrayValue = condition.value
				.split(",")
				.map((v) => v.trim())
				.filter(Boolean)
				.map((v) => {
					// Try to parse each item
					if (v.toLowerCase() === "true") return true;
					if (v.toLowerCase() === "false") return false;
					const numVal = Number(v);
					return !isNaN(numVal) && v !== "" ? numVal : v;
				});
			return {
				...condition,
				value: arrayValue,
			};
		}

		return condition;
	};

	return {
		...conditionGroup,
		conditions: conditionGroup.conditions.map(parseConditionOrGroup) as (
			| Condition
			| ConditionGroup
		)[],
	};
}

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
	const [editedCalculations, setEditedCalculations] = useState<
		Calculation[] | undefined
	>(data?.calculations);
	const [calculatedState, setCalculatedState] = useState<
		Record<string, unknown>
	>({});
	const { setEdges } = useReactFlow();

	// Subscribe to source node data changes - this will re-render when data changes
	const sourceNodeData = useNodesData(source);
	const sourceNodeState = (sourceNodeData?.data as StageNodeData)?.state;

	// Get the target node data (if needed) - also reactive
	// Target node data can be added later if edge-level validation requires it
	useNodesData(target);

	const [edgePath, labelX, labelY] = getSimpleBezierPath(props);

	const criteria: ConditionGroup | undefined = data?.criteria;
	const calculations: Calculation[] | undefined = data?.calculations;

	// Extract available form fields from source node blocks
	const availableFields = useMemo(() => {
		const fields: string[] = [];

		// Add form fields from source node blocks
		if (sourceNodeData?.data) {
			const stageData = sourceNodeData.data as StageNodeData;
			if (stageData.blocks) {
				fields.push(...extractAvailableFormFields(stageData.blocks));
			}
		}

		// Add calculation output keys
		if (editedCalculations) {
			for (const calc of editedCalculations) {
				if (calc.outputKey && !fields.includes(calc.outputKey)) {
					fields.push(calc.outputKey);
				}
			}
		}

		return fields;
	}, [sourceNodeData?.data, editedCalculations]);

	// Sync edited criteria with data changes
	useEffect(() => {
		setEditedCriteria(data?.criteria);
	}, [data?.criteria]);

	// Sync edited calculations with data changes
	useEffect(() => {
		setEditedCalculations(data?.calculations);
	}, [data?.calculations]);

	const validate = useCallback((): boolean => {
		if (!criteria) return true;
		if (!sourceNodeData?.data) return false;
		if (!sourceNodeState) return false;

		// Run calculations if they exist
		let fullData: CriteriaData = sourceNodeState;
		if (calculations && calculations.length > 0) {
			const calculatedData = runCalculations(calculations, sourceNodeState);
			fullData = { ...sourceNodeState, ...calculatedData };
			setCalculatedState(calculatedData);
		} else {
			setCalculatedState({});
		}

		// Parse criteria to ensure 'in' and 'not_in' operators have array values
		const parsedCriteria = parseCriteriaForValidation(criteria);

		const validateResult = evaluateCriteriaConditions(parsedCriteria, fullData);
		return validateResult;
	}, [criteria, calculations, sourceNodeData?.data, sourceNodeState]);

	useEffect(() => {
		setValid(validate());
	}, [sourceNodeState, criteria, validate]);

	const updateCriteria = () => {
		setEdges((edges) =>
			edges.map((edge) => {
				if (edge.id === id) {
					return {
						...edge,
						data: {
							...edge.data,
							criteria: editedCriteria,
							calculations: editedCalculations,
						},
					};
				}
				return edge;
			})
		);
		setIsEditing(false);
	};

	const addCalculation = () => {
		const newCalculation: Calculation = {
			outputKey: "",
			operation: "countWhere",
			inputKeys: [],
			filter: {
				operator: "equals",
				value: "",
			},
		};

		setEditedCalculations((prev) => {
			if (!prev) return [newCalculation];
			return [...prev, newCalculation];
		});
	};

	const removeCalculation = (index: number) => {
		setEditedCalculations((prev) => {
			if (!prev) return prev;
			return prev.filter((_, i) => i !== index);
		});
	};

	const updateCalculation = (index: number, updates: Partial<Calculation>) => {
		setEditedCalculations((prev) => {
			if (!prev) return prev;
			const newCalculations = [...prev];
			newCalculations[index] = {
				...newCalculations[index],
				...updates,
			};
			return newCalculations;
		});
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
		value: Condition[keyof Condition]
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
							{/* Calculations Section */}
							<div className="border-b pb-3">
								<h4 className="text-sm font-semibold mb-2">Calculations</h4>
								<div className="space-y-2">
									{editedCalculations?.map((calc, index) => (
										<div
											key={index}
											className="p-2 bg-blue-50 rounded border border-blue-200"
										>
											<div className="flex justify-between items-start mb-2">
												<span className="text-xs font-medium text-blue-700">
													Calculation {index + 1}
												</span>
												<Button
													size="sm"
													variant="ghost"
													onClick={() => removeCalculation(index)}
													className="text-red-600 hover:text-red-800 hover:bg-red-50 h-6 w-6 p-0"
												>
													<X className="h-3 w-3" />
												</Button>
											</div>
											<div className="space-y-2">
												<div className="flex gap-2">
													<Input
														placeholder="Output Key"
														value={calc.outputKey}
														onChange={(e) =>
															updateCalculation(index, {
																outputKey: e.target.value,
															})
														}
														className="text-sm flex-1"
													/>
													<Select
														value={calc.operation}
														onValueChange={(value: "countWhere" | "sum") =>
															updateCalculation(index, { operation: value })
														}
													>
														<SelectTrigger className="w-32">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="countWhere">
																Count Where
															</SelectItem>
															<SelectItem value="sum">Sum</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div>
													<label className="text-xs text-gray-600">
														Input Keys (comma-separated):
													</label>
													{availableFields.length > 0 ? (
														<div className="flex flex-wrap gap-1 mt-1">
															{availableFields.map((field) => (
																<Button
																	key={field}
																	size="sm"
																	variant={
																		calc.inputKeys.includes(field)
																			? "default"
																			: "outline"
																	}
																	className="text-xs h-6 px-2"
																	onClick={() => {
																		const newKeys = calc.inputKeys.includes(
																			field
																		)
																			? calc.inputKeys.filter(
																					(k) => k !== field
																			  )
																			: [...calc.inputKeys, field];
																		updateCalculation(index, {
																			inputKeys: newKeys,
																		});
																	}}
																>
																	{field}
																</Button>
															))}
														</div>
													) : (
														<Input
															placeholder="key1, key2, key3"
															value={calc.inputKeys.join(", ")}
															onChange={(e) =>
																updateCalculation(index, {
																	inputKeys: e.target.value
																		.split(",")
																		.map((k) => k.trim())
																		.filter(Boolean),
																})
															}
															className="text-sm"
														/>
													)}
												</div>
												{calc.operation === "countWhere" && (
													<div className="flex gap-2 items-center">
														<label className="text-xs text-gray-600">
															Filter:
														</label>
														<Select
															value={calc.filter?.operator || "equals"}
															onValueChange={(value: Operator) =>
																updateCalculation(index, {
																	filter: {
																		...calc.filter,
																		operator: value,
																		value: calc.filter?.value ?? "",
																	},
																})
															}
														>
															<SelectTrigger className="w-32">
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
															value={
																calc.filter?.value === null ||
																calc.filter?.value === undefined
																	? ""
																	: String(calc.filter.value)
															}
															onChange={(e) => {
																const val = e.target.value;
																let parsedVal: string | number | boolean = val;
																if (val.toLowerCase() === "true") {
																	parsedVal = true;
																} else if (val.toLowerCase() === "false") {
																	parsedVal = false;
																} else {
																	const numVal = Number(val);
																	if (!isNaN(numVal) && val !== "") {
																		parsedVal = numVal;
																	}
																}
																updateCalculation(index, {
																	filter: {
																		...calc.filter,
																		operator: calc.filter?.operator || "equals",
																		value: parsedVal,
																	},
																});
															}}
															className="flex-1"
														/>
													</div>
												)}
											</div>
										</div>
									))}
								</div>
								<Button
									size="sm"
									variant="outline"
									onClick={addCalculation}
									className="w-full mt-2"
								>
									<Plus className="h-4 w-4 mr-1" />
									Add Calculation
								</Button>
							</div>

							{/* Conditions Section */}
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
													{availableFields.length > 0 ? (
														<Select
															value={condition.key}
															onValueChange={(value: string) =>
																updateCondition(index, "key", value)
															}
														>
															<SelectTrigger>
																<SelectValue placeholder="Select a field..." />
															</SelectTrigger>
															<SelectContent>
																{availableFields.map((field) => (
																	<SelectItem key={field} value={field}>
																		{field}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													) : (
														<Input
															placeholder="Key (e.g., formId.fieldName)"
															value={condition.key}
															onChange={(e) =>
																updateCondition(index, "key", e.target.value)
															}
															className="text-sm"
														/>
													)}
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
															placeholder={
																condition.operator === "in" ||
																condition.operator === "not_in"
																	? "Value (comma-separated for in/not_in)"
																	: "Value"
															}
															value={
																condition.value === null ||
																condition.value === undefined
																	? ""
																	: String(condition.value)
															}
															onChange={(e) => {
																const val = e.target.value;

																// For 'in' and 'not_in' operators, store as string
																// It will be parsed to array during validation
																if (
																	condition.operator === "in" ||
																	condition.operator === "not_in"
																) {
																	updateCondition(index, "value", val);
																	return;
																}

																// For other operators, parse as single value
																// Try to parse as boolean first
																if (val.toLowerCase() === "true") {
																	updateCondition(index, "value", true);
																	return;
																}
																if (val.toLowerCase() === "false") {
																	updateCondition(index, "value", false);
																	return;
																} // Try to parse as number if possible
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
							{/* Display Calculations */}
							{calculations && calculations.length > 0 && (
								<div className="mb-3">
									<div className="text-xs font-medium text-gray-500 uppercase mb-1">
										Calculations
									</div>
									<div className="space-y-1">
										{calculations.map((calc, index) => (
											<div
												key={index}
												className="p-2 bg-blue-50 rounded text-xs"
											>
												<span className="font-semibold">{calc.outputKey}</span>
												{" = "}
												<span className="text-blue-700">{calc.operation}</span>(
												{calc.inputKeys.join(", ")})
												{calc.filter && (
													<span className="text-gray-600">
														{" "}
														where {calc.filter.operator}{" "}
														{JSON.stringify(calc.filter.value)}
													</span>
												)}
												{calculatedState[calc.outputKey] !== undefined && (
													<span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 rounded">
														= {JSON.stringify(calculatedState[calc.outputKey])}
													</span>
												)}
											</div>
										))}
									</div>
								</div>
							)}

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
									{Object.keys(calculatedState).length > 0 && (
										<div>
											<p className="font-semibold">Calculated Values:</p>
											<pre className="text-xs overflow-auto max-h-32">
												{JSON.stringify(calculatedState, null, 2)}
											</pre>
										</div>
									)}
								</div>
							</details>
						</div>
					)}
				</div>
			</EdgeLabelRenderer>
		</>
	);
}
