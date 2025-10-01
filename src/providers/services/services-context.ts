import { Service } from "@/types/service/service";
import { createContext } from "react";

export const ServicesContext = createContext<{
	services: Service[] | undefined;
	setServices: (services: Service[]) => void;
	council: string;
	setCouncil: (council: string) => void;
	loading: boolean;
	setLoading: (loading: boolean) => void;
}>({
	services: undefined,
	setServices: () => {},
	council: "lothian",
	setCouncil: () => {},
	loading: false,
	setLoading: () => {},
});
