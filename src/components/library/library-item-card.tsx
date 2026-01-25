"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Plus,
	Eye,
	Trash2,
	MoreVertical,
	Type,
	Image as ImageIcon,
	Video,
	FileText,
	Columns,
	ChevronDown,
	FormInput,
	ExternalLink,
	Code,
	FileCode,
	LayoutList,
	ClipboardList,
} from "lucide-react";
import type { ContentBlockType } from "@/types/content";

// Icons for each block type
const blockTypeIcons: Record<ContentBlockType, React.ReactNode> = {
	intro: <LayoutList className="h-4 w-4" />,
	title: <Type className="h-4 w-4" />,
	paragraph: <FileText className="h-4 w-4" />,
	video: <Video className="h-4 w-4" />,
	image: <ImageIcon className="h-4 w-4" />,
	assessment: <FormInput className="h-4 w-4" />,
	recommendation: <ClipboardList className="h-4 w-4" />,
	assessmentResult: <ClipboardList className="h-4 w-4" />,
	externalRecommendation: <ExternalLink className="h-4 w-4" />,
	component: <Code className="h-4 w-4" />,
	dropdown: <ChevronDown className="h-4 w-4" />,
	html: <FileCode className="h-4 w-4" />,
	column: <Columns className="h-4 w-4" />,
};

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
}

export function LibraryItemCard({
	name,
	description,
	blockType,
	blockTypes,
	blockCount,
	tags,
	createdAt,
	onAdd,
	onPreview,
	onDelete,
}: LibraryItemCardProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	return (
		<Card className="group hover:bg-accent/50 transition-colors">
			<CardHeader className="p-3 pb-2">
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center gap-2 min-w-0">
						{blockType && (
							<div className="flex-shrink-0 text-muted-foreground">
								{blockTypeIcons[blockType]}
							</div>
						)}
						<CardTitle className="text-sm font-medium truncate">
							{name}
						</CardTitle>
					</div>
					<div className="flex items-center gap-1 flex-shrink-0">
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={onAdd}
							title="Add to canvas"
						>
							<Plus className="h-4 w-4" />
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="h-7 w-7">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={onPreview}>
									<Eye className="h-4 w-4 mr-2" />
									Preview
								</DropdownMenuItem>
								<DropdownMenuItem onClick={onAdd}>
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
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-3 pt-0 space-y-2">
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

					{/* Block types for pages (show first 2) */}
					{blockTypes && blockTypes.length > 0 && (
						<div className="flex items-center gap-1">
							{blockTypes.slice(0, 2).map((type) => (
								<span key={type} className="text-muted-foreground">
									{blockTypeIcons[type]}
								</span>
							))}
							{blockTypes.length > 2 && (
								<span className="text-xs text-muted-foreground">
									+{blockTypes.length - 2}
								</span>
							)}
						</div>
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
		</Card>
	);
}
