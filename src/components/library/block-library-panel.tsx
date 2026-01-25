"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Blocks } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth/use-auth";
import {
	getBlockLibrary,
	deleteBlockFromLibrary,
} from "@/actions/block-library-actions";
import { LibraryFilters } from "./library-filters";
import { LibraryItemCard } from "./library-item-card";
import { LibraryPreviewDialog } from "./library-preview-dialog";
import type {
	BlockLibraryItem,
	LibraryFilters as FiltersType,
} from "@/types/library";

interface BlockLibraryPanelProps {
	selectedNodeId?: string | null;
}

export function BlockLibraryPanel({ selectedNodeId }: BlockLibraryPanelProps) {
	const { user } = useAuth();
	const [items, setItems] = useState<BlockLibraryItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [filters, setFilters] = useState<FiltersType>({});
	const [itemToDelete, setItemToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [previewItem, setPreviewItem] = useState<BlockLibraryItem | null>(null);

	const fetchItems = useCallback(async () => {
		if (!user) return;

		setIsLoading(true);
		try {
			const result = await getBlockLibrary(user, filters);
			setItems(result.docs);
		} catch (error) {
			console.error("Error fetching block library:", error);
		} finally {
			setIsLoading(false);
		}
	}, [user, filters]);

	// Fetch items when filters change
	useEffect(() => {
		fetchItems();
	}, []);

	// Listen for refresh events (when new blocks are saved)
	useEffect(() => {
		const handleRefresh = () => {
			fetchItems();
		};

		window.addEventListener("library-block-refresh", handleRefresh);
		return () => {
			window.removeEventListener("library-block-refresh", handleRefresh);
		};
	}, [fetchItems]);

	// Extract unique tags from items
	const availableTags = useMemo(() => {
		const tagSet = new Set<string>();
		items.forEach((item) => {
			item.tags?.forEach((tagItem) => {
				tagSet.add(tagItem.tag);
			});
		});
		return Array.from(tagSet).sort();
	}, [items]);

	const handleDelete = async () => {
		if (!user || !itemToDelete) return;

		setIsDeleting(true);
		try {
			const result = await deleteBlockFromLibrary(user, itemToDelete);
			if (result.success) {
				setItems((prev) => prev.filter((item) => item.id !== itemToDelete));
				toast.success("Block deleted from library");
			}
		} catch (error) {
			console.error("Error deleting block:", error);
			toast.error("Failed to delete block");
		} finally {
			setIsDeleting(false);
			setItemToDelete(null);
		}
	};

	const handleAddToCanvas = (item: BlockLibraryItem) => {
		// Emit custom event for adding block to canvas
		const event = new CustomEvent("add-block-from-library", {
			detail: { block: item.blockData },
		});
		window.dispatchEvent(event);
	};

	const isAddDisabled = !selectedNodeId;

	return (
		<div className="p-4 space-y-4 h-full flex flex-col">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Block Library</h2>
			</div>

			<LibraryFilters
				filters={filters}
				onFiltersChange={setFilters}
				availableTags={availableTags}
			/>

			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			) : items.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<Blocks className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-sm text-muted-foreground">
						{filters.search || filters.tags?.length
							? "No blocks match your filters"
							: "No blocks saved yet"}
					</p>
					<p className="text-xs text-muted-foreground mt-1">
						Save blocks from the inspector to build your library
					</p>
				</div>
			) : (
				<ScrollArea className="flex-1 -mx-4 px-4">
					<div className="space-y-2 pb-4">
						{items.map((item) => (
							<LibraryItemCard
								key={item.id}
								id={item.id}
								name={item.name}
								description={item.description}
								blockType={item.blockType}
								tags={item.tags}
								createdAt={item.createdAt}
								onAdd={() => handleAddToCanvas(item)}
								onPreview={() => setPreviewItem(item)}
								onDelete={() => setItemToDelete(item.id)}
								disabled={isAddDisabled}
								disabledReason="Select a page first"
							/>
						))}
					</div>
				</ScrollArea>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={itemToDelete !== null}
				onOpenChange={(open) => !open && setItemToDelete(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Block</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this block from your library? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setItemToDelete(null)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Preview Dialog */}
			<LibraryPreviewDialog
				open={previewItem !== null}
				onOpenChange={(open) => !open && setPreviewItem(null)}
				title={previewItem?.name || ""}
				description={previewItem?.description}
				type="block"
				blockData={previewItem?.blockData}
				onAdd={() => {
					if (previewItem) {
						handleAddToCanvas(previewItem);
						setPreviewItem(null);
					}
				}}
			/>
		</div>
	);
}
