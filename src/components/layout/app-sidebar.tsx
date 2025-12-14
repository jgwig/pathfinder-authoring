"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth/use-auth";
import { usePathway } from "@/providers/pathway/use-pathway";
import { Pathway, User as PayloadUser } from "@/payload-types";

export function AppSidebar() {
	const [name, setName] = useState("");
	const [isOpen, setIsOpen] = useState(false);

	const {
		pathway,
		pathways,
		isLoading,
		error,
		createPathway,
		fetchPathways,
		setPathwayById,
	} = usePathway();
	const { user, logout } = useAuth();

	// Fetch pathways on component mount
	useEffect(() => {
		if (user) {
			fetchPathways(user);
		}
	}, []);

	const handleCreate = async () => {
		if (!user) {
			console.error("User is not defined. Cannot create pathway.");
			return;
		}

		await createPathway(user, name);
		setIsOpen(false);
		setName("");
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getAuthorEmail = (pathway: Pathway): string => {
		if (typeof pathway.user === "object" && pathway.user !== null) {
			return (pathway.user as PayloadUser).email;
		}
		return "Unknown";
	};

	return (
		<Sidebar>
			<SidebarHeader className="border-b">
				<Image src={"/pathfinder_logo.png"} width={200} height={150} alt="" />
			</SidebarHeader>
			<SidebarContent>
				<div className="p-4 space-y-4">
					<h2 className="text-lg font-semibold">Pathways</h2>

					{error && (
						<div className="text-sm text-destructive">Error: {error}</div>
					)}

					{isLoading ? (
						<div className="text-sm text-muted-foreground">
							Loading pathways...
						</div>
					) : pathways.length === 0 ? (
						<div className="text-sm text-muted-foreground">
							No pathways yet. Create one to get started!
						</div>
					) : (
						<div className="space-y-3">
							{pathways.map((pathway) => (
								<Card
									key={pathway.id}
									className="cursor-pointer hover:bg-accent transition-colors"
									onClick={() => setPathwayById(pathway.id)}
								>
									<CardHeader className="p-4 pb-2">
										<CardTitle className="text-base">{pathway.name}</CardTitle>
										<CardDescription className="text-xs">
											{getAuthorEmail(pathway)}
										</CardDescription>
									</CardHeader>
									<CardContent className="p-4 pt-0">
										<p className="text-xs text-muted-foreground">
											Created {formatDate(pathway.createdAt)}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</SidebarContent>
			<SidebarFooter>
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>
						<Button variant={"outline"}>New</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Create New Pathway</DialogTitle>
							<DialogDescription>
								Enter a name to create a new pathway
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4">
							<div className="grid gap-3">
								<Label htmlFor="name-1">Name</Label>
								<Input
									id="name-1"
									name="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									disabled={isLoading}
								/>
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline" disabled={isLoading}>
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="submit"
								onClick={handleCreate}
								disabled={isLoading || !name.trim()}
							>
								{isLoading ? "Creating..." : "Create"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<Button variant={"destructive"} onClick={() => logout()}>
					Logout
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
}
