"use client";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Eye, Trash2, MoreVertical } from "lucide-react";
import type { ContentBlockType } from "@/types/content";

// Human readable names for block types
const blockTypeLabels: Record<ContentBlockType, string> = {
	intro: "Intro",
	title: "Title",
	paragraph: "Paragraph",
	video: "Video",
	image: "Image",
	assessment: "Assessment",
	recommendation: "Recommendation",
	assessmentResult: "Assessment Result",
	externalRecommendation: "External Recommendation",
	component: "Component",
	dropdown: "Dropdown",
	html: "HTML",
	column: "Column",
};

interface LibraryItemCardProps {
	id: string;
	name: string;
	description?: string;
	blockType?: ContentBlockType;
	blockTypes?: ContentBlockType[];
	blockCount?: number;
	tags?: { tag: string; id?: string }[];
	createdAt: string;
	onAdd: () => void;
	onPreview: () => void;
	onDelete: () => void;
	disabled?: boolean;
	disabledReason?: string;
}

export function LibraryItemCard({
	name,
	description,
	blockType,
	blockCount,
	tags,
	createdAt,
	onAdd,
	onPreview,
	onDelete,
	disabled = false,
	disabledReason,
}: LibraryItemCardProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	return (
		<Card className="group hover:bg-accent/50 transition-colors gap-2 py-3">
			<CardHeader className="px-3 py-0">
				<Tooltip>
					<TooltipTrigger asChild>
						<CardTitle className="text-sm font-medium truncate cursor-default">
							{name}
						</CardTitle>
					</TooltipTrigger>
					<TooltipContent side="top" className="max-w-[250px]">
						<p>{name}</p>
					</TooltipContent>
				</Tooltip>
			</CardHeader>
			<CardContent className="px-3 py-0 space-y-2">
				{description && (
					<p className="text-xs text-muted-foreground line-clamp-2">
						{description}
					</p>
				)}

				<div className="flex items-center gap-2 flex-wrap">
					{/* Block type badge */}
					{blockType && (
						<Badge variant="outline" className="text-xs">
							{blockTypeLabels[blockType]}
						</Badge>
					)}

					{/* Block count for pages */}
					{blockCount !== undefined && (
						<Badge variant="secondary" className="text-xs">
							{blockCount} block{blockCount !== 1 ? "s" : ""}
						</Badge>
					)}
				</div>

				{/* Tags */}
				{tags && tags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{tags.slice(0, 3).map((tagItem) => (
							<Badge
								key={tagItem.id || tagItem.tag}
								variant="secondary"
								className="text-xs py-0"
							>
								{tagItem.tag}
							</Badge>
						))}
						{tags.length > 3 && (
							<span className="text-xs text-muted-foreground">
								+{tags.length - 3}
							</span>
						)}
					</div>
				)}

				{/* Date */}
				<p className="text-xs text-muted-foreground">{formatDate(createdAt)}</p>
			</CardContent>
			<CardFooter className="px-3 py-0 gap-1">
				{disabled && disabledReason ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="flex-1">
								<Button
									variant="secondary"
									size="sm"
									className="w-full"
									disabled
								>
									<Plus className="h-4 w-4 mr-1" />
									Add to Canvas
								</Button>
							</span>
						</TooltipTrigger>
						<TooltipContent side="top">
							<p>{disabledReason}</p>
						</TooltipContent>
					</Tooltip>
				) : (
					<Button
						variant="secondary"
						size="sm"
						className="flex-1"
						onClick={onAdd}
					>
						<Plus className="h-4 w-4 mr-1" />
						Add to Canvas
					</Button>
				)}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={onPreview}>
							<Eye className="h-4 w-4 mr-2" />
							Preview
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onAdd} disabled={disabled}>
							<Plus className="h-4 w-4 mr-2" />
							Add to canvas
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={onDelete}
							className="text-destructive focus:text-destructive"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</CardFooter>
		</Card>
	);
}
