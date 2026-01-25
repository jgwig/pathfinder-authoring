"use client";

import {
	createContext,
	useContext,
	type MutableRefObject,
	type ReactNode,
} from "react";
import type {
	Edge,
	Node,
	OnConnect,
	OnConnectEnd,
	OnEdgesChange,
	OnNodesChange,
	ReactFlowInstance,
	OnSelectionChangeFunc,
} from "@xyflow/react";
import { StageNodeData } from "@/types/flow/nodes";
import { PathwayFlowData } from "@/types/flow/flow";

export type FlowContextValue = {
	nodes: Node<StageNodeData>[];
	edges: Edge[];
	selectedNode?: Node<StageNodeData>;
	setSelectedNode: (node?: Node<StageNodeData>) => void;
	onNodesChange: OnNodesChange<Node<StageNodeData>>;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	onConnectEnd: OnConnectEnd;
	onSelectionChange: OnSelectionChangeFunc;
	setReactFlowInstance: (
		instance: ReactFlowInstance<Node<StageNodeData>, Edge>
	) => void;
	getFlowSnapshot: () => PathwayFlowData;
	applyFlow: (flow: PathwayFlowData) => void;
	isLocalChangeRef: MutableRefObject<boolean>;
	duplicateNode: (nodeId: string) => void;
	deleteNode: (nodeId: string) => void;
	onSave: () => Promise<void>;
	onRestore: () => void;
	onReset: () => void;
};

const FlowContext = createContext<FlowContextValue | null>(null);

export function FlowProvider({
	value,
	children,
}: {
	value: FlowContextValue;
	children: ReactNode;
}) {
	return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlowContext(): FlowContextValue {
	const ctx = useContext(FlowContext);
	if (!ctx) {
		throw new Error("useFlowContext must be used within a FlowProvider");
	}
	return ctx;
}
