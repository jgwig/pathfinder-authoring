"use client";

import { ReactNode, useMemo } from "react";
import {
	FlowProvider as FlowContextProvider,
	FlowContextValue,
} from "./flow-context";
import { PathwayFlowData, createInitialFlowData } from "@/types/flow/flow";
import { useFlowState } from "@/hooks/use-flow-state";
import { useFlowPersistence } from "@/hooks/use-flow-persistence";

export type FlowProviderProps = {
	initialFlow?: PathwayFlowData;
	flowFromSource?: PathwayFlowData;
	isPreviewingVersion?: boolean;
	canPersist: boolean;
	autoSave: (flow: PathwayFlowData) => Promise<void>;
	savePathway: (flow: PathwayFlowData) => Promise<void>;
	children: ReactNode;
};

export function FlowProvider({
	initialFlow,
	flowFromSource,
	isPreviewingVersion = false,
	canPersist,
	autoSave,
	savePathway,
	children,
}: FlowProviderProps) {
	const flowToUse = initialFlow ?? createInitialFlowData();

	const {
		nodes,
		edges,
		selectedNode,
		setSelectedNode,
		onNodesChange,
		onEdgesChange,
		onConnect,
		onConnectEnd,
		onSelectionChange,
		setReactFlowInstance,
		getFlowSnapshot,
		isLocalChangeRef,
		applyFlow,
	} = useFlowState({ flow: flowToUse, isPreviewingVersion });

	const { onSave, onRestore, onReset } = useFlowPersistence({
		canPersist,
		autoSaveEnabled: false,
		isPreviewingVersion,
		flowFromSource,
		getFlowSnapshot,
		applyFlow,
		isLocalChangeRef,
		autoSave,
		savePathway,
		watchValues: useMemo(() => [nodes, edges], [nodes, edges]),
	});

	const value: FlowContextValue = {
		nodes,
		edges,
		selectedNode,
		setSelectedNode,
		onNodesChange,
		onEdgesChange,
		onConnect,
		onConnectEnd,
		onSelectionChange,
		setReactFlowInstance,
		getFlowSnapshot,
		applyFlow,
		isLocalChangeRef,
		onSave,
		onRestore,
		onReset,
	};

	return <FlowContextProvider value={value}>{children}</FlowContextProvider>;
}
