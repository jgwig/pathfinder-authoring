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
			try {
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
			} catch (error) {
				console.error("Failed to fetch services:", error);
				setServices(undefined);
			} finally {
				setLoading(false);
			}
		};
		fetchServices();
	}, [council]);

	function getServiceBySlug(
		slug: string,
		targetCouncil?: string
	): Service | undefined {
		// If target council matches current council, use cached services
		if (!targetCouncil || targetCouncil === council) {
			return services?.find((service) => service.name === slug);
		}
		// If councils don't match, return undefined (caller should use getServiceFromCouncil)
		return undefined;
	}

	async function getServiceFromCouncil(
		slug: string,
		targetCouncil: string
	): Promise<Service | undefined> {
		try {
			const data: ServiceListServerModel = await getServices(targetCouncil);
			if (!data) return undefined;

			const targetServices: Service[] = data.services.map(
				(serverModel: ServiceServerModel) =>
					Service.fromServiceServerModel(new ServiceServerModel(serverModel))
			);
			return targetServices.find((service) => service.name === slug);
		} catch (error) {
			console.error(
				`Failed to fetch service ${slug} from ${targetCouncil}:`,
				error
			);
			return undefined;
		}
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
				getServiceFromCouncil,
			}}
		>
			{children}
		</ServicesContext>
	);
};
