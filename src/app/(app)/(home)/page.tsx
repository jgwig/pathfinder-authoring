"use client";

import "@xyflow/react/dist/style.css";
import { redirect } from "next/navigation";
import { useAuth } from "@/providers/auth/use-auth";
import { ReactFlowLayout } from "@/components/react-flow/ReactFlowLayout";

export default function Home() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex min-h-screen w-full items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (!user) {
		redirect("login");
	}

	return (
		<div className="flex min-h-screen w-full">
			<ReactFlowLayout />
		</div>
	);
}
