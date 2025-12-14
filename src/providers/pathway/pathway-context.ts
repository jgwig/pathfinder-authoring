import { createContext } from "react";
import { Node, Edge } from "@xyflow/react";
import type { CriteriaEdgeData } from "@/edges/criteria-edge";
import { Pathway, User } from "@/payload-types";

export const PathwayContext = createContext<{
	pathway: Pathway | undefined;
	setPathwayById: (id: number) => void;
	pathways: Pathway[];
	isLoading: boolean;
	error: string | null;
	fetchPathways: (user: User) => Promise<void>;
	createPathway: (user: User, name: string) => Promise<void>;
	savePathway: (
		user: User,
		pathwayId: number,
		pathwayData: any
	) => Promise<void>;
}>({
	pathway: undefined,
	pathways: [],
	isLoading: false,
	error: null,
	setPathwayById: () => {},
	fetchPathways: async () => {},
	createPathway: async () => {},
	savePathway: async () => {},
});
