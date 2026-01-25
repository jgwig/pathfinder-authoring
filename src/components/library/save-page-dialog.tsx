"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth/use-auth";
import { savePageToLibrary } from "@/actions/page-library-actions";
import type { StageNodeData } from "@/types/flow/nodes";

interface SavePageDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	stageData: StageNodeData | null;
	onSaved?: () => void;
}

export function SavePageDialog({
	open,
	onOpenChange,
	stageData,
	onSaved,
}: SavePageDialogProps) {
	const { user } = useAuth();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [tagsInput, setTagsInput] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSave = async () => {
		if (!user || !stageData || !name.trim()) return;

		setIsSaving(true);
		setError(null);

		try {
			// Parse tags from comma-separated input
			const tags = tagsInput
				.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0);

			const result = await savePageToLibrary(
				user,
				name.trim(),
				stageData,
				description.trim() || undefined,
				tags.length > 0 ? tags : undefined,
			);

			if (result.success) {
				// Reset form
				setName("");
				setDescription("");
				setTagsInput("");
				onOpenChange(false);
				toast.success("Page saved to library");
				// Emit refresh event for library panels
				window.dispatchEvent(new CustomEvent("library-page-refresh"));
				onSaved?.();
			} else {
				setError(result.error || "Failed to save page");
				toast.error(result.error || "Failed to save page");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save page");
		} finally {
			setIsSaving(false);
		}
	};

	const handleClose = () => {
		if (!isSaving) {
			setName("");
			setDescription("");
			setTagsInput("");
			setError(null);
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Save Page to Library</DialogTitle>
					<DialogDescription>
						Save this page to your library for reuse in other pathways.
						{stageData && (
							<span className="block mt-1 text-xs">
								This page contains {stageData.blocks.length} block
								{stageData.blocks.length !== 1 ? "s" : ""}.
							</span>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="page-name">Name *</Label>
						<Input
							id="page-name"
							placeholder="Enter a memorable name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={isSaving}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="page-description">Description</Label>
						<Input
							id="page-description"
							placeholder="Optional description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={isSaving}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="page-tags">Tags</Label>
						<Input
							id="page-tags"
							placeholder="Enter tags separated by commas"
							value={tagsInput}
							onChange={(e) => setTagsInput(e.target.value)}
							disabled={isSaving}
						/>
						<p className="text-xs text-muted-foreground">
							Separate multiple tags with commas
						</p>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={isSaving}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isSaving || !name.trim()}>
						{isSaving ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Saving...
							</>
						) : (
							"Save"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
