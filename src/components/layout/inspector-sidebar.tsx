"use client";

import {
	ContentBlock,
	contentBlockOptions,
	ContentBlockType,
	getDefaultDataForType,
	StageNodeData,
} from "@/types/content";
import { Node, useReactFlow } from "@xyflow/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { GripVertical, Info, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
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
	const [blocks, setBlocks] = useState<ContentBlock<any>[]>([]);
	const [title, setTitle] = useState<string>("");

	const { updateNodeData } = useReactFlow();

	// Initialise the component state when the node changes
	useEffect(() => {
		if (node) {
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

	function handleUpdateBlock(updatedBlock: ContentBlock<any>) {
		setBlocks(
			blocks.map((block) =>
				block.id === updatedBlock.id ? updatedBlock : block
			)
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
									blocks.map((block, i) => {
										// console.log(blocks);
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
														<Button
															variant="ghost"
															size="icon"
															className="size-8"
															onClick={() => handleRemoveBlock(block.id)}
														>
															<X className="h-4 w-4 text-red-800" />
														</Button>
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
		</div>
	);
}
