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
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth/use-auth";
import { usePathway } from "@/providers/pathway/use-pathway";
import { Pathway, User as PayloadUser } from "@/payload-types";
import {
	Check,
	Trash2,
	History,
	ChevronDown,
	RotateCcw,
	Loader2,
} from "lucide-react";

export function AppSidebar() {
	const [name, setName] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [isVersionsOpen, setIsVersionsOpen] = useState(false);

	const {
		pathway: selectedPathway,
		pathways,
		versions,
		previewVersion,
		isLoading,
		isLoadingVersions,
		isPreviewingVersion,
		error,
		createPathway,
		fetchPathways,
		selectPathway,
		deletePathway,
		fetchVersions,
		restoreVersion,
		previewVersionById,
		clearPreview,
	} = usePathway();
	const { user, logout } = useAuth();

	const [pathwayToDelete, setPathwayToDelete] = useState<number | null>(null);
	const [versionToRestore, setVersionToRestore] = useState<string | null>(null);

	// Fetch pathways on component mount when user is available
	useEffect(() => {
		if (user) {
			fetchPathways();
		}
	}, [user, fetchPathways]);

	// Fetch versions when a pathway is selected and versions panel is open
	useEffect(() => {
		if (selectedPathway && isVersionsOpen) {
			fetchVersions();
		}
	}, [selectedPathway, isVersionsOpen, fetchVersions]);

	const handleCreate = async () => {
		if (!user) {
			console.error("User is not defined. Cannot create pathway.");
			return;
		}

		await createPathway(name);
		setIsOpen(false);
		setName("");
	};

	const handleDelete = async () => {
		if (!pathwayToDelete) return;

		await deletePathway(pathwayToDelete);
		setPathwayToDelete(null);
	};

	const handleRestoreVersion = async () => {
		if (!versionToRestore) return;

		await restoreVersion(versionToRestore);
		setVersionToRestore(null);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
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
									className={`cursor-pointer hover:bg-accent transition-colors ${
										selectedPathway?.id === pathway.id
											? "ring-2 ring-primary"
											: ""
									}`}
									onClick={() => selectPathway(pathway.id)}
								>
									<CardHeader className="p-4 pb-2">
										<CardTitle className="text-base flex items-center justify-between">
											<span>{pathway.name}</span>
											<div className="flex items-center gap-2">
												{selectedPathway?.id === pathway.id && (
													<Check className="w-4 h-4 text-primary" />
												)}
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6 text-destructive hover:text-destructive"
													onClick={(e) => {
														e.stopPropagation();
														setPathwayToDelete(pathway.id);
													}}
													disabled={isLoading}
												>
													<Trash2 className="w-3 h-3" />
												</Button>
											</div>
										</CardTitle>
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

					{/* Version History Section */}
					{selectedPathway && (
						<Collapsible
							open={isVersionsOpen}
							onOpenChange={setIsVersionsOpen}
							className="mt-6"
						>
							<CollapsibleTrigger asChild>
								<Button variant="ghost" className="w-full justify-between px-2">
									<span className="flex items-center gap-2">
										<History className="w-4 h-4" />
										Version History
									</span>
									<ChevronDown
										className={`w-4 h-4 transition-transform ${
											isVersionsOpen ? "rotate-180" : ""
										}`}
									/>
								</Button>
							</CollapsibleTrigger>
							<CollapsibleContent className="pt-2">
								{isLoadingVersions ? (
									<div className="flex items-center justify-center py-4">
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										<span className="text-sm text-muted-foreground">
											Loading versions...
										</span>
									</div>
								) : versions.length === 0 ? (
									<div className="text-sm text-muted-foreground py-2 px-2">
										No previous versions
									</div>
								) : (
									<ScrollArea className="h-[200px]">
										<div className="space-y-2 pr-2">
											{versions.map((version, index) => {
												const isCurrentVersion = index === 0;
												const isBeingPreviewed =
													previewVersion?.id === version.id;

												return (
													<div
														key={version.id}
														className={`flex items-center justify-between p-2 rounded-md border transition-colors cursor-pointer ${
															isBeingPreviewed
																? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
																: "bg-card text-card-foreground hover:bg-accent"
														}`}
														onClick={() => {
															if (isCurrentVersion) {
																clearPreview();
															} else {
																previewVersionById(version.id);
															}
														}}
													>
														<div className="flex flex-col">
															<span className="text-xs font-medium flex items-center gap-1">
																{isCurrentVersion
																	? "Current"
																	: `v${versions.length - index}`}
																{isBeingPreviewed && !isCurrentVersion && (
																	<span className="text-[10px] text-blue-600 dark:text-blue-400">
																		(Previewing)
																	</span>
																)}
															</span>
															<span className="text-xs text-muted-foreground">
																{formatDateTime(version.createdAt)}
															</span>
														</div>
														{!isCurrentVersion && (
															<Button
																variant="ghost"
																size="sm"
																className="h-7 px-2"
																onClick={(e) => {
																	e.stopPropagation();
																	setVersionToRestore(version.id);
																}}
																disabled={isLoading}
															>
																<RotateCcw className="w-3 h-3 mr-1" />
																Restore
															</Button>
														)}
													</div>
												);
											})}
										</div>
									</ScrollArea>
								)}
							</CollapsibleContent>
						</Collapsible>
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

				{/* Delete Confirmation Dialog */}
				<Dialog
					open={pathwayToDelete !== null}
					onOpenChange={(open) => !open && setPathwayToDelete(null)}
				>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Delete Pathway</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete this pathway? This action cannot
								be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline" disabled={isLoading}>
									Cancel
								</Button>
							</DialogClose>
							<Button
								variant="destructive"
								onClick={handleDelete}
								disabled={isLoading}
							>
								{isLoading ? "Deleting..." : "Delete"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Restore Version Confirmation Dialog */}
				<Dialog
					open={versionToRestore !== null}
					onOpenChange={(open) => !open && setVersionToRestore(null)}
				>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Restore Version</DialogTitle>
							<DialogDescription>
								Are you sure you want to restore this version? Your current
								changes will be saved as a new version before restoring.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline" disabled={isLoading}>
									Cancel
								</Button>
							</DialogClose>
							<Button onClick={handleRestoreVersion} disabled={isLoading}>
								{isLoading ? "Restoring..." : "Restore"}
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
