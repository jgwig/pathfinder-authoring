"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { X, Search, Tags, ChevronDown } from "lucide-react";
import type { LibraryFilters as LibraryFiltersType } from "@/types/library";

interface LibraryFiltersProps {
	filters: LibraryFiltersType;
	onFiltersChange: (filters: LibraryFiltersType) => void;
	availableTags?: string[];
}

export function LibraryFilters({
	filters,
	onFiltersChange,
	availableTags = [],
}: LibraryFiltersProps) {
	const [searchValue, setSearchValue] = useState(filters.search || "");
	const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchValue !== filters.search) {
				onFiltersChange({ ...filters, search: searchValue || undefined });
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [searchValue, filters, onFiltersChange]);

	const handleTagToggle = useCallback(
		(tag: string, checked: boolean) => {
			const currentTags = filters.tags || [];
			const newTags = checked
				? [...currentTags, tag]
				: currentTags.filter((t) => t !== tag);
			onFiltersChange({
				...filters,
				tags: newTags.length > 0 ? newTags : undefined,
			});
		},
		[filters, onFiltersChange],
	);

	const handleRemoveTag = useCallback(
		(tagToRemove: string) => {
			onFiltersChange({
				...filters,
				tags: filters.tags?.filter((tag) => tag !== tagToRemove),
			});
		},
		[filters, onFiltersChange],
	);

	const selectedTagsCount = filters.tags?.length || 0;

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

			{/* Tags filter */}
			{availableTags.length > 0 && (
				<Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className="w-full justify-between"
							size="sm"
						>
							<span className="flex items-center gap-2">
								<Tags className="h-4 w-4" />
								{selectedTagsCount > 0
									? `${selectedTagsCount} tag${selectedTagsCount > 1 ? "s" : ""} selected`
									: "Filter by tags"}
							</span>
							<ChevronDown className="h-4 w-4 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-2" align="start">
						<div className="space-y-2 max-h-[200px] overflow-y-auto">
							{availableTags.map((tag) => (
								<label
									key={tag}
									className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded px-2 py-1"
								>
									<Checkbox
										checked={filters.tags?.includes(tag) || false}
										onCheckedChange={(checked) =>
											handleTagToggle(tag, checked === true)
										}
									/>
									<span className="text-sm">{tag}</span>
								</label>
							))}
						</div>
					</PopoverContent>
				</Popover>
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
