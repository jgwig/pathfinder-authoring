"use client";

import { authenticateAction, loginAction, logoutAction } from "@/actions/auth";
import { User } from "@/payload-types";
import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const isAuthenticated = async () => {
			const response = await authenticate();
			setUser(response);
			setIsLoading(false);
		};
		isAuthenticated();
	}, []);

	async function login(email: string, password: string) {
		const result = await loginAction({ email: email, password: password });
		if (result.user) setUser(result.user);
	}

	async function logout() {
		const response = await logoutAction();
		if (response) setUser(undefined);
	}

	async function authenticate(): Promise<User | undefined> {
		const response = await authenticateAction();
		if (response) return response.user;
		return undefined;
	}

	return (
		<AuthContext value={{ user, isLoading, login, logout }}>
			{children}
		</AuthContext>
	);
};
