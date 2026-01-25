import { Service } from "@/types/service/service";
import { createContext } from "react";

export const ServicesContext = createContext<{
	services: Service[] | undefined;
	setServices: (services: Service[]) => void;
	council: string;
	setCouncil: (council: string) => void;
	loading: boolean;
	setLoading: (loading: boolean) => void;
	getServiceBySlug: (slug: string, council?: string) => Service | undefined;
	getServiceFromCouncil: (
		slug: string,
		council: string
	) => Promise<Service | undefined>;
}>({
	services: undefined,
	setServices: () => {},
	council: "lothian",
	setCouncil: () => {},
	loading: false,
	setLoading: () => {},
	getServiceBySlug: () => undefined,
	getServiceFromCouncil: async () => undefined,
});
