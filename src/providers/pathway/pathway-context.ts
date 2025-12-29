import { createContext } from "react";
import { Pathway } from "@/payload-types";
import { PathwayFlowData } from "@/types/pathway";
import type { PathwayVersion } from "@/actions/flow-actions";

/**
 * State shape for the pathway context
 */
export interface PathwayState {
	/** Currently selected pathway from PayloadCMS */
	pathway: Pathway | undefined;
	/** Parsed flow data from the current pathway, ready for ReactFlow */
	flow: PathwayFlowData | undefined;
	/** List of all pathways available to the user */
	pathways: Pathway[];
	/** Version history for the currently selected pathway */
	versions: PathwayVersion[];
	/** Currently previewing version (null if not previewing) */
	previewVersion: PathwayVersion | null;
	/** Loading state for async operations */
	isLoading: boolean;
	/** Loading state specifically for versions */
	isLoadingVersions: boolean;
	/** Error message from the last failed operation */
	error: string | null;
	/** Whether the current flow has unsaved changes */
	isDirty: boolean;
	/** Whether auto-save is currently in progress */
	isAutoSaving: boolean;
	/** Whether we're currently previewing a version */
	isPreviewingVersion: boolean;
}

/**
 * Actions available in the pathway context
 */
export interface PathwayActions {
	/** Select a pathway by its ID from the loaded pathways list */
	selectPathway: (id: number) => void;
	/** Fetch all pathways for the current authenticated user */
	fetchPathways: () => Promise<void>;
	/** Create a new pathway with the given name */
	createPathway: (name: string) => Promise<void>;
	/** Save the current flow data to the selected pathway */
	savePathway: (flowData: PathwayFlowData) => Promise<void>;
	/** Update the local flow state (marks as dirty) */
	updateFlow: (flowData: PathwayFlowData) => void;
	/** Clear the current pathway selection */
	clearPathway: () => void;
	/** Clear any error state */
	clearError: () => void;
	/** Delete a pathway by its ID */
	deletePathway: (id: number) => Promise<void>;
	/** Fetch version history for the currently selected pathway */
	fetchVersions: () => Promise<void>;
	/** Restore a pathway to a specific version */
	restoreVersion: (versionId: string) => Promise<void>;
	/** Auto-save the current flow (used by debounced save) */
	autoSave: (flowData: PathwayFlowData) => Promise<void>;
	/** Preview a specific version without restoring */
	previewVersionById: (versionId: string) => void;
	/** Clear the version preview and return to current flow */
	clearPreview: () => void;
}

export type PathwayContextValue = PathwayState & PathwayActions;

const defaultState: PathwayState = {
	pathway: undefined,
	flow: undefined,
	pathways: [],
	versions: [],
	previewVersion: null,
	isLoading: false,
	isLoadingVersions: false,
	error: null,
	isDirty: false,
	isAutoSaving: false,
	isPreviewingVersion: false,
};

const defaultActions: PathwayActions = {
	selectPathway: () => {},
	fetchPathways: async () => {},
	createPathway: async () => {},
	savePathway: async () => {},
	updateFlow: () => {},
	clearPathway: () => {},
	clearError: () => {},
	deletePathway: async () => {},
	fetchVersions: async () => {},
	restoreVersion: async () => {},
	autoSave: async () => {},
	previewVersionById: () => {},
	clearPreview: () => {},
};

export const PathwayContext = createContext<PathwayContextValue>({
	...defaultState,
	...defaultActions,
});
