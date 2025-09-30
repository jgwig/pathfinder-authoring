import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useRef, useEffect } from "react";
import { Check, ChevronDownIcon, ChevronsUpDown, XIcon } from "lucide-react";
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

interface SelectFieldProps<T extends string | number> {
	label: string;
	value: T;
	onChange: (value: T) => void;
	options: { label: string; value: T }[];
	required?: boolean;
	error?: string;
	className?: string;
}

export const SelectField = <T extends string | number>({
	label,
	value,
	onChange,
	options,
	required,
	error,
	className,
}: SelectFieldProps<T>) => {
	return (
		<FormField
			label={label}
			error={error}
			required={required}
			className={className}
		>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value as T)}
				aria-invalid={!!error}
				className={cn(
					"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
					"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
					"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
				)}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</FormField>
	);
};

interface SearchableSelectFieldProps<T extends string | number> {
	label: string;
	value: T | null;
	onChange: (value: T | null) => void;
	options: { label: string; value: T }[];
	placeholder?: string;
	searchPlaceholder?: string;
	required?: boolean;
	error?: string;
	className?: string;
	allowClear?: boolean;
	noOptionsMessage?: string;
}

export const SearchableSelectField = <T extends string | number>({
	label,
	value,
	onChange,
	options,
	placeholder = "Select an option...",
	searchPlaceholder = "Search options...",
	required,
	error,
	className,
	allowClear = false,
	noOptionsMessage = "No options found",
}: SearchableSelectFieldProps<T>) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find((option) => option.value === value);

	const filteredOptions = options.filter((option) =>
		option.label.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleSelect = (selectedValue: T) => {
		onChange(selectedValue);
		setIsOpen(false);
		setSearchTerm("");
	};

	const handleClear = () => {
		onChange(null);
		setSearchTerm("");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setIsOpen(false);
			setSearchTerm("");
		} else if (e.key === "Enter" && filteredOptions.length === 1) {
			e.preventDefault();
			handleSelect(filteredOptions[0].value);
		}
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setSearchTerm("");
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<FormField
			label={label}
			error={error}
			required={required}
			className={className}
		>
			<div ref={containerRef} className="relative">
				<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
					<DropdownMenuTrigger asChild>
						<div
							className={cn(
								"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm cursor-pointer flex items-center justify-between",
								"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
								"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
								error &&
									"border-destructive ring-destructive/20 dark:ring-destructive/40"
							)}
							aria-invalid={!!error}
						>
							<span
								className={cn(
									"truncate",
									!selectedOption && "text-muted-foreground"
								)}
							>
								{selectedOption ? selectedOption.label : placeholder}
							</span>
							<div className="flex items-center gap-1">
								{allowClear && selectedOption && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											handleClear();
										}}
										className="hover:bg-muted rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
									>
										<XIcon className="h-3 w-3" />
									</button>
								)}
								<ChevronDownIcon
									className={cn(
										"h-4 w-4 text-muted-foreground transition-transform",
										isOpen && "rotate-180"
									)}
								/>
							</div>
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[200px] overflow-y-auto p-0"
						align="start"
					>
						<div className="p-2 border-b">
							<Input
								ref={inputRef}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder={searchPlaceholder}
								className="h-8"
								autoFocus
							/>
						</div>
						<div className="p-1">
							{filteredOptions.length === 0 ? (
								<div className="px-2 py-1.5 text-sm text-muted-foreground">
									{noOptionsMessage}
								</div>
							) : (
								filteredOptions.map((option) => (
									<DropdownMenuItem
										key={option.value}
										onClick={() => handleSelect(option.value)}
										className={cn(
											"cursor-pointer",
											option.value === value &&
												"bg-accent text-accent-foreground"
										)}
									>
										{option.label}
									</DropdownMenuItem>
								))
							)}
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
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
	const [comboValue, setComboValue] = useState("");
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
						className="flex justify-between"
					>
						{comboValue
							? options.find((option) => option.value === comboValue)?.label
							: placeholder}
						<ChevronsUpDown className="opacity-50" />
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
										<Check
											className={cn(
												"ml-auto",
												comboValue === option.value
													? "opacity-100"
													: "opacity-0"
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
