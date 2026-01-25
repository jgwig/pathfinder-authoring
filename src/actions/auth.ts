"use server";

import { login, logout } from "@payloadcms/next/auth";
import config from "@payload-config";
import { getPayload } from "payload";
import { headers as getHeaders } from "next/headers";

export async function loginAction({
	email,
	password,
}: {
	email: string;
	password: string;
}) {
	try {
		const result = await login({
			collection: "users",
			config,
			email,
			password,
		});
		console.log("Login successfull with user: ", result.user.email);
		return { success: true, user: result.user };
	} catch (error) {
		console.error("Login error:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Login failed. Please check your credentials.",
		};
	}
}

export async function logoutAction() {
	try {
		return await logout({ allSessions: true, config });
	} catch (error) {
		throw new Error(
			`Logout failed: ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	}
}

export async function authenticateAction() {
	const payload = await getPayload({ config });
	const headers = await getHeaders();
	const { user } = await payload.auth({ headers });

	if (user) {
		return { authenticated: true, user: user };
	}

	return { authenticated: false, user: undefined };
}
