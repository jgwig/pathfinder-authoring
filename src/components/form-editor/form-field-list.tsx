"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	GripVertical,
	Trash2,
	Type,
	Mail,
	Link2,
	Hash,
	AlignLeft,
	ChevronDown,
	CheckSquare,
	Circle,
} from "lucide-react";
import type { FormField } from "./form-field-editor-modal";
import { cn } from "@/lib/utils";

interface FormFieldListProps {
	fields: FormField[];
	selectedFieldId: string | null;
	onSelectField: (id: string) => void;
	onDeleteField: (id: string) => void;
	onReorderFields: (startIndex: number, endIndex: number) => void;
}

const fieldTypeIcons = {
	text: Type,
	email: Mail,
	url: Link2,
	number: Hash,
	textarea: AlignLeft,
	dropdown: ChevronDown,
	checkbox: CheckSquare,
	radio: Circle,
};

export function FormFieldList({
	fields,
	selectedFieldId,
	onSelectField,
	onDeleteField,
}: FormFieldListProps) {
	return (
		<div className="p-3 space-y-2">
			{fields.map((field) => {
				const Icon = fieldTypeIcons[field.type];
				const isSelected = field.id === selectedFieldId;
				const isRequired = field.validations.some((v) => v.type === "required");

				return (
					<Card
						key={field.id}
						className={cn(
							"p-3 cursor-pointer transition-colors hover:bg-accent/50",
							isSelected && "bg-accent border-primary"
						)}
						onClick={() => onSelectField(field.id)}
					>
						<div className="flex items-center gap-2">
							<GripVertical className="h-4 w-4 text-muted-foreground cursor-move flex-shrink-0" />
							<Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium truncate">
										{field.label}
									</span>
									{isRequired && (
										<span className="text-xs text-destructive font-medium flex-shrink-0">
											*
										</span>
									)}
								</div>
								<div className="text-xs text-muted-foreground capitalize">
									{field.type}
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 flex-shrink-0"
								onClick={(e) => {
									e.stopPropagation();
									onDeleteField(field.id);
								}}
							>
								<Trash2 className="h-3.5 w-3.5 text-destructive" />
							</Button>
						</div>
					</Card>
				);
			})}
		</div>
	);
}
