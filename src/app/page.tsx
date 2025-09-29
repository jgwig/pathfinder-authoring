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
import { ContentBlock, StageNodeData } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Inspector } from "@/components/layout/inspector-sidebar";

const nodeTypes = {
	stageNode: StageNode,
};

const FLOW_KEY = "pathfinder-flow";

const initialNodes: Node<StageNodeData>[] = [
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

// ...existing code...

export default function Home() {
	const [nodes, setNodes, onNodesChange] =
		useNodesState<Node<StageNodeData>>(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
	const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
		Node<StageNodeData>,
		Edge
	> | null>(null);
	const [selectedNode, setSelectedNode] = useState<
		Node<StageNodeData> | undefined
	>(undefined);

	const { screenToFlowPosition, setViewport } = useReactFlow<
		Node<StageNodeData>,
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
				const id = crypto.randomUUID();
				const { clientX, clientY } =
					"changedTouches" in event ? event.changedTouches[0] : event;
				const newNode: Node<StageNodeData> = {
					id,
					position: screenToFlowPosition({
						x: clientX,
						y: clientY,
					}),
					data: { blocks: [], title: "New Stage" },
					type: "stageNode",
					selected: true,
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
		<div className="flex flex-row min-h-screen w-full">
			<div style={{ width: "100%", height: "100%" }}>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					nodeTypes={nodeTypes}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					onConnectEnd={onConnectEnd}
					onSelectionChange={({ nodes }) => setSelectedNode(nodes[0])}
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
			<Inspector node={selectedNode} />
		</div>
	);
}
