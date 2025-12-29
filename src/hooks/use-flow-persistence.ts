"use client";

import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import { PathwayFlowData, createInitialFlowData } from "@/types/flow/flow";

export type UseFlowPersistenceArgs = {
	canPersist: boolean;
	autoSaveEnabled?: boolean;
	isPreviewingVersion?: boolean;
	flowFromSource?: PathwayFlowData | undefined;
	getFlowSnapshot: () => PathwayFlowData;
	applyFlow: (flow: PathwayFlowData) => void;
	isLocalChangeRef: MutableRefObject<boolean>;
	autoSave: (flow: PathwayFlowData) => Promise<void>;
	savePathway: (flow: PathwayFlowData) => Promise<void>;
	watchValues: unknown[];
};

export type UseFlowPersistenceResult = {
	onSave: () => Promise<void>;
	onRestore: () => void;
	onReset: () => void;
};

/**
 * Encapsulates persistence concerns (manual save, debounced auto-save, restore/reset).
 * LocalStorage is intentionally omitted; persistence flows only through server actions.
 */
export function useFlowPersistence({
	canPersist,
	autoSaveEnabled = false,
	isPreviewingVersion = false,
	flowFromSource,
	getFlowSnapshot,
	applyFlow,
	isLocalChangeRef,
	autoSave,
	savePathway,
	watchValues,
}: UseFlowPersistenceArgs): UseFlowPersistenceResult {
	const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Debounced auto-save based on flow changes
	useEffect(() => {
		if (
			!autoSaveEnabled ||
			!canPersist ||
			!isLocalChangeRef.current ||
			isPreviewingVersion
		) {
			return;
		}

		if (autoSaveTimerRef.current) {
			clearTimeout(autoSaveTimerRef.current);
		}

		autoSaveTimerRef.current = setTimeout(() => {
			const flowData = getFlowSnapshot();
			autoSave(flowData);
		}, 2000);

		return () => {
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current);
			}
		};
	}, [
		autoSaveEnabled,
		canPersist,
		getFlowSnapshot,
		autoSave,
		isLocalChangeRef,
		isPreviewingVersion,
		watchValues,
	]);

	const onSave = useCallback(async () => {
		if (!canPersist) return;
		const flowData = getFlowSnapshot();
		await savePathway(flowData);
	}, [canPersist, getFlowSnapshot, savePathway]);

	const onRestore = useCallback(() => {
		if (flowFromSource) {
			applyFlow(flowFromSource);
			return;
		}
		applyFlow(createInitialFlowData());
	}, [applyFlow, flowFromSource]);

	const onReset = useCallback(() => {
		applyFlow(createInitialFlowData());
	}, [applyFlow]);

	return { onSave, onRestore, onReset };
}
