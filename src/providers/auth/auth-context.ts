import { User } from "@/payload-types";
import { createContext } from "react";

export const AuthContext = createContext<{
	user: User | undefined;
	isLoading: boolean;
	login: (email: string, password: string) => void;
	logout: () => void;
}>({
	user: undefined,
	isLoading: true,
	login: () => {},
	logout: () => {},
});
