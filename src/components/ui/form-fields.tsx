import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
		<div className={cn("space-y-2", className)}>
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
