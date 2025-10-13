"use client";

import { getServices } from "@/actions/actions";
import { ServiceListServerModel } from "@/types/service/server/serviceListServerModel";
import { ServiceServerModel } from "@/types/service/server/serviceServerModel";
import { Service } from "@/types/service/service";
import { useEffect, useState, type ReactNode } from "react";
import { ServicesContext } from "./services-context";

export const ServicesProvider = ({ children }: { children: ReactNode }) => {
	const [loading, setLoading] = useState(false);
	const [council, setCouncil] = useState("lothian");
	const [services, setServices] = useState<Service[] | undefined>(undefined);

	// Fetch services when council changes
	useEffect(() => {
		const fetchServices = async () => {
			setLoading(true);
			const data: ServiceListServerModel = await getServices(council);
			if (!data) {
				setServices(undefined);
				setLoading(false);
				return;
			}
			const services: Service[] = data.services.map(
				(serverModel: ServiceServerModel) =>
					Service.fromServiceServerModel(new ServiceServerModel(serverModel))
			);
			setServices(services);
			setLoading(false);
		};
		fetchServices();
	}, [council]);

	function getServiceBySlug(slug: string): Service | undefined {
		return services?.find((service) => service.name === slug);
	}

	return (
		<ServicesContext
			value={{
				council,
				loading,
				services,
				setCouncil,
				setLoading,
				setServices,
				getServiceBySlug,
			}}
		>
			{children}
		</ServicesContext>
	);
};
