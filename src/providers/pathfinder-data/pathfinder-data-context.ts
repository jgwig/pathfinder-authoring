"use client";

import { createContext } from "react";
import { Edge, Node, ReactFlowJsonObject } from "@xyflow/react";
import { StageNodeData } from "@/types/content";

export interface PathfinderData {
	name: string;
	id: string;
	flow: ReactFlowJsonObject<Node<StageNodeData>, Edge>;
}

export interface PathfinderDataContextType {
	pathfinderData: PathfinderData[];
	savePathfinder: (pathfinder: Omit<PathfinderData, "id">) => string;
	updatePathfinder: (
		id: string,
		updates: Partial<Omit<PathfinderData, "id">>
	) => void;
	deletePathfinder: (id: string) => void;
	getPathfinder: (id: string) => PathfinderData | undefined;
	loadFromStorage: () => void;
	clearAll: () => void;
	loadedPathfinder: PathfinderData | undefined;
	loadPathfinder: (id: string) => void;
}

export const PathfinderDataContext =
	createContext<PathfinderDataContextType | null>(null);
