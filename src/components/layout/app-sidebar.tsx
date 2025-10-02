"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { usePathfinderData } from "@/providers/pathfinder-data/use-pathfinder-data-provider";
import Image from "next/image";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { initialNodes } from "@/nodes/initial-node";

export function AppSidebar() {
	const { pathfinderData, loadPathfinder } = usePathfinderData();
	const reactFlow = useReactFlow();

	function createNewFlow() {
		reactFlow.setNodes(initialNodes);
		reactFlow.setEdges([]);
		reactFlow.setViewport({ x: 140, y: 200, zoom: 0.85 });
	}

	return (
		<Sidebar>
			<SidebarHeader className="border-b">
				<Image src={"/pathfinder_logo.png"} width={200} height={150} alt="" />
			</SidebarHeader>
			<SidebarContent>
				{pathfinderData.map((data) => (
					<p onClick={() => loadPathfinder(data.id)} key={data.id}>
						{data.name}
					</p>
				))}
			</SidebarContent>
			<SidebarFooter className="border-t">
				<Button variant={"outline"} onClick={() => createNewFlow()}>
					<Plus className="w-4 h-4" />
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
}
