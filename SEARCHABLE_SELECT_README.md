# SearchableSelectField Component

A new form component that combines the functionality of `SelectField` with search capabilities, allowing users to easily filter through large lists of options.

## Features

- **Search functionality**: Filter options by typing in the search input
- **Keyboard navigation**: Use Enter to select when only one option matches, Escape to close
- **Clear functionality**: Optional clear button to reset selection
- **Accessibility**: Proper ARIA attributes and keyboard support
- **Consistent styling**: Matches the existing form field design system
- **TypeScript support**: Full type safety for option values (string or number)

## Usage

```tsx
import { SearchableSelectField } from "@/components/ui/form-fields";

const MyComponent = () => {
	const [selectedValue, setSelectedValue] = useState<string | null>(null);

	const options = [
		{ label: "Apple", value: "apple" },
		{ label: "Banana", value: "banana" },
		{ label: "Orange", value: "orange" },
		// ... more options
	];

	return (
		<SearchableSelectField
			label="Favorite Fruit"
			value={selectedValue}
			onChange={setSelectedValue}
			options={options}
			placeholder="Choose a fruit..."
			searchPlaceholder="Search fruits..."
			allowClear
			required
		/>
	);
};
```

## Props

| Prop                | Type                            | Default                 | Description                                  |
| ------------------- | ------------------------------- | ----------------------- | -------------------------------------------- |
| `label`             | `string`                        | -                       | Label text for the field                     |
| `value`             | `T \| null`                     | -                       | Currently selected value                     |
| `onChange`          | `(value: T \| null) => void`    | -                       | Callback when selection changes              |
| `options`           | `{ label: string; value: T }[]` | -                       | Array of selectable options                  |
| `placeholder`       | `string`                        | `"Select an option..."` | Placeholder text when no option is selected  |
| `searchPlaceholder` | `string`                        | `"Search options..."`   | Placeholder text in the search input         |
| `required`          | `boolean`                       | `false`                 | Whether the field is required                |
| `error`             | `string`                        | -                       | Error message to display                     |
| `className`         | `string`                        | -                       | Additional CSS classes                       |
| `allowClear`        | `boolean`                       | `false`                 | Show clear button when an option is selected |
| `noOptionsMessage`  | `string`                        | `"No options found"`    | Message when search yields no results        |

## Key Differences from SelectField

1. **Search capability**: Users can type to filter options
2. **Null values**: Supports `null` as a value for clearable selections
3. **Interactive dropdown**: Uses dropdown menu instead of native select element
4. **Enhanced UX**: Visual feedback, animations, and better keyboard support

## Implementation Details

- Built on top of the existing `FormField` component for consistency
- Uses `DropdownMenu` primitives from the UI library
- Implements proper focus management and keyboard interactions
- Automatically closes when clicking outside the component
- Filters options case-insensitively based on the search term

## Example with Numbers

```tsx
const [selectedCountry, setSelectedCountry] = useState<number | null>(null);

const countries = [
	{ label: "United States", value: 1 },
	{ label: "Canada", value: 2 },
	{ label: "United Kingdom", value: 3 },
];

<SearchableSelectField
	label="Country"
	value={selectedCountry}
	onChange={setSelectedCountry}
	options={countries}
	allowClear
/>;
```
