"use server";

import { getPayload } from "payload";
import config from "@/payload.config";
import { User } from "@/payload-types";

export async function getServices(council: string) {
	const baseURL = "https://earlyaccess-api-dev.daysix.co/";
	const servicesURL = baseURL + council + "/community-services";

	try {
		const response = await fetch(servicesURL, { method: "GET" });
		const data = await response.json();

		return data;
	} catch (error) {
		console.error(error);
	}
}

export async function createPathwayAction(user: User, name: string) {
	const payload = await getPayload({ config });

	try {
		const pathway = await payload.create({
			collection: "pathways",
			overrideAccess: false,
			user: user,
			data: {
				name,
				user,
				data: {}, // Initialize with empty data object
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
	flowData: any
) {
	const payload = await getPayload({ config });

	try {
		const result = await payload.update({
			collection: "pathways",
			id: pathwayId,
			data: {
				data: flowData,
			},
		});
		return result;
	} catch (error) {
		console.error(error);
	}
}
