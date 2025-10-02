import { FormItem, FormItemType } from "@/types/content";
import { TextField } from "./form-fields";
import { Button } from "./button";
import { X } from "lucide-react";

const formItemOptions: { label: string; value: FormItemType }[] = [
	{
		label: "Button Select",
		value: "buttonSelect",
	},
	{
		label: "Dropdown Select",
		value: "dropdownSelect",
	},
	{
		label: "Checkbox",
		value: "checkbox",
	},
];

export function AssessmentField({
	field,
	onChange,
	removeField,
}: {
	field: FormItem;
	onChange: (updatedField: FormItem) => void;
	removeField: (id: string) => void;
}) {
	const handleAddOption = () => {
		const currentOptions = field.options || [];
		const newOption = "";
		const updatedOptions = [...currentOptions, newOption];
		handleUpdateField("options", updatedOptions);
	};

	const handleRemoveOption = (index: number) => {
		const currentOptions = field.options || [];
		const updatedOptions = currentOptions.filter((_, i) => i !== index);
		handleUpdateField("options", updatedOptions);
	};

	const handleUpdateOption = (index: number, value: string) => {
		const currentOptions = field.options || [];
		const updatedOptions = currentOptions.map((option, i) =>
			i === index ? value : option
		);
		handleUpdateField("options", updatedOptions);
	};

	const handleUpdateField = (key: string, value: any) => {
		const updatedField = { ...field, [key]: value };
		onChange(updatedField);
	};

	return (
		<div className="flex flex-col gap-4">
			<span className="flex flex-row justify-between">
				<p className="font-medium">
					{formItemOptions.find((option) => option.value === field.type)?.label}
				</p>
				<Button
					variant={"ghost"}
					size={"icon"}
					onClick={() => removeField(field.id)}
				>
					<X className="w-4 h-4 text-red-800" />
				</Button>
			</span>
			<TextField
				label="Label"
				value={field.label}
				onChange={(value) => handleUpdateField("label", value)}
				required
			/>
			<TextField
				label="Name"
				value={field.name}
				onChange={(value) => handleUpdateField("name", value)}
			/>
			{field.type !== "checkbox" && (
				<Button variant={"outline"} onClick={handleAddOption}>
					Add Option
				</Button>
			)}
			{field.options &&
				field.options.map((option, i) => (
					<div className="flex flex-col gap-2 border rounded-lg p-2 relative">
						<Button
							variant={"ghost"}
							size={"icon"}
							onClick={() => handleRemoveOption(i)}
							className="absolute -top-0.5 -right-0.5"
						>
							<X className="w-4 h-4 text-red-800" />
						</Button>
						<TextField
							label="Value"
							value={field.options?.[i] || ""}
							onChange={(value) => handleUpdateOption(i, value)}
							required
						/>
					</div>
				))}
		</div>
	);
}
