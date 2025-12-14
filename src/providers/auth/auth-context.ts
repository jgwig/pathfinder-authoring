import { User } from "@/payload-types";
import { createContext } from "react";

export const AuthContext = createContext<{
	user: User | undefined;
	login: (email: string, password: string) => void;
	logout: () => void;
}>({
	user: undefined,
	login: () => {},
	logout: () => {},
});
