"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { BlockPreview } from "@/components/content-blocks/preview/block-preview";
import type { ContentBlock, AnyBlockData } from "@/types/content";
import type { LibraryStageData } from "@/types/library";

interface LibraryPreviewDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	type: "block" | "page";
	blockData?: ContentBlock<AnyBlockData>;
	stageData?: LibraryStageData;
	onAdd: () => void;
}

export function LibraryPreviewDialog({
	open,
	onOpenChange,
	title,
	description,
	type,
	blockData,
	stageData,
	onAdd,
}: LibraryPreviewDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>

				<ScrollArea className="flex-1 min-h-0 h-[calc(90vh-12rem)] border rounded-md">
					<div className="p-4 space-y-4">
						{type === "block" && blockData && (
							<div className="border rounded-lg p-4 bg-background">
								<BlockPreview block={blockData} />
							</div>
						)}

						{type === "page" && stageData && (
							<div className="space-y-4">
								{stageData.title && (
									<h3 className="text-lg font-semibold border-b pb-2">
										{stageData.title}
									</h3>
								)}
								{stageData.blocks.map((block, index) => (
									<div
										key={block.id || index}
										className="border rounded-lg p-4 bg-background"
									>
										<BlockPreview block={block} />
									</div>
								))}
								{stageData.blocks.length === 0 && (
									<p className="text-sm text-muted-foreground text-center py-4">
										No blocks in this page
									</p>
								)}
							</div>
						)}
					</div>
				</ScrollArea>

				<DialogFooter className="flex-shrink-0">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
					<Button onClick={onAdd}>
						<Plus className="h-4 w-4 mr-2" />
						Add to Canvas
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
