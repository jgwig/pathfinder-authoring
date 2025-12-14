"use client";

import "@xyflow/react/dist/style.css";
import { redirect } from "next/navigation";
import { useAuth } from "@/providers/auth/use-auth";
import { ReactFlowLayout } from "@/components/react-flow/ReactFlowLayout";

export default function Home() {
	const { user } = useAuth();

	if (!user) {
		redirect("login");
	}

	return (
		<div className="flex min-h-screen w-full">
			<ReactFlowLayout />
		</div>
	);
}
