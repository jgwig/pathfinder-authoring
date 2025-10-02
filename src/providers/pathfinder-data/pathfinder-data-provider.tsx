"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import {
	PathfinderDataContext,
	PathfinderData,
	PathfinderDataContextType,
} from "./pathfinder-data-context";

const PATHFINDER_DATA_KEY = "pathfinder-data";

const generateId = (): string => {
	return `pathfinder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const PathfinderDataProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [pathfinderData, setPathfinderData] = useState<PathfinderData[]>([]);
	const [loadedPathfinder, setLoadedPathfinder] = useState<
		PathfinderData | undefined
	>();

	// Save data to localStorage
	const saveToStorage = useCallback((data: PathfinderData[]) => {
		try {
			localStorage.setItem(PATHFINDER_DATA_KEY, JSON.stringify(data));
		} catch (error) {
			console.error("Failed to save pathfinder data to localStorage:", error);
		}
	}, []);

	// Load data from localStorage
	const loadFromStorage = useCallback(() => {
		try {
			const stored = localStorage.getItem(PATHFINDER_DATA_KEY);
			if (stored) {
				const parsed = JSON.parse(stored) as PathfinderData[];
				setPathfinderData(parsed);
				return parsed;
			}
		} catch (error) {
			console.error("Failed to load pathfinder data from localStorage:", error);
		}
		return [];
	}, []);

	// Save a new pathfinder
	const savePathfinder = useCallback(
		(pathfinder: Omit<PathfinderData, "id">): string => {
			const id = generateId();
			const newPathfinder: PathfinderData = {
				...pathfinder,
				id,
			};

			setPathfinderData((prev) => {
				const updated = [...prev, newPathfinder];
				saveToStorage(updated);
				return updated;
			});

			return id;
		},
		[saveToStorage]
	);

	// Update an existing pathfinder
	const updatePathfinder = useCallback(
		(id: string, updates: Partial<Omit<PathfinderData, "id">>) => {
			setPathfinderData((prev) => {
				const updated = prev.map((pathfinder) =>
					pathfinder.id === id ? { ...pathfinder, ...updates } : pathfinder
				);
				saveToStorage(updated);
				return updated;
			});
		},
		[saveToStorage]
	);

	// Delete a pathfinder
	const deletePathfinder = useCallback(
		(id: string) => {
			setPathfinderData((prev) => {
				const updated = prev.filter((pathfinder) => pathfinder.id !== id);
				saveToStorage(updated);
				return updated;
			});
		},
		[saveToStorage]
	);

	// Get a specific pathfinder by ID
	const getPathfinder = useCallback(
		(id: string): PathfinderData | undefined => {
			return pathfinderData.find((pathfinder) => pathfinder.id === id);
		},
		[pathfinderData]
	);

	const loadPathfinder = useCallback((id: string) => {
		setLoadedPathfinder(
			pathfinderData.find((pathfinder) => pathfinder.id === id)
		);
	}, []);

	// Clear all pathfinders
	const clearAll = useCallback(() => {
		setPathfinderData([]);
		try {
			localStorage.removeItem(PATHFINDER_DATA_KEY);
		} catch (error) {
			console.error(
				"Failed to clear pathfinder data from localStorage:",
				error
			);
		}
	}, []);

	// Load data from localStorage on component mount
	useEffect(() => {
		loadFromStorage();
	}, [loadFromStorage]);

	const contextValue: PathfinderDataContextType = {
		pathfinderData,
		savePathfinder,
		updatePathfinder,
		deletePathfinder,
		getPathfinder,
		loadFromStorage,
		clearAll,
		loadedPathfinder,
		loadPathfinder,
	};

	return (
		<PathfinderDataContext.Provider value={contextValue}>
			{children}
		</PathfinderDataContext.Provider>
	);
};
