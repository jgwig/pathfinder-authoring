"use client";

import { useState, useCallback } from "react";
import {
	ReactFlow,
	applyNodeChanges,
	applyEdgeChanges,
	addEdge,
	MiniMap,
	Controls,
	Background,
	useReactFlow,
	useNodesState,
	useEdgesState,
	Node,
	Edge,
	OnConnect,
	OnConnectEnd,
	Panel,
	ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import StageNode from "@/nodes/stage-node";
import { DevTools } from "@/components/devtools";
import { ContentBlock } from "@/types/content";
import { Button } from "@/components/ui/button";

const nodeTypes = {
	stageNode: StageNode,
};

const FLOW_KEY = "pathfinder-flow";

const initialNodes: Node<{ blocks: ContentBlock<any>[]; title: string }>[] = [
	{
		id: "s1",
		position: { x: 0, y: 0 },
		data: {
			blocks: [],
			title: "Introduction",
		},
		type: "stageNode",
	},
];

let id = 1;
const getId = () => `${id++}`;

export default function Home() {
	const [nodes, setNodes, onNodesChange] =
		useNodesState<Node<{ blocks: ContentBlock<any>[]; title: string }>>(
			initialNodes
		);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
	const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
		Node<{ blocks: ContentBlock<any>[]; title: string }>,
		Edge
	> | null>(null);

	const { screenToFlowPosition, setViewport } = useReactFlow<
		Node<{ blocks: ContentBlock<any>[]; title: string }>,
		Edge
	>();

	const onConnect: OnConnect = useCallback(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[]
	);

	const onSave = useCallback(() => {
		if (rfInstance) {
			const flow = rfInstance.toObject();
			localStorage.setItem(FLOW_KEY, JSON.stringify(flow));
		}
	}, [rfInstance]);

	const onRestore = useCallback(() => {
		const restoreFlow = async () => {
			const flowString = localStorage.getItem(FLOW_KEY);
			const flow = flowString ? JSON.parse(flowString) : null;

			if (flow) {
				const { x = 0, y = 0, zoom = 1 } = flow.viewport;
				setNodes(flow.nodes || []);
				setEdges(flow.edges || []);
				setViewport({ x, y, zoom });
			}
		};

		restoreFlow();
	}, [setNodes, setViewport]);

	const onConnectEnd: OnConnectEnd = useCallback(
		(event, connectionState) => {
			// when a connection is dropped on the pane it's not valid
			if (!connectionState.isValid) {
				// we need to remove the wrapper bounds, in order to get the correct position
				const id = getId();
				const { clientX, clientY } =
					"changedTouches" in event ? event.changedTouches[0] : event;
				const newNode: Node<{ blocks: ContentBlock<any>[]; title: string }> = {
					id,
					position: screenToFlowPosition({
						x: clientX,
						y: clientY,
					}),
					data: { blocks: [], title: "Stage " + id },
					type: "stageNode",
				};

				setNodes((nds) => nds.concat(newNode));
				setEdges((eds) =>
					connectionState.fromNode
						? eds.concat({
								id,
								source: connectionState.fromNode.id,
								target: id,
						  })
						: eds
				);
			}
		},
		[screenToFlowPosition]
	);

	return (
		<div style={{ width: "100vw", height: "100vh" }}>
			<ReactFlow<Node<{ blocks: ContentBlock<any>[]; title: string }>, Edge>
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onConnectEnd={onConnectEnd}
				onInit={(instance) => setRfInstance(instance)}
				fitView
				fitViewOptions={{ padding: 1.5 }}
			>
				<MiniMap />
				<Controls />
				<Background />
				<DevTools position="top-left" />
				<Panel position="top-right" className="flex flex-row gap-2">
					<Button variant={"outline"} onClick={() => onSave()}>
						Save
					</Button>
					<Button variant={"outline"} onClick={() => onRestore()}>
						Restore
					</Button>
				</Panel>
			</ReactFlow>
		</div>
	);
}
