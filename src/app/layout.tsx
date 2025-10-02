import type { Metadata } from "next";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactFlowProvider } from "@xyflow/react";
import { ServicesProvider } from "@/providers/services/services-provider";
import { PathfinderDataProvider } from "@/providers/pathfinder-data/pathfinder-data-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Pathfinder Authoring Tool",
	description: "Daysix Pathfinder Authoring Tool",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SidebarProvider defaultOpen={false}>
			<ReactFlowProvider>
				<ServicesProvider>
					<PathfinderDataProvider>
						<html lang="en">
							<body
								className={`${geistSans.variable} ${geistMono.variable} antialiased `}
							>
								<AppSidebar />
								<SidebarTrigger />
								{children}
							</body>
						</html>
					</PathfinderDataProvider>
				</ServicesProvider>
			</ReactFlowProvider>
		</SidebarProvider>
	);
}
