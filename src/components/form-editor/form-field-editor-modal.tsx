"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { FormFieldList } from "./form-field-list";
import { FormFieldEditor } from "./form-field-editor";

export type FieldType =
	| "text"
	| "email"
	| "url"
	| "number"
	| "textarea"
	| "dropdown"
	| "checkbox"
	| "radio";

export type ValidationRule = {
	type:
		| "required"
		| "minLength"
		| "maxLength"
		| "pattern"
		| "email"
		| "url"
		| "min"
		| "max";
	value?: string | number;
	message?: string;
};

export type DisplayCondition = {
	fieldId: string;
	operator:
		| "equals"
		| "notEquals"
		| "contains"
		| "greaterThan"
		| "lessThan"
		| "isEmpty"
		| "isNotEmpty";
	value?: string;
};

export type FormField = {
	id: string;
	type: FieldType;
	label: string;
	placeholder?: string;
	helpText?: string;
	options?: string[]; // For dropdown, checkbox, radio
	validations: ValidationRule[];
	displayConditions: DisplayCondition[];
	defaultValue?: string;
};

interface FormFieldEditorModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function FormFieldEditorModal({
	open,
	onOpenChange,
}: FormFieldEditorModalProps) {
	const [fields, setFields] = useState<FormField[]>([
		{
			id: "field-1",
			type: "text",
			label: "Full Name",
			placeholder: "Enter your full name",
			validations: [{ type: "required", message: "Name is required" }],
			displayConditions: [],
		},
		{
			id: "field-2",
			type: "email",
			label: "Email Address",
			placeholder: "you@example.com",
			validations: [
				{ type: "required", message: "Email is required" },
				{ type: "email", message: "Must be a valid email" },
			],
			displayConditions: [],
		},
	]);
	const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
		fields[0]?.id || null
	);

	const selectedField = fields.find((f) => f.id === selectedFieldId);

	const addField = () => {
		const newField: FormField = {
			id: `field-${Date.now()}`,
			type: "text",
			label: "New Field",
			validations: [],
			displayConditions: [],
		};
		setFields([...fields, newField]);
		setSelectedFieldId(newField.id);
	};

	const updateField = (id: string, updates: Partial<FormField>) => {
		setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
	};

	const deleteField = (id: string) => {
		setFields(fields.filter((f) => f.id !== id));
		if (selectedFieldId === id) {
			setSelectedFieldId(fields[0]?.id || null);
		}
	};

	const reorderFields = (startIndex: number, endIndex: number) => {
		const result = Array.from(fields);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);
		setFields(result);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex flex-col min-w-4xl h-[85vh] p-0 gap-0">
				<DialogHeader className="px-6 py-4 border-b border-border">
					<DialogTitle>Configure Form Fields</DialogTitle>
					<DialogDescription>
						Add, edit, and configure form fields with validation rules and
						display conditions
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-1 overflow-hidden">
					{/* Left Panel - Field List */}
					<div className=" border-r border-border flex flex-col">
						<div className="p-4 border-b border-border">
							<Button onClick={addField} className="w-full" size="sm">
								<Plus className="mr-2 h-4 w-4" />
								Add Field
							</Button>
						</div>
						<ScrollArea className="flex-1">
							<FormFieldList
								fields={fields}
								selectedFieldId={selectedFieldId}
								onSelectField={setSelectedFieldId}
								onDeleteField={deleteField}
								onReorderFields={reorderFields}
							/>
						</ScrollArea>
					</div>

					{/* Right Panel - Field Editor */}
					<div className="flex-1 flex flex-col">
						{selectedField ? (
							<FormFieldEditor
								field={selectedField}
								allFields={fields}
								onUpdateField={(updates) =>
									updateField(selectedField.id, updates)
								}
							/>
						) : (
							<div className="flex-1 flex items-center justify-center text-muted-foreground">
								Select a field to edit or add a new field
							</div>
						)}
					</div>
				</div>

				<div className="px-6 py-4 border-t border-border flex justify-end gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={() => onOpenChange(false)}>
						Save Form Configuration
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
