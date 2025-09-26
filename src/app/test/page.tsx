"use client";

import { Button } from "@/components/ui/button";
import {
	Sortable,
	SortableContent,
	SortableItem,
	SortableItemHandle,
} from "@/components/ui/sortable";
import { ContentBlock, contentBlockOptions } from "@/types/content";
import { GripVertical } from "lucide-react";
import { useEffect, useState } from "react";

export default function Test() {
	const [blocks, setBlocks] = useState<ContentBlock<any>[]>([
		{
			type: "recommendation",
			id: "37cbe197-b505-47dd-a067-6cbe077a6fbc",
		},
		{
			type: "image",
			id: "56c17fc6-f1a6-430c-bb8c-0fe93f0b4c08",
		},
		{
			type: "html",
			id: "55a3a8c6-370d-408c-bcc5-bf251d719d19",
		},
	]);

	useEffect(() => {
		console.log(blocks);
	}, [blocks]);
	return (
		<div className="w-screen h-screen flex justify-center items-center">
			<Sortable
				value={blocks}
				onValueChange={setBlocks}
				getItemValue={(item) => item.id}
				orientation="vertical"
			>
				<SortableContent>
					{blocks &&
						blocks.map((block, i) => {
							console.log(block);
							return (
								<SortableItem key={block.type + i} value={block.id}>
									<SortableItemHandle asChild>
										<Button variant="ghost" size="icon" className="size-8">
											<GripVertical className="h-4 w-4" />
										</Button>
									</SortableItemHandle>
									<div className="p-4 rounded-lg border-accent border">
										{contentBlockOptions[block.type]}
									</div>
								</SortableItem>
							);
						})}
				</SortableContent>
			</Sortable>
		</div>
	);
}
