"use server";

import { ServiceListServerModel } from "@/types/service/server/serviceListServerModel";
import { ServiceServerModel } from "@/types/service/server/serviceServerModel";
import { Service } from "@/types/service/service";

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
