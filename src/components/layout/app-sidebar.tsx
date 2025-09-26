import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeader className="border-b">
				<Image src={"/pathfinder_logo.png"} width={200} height={150} alt="" />
			</SidebarHeader>
			<SidebarContent></SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}
