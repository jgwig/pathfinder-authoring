"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { PathwayContext, PathwayContextValue } from "./pathway-context";
import { Pathway } from "@/payload-types";
import {
	createPathwayAction,
	getPathways,
	updatePathway,
	getPathwayVersions,
	restorePathwayVersion,
	type PathwayVersion,
} from "@/actions/flow-actions";
import { useAuth } from "@/providers/auth/use-auth";
import {
	PathwayFlowData,
	createInitialFlowData,
	parsePathwayFlowData,
} from "@/types/pathway";

export const PathwayProvider = ({ children }: { children: ReactNode }) => {
	const { user } = useAuth();

	// Core state
	const [pathway, setPathway] = useState<Pathway | undefined>(undefined);
	const [pathways, setPathways] = useState<Pathway[]>([]);
	const [flow, setFlow] = useState<PathwayFlowData | undefined>(undefined);
	const [versions, setVersions] = useState<PathwayVersion[]>([]);
	const [previewVersion, setPreviewVersion] = useState<PathwayVersion | null>(
		null
	);

	// UI state
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingVersions, setIsLoadingVersions] = useState(false);
	const [isAutoSaving, setIsAutoSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isDirty, setIsDirty] = useState(false);

	// Computed state
	const isPreviewingVersion = previewVersion !== null;

	/**
	 * When the pathway changes, parse its data into flow state
	 * Only runs when pathway changes, not when preview changes
	 */
	useEffect(() => {
		if (pathway) {
			// Only update flow if we're not previewing a version
			if (!previewVersion) {
				const parsedFlow = parsePathwayFlowData(pathway.data);
				setFlow(parsedFlow);
			}
			setIsDirty(false);
			// Clear versions when pathway changes - they'll be fetched separately
			setVersions([]);
			// Clear preview when pathway changes
			setPreviewVersion(null);
		} else {
			setFlow(undefined);
			setIsDirty(false);
			setVersions([]);
			setPreviewVersion(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathway]); // Only depend on pathway, not previewVersion

	/**
	 * Fetch all pathways for the current user
	 */
	const fetchPathways = useCallback(async () => {
		if (!user) {
			setError("User not authenticated");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const result = await getPathways(user);
			if (result?.docs) {
				setPathways(result.docs);
			}
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to fetch pathways";
			setError(message);
			console.error("Failed to fetch pathways:", err);
		} finally {
			setIsLoading(false);
		}
	}, [user]);

	/**
	 * Create a new pathway with initial flow data
	 */
	const createPathway = useCallback(
		async (name: string) => {
			if (!user) {
				setError("User not authenticated");
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const initialFlow = createInitialFlowData();
				const result = await createPathwayAction(user, name, initialFlow);

				if (result.success && result.pathway) {
					setPathway(result.pathway);
					// Refresh pathways list to include the new one
					await fetchPathways();
				} else {
					setError(result.error || "Failed to create pathway");
				}
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "An error occurred";
				setError(message);
				console.error("Failed to create pathway:", err);
			} finally {
				setIsLoading(false);
			}
		},
		[user, fetchPathways]
	);

	/**
	 * Save the current flow data to the selected pathway
	 */
	const savePathway = useCallback(
		async (flowData: PathwayFlowData) => {
			if (!user) {
				setError("User not authenticated");
				return;
			}

			if (!pathway) {
				setError("No pathway selected");
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const result = await updatePathway(user, pathway.id, flowData);

				if (result) {
					setPathway(result);
					// Update the pathway in the local list
					setPathways((prev) =>
						prev.map((p) => (p.id === result.id ? result : p))
					);
					setIsDirty(false);
				}
			} catch (err) {
				const message =
					err instanceof Error
						? err.message
						: `Failed to save pathway: ${pathway.id}`;
				setError(message);
				console.error("Failed to save pathway:", err);
			} finally {
				setIsLoading(false);
			}
		},
		[user, pathway]
	);

	/**
	 * Select a pathway by ID from the loaded pathways
	 */
	const selectPathway = useCallback(
		(id: number) => {
			const selected = pathways.find((p) => p.id === id);
			if (selected) {
				setPathway(selected);
			} else {
				console.warn(`Pathway with id ${id} not found in loaded pathways`);
			}
		},
		[pathways]
	);

	/**
	 * Update the local flow state (marks as dirty for unsaved changes)
	 */
	const updateFlow = useCallback((flowData: PathwayFlowData) => {
		setFlow(flowData);
		setIsDirty(true);
	}, []);

	/**
	 * Clear the current pathway selection
	 */
	const clearPathway = useCallback(() => {
		setPathway(undefined);
		setFlow(undefined);
		setIsDirty(false);
	}, []);

	/**
	 * Clear any error state
	 */
	const clearError = useCallback(() => {
		setError(null);
	}, []);

	/**
	 * Fetch version history for the currently selected pathway
	 */
	const fetchVersions = useCallback(async () => {
		if (!user) {
			setError("User not authenticated");
			return;
		}

		if (!pathway) {
			return;
		}

		setIsLoadingVersions(true);

		try {
			const result = await getPathwayVersions(user, pathway.id);
			setVersions(result?.docs ?? []);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to fetch versions";
			console.error("Failed to fetch versions:", message);
			// Don't set error for version fetch failures - non-critical
		} finally {
			setIsLoadingVersions(false);
		}
	}, [user, pathway]);

	/**
	 * Restore a pathway to a specific version
	 */
	const restoreVersion = useCallback(
		async (versionId: string) => {
			if (!user) {
				setError("User not authenticated");
				return;
			}

			if (!pathway) {
				setError("No pathway selected");
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const result = await restorePathwayVersion(user, versionId);

				if (result.success && result.pathway) {
					setPathway(result.pathway);
					// Update the pathway in the local list
					setPathways((prev) =>
						prev.map((p) => (p.id === result.pathway!.id ? result.pathway! : p))
					);
					// Refresh versions after restore
					await fetchVersions();
				} else {
					setError(result.error || "Failed to restore version");
				}
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Failed to restore version";
				setError(message);
				console.error("Failed to restore version:", err);
			} finally {
				setIsLoading(false);
			}
		},
		[user, pathway, fetchVersions]
	);

	/**
	 * Auto-save the current flow (used by debounced save)
	 */
	const autoSave = useCallback(
		async (flowData: PathwayFlowData) => {
			// Don't auto-save while previewing a version
			if (!user || !pathway || previewVersion) {
				return;
			}

			setIsAutoSaving(true);

			try {
				const result = await updatePathway(user, pathway.id, flowData);

				if (result) {
					setPathway(result);
					setPathways((prev) =>
						prev.map((p) => (p.id === result.id ? result : p))
					);
					setIsDirty(false);
					// Optionally refresh versions after auto-save
					// await fetchVersions();
				}
			} catch (err) {
				console.error("Auto-save failed:", err);
				// Don't set error for auto-save failures - too noisy
			} finally {
				setIsAutoSaving(false);
			}
		},
		[user, pathway, previewVersion]
	);

	/**
	 * Preview a specific version by ID (displays on canvas without restoring)
	 */
	const previewVersionById = useCallback(
		(versionId: string) => {
			const version = versions.find((v) => v.id === versionId);
			if (version) {
				setPreviewVersion(version);
				// Parse and set the flow from the version's data
				const versionFlow = parsePathwayFlowData(version.version.data);
				setFlow(versionFlow);
			}
		},
		[versions]
	);

	/**
	 * Clear the version preview and return to current pathway's flow
	 */
	const clearPreview = useCallback(() => {
		setPreviewVersion(null);
		// Restore the current pathway's flow
		if (pathway) {
			const parsedFlow = parsePathwayFlowData(pathway.data);
			setFlow(parsedFlow);
		}
	}, [pathway]);

	/**
	 * Delete a pathway by its ID
	 */
	const deletePathway = useCallback(
		async (id: number) => {
			if (!user) {
				setError("User not authenticated");
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const { deletePathwayAction } = await import("@/actions/flow-actions");
				const result = await deletePathwayAction(user, id);

				if (result.success) {
					// Remove from local list
					setPathways((prev) => prev.filter((p) => p.id !== id));
					// If we deleted the currently selected pathway, clear it
					if (pathway?.id === id) {
						clearPathway();
					}
				} else {
					setError(result.error || "Failed to delete pathway");
				}
			} catch (err) {
				const message =
					err instanceof Error
						? err.message
						: `Failed to delete pathway: ${id}`;
				setError(message);
				console.error("Failed to delete pathway:", err);
			} finally {
				setIsLoading(false);
			}
		},
		[user, pathway, clearPathway]
	);

	// Memoize context value to prevent unnecessary re-renders
	const contextValue: PathwayContextValue = useMemo(
		() => ({
			// State
			pathway,
			flow,
			pathways,
			versions,
			previewVersion,
			isLoading,
			isLoadingVersions,
			isAutoSaving,
			error,
			isDirty,
			isPreviewingVersion,
			// Actions
			selectPathway,
			fetchPathways,
			createPathway,
			savePathway,
			updateFlow,
			clearPathway,
			clearError,
			deletePathway,
			fetchVersions,
			restoreVersion,
			autoSave,
			previewVersionById,
			clearPreview,
		}),
		[
			pathway,
			flow,
			pathways,
			versions,
			previewVersion,
			isLoading,
			isLoadingVersions,
			isAutoSaving,
			error,
			isDirty,
			isPreviewingVersion,
			selectPathway,
			fetchPathways,
			createPathway,
			savePathway,
			updateFlow,
			clearPathway,
			clearError,
			deletePathway,
			fetchVersions,
			restoreVersion,
			autoSave,
			previewVersionById,
			clearPreview,
		]
	);

	return (
		<PathwayContext.Provider value={contextValue}>
			{children}
		</PathwayContext.Provider>
	);
};
