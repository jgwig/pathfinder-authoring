import { Button } from "@/components/ui/button";
import {
	BaseNode,
	BaseNodeContent,
	BaseNodeFooter,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/nodes/base-node";
import {
	Handle,
	Node,
	NodeProps,
	Position,
	useNodeConnections,
	useReactFlow,
} from "@xyflow/react";
import { ArrowDownUp, GripVertical, Info, Plus, Rocket, X } from "lucide-react";
import { memo, useEffect, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AnyBlockData,
	ContentBlock,
	contentBlockOptions,
	ContentBlockType,
	StageNodeData,
} from "@/types/content";
import {
	Sortable,
	SortableContent,
	SortableItem,
	SortableItemHandle,
} from "@/components/ui/sortable";
import { BlockEditor } from "@/components/content-blocks/block-editor";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

function StageNode({ id, data }: NodeProps<Node<StageNodeData>>) {
	return (
		<BaseNode className={`w-[550px]`}>
			<BaseNodeHeader className="border-b">
				<BaseNodeHeaderTitle>{data.title}</BaseNodeHeaderTitle>
				{/* <Button
					variant="ghost"
					size="icon"
					className="size-8"
					onClick={() => setIsSortabe((prev) => !prev)}
				>
					<ArrowDownUp
						className={`h-4 w-4 ${
							isSortable ? "text-black" : "text-muted-foreground"
						}`}
					/>
				</Button> */}
				<p className="text-xs text-muted-foreground border px-1 rounded-full">
					Stage
				</p>
			</BaseNodeHeader>
			<BaseNodeContent className="flex min-h-[500px]   flex-col">
				{data.blocks.length === 0 && (
					<div className="flex-1 flex h-full items-center justify-center text-muted-foreground">
						<p>No content</p>
					</div>
				)}
				{data.blocks &&
					data.blocks.map((block, i) => {
						// console.log(blocks);
						return <p key={block.id}>{block.type}</p>;
					})}
				{/* <Sortable
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
										<div className="p-4 rounded-lg border-accent border flex flex-col ">
											<div className="flex flex-row justify-between items-center">
												<div className="flex flex-row items-center">
													<SortableItemHandle
														asChild
														className={`${!isSortable && "hidden"}`}
													>
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
				</Sortable> */}
			</BaseNodeContent>
			{/* <BaseNodeFooter>
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
			</BaseNodeFooter> */}
			{id === "s1" ? (
				<Handle
					type="source"
					position={Position.Right}
					className="bg-green-500"
					style={{ width: "10px", height: "10px" }}
				/>
			) : (
				<>
					<Handle
						type="target"
						position={Position.Left}
						style={{ width: "10px", height: "10px" }}
					/>
					<Handle
						type="source"
						position={Position.Right}
						style={{ width: "10px", height: "10px" }}
					/>
				</>
			)}
		</BaseNode>
	);
}

export default memo(StageNode);

StageNode.displayName = "StageNode";
