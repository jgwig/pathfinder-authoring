"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import { ContentBlockType, contentBlockOptions } from "@/types/content";
import type { LibraryFilters as LibraryFiltersType } from "@/types/library";

interface LibraryFiltersProps {
	filters: LibraryFiltersType;
	onFiltersChange: (filters: LibraryFiltersType) => void;
	showBlockTypeFilter?: boolean;
}

export function LibraryFilters({
	filters,
	onFiltersChange,
	showBlockTypeFilter = true,
}: LibraryFiltersProps) {
	const [searchValue, setSearchValue] = useState(filters.search || "");

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchValue !== filters.search) {
				onFiltersChange({ ...filters, search: searchValue || undefined });
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [searchValue, filters, onFiltersChange]);

	const handleBlockTypeChange = useCallback(
		(value: string) => {
			onFiltersChange({
				...filters,
				blockType: value === "all" ? undefined : (value as ContentBlockType),
			});
		},
		[filters, onFiltersChange]
	);

	const handleRemoveTag = useCallback(
		(tagToRemove: string) => {
			onFiltersChange({
				...filters,
				tags: filters.tags?.filter((tag) => tag !== tagToRemove),
			});
		},
		[filters, onFiltersChange]
	);

	return (
		<div className="space-y-3">
			{/* Search input */}
			<div className="relative">
				<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search library..."
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					className="pl-8"
				/>
			</div>

			{/* Block type filter */}
			{showBlockTypeFilter && (
				<Select
					value={filters.blockType || "all"}
					onValueChange={handleBlockTypeChange}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="All types" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All types</SelectItem>
						{Object.entries(contentBlockOptions).map(([value, label]) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}

			{/* Active tags */}
			{filters.tags && filters.tags.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{filters.tags.map((tag) => (
						<Badge
							key={tag}
							variant="secondary"
							className="flex items-center gap-1"
						>
							{tag}
							<button
								onClick={() => handleRemoveTag(tag)}
								className="ml-1 hover:text-destructive"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					))}
				</div>
			)}
		</div>
	);
}
