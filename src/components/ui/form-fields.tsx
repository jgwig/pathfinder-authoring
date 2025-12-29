import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./command";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "./select";
import { Checkbox } from "./checkbox";

interface FormFieldProps {
	label: string;
	error?: string;
	required?: boolean;
	children: React.ReactNode;
	className?: string;
}

export const FormField = ({
	label,
	error,
	required,
	children,
	className,
}: FormFieldProps) => {
	return (
		<div className={cn("flex flex-col space-y-2", className)}>
			<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				{label}
				{required && <span className="text-destructive ml-1">*</span>}
			</label>
			{children}
			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
};

interface TextFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	required?: boolean;
	error?: string;
	className?: string;
}

export const TextField = ({
	label,
	value,
	onChange,
	placeholder,
	required,
	error,
	className,
}: TextFieldProps) => {
	return (
		<FormField
			label={label}
			error={error}
			required={required}
			className={className}
		>
			<Input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				aria-invalid={!!error}
			/>
		</FormField>
	);
};

interface TextAreaFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	required?: boolean;
	error?: string;
	rows?: number;
	className?: string;
}

export const TextAreaField = ({
	label,
	value,
	onChange,
	placeholder,
	required,
	error,
	rows = 4,
	className,
}: TextAreaFieldProps) => {
	return (
		<FormField
			label={label}
			error={error}
			required={required}
			className={className}
		>
			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				rows={rows}
				aria-invalid={!!error}
				className={cn(
					"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none resize-vertical disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
					"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
					"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
				)}
			/>
		</FormField>
	);
};

interface NumberFieldProps {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	required?: boolean;
	error?: string;
	className?: string;
}

export const NumberField = ({
	label,
	value,
	onChange,
	min,
	max,
	required,
	error,
	className,
}: NumberFieldProps) => {
	return (
		<FormField
			label={label}
			error={error}
			required={required}
			className={className}
		>
			<Input
				type="number"
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				min={min}
				max={max}
				aria-invalid={!!error}
			/>
		</FormField>
	);
};

interface SelectFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: { label: string; value: string }[];
	required?: boolean;
	error?: string;
	className?: string;
}

export const SelectField = ({
	label,
	value,
	onChange,
	options,
	required,
	error,
	className,
}: SelectFieldProps) => {
	return (
		<FormField
			label={label}
			error={error}
			required={required}
			className={className}
		>
			<Select value={value} onValueChange={(value) => onChange(value)}>
				<SelectTrigger className="flex w-full">
					<SelectValue placeholder="Select..."></SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Select</SelectLabel>
						{options.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</FormField>
	);
};
interface ComboboxFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: { label: string; value: string }[];
	placeholder?: string;
	searchPlaceholder?: string;
	required?: boolean;
	error?: string;
	className?: string;
	noOptionsMessage?: string;
}

export const ComboboxField = ({
	label,
	value,
	onChange,
	options,
	placeholder = "Select an option...",
	searchPlaceholder = "Search options...",
	required,
	error,
	className,
	noOptionsMessage = "No options found",
}: ComboboxFieldProps) => {
	const [open, setOpen] = useState(false);
	const [comboValue, setComboValue] = useState(value);

	useEffect(() => {
		setComboValue(value);
	}, [value]);
	return (
		<FormField
			label={label}
			error={error}
			required={required}
			className={className}
		>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="flex justify-between items-center h-auto min-h-9 py-2"
					>
						<p className="text-wrap !font-normal max-w-[80%] text-start">
							{comboValue
								? options.find((option) => option.value === comboValue)?.label
								: placeholder}
						</p>

						<ChevronDownIcon className="opacity-30 " />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandInput placeholder={searchPlaceholder} className="h-9" />
						<CommandList>
							<CommandEmpty>{noOptionsMessage}</CommandEmpty>
							<CommandGroup>
								{options.map((option) => (
									<CommandItem
										key={option.value}
										value={option.label}
										onSelect={() => {
											setComboValue(option.value);
											onChange(option.value);
											setOpen(false);
										}}
									>
										{option.label}
										<ChevronDownIcon
											className={cn(
												"ml-auto",
												comboValue === option.value ? "opacity-30" : "opacity-0"
											)}
										/>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</FormField>
	);
};

interface UrlFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	required?: boolean;
	error?: string;
	className?: string;
}

export const UrlField = ({
	label,
	value,
	onChange,
	placeholder,
	required,
	error,
	className,
}: UrlFieldProps) => {
	return (
		<FormField
			label={label}
			error={error}
			required={required}
			className={className}
		>
			<Input
				type="url"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder || "https://example.com"}
				aria-invalid={!!error}
			/>
		</FormField>
	);
};

interface ButtonSelectFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: { label: string; value: string }[];
	required?: boolean;
	error?: string;
	className?: string;
}

export const ButtonSelectField = ({
	label,
	value,
	onChange,
	options,
	required,
	error,
	className,
}: ButtonSelectFieldProps) => {
	return (
		<FormField
			label={label}
			error={error}
			required={required}
			className={className}
		>
			<div className="flex flex-wrap gap-2">
				{options.map((option) => (
					<Button
						key={option.value}
						type="button"
						variant={value === option.value ? "default" : "outline"}
						size="sm"
						onClick={() => onChange(option.value)}
						className="transition-colors"
					>
						{option.label}
					</Button>
				))}
			</div>
		</FormField>
	);
};

interface CheckboxFieldProps {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	required?: boolean;
	error?: string;
	className?: string;
}

export const CheckboxField = ({
	label,
	checked,
	onChange,
	required,
	error,
	className,
}: CheckboxFieldProps) => {
	return (
		<FormField
			label={label}
			error={error}
			required={required}
			className={className}
		>
			<Checkbox
				onCheckedChange={(value) => onChange(value as boolean)}
				checked={checked}
			/>
		</FormField>
	);
};
