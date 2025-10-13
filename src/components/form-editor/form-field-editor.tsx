"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type {
	FormField,
	FieldType,
	ValidationRule,
	DisplayCondition,
} from "./form-field-editor-modal";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface FormFieldEditorProps {
	field: FormField;
	allFields: FormField[];
	onUpdateField: (updates: Partial<FormField>) => void;
}

const fieldTypes: { value: FieldType; label: string }[] = [
	{ value: "text", label: "Text Input" },
	{ value: "email", label: "Email" },
	{ value: "url", label: "URL" },
	{ value: "number", label: "Number" },
	{ value: "textarea", label: "Text Area" },
	{ value: "dropdown", label: "Dropdown" },
	{ value: "checkbox", label: "Checkbox Group" },
	{ value: "radio", label: "Radio Buttons" },
];

const validationTypes = [
	{ value: "required", label: "Required", hasValue: false },
	{ value: "minLength", label: "Minimum Length", hasValue: true },
	{ value: "maxLength", label: "Maximum Length", hasValue: true },
	{ value: "pattern", label: "Pattern (Regex)", hasValue: true },
	{ value: "email", label: "Email Format", hasValue: false },
	{ value: "url", label: "URL Format", hasValue: false },
	{ value: "min", label: "Minimum Value", hasValue: true },
	{ value: "max", label: "Maximum Value", hasValue: true },
];

const conditionOperators = [
	{ value: "equals", label: "Equals" },
	{ value: "notEquals", label: "Not Equals" },
	{ value: "contains", label: "Contains" },
	{ value: "greaterThan", label: "Greater Than" },
	{ value: "lessThan", label: "Less Than" },
	{ value: "isEmpty", label: "Is Empty" },
	{ value: "isNotEmpty", label: "Is Not Empty" },
];

export function FormFieldEditor({
	field,
	allFields,
	onUpdateField,
}: FormFieldEditorProps) {
	const needsOptions = ["dropdown", "checkbox", "radio"].includes(field.type);

	const addValidation = () => {
		onUpdateField({
			validations: [...field.validations, { type: "required", message: "" }],
		});
	};

	const updateValidation = (
		index: number,
		updates: Partial<ValidationRule>
	) => {
		const newValidations = [...field.validations];
		newValidations[index] = { ...newValidations[index], ...updates };
		onUpdateField({ validations: newValidations });
	};

	const removeValidation = (index: number) => {
		onUpdateField({
			validations: field.validations.filter((_, i) => i !== index),
		});
	};

	const addCondition = () => {
		onUpdateField({
			displayConditions: [
				...field.displayConditions,
				{ fieldId: allFields[0]?.id || "", operator: "equals", value: "" },
			],
		});
	};

	const updateCondition = (
		index: number,
		updates: Partial<DisplayCondition>
	) => {
		const newConditions = [...field.displayConditions];
		newConditions[index] = { ...newConditions[index], ...updates };
		onUpdateField({ displayConditions: newConditions });
	};

	const removeCondition = (index: number) => {
		onUpdateField({
			displayConditions: field.displayConditions.filter((_, i) => i !== index),
		});
	};

	const addOption = () => {
		onUpdateField({
			options: [...(field.options || []), ""],
		});
	};

	const updateOption = (index: number, value: string) => {
		const newOptions = [...(field.options || [])];
		newOptions[index] = value;
		onUpdateField({ options: newOptions });
	};

	const removeOption = (index: number) => {
		onUpdateField({
			options: (field.options || []).filter((_, i) => i !== index),
		});
	};

	return (
		<ScrollArea className="flex-1">
			<div className="p-6 space-y-6">
				{/* Basic Settings */}
				<div className="space-y-4">
					<h3 className="text-sm font-semibold text-foreground">
						Basic Settings
					</h3>

					<div className="space-y-2">
						<Label htmlFor="field-type">Field Type</Label>
						<Select
							value={field.type}
							onValueChange={(value: FieldType) =>
								onUpdateField({ type: value })
							}
						>
							<SelectTrigger id="field-type">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{fieldTypes.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="field-label">Label</Label>
						<Input
							id="field-label"
							value={field.label}
							onChange={(e) => onUpdateField({ label: e.target.value })}
							placeholder="Enter field label"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="field-placeholder">Placeholder</Label>
						<Input
							id="field-placeholder"
							value={field.placeholder || ""}
							onChange={(e) => onUpdateField({ placeholder: e.target.value })}
							placeholder="Enter placeholder text"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="field-help">Help Text</Label>
						<Input
							id="field-help"
							value={field.helpText || ""}
							onChange={(e) => onUpdateField({ helpText: e.target.value })}
							placeholder="Optional help text"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="field-default">Default Value</Label>
						<Input
							id="field-default"
							value={field.defaultValue || ""}
							onChange={(e) => onUpdateField({ defaultValue: e.target.value })}
							placeholder="Optional default value"
						/>
					</div>
				</div>

				{/* Options (for dropdown, checkbox, radio) */}
				{needsOptions && (
					<>
						<Separator />
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-semibold text-foreground">
									Options
								</h3>
								<Button onClick={addOption} size="sm" variant="outline">
									<Plus className="mr-2 h-3.5 w-3.5" />
									Add Option
								</Button>
							</div>

							<div className="space-y-2">
								{(field.options || []).map((option, index) => (
									<div key={index} className="flex gap-2">
										<Input
											value={option}
											onChange={(e) => updateOption(index, e.target.value)}
											placeholder={`Option ${index + 1}`}
										/>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => removeOption(index)}
											className="flex-shrink-0"
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									</div>
								))}
								{(!field.options || field.options.length === 0) && (
									<p className="text-sm text-muted-foreground">
										No options added yet
									</p>
								)}
							</div>
						</div>
					</>
				)}

				{/* Validation Rules */}
				<Separator />
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold text-foreground">
							Validation Rules
						</h3>
						<Button onClick={addValidation} size="sm" variant="outline">
							<Plus className="mr-2 h-3.5 w-3.5" />
							Add Rule
						</Button>
					</div>

					<div className="space-y-3">
						{field.validations.map((validation, index) => {
							const validationType = validationTypes.find(
								(v) => v.value === validation.type
							);
							return (
								<Card key={index} className="p-4">
									<div className="space-y-3">
										<div className="flex items-start gap-2">
											<div className="flex-1 space-y-3">
												<div className="space-y-2">
													<Label>Rule Type</Label>
													<Select
														value={validation.type}
														onValueChange={(value) =>
															updateValidation(index, {
																type: value as ValidationRule["type"],
															})
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{validationTypes.map((type) => (
																<SelectItem key={type.value} value={type.value}>
																	{type.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>

												{validationType?.hasValue && (
													<div className="space-y-2">
														<Label>Value</Label>
														<Input
															value={validation.value?.toString() || ""}
															onChange={(e) =>
																updateValidation(index, {
																	value: e.target.value,
																})
															}
															placeholder="Enter value"
														/>
													</div>
												)}

												<div className="space-y-2">
													<Label>Error Message</Label>
													<Input
														value={validation.message || ""}
														onChange={(e) =>
															updateValidation(index, {
																message: e.target.value,
															})
														}
														placeholder="Custom error message"
													/>
												</div>
											</div>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => removeValidation(index)}
												className="flex-shrink-0"
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</div>
								</Card>
							);
						})}
						{field.validations.length === 0 && (
							<p className="text-sm text-muted-foreground">
								No validation rules added
							</p>
						)}
					</div>
				</div>

				{/* Display Conditions */}
				<Separator />
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-semibold text-foreground">
								Display Conditions
							</h3>
							<p className="text-xs text-muted-foreground mt-1">
								Show this field only when conditions are met
							</p>
						</div>
						<Button onClick={addCondition} size="sm" variant="outline">
							<Plus className="mr-2 h-3.5 w-3.5" />
							Add Condition
						</Button>
					</div>

					<div className="space-y-3">
						{field.displayConditions.map((condition, index) => {
							const targetField = allFields.find(
								(f) => f.id === condition.fieldId
							);
							const needsValue = !["isEmpty", "isNotEmpty"].includes(
								condition.operator
							);

							return (
								<Card key={index} className="p-4">
									<div className="space-y-3">
										<div className="flex items-start gap-2">
											<div className="flex-1 space-y-3">
												<div className="space-y-2">
													<Label>When Field</Label>
													<Select
														value={condition.fieldId}
														onValueChange={(value) =>
															updateCondition(index, { fieldId: value })
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{allFields
																.filter((f) => f.id !== field.id)
																.map((f) => (
																	<SelectItem key={f.id} value={f.id}>
																		{f.label}
																	</SelectItem>
																))}
														</SelectContent>
													</Select>
												</div>

												<div className="space-y-2">
													<Label>Operator</Label>
													<Select
														value={condition.operator}
														onValueChange={(value) =>
															updateCondition(index, {
																operator: value as DisplayCondition["operator"],
															})
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{conditionOperators.map((op) => (
																<SelectItem key={op.value} value={op.value}>
																	{op.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>

												{needsValue && (
													<div className="space-y-2">
														<Label>Value</Label>
														<Input
															value={condition.value || ""}
															onChange={(e) =>
																updateCondition(index, {
																	value: e.target.value,
																})
															}
															placeholder="Enter comparison value"
														/>
													</div>
												)}

												{targetField && (
													<div className="flex items-center gap-2">
														<Badge variant="secondary" className="text-xs">
															{targetField.label}
														</Badge>
														<span className="text-xs text-muted-foreground">
															{condition.operator
																.replace(/([A-Z])/g, " $1")
																.toLowerCase()}
														</span>
														{needsValue && condition.value && (
															<Badge variant="outline" className="text-xs">
																{condition.value}
															</Badge>
														)}
													</div>
												)}
											</div>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => removeCondition(index)}
												className="flex-shrink-0"
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</div>
								</Card>
							);
						})}
						{field.displayConditions.length === 0 && (
							<p className="text-sm text-muted-foreground">
								No display conditions added. Field will always be visible.
							</p>
						)}
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}
