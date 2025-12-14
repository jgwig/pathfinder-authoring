"use client";

import { ReactNode, useEffect, useState } from "react";
import { PathwayContext } from "./pathway-context";
import { Pathway, User } from "@/payload-types";
import {
	createPathwayAction,
	getPathways,
	updatePathway,
} from "@/actions/actions";

export const PathwayProvider = ({ children }: { children: ReactNode }) => {
	const [pathway, setPathway] = useState<Pathway | undefined>(undefined);
	const [pathways, setPathways] = useState<Pathway[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		console.log(pathway);
	}, [pathway]);

	async function createPathway(user: User, name: string) {
		setIsLoading(true);
		setError(null);
		try {
			const result = await createPathwayAction(user, name);
			if (result.success && result.pathway) {
				setPathway(result.pathway);
				// Refresh pathways list
				await fetchPathways(user);
			} else {
				setError(result.error || "Failed to create pathway");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	}

	async function fetchPathways(user: User) {
		setIsLoading(true);
		setError(null);
		try {
			const result = await getPathways(user);
			if (result?.docs) {
				setPathways(result.docs);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch pathways");
		} finally {
			setIsLoading(false);
		}
	}

	async function savePathway(user: User, pathwayId: number, flowData: any) {
		setIsLoading(true);
		setError(null);
		try {
			const result = await updatePathway(user, pathwayId, flowData);
			if (result) {
				setPathway(result);
				// Update the pathway in the pathways list
				setPathways((prev) =>
					prev.map((p) => (p.id === result.id ? result : p))
				);
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: `Failed to update pathway with id: ${pathwayId}`
			);
		} finally {
			setIsLoading(false);
		}
	}

	function setPathwayById(id: number) {
		const selected = pathways.find((pathway) => pathway.id === id);
		setPathway(selected);
	}

	return (
		<PathwayContext
			value={{
				pathway,
				pathways,
				isLoading,
				error,
				createPathway,
				fetchPathways,
				setPathwayById,
				savePathway,
			}}
		>
			{children}
		</PathwayContext>
	);
};
