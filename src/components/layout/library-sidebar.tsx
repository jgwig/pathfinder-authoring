"use client";

import { useState } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/providers/auth/use-auth";
import { useFlowContext } from "@/providers/flow/flow-context";
import { FolderKanban, Blocks, FileText } from "lucide-react";
import { PathwaysPanel } from "@/components/library/pathways-panel";
import { BlockLibraryPanel } from "@/components/library/block-library-panel";
import { PageLibraryPanel } from "@/components/library/page-library-panel";

type TabValue = "pathways" | "blocks" | "pages";

export function LibrarySidebar() {
	const [activeTab, setActiveTab] = useState<TabValue>("pathways");
	const { logout } = useAuth();

	// Try to get flow context - it may not be available on all pages
	let selectedNodeId: string | null = null;
	try {
		const flowContext = useFlowContext();
		selectedNodeId = flowContext.selectedNode?.id ?? null;
	} catch {
		// Flow context not available (e.g., on pathways list page)
	}

	return (
		<Sidebar>
			<SidebarHeader className="border-b space-y-4">
				<Image src={"/pathfinder_logo.png"} width={200} height={150} alt="" />
				<ToggleGroup
					type="single"
					value={activeTab}
					onValueChange={(value) => value && setActiveTab(value as TabValue)}
					variant="outline"
					className="w-full"
				>
					<ToggleGroupItem value="pathways" className="flex-1 gap-1">
						<FolderKanban className="h-4 w-4" />
						<span className="hidden sm:inline text-xs">Pathways</span>
					</ToggleGroupItem>
					<ToggleGroupItem value="blocks" className="flex-1 gap-1">
						<Blocks className="h-4 w-4" />
						<span className="hidden sm:inline text-xs">Blocks</span>
					</ToggleGroupItem>
					<ToggleGroupItem value="pages" className="flex-1 gap-1">
						<FileText className="h-4 w-4" />
						<span className="hidden sm:inline text-xs">Pages</span>
					</ToggleGroupItem>
				</ToggleGroup>
			</SidebarHeader>
			<SidebarContent>
				{activeTab === "pathways" && <PathwaysPanel />}
				{activeTab === "blocks" && (
					<BlockLibraryPanel selectedNodeId={selectedNodeId} />
				)}
				{activeTab === "pages" && <PageLibraryPanel />}
			</SidebarContent>
			<SidebarFooter>
				<Button variant={"destructive"} onClick={() => logout()}>
					Logout
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
}
