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

function StageNode({
	id,
	data,
}: NodeProps<Node<{ blocks: ContentBlock<any>[]; title: string }>>) {
	const [blocks, setBlocks] = useState<ContentBlock<any>[]>(data.blocks);
	const [isSortable, setIsSortabe] = useState<boolean>(false);

	const { updateNodeData } = useReactFlow();

	const connections = useNodeConnections({
		handleType: "target",
	});

	useEffect(() => {
		updateNodeData(id, { blocks: blocks });
	}, [blocks]);

	function handleAddBlock(type: ContentBlockType) {
		setBlocks([
			...blocks,
			new ContentBlock({ type: type, data: getDefaultDataForType(type) }),
		]);
	}

	function handleRemoveBlock(id: string) {
		setBlocks(blocks.filter((block) => block.id !== id));
	}

	function handleUpdateBlock(id: string, updatedBlock: ContentBlock<any>) {
		setBlocks(
			blocks.map((block) =>
				block.id === updatedBlock.id ? updatedBlock : block
			)
		);
	}

	// Helper function to get default data for each block type
	function getDefaultDataForType(type: ContentBlockType): AnyBlockData {
		switch (type) {
			case "title":
				return { text: "", level: 1 as const };
			case "paragraph":
				return { text: "" };
			case "video":
				return { url: "", caption: "" };
			case "image":
				return { url: "", alt: "", caption: "" };
			case "component":
				return { component: "" };
			case "recommendation":
				return { services: [] };
			case "externalRecommendation":
				return { services: [] };
			case "assessment":
				return { formId: "", form: [] };
			case "html":
				return "";
			case "intro":
				return {
					overview: { title: { text: "", level: 1 as const }, text: [] },
					steps: { title: { text: "", level: 1 as const }, text: [] },
				};
			case "dropdown":
				return { title: { text: "", level: 1 as const }, content: [] };
			case "assessmentResult":
				return {
					title: { text: "", level: 1 as const },
					paragraph: { text: "" },
					cardStyles: "",
				};
			default:
				return "";
		}
	}

	return (
		<BaseNode className={`w-[550px] ${isSortable && "nodrag"}`}>
			<BaseNodeHeader className="border-b">
				<BaseNodeHeaderTitle>{data.title}</BaseNodeHeaderTitle>
				<Button
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
				</Button>
				<p className="text-xs text-muted-foreground border px-1 rounded-full">
					Stage
				</p>
			</BaseNodeHeader>
			<BaseNodeContent className="flex flex-col gap-6">
				<div className="flex flex-row gap-2">
					<h3 className="text-lg font-bold">Content</h3>
					<Tooltip>
						<TooltipTrigger>
							<Info className="w-4 h-4 text-muted-foreground" />
						</TooltipTrigger>
						<TooltipContent>
							<p className="text-xs">
								Add as many content blocks as you wish to make up the content of
								this stage. You will be able to see a preview of what the stage
								will look like below.
							</p>
						</TooltipContent>
					</Tooltip>
				</div>
				{blocks.length === 0 && (
					<div className="flex items-center justify-center text-muted-foreground">
						<p>No content</p>
					</div>
				)}
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
				</Sortable>
			</BaseNodeContent>
			<BaseNodeFooter>
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
			</BaseNodeFooter>
			{id === "s1" ? (
				<Handle type="source" position={Position.Right} />
			) : (
				<>
					<Handle type="target" position={Position.Left} />
					<Handle type="source" position={Position.Right} />
				</>
			)}
		</BaseNode>
	);
}

export default memo(StageNode);

StageNode.displayName = "StageNode";
