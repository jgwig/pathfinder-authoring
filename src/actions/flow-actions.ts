"use server";

import { getPayload } from "payload";
import config from "@/payload.config";
import { Pathway, User } from "@/payload-types";
import { PathwayFlowData, createInitialFlowData } from "@/types/pathway";

export async function createPathwayAction(
	user: User,
	name: string,
	initialData?: PathwayFlowData
): Promise<{ success: boolean; pathway?: Pathway; error?: string }> {
	const payload = await getPayload({ config });

	try {
		// Use provided initial data or create default flow data
		const flowData = initialData ?? createInitialFlowData();

		const pathway = await payload.create({
			collection: "pathways",
			overrideAccess: false,
			user: user,
			data: {
				name,
				user,
				// Cast to unknown first to satisfy PayloadCMS JSON field type
				data: flowData as unknown as Record<string, unknown>,
			},
		});
		return { success: true, pathway };
	} catch (error) {
		console.error("Error creating pathway:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to create pathway",
		};
	}
}

export async function getPathways(user: User) {
	const payload = await getPayload({ config });

	try {
		const pathways = await payload.find({
			collection: "pathways",
			overrideAccess: false,
			user: user,
			pagination: false,
		});
		return pathways;
	} catch (error) {
		console.error(error);
	}
}

export async function updatePathway(
	user: User,
	pathwayId: number,
	flowData: PathwayFlowData
): Promise<Pathway> {
	const payload = await getPayload({ config });

	const result = await payload.update({
		collection: "pathways",
		id: pathwayId,
		overrideAccess: false,
		user: user,
		data: {
			// Cast to unknown first to satisfy PayloadCMS JSON field type
			data: flowData as unknown as Record<string, unknown>,
		},
	});

	return result;
}

export async function deletePathwayAction(
	user: User,
	pathwayId: number
): Promise<{ success: boolean; error?: string }> {
	const payload = await getPayload({ config });

	try {
		await payload.delete({
			collection: "pathways",
			id: pathwayId,
			overrideAccess: false,
			user: user,
		});
		return { success: true };
	} catch (error) {
		console.error("Error deleting pathway:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to delete pathway",
		};
	}
}

/**
 * Version type for pathway versions from PayloadCMS
 */
export interface PathwayVersion {
	id: string;
	parent: number;
	version: Pathway;
	createdAt: string;
	updatedAt: string;
	autosave?: boolean;
}

/**
 * Fetch all versions for a specific pathway
 */
export async function getPathwayVersions(
	user: User,
	pathwayId: number
): Promise<{ docs: PathwayVersion[]; totalDocs: number } | null> {
	const payload = await getPayload({ config });

	try {
		const result = await payload.findVersions({
			collection: "pathways",
			where: {
				parent: { equals: pathwayId },
			},
			sort: "-createdAt",
			limit: 50,
			overrideAccess: false,
			user: user,
		});

		return {
			docs: result.docs as unknown as PathwayVersion[],
			totalDocs: result.totalDocs,
		};
	} catch (error) {
		console.error("Error fetching pathway versions:", error);
		return null;
	}
}

/**
 * Restore a pathway to a specific version
 */
export async function restorePathwayVersion(
	user: User,
	versionId: string
): Promise<{ success: boolean; pathway?: Pathway; error?: string }> {
	const payload = await getPayload({ config });

	try {
		const restored = await payload.restoreVersion({
			collection: "pathways",
			id: versionId,
			overrideAccess: false,
			user: user,
		});

		return { success: true, pathway: restored };
	} catch (error) {
		console.error("Error restoring pathway version:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to restore version",
		};
	}
}
