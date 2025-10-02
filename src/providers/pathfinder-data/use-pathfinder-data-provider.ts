"use client";

import { useContext } from "react";
import {
	PathfinderDataContext,
	PathfinderDataContextType,
} from "./pathfinder-data-context";

export const usePathfinderData = (): PathfinderDataContextType => {
	const context = useContext(PathfinderDataContext);

	if (!context) {
		throw new Error(
			"usePathfinderDataProvider must be used within a PathfinderDataProvider"
		);
	}

	return context;
};
