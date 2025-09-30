"use client";

import { useState } from "react";
import { SearchableSelectField } from "@/components/ui/form-fields";

const fruits = [
	{ label: "Apple", value: "apple" },
	{ label: "Banana", value: "banana" },
	{ label: "Orange", value: "orange" },
	{ label: "Grape", value: "grape" },
	{ label: "Strawberry", value: "strawberry" },
	{ label: "Blueberry", value: "blueberry" },
	{ label: "Pineapple", value: "pineapple" },
	{ label: "Mango", value: "mango" },
	{ label: "Watermelon", value: "watermelon" },
	{ label: "Kiwi", value: "kiwi" },
];

const countries = [
	{ label: "United States", value: 1 },
	{ label: "Canada", value: 2 },
	{ label: "United Kingdom", value: 3 },
	{ label: "Germany", value: 4 },
	{ label: "France", value: 5 },
	{ label: "Japan", value: 6 },
	{ label: "Australia", value: 7 },
	{ label: "Brazil", value: 8 },
	{ label: "India", value: 9 },
	{ label: "China", value: 10 },
];

export const SearchableSelectDemo = () => {
	const [selectedFruit, setSelectedFruit] = useState<string | null>(null);
	const [selectedCountry, setSelectedCountry] = useState<number | null>(null);

	return (
		<div className="max-w-md mx-auto p-6 space-y-6">
			<h2 className="text-2xl font-bold mb-4">SearchableSelectField Demo</h2>

			<SearchableSelectField
				label="Favorite Fruit"
				value={selectedFruit}
				onChange={setSelectedFruit}
				options={fruits}
				placeholder="Choose a fruit..."
				searchPlaceholder="Search fruits..."
				allowClear
				required
			/>

			<SearchableSelectField
				label="Country"
				value={selectedCountry}
				onChange={setSelectedCountry}
				options={countries}
				placeholder="Select a country..."
				searchPlaceholder="Search countries..."
				allowClear
			/>

			<div className="mt-6 p-4 bg-gray-100 rounded-md">
				<h3 className="font-semibold mb-2">Selected Values:</h3>
				<p>Fruit: {selectedFruit || "None"}</p>
				<p>Country: {selectedCountry || "None"}</p>
			</div>
		</div>
	);
};
