import {
	addEdge,
	Background,
	Controls,
	Edge,
	MiniMap,
	Node,
	OnConnect,
	OnConnectEnd,
	ReactFlow,
	ReactFlowInstance,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "@xyflow/react";
import { DevTools } from "../devtools";
import { useCallback, useEffect, useRef, useState } from "react";
import stageNode, { StageNodeData } from "@/nodes/stage-node";
import { usePathway } from "@/providers/pathway/use-pathway";
import { useAuth } from "@/providers/auth/use-auth";
import { redirect } from "next/navigation";
import criteriaNode from "@/nodes/criteria-node";
import { CriteriaEdge } from "@/edges/criteria-edge";
import { Inspector } from "../layout/inspector-sidebar";
import { ActionPanel } from "./ActionPanel";
import { PathwayFlowData, createInitialFlowData } from "@/types/pathway";

const FLOW_KEY = "pathfinder-flow";
const AUTO_SAVE_DELAY_MS = 2000; // 2 second debounce

const nodeTypes = {
	stageNode: stageNode,
	criteriaNode: criteriaNode,
};

const edgeTypes = {
	criteriaEdge: CriteriaEdge,
};

export function ReactFlowLayout() {
	const { user } = useAuth();
	const {
		pathway,
		flow,
		savePathway,
		autoSave,
		isDirty,
		isLoading,
		isAutoSaving,
		isPreviewingVersion,
		previewVersion,
		clearPreview,
		restoreVersion,
	} = usePathway();

	// Redirect to login if not authenticated
	if (!user) {
		redirect("login");
	}

	// Get the initial flow data - either from pathway context or default
	const initialFlow = flow ?? createInitialFlowData();

	const [nodes, setNodes, onNodesChange] = useNodesState<Node<StageNodeData>>(
		initialFlow.nodes as Node<StageNodeData>[]
	);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
		initialFlow.edges
	);
	const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
		Node<StageNodeData>,
		Edge
	> | null>(null);
	const [selectedNode, setSelectedNode] = useState<
		Node<StageNodeData> | undefined
	>(undefined);

	// Track if we've synced with the flow prop to avoid re-syncing
	const lastFlowRef = useRef<PathwayFlowData | undefined>(undefined);
	// Track auto-save debounce timer
	const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
	// Track if changes are from local edits (not from context sync)
	const isLocalChangeRef = useRef(false);

	const { screenToFlowPosition, setViewport } = useReactFlow<
		Node<StageNodeData>,
		Edge
	>();

	/**
	 * Sync nodes/edges/viewport when the flow from context changes
	 * This happens when a pathway is selected from PayloadCMS
	 */
	useEffect(() => {
		console.log("ReactFlowLayout flow effect triggered");
		console.log("Current flow:", flow);
		console.log("Last flow ref:", lastFlowRef.current);
		console.log("Are they different?", flow !== lastFlowRef.current);

		// Only sync if flow has actually changed (different reference)
		if (flow && flow !== lastFlowRef.current) {
			console.log("Updating ReactFlow with new flow data");
			isLocalChangeRef.current = false; // This is a context update, not local
			setNodes(flow.nodes as Node<StageNodeData>[]);
			setEdges(flow.edges);
			setViewport(flow.viewport);
			lastFlowRef.current = flow;
		}
	}, [flow, setNodes, setEdges, setViewport]);

	/**
	 * Debounced auto-save when nodes or edges change
	 */
	useEffect(() => {
		// Don't auto-save if:
		// - No pathway selected
		// - No ReactFlow instance
		// - Currently syncing from context (not a local change)
		// - Currently previewing a version
		if (
			!pathway ||
			!rfInstance ||
			!isLocalChangeRef.current ||
			isPreviewingVersion
		) {
			return;
		}

		// Clear any existing timer
		if (autoSaveTimerRef.current) {
			clearTimeout(autoSaveTimerRef.current);
		}

		// Set up new debounced save
		autoSaveTimerRef.current = setTimeout(() => {
			const flowData = rfInstance.toObject() as PathwayFlowData;

			// Save to localStorage as backup
			localStorage.setItem(FLOW_KEY, JSON.stringify(flowData));

			// Auto-save to PayloadCMS
			autoSave(flowData);
		}, AUTO_SAVE_DELAY_MS);

		// Cleanup timer on unmount or when deps change
		return () => {
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current);
			}
		};
	}, [nodes, edges, pathway, rfInstance, autoSave]);

	/**
	 * Wrap onNodesChange to track local changes
	 */
	const handleNodesChange = useCallback(
		(changes: Parameters<typeof onNodesChange>[0]) => {
			isLocalChangeRef.current = true;
			onNodesChange(changes);
		},
		[onNodesChange]
	);

	/**
	 * Wrap onEdgesChange to track local changes
	 */
	const handleEdgesChange = useCallback(
		(changes: Parameters<typeof onEdgesChange>[0]) => {
			isLocalChangeRef.current = true;
			onEdgesChange(changes);
		},
		[onEdgesChange]
	);

	const onConnect: OnConnect = useCallback(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[setEdges]
	);

	const onConnectEnd: OnConnectEnd = useCallback(
		(event, connectionState) => {
			// When a connection is dropped on the pane it's not valid
			if (!connectionState.isValid) {
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
								type: "criteriaEdge",
						  })
						: eds
				);
			}
		},
		[screenToFlowPosition, setNodes, setEdges]
	);

	/**
	 * Restore flow from localStorage (fallback/development feature)
	 */
	const onRestore = useCallback(() => {
		const flowString = localStorage.getItem(FLOW_KEY);
		const parsedFlow = flowString ? JSON.parse(flowString) : null;

		if (parsedFlow) {
			const { x = 0, y = 0, zoom = 1 } = parsedFlow.viewport || {};
			setNodes(parsedFlow.nodes || []);
			setEdges(parsedFlow.edges || []);
			setViewport({ x, y, zoom });
		}
	}, [setNodes, setEdges, setViewport]);

	/**
	 * Save current flow to PayloadCMS and localStorage
	 */
	const onSave = useCallback(async () => {
		if (!rfInstance) return;

		const flowData = rfInstance.toObject() as PathwayFlowData;

		// Always save to localStorage as backup
		localStorage.setItem(FLOW_KEY, JSON.stringify(flowData));

		// Save to PayloadCMS if a pathway is selected
		if (pathway) {
			console.log("Saving pathway to PayloadCMS:", pathway.name);
			await savePathway(flowData);
		}
	}, [rfInstance, pathway, savePathway]);

	/**
	 * Reset to initial default state
	 */
	const onReset = useCallback(() => {
		const defaultFlow = createInitialFlowData();
		setEdges(defaultFlow.edges);
		setNodes(defaultFlow.nodes as Node<StageNodeData>[]);
		setViewport(defaultFlow.viewport);
	}, [setEdges, setNodes, setViewport]);

	return (
		<>
			<div style={{ width: "100%", height: "100%" }}>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					onNodesChange={handleNodesChange}
					onEdgesChange={handleEdgesChange}
					onConnect={onConnect}
					onConnectEnd={onConnectEnd}
					onSelectionChange={({ nodes }) =>
						setSelectedNode(nodes.find((node) => node.type === "stageNode"))
					}
					onInit={(instance) => setRfInstance(instance)}
					fitView
					minZoom={0.2}
					maxZoom={1}
					fitViewOptions={{ padding: 1.5 }}
				>
					<MiniMap />
					<Controls />
					<Background />
					<DevTools position="top-left" />
					<ActionPanel
						onSave={onSave}
						onReset={onReset}
						onRestore={onRestore}
						isLoading={isLoading}
						isDirty={isDirty}
						isAutoSaving={isAutoSaving}
						pathwayName={pathway?.name}
						isPreviewingVersion={isPreviewingVersion}
						previewVersionDate={previewVersion?.createdAt}
						onCancelPreview={clearPreview}
						onRestorePreviewedVersion={
							previewVersion
								? () => restoreVersion(previewVersion.id)
								: undefined
						}
					/>
				</ReactFlow>
			</div>
			<Inspector node={selectedNode} />
		</>
	);
}
