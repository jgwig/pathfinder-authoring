"use server";

// Server action for fetching external services. Flow server actions now live in flow-actions.ts.
export async function getServices(council: string) {
	const baseURL = "https://earlyaccess-api.daysix.co/";
	const servicesURL = baseURL + council + "/community-services";

	try {
		const response = await fetch(servicesURL, { method: "GET" });
		const data = await response.json();

		return data;
	} catch (error) {
		console.error(error);
		throw error; // Re-throw to allow proper error handling
	}
}
