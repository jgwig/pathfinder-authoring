import { get } from "lodash"; // Safe way to access nested properties

export const VALID_OPERATORS = [
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
] as const;

// Creates a type of the above valid operators
export type Operator = (typeof VALID_OPERATORS)[number];

export type CriteriaPrimitive = string | number | boolean | null;
export type CriteriaValue = CriteriaPrimitive | CriteriaPrimitive[] | RegExp;
export type CriteriaData = Record<string, unknown>;

// Groups multiple Conditions with 'and' / 'or' logical operators
export interface ConditionGroup {
	type?: "or" | "and";
	conditions: ConditionOrGroup[];
}

// Used for nested ConditionGroup structures
type ConditionOrGroup = Condition | ConditionGroup;

// Contains a single logical check
export interface Condition {
	key: string;
	operator: Operator;
	value: CriteriaValue; // array of values used for 'in' operation. Can also be a regular expression to be used with the matches_regex operator
}

// The result for given criteria
export interface EvaluationResult {
	key: string;
	value: unknown;
}

// Main Criteria structure
export interface Criteria {
	result: EvaluationResult;
	calculations?: Calculation[];
	criteria: ConditionGroup[];
}

interface Calculation {
	outputKey: string;
	operation: "countWhere" | "sum"; // can be extended with more operations
	inputKeys: string[];
	filter?: {
		operator: Operator;
		value: CriteriaValue;
	};
}

/**
 * Evaluates a set of criteria against the provided state and returns the result if matched.
 * Orchestrates the evaluation by iterating through top-level criteria groups and using logical operators.
 * Delegates detailed condition/group evaluation to evaluateCriteriaConditions.
 * @param criteria The criteria set to evaluate
 * @param data The current state to check against
 * @returns The evaluation result if criteria are met, otherwise a default failed result
 */
export function evaluateCriteria(
	criteria: Criteria,
	data: CriteriaData
): EvaluationResult {
	let result = {
		key: "failed",
		value: "Failed to evaluate the criteria with the state provided",
	};
	let evaluate = false;

	// Run calculations
	let calculatedData: CriteriaData = {};
	if (criteria.calculations) {
		calculatedData = runCalculations(criteria.calculations, data);
	}

	// Merge data
	const fullData = { ...data, ...calculatedData };

	//only evaluate if the criteria array isn't empty
	if (criteria.criteria.length !== 0) {
		// Iterate over the top level criteria conditions to see if there are any criteria that succeed
		evaluate = criteria.criteria.every((conditions) => {
			// Return early if the conditions array is empty
			if (conditions.conditions.length === 0) {
				return false;
			}

			if (conditions.type === "and") {
				return conditions.conditions.every((condition) =>
					evaluateCriteriaConditions(condition, fullData)
				);
			}
			if (conditions.type === "or") {
				return conditions.conditions.some((condition) =>
					evaluateCriteriaConditions(condition, fullData)
				);
			}
			// Default to 'and' if type is missing
			return conditions.conditions.every((condition) =>
				evaluateCriteriaConditions(condition, fullData)
			);
		});
	}

	if (evaluate) result = criteria.result;
	return result;
}

/**
 * Recursively evaluates a single condition or a group of conditions against the state.
 * Handles both individual conditions and nested groups using logical operators.
 * Used internally by evaluateCriteria for detailed evaluation.
 * @param condition A single condition or a group of conditions
 * @param data The current state to check against
 * @returns True if the condition/group is satisfied, otherwise false
 */
export function evaluateCriteriaConditions(
	condition: ConditionOrGroup,
	data: CriteriaData
): boolean {
	// If this is a group, recursively evaluate
	// Checks if the current condition object is actually a ConditionGroup (i.e. a nested condition group that contains the 'conditions' property)
	if ("conditions" in condition) {
		const { type, conditions } = condition;
		if (type === "and") {
			return conditions.every((c) => evaluateCriteriaConditions(c, data));
		}
		if (type === "or") {
			return conditions.some((c) => evaluateCriteriaConditions(c, data));
		}
		// Default to 'and' if type is missing
		return conditions.every((c) => evaluateCriteriaConditions(c, data));
	}

	console.log(get(data, condition.key));

	// Otherwise, use the matching operator to evaluate the leaf condition against the given state
	return checkValuesWithOperator(
		get(data, condition.key),
		condition.value,
		condition.operator
	);
}

/**
 *
 * @param dataValue The value that you are testing
 * @param criteriaValue The value you are providing
 * @param operator The operator used in the evaluation
 * @returns True if the condition is valid, false otherwise
 */
function checkValuesWithOperator(
	dataValue: unknown,
	criteriaValue: CriteriaValue,
	operator: Operator
): boolean {
	if (!VALID_OPERATORS.includes(operator)) {
		console.error(`Unknown operator: ${operator}`);
		return false;
	}

	switch (operator) {
		case "equals":
			if (Array.isArray(criteriaValue) || criteriaValue instanceof RegExp) {
				return false;
			}
			return dataValue === criteriaValue;
		case "not_equals":
			if (Array.isArray(criteriaValue) || criteriaValue instanceof RegExp) {
				return false;
			}
			return dataValue !== criteriaValue;
		case "greater_than":
			if (isComparable(dataValue) && isComparable(criteriaValue)) {
				return dataValue > criteriaValue;
			}
			return false;
		case "less_than":
			if (isComparable(dataValue) && isComparable(criteriaValue)) {
				return dataValue < criteriaValue;
			}
			return false;
		case "greater_than_equal":
			if (isComparable(dataValue) && isComparable(criteriaValue)) {
				return dataValue >= criteriaValue;
			}
			return false;
		case "less_than_equal":
			if (isComparable(dataValue) && isComparable(criteriaValue)) {
				return dataValue <= criteriaValue;
			}
			return false;
		case "in":
			if (Array.isArray(criteriaValue) && criteriaValue.length > 0) {
				return criteriaValue.some((value) => value === dataValue);
			}
			return false;
		case "not_in":
			if (Array.isArray(criteriaValue) && criteriaValue.length > 0) {
				return !criteriaValue.some((value) => value === dataValue);
			}
			return false;
		case "matches_regex":
			if (criteriaValue instanceof RegExp) {
				return typeof dataValue === "string" && criteriaValue.test(dataValue);
			}
			return new RegExp(String(criteriaValue), "i").test(String(dataValue));
		case "not_matches_regex":
			if (criteriaValue instanceof RegExp) {
				return !(
					typeof dataValue === "string" && criteriaValue.test(dataValue)
				);
			}
			return !new RegExp(String(criteriaValue), "i").test(String(dataValue));

		default:
			// If an unknown operator is found, return false
			console.error(`Unknown operator: ${operator}`);
			return false;
	}
}

function runCalculations(
	calculations: Calculation[],
	data: CriteriaData
): Record<string, unknown> {
	const calculatedData: Record<string, unknown> = {};

	for (const calc of calculations) {
		switch (calc.operation) {
			case "countWhere":
				let count = 0;
				for (const key of calc.inputKeys) {
					if (calc.filter) {
						// Run the operator check
						if (
							checkValuesWithOperator(
								get(data, key),
								calc.filter.value,
								calc.filter.operator
							)
						) {
							count++;
						}
					}
				}
				calculatedData[calc.outputKey] = count;
				break;
			case "sum":
				let sum = 0;
				for (const key of calc.inputKeys) {
					const dataValue = get(data, key);
					if (typeof dataValue === "number") {
						sum += dataValue;
					}
				}
				calculatedData[calc.outputKey] = sum;
				break;
			// Add more operations as required
		}
	}

	return calculatedData;
}

function isComparable(
	value: CriteriaValue | unknown
): value is number | string {
	return typeof value === "number" || typeof value === "string";
}
