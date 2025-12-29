"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

import { ReactFlowProvider } from "@xyflow/react";
import { ServicesProvider } from "@/providers/services/services-provider";
import { PathwayProvider } from "@/providers/pathway/pathway-provider";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SidebarProvider defaultOpen={false}>
			<ReactFlowProvider>
				<ServicesProvider>
					<PathwayProvider>
						<AppSidebar />
						<SidebarTrigger />
						{children}
					</PathwayProvider>
				</ServicesProvider>
			</ReactFlowProvider>
		</SidebarProvider>
	);
}
