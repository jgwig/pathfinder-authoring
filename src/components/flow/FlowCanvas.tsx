"use client";

import "@xyflow/react/dist/style.css";
import type { ComponentType } from "react";
import {
	Background,
	Controls,
	MiniMap,
	ReactFlow,
	NodeTypes,
	NodeProps,
} from "@xyflow/react";
import stageNode from "@/nodes/stage-node";
import criteriaNode from "@/nodes/criteria-node";
import { CriteriaEdge } from "@/edges/criteria-edge";
import { DevTools } from "../devtools";
import { useFlowContext } from "@/providers/flow/flow-context";
import { FlowToolbar, FlowToolbarProps } from "./FlowToolbar";

const nodeTypes: NodeTypes = {
	stageNode: stageNode as unknown as ComponentType<NodeProps>,
	criteriaNode: criteriaNode as unknown as ComponentType<NodeProps>,
};

const edgeTypes = {
	criteriaEdge: CriteriaEdge,
};

type FlowCanvasProps = FlowToolbarProps;

export function FlowCanvas(props: FlowCanvasProps) {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		onConnectEnd,
		onSelectionChange,
		setReactFlowInstance,
	} = useFlowContext();

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			nodeTypes={nodeTypes}
			edgeTypes={edgeTypes}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			onConnectEnd={onConnectEnd}
			onSelectionChange={onSelectionChange}
			onInit={(instance) => setReactFlowInstance(instance)}
			fitView
			minZoom={0.2}
			maxZoom={1}
			fitViewOptions={{ padding: 1.5 }}
		>
			<MiniMap />
			<Controls />
			<Background />
			<DevTools position="top-left" />
			<FlowToolbar {...props} />
		</ReactFlow>
	);
}
