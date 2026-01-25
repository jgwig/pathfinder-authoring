"use client";

import {
	ContentBlock,
	contentBlockOptions,
	ContentBlockType,
	AnyBlockData,
	getDefaultDataForType,
} from "@/types/content";
import { StageNodeData } from "@/types/flow/nodes";
import { Node, useReactFlow } from "@xyflow/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { GripVertical, Info, Plus, X, BookmarkPlus } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { SaveBlockDialog } from "@/components/library/save-block-dialog";
import {
	Sortable,
	SortableContent,
	SortableItem,
	SortableItemHandle,
} from "../ui/sortable";
import { BlockEditor } from "../content-blocks/editor/block-editor";
import { TextField } from "../ui/form-fields";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function Inspector({ node }: { node: Node<StageNodeData> | undefined }) {
	const [blocks, setBlocks] = useState<ContentBlock<AnyBlockData>[]>([]);
	const [title, setTitle] = useState<string>("");
	const [blockToSave, setBlockToSave] =
		useState<ContentBlock<AnyBlockData> | null>(null);
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);

	const { updateNodeData } = useReactFlow();

	// Handler for adding blocks from library
	const handleAddBlockFromLibrary = useCallback(
		(event: CustomEvent<{ block: ContentBlock<AnyBlockData> }>) => {
			const { block } = event.detail;
			// Create a new block with a fresh ID
			const newBlock = new ContentBlock({
				type: block.type,
				data: JSON.parse(JSON.stringify(block.data)),
				config: block.config
					? JSON.parse(JSON.stringify(block.config))
					: undefined,
			});
			setBlocks((prev) => [...prev, newBlock]);
		},
		[],
	);

	// Listen for add-block-from-library events
	useEffect(() => {
		window.addEventListener(
			"add-block-from-library",
			handleAddBlockFromLibrary as EventListener,
		);
		return () => {
			window.removeEventListener(
				"add-block-from-library",
				handleAddBlockFromLibrary as EventListener,
			);
		};
	}, [handleAddBlockFromLibrary]);

	// Initialise the component state when the node changes
	useEffect(() => {
		if (node && node.type === "stageNode") {
			setBlocks(node.data.blocks);
			setTitle(node.data.title);
		}
	}, [node]);

	// Keep the react-flow node data in sync when blocks change.
	useEffect(() => {
		if (node) {
			updateNodeData(node.id, { blocks: blocks });
		}
	}, [blocks, node, updateNodeData]);

	useEffect(() => {
		if (node) {
			updateNodeData(node.id, { title: title });
		}
	}, [title, node, updateNodeData]);

	function handleAddBlock(type: ContentBlockType) {
		setBlocks([
			...blocks,
			new ContentBlock({ type: type, data: getDefaultDataForType(type) }),
		]);
	}

	function handleRemoveBlock(id: string) {
		setBlocks(blocks.filter((block) => block.id !== id));
	}

	function handleUpdateBlock(updatedBlock: ContentBlock<AnyBlockData>) {
		setBlocks(
			blocks.map((block) =>
				block.id === updatedBlock.id ? updatedBlock : block,
			),
		);
	}

	function handleUpdateStageTitle(value: string) {
		if (node) {
			setTitle(value);
		}
	}

	if (!node) {
		return (
			<div className="h-full flex flex-col w-[400px] bg-gray-50 border-l">
				<div className="flex flex-col p-4 w-full border-b">
					<h3 className="font-semibold text-2xl text-neutral-800">Inspector</h3>
				</div>
				<p className="text-sm text-slate-500 mt-2 p-4">
					Select a node to edit its properties.
				</p>
			</div>
		);
	}

	return (
		<div className="h-full max-h-screen overflow-y-auto flex flex-col w-[450px]  border-l">
			<div className="flex flex-col p-4 w-full border-b">
				<h3 className="font-semibold text-2xl text-neutral-800">Inspector</h3>
				<p className="text-sm text-slate-500 mt-2">{node.id}</p>
			</div>
			<div className="flex-1 gap-4 w-full">
				<div className="flex flex-col p-4 gap-2 border-b">
					<TextField
						label="Stage Title"
						value={title}
						onChange={(value) => handleUpdateStageTitle(value)}
						className="[&>label]:font-bold"
					/>
				</div>
				<div className="flex flex-col gap-2 p-4">
					<div className="flex flex-row gap-2 ">
						<h3 className="text-sm font-bold">Content</h3>
						<Tooltip>
							<TooltipTrigger>
								<Info className="w-4 h-4 text-muted-foreground" />
							</TooltipTrigger>
							<TooltipContent>
								<p className="text-xs">
									Add as many content blocks as you wish to make up the content
									of this stage. You will see the preview of the stage on the
									canvas as you edit.
								</p>
							</TooltipContent>
						</Tooltip>
					</div>
					{blocks.length > 0 ? (
						<Sortable
							value={blocks}
							onValueChange={setBlocks}
							getItemValue={(item) => item.id}
							orientation="vertical"
						>
							<SortableContent className="flex flex-col gap-4">
								{blocks &&
									blocks.map((block) => {
										return (
											<SortableItem key={block.id} value={block.id}>
												<div className="p-4 rounded-lg border flex flex-col ">
													<div className="flex flex-row justify-between items-center">
														<div className="flex flex-row items-center">
															<SortableItemHandle asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="size-8"
																>
																	<GripVertical className="h-4 w-4" />
																</Button>
															</SortableItemHandle>
															<p className="font-semibold">
																{contentBlockOptions[block.type]}
															</p>
														</div>
														<div className="flex flex-row items-center gap-1">
															<Tooltip>
																<TooltipTrigger asChild>
																	<Button
																		variant="ghost"
																		size="icon"
																		className="size-8"
																		onClick={() => {
																			setBlockToSave(block);
																			setSaveDialogOpen(true);
																		}}
																	>
																		<BookmarkPlus className="h-4 w-4 text-muted-foreground" />
																	</Button>
																</TooltipTrigger>
																<TooltipContent>
																	<p className="text-xs">Save to library</p>
																</TooltipContent>
															</Tooltip>
															<Button
																variant="ghost"
																size="icon"
																className="size-8"
																onClick={() => handleRemoveBlock(block.id)}
															>
																<X className="h-4 w-4 text-red-800" />
															</Button>
														</div>
													</div>
													<BlockEditor
														block={block}
														handleUpdateBlock={handleUpdateBlock}
													/>
												</div>
											</SortableItem>
										);
									})}
							</SortableContent>
						</Sortable>
					) : (
						<div className="flex size-full items-center justify-center p-4">
							<p className=" text-slate-500">No Content</p>
						</div>
					)}
				</div>
			</div>
			<div className="flex flex-col p-4 w-full border-t">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="nodrag w-full">
							<Plus />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{Object.entries(contentBlockOptions).map(([key, value]) => (
							<DropdownMenuItem
								key={value}
								onClick={() => handleAddBlock(key as ContentBlockType)}
							>
								{value}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Save Block to Library Dialog */}
			<SaveBlockDialog
				open={saveDialogOpen}
				onOpenChange={setSaveDialogOpen}
				block={blockToSave}
				onSaved={() => setBlockToSave(null)}
			/>
		</div>
	);
}
