"use client";

import {
	addEdge,
	Edge,
	Node,
	OnConnect,
	OnConnectEnd,
	OnSelectionChangeFunc,
	ReactFlowInstance,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "@xyflow/react";
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type MutableRefObject,
} from "react";
import {
	PathwayFlowData,
	DEFAULT_VIEWPORT,
	StageNodeData,
} from "@/types/flow/flow";

export type UseFlowStateArgs = {
	flow: PathwayFlowData;
	isPreviewingVersion?: boolean;
};

export type UseFlowStateResult = {
	nodes: Node<StageNodeData>[];
	edges: Edge[];
	selectedNode?: Node<StageNodeData>;
	setSelectedNode: (node?: Node<StageNodeData>) => void;
	onNodesChange: ReturnType<typeof useNodesState<Node<StageNodeData>>>[2];
	onEdgesChange: ReturnType<typeof useEdgesState>[2];
	onConnect: OnConnect;
	onConnectEnd: OnConnectEnd;
	onSelectionChange: OnSelectionChangeFunc;
	setReactFlowInstance: (
		instance: ReactFlowInstance<Node<StageNodeData>, Edge>
	) => void;
	applyFlow: (next: PathwayFlowData) => void;
	getFlowSnapshot: () => PathwayFlowData;
	isLocalChangeRef: MutableRefObject<boolean>;
};

/**
 * Centralizes React Flow canvas state and event handlers so the UI layer can stay dumb.
 * Keeps a clear boundary between external flow updates (e.g., selecting a different pathway)
 * and local user edits, which persistence hooks can listen to via `isLocalChangeRef`.
 */
export function useFlowState({
	flow,
	// Accept but currently unused; kept for future read-only mode handling
	isPreviewingVersion: _isPreviewingVersion = false,
}: UseFlowStateArgs): UseFlowStateResult {
	void _isPreviewingVersion;
	const [nodes, setNodes, rawOnNodesChange] = useNodesState<
		Node<StageNodeData>
	>(flow.nodes as Node<StageNodeData>[]);
	const [edges, setEdges, rawOnEdgesChange] = useEdgesState<Edge>(flow.edges);
	const [selectedNode, setSelectedNode] = useState<Node<StageNodeData>>();
	const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
		Node<StageNodeData>,
		Edge
	> | null>(null);

	const { screenToFlowPosition, setViewport, getViewport } = useReactFlow<
		Node<StageNodeData>,
		Edge
	>();

	const lastFlowRef = useRef<PathwayFlowData | null>(null);
	const isLocalChangeRef = useRef(false);

	// Sync nodes/edges/viewport when upstream flow changes (e.g., selecting another pathway)
	useEffect(() => {
		if (flow && flow !== lastFlowRef.current) {
			isLocalChangeRef.current = false;
			setNodes(flow.nodes as Node<StageNodeData>[]);
			setEdges(flow.edges);
			setViewport(flow.viewport ?? DEFAULT_VIEWPORT);
			lastFlowRef.current = flow;
		}
	}, [flow, setEdges, setNodes, setViewport]);

	const onNodesChange = useCallback<UseFlowStateResult["onNodesChange"]>(
		(changes) => {
			isLocalChangeRef.current = true;
			rawOnNodesChange(changes);
		},
		[rawOnNodesChange]
	);

	const onEdgesChange = useCallback<UseFlowStateResult["onEdgesChange"]>(
		(changes) => {
			isLocalChangeRef.current = true;
			rawOnEdgesChange(changes);
		},
		[rawOnEdgesChange]
	);

	const onConnect = useCallback<OnConnect>(
		(params) => {
			isLocalChangeRef.current = true;
			setEdges((eds) => addEdge(params, eds));
		},
		[setEdges]
	);

	const onConnectEnd = useCallback<OnConnectEnd>(
		(event, connectionState) => {
			if (!connectionState.isValid) {
				isLocalChangeRef.current = true;
				const id = crypto.randomUUID();
				const { clientX, clientY } =
					"changedTouches" in event ? event.changedTouches[0] : event;
				const newNode: Node<StageNodeData> = {
					id,
					position: screenToFlowPosition({ x: clientX, y: clientY }),
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
		[screenToFlowPosition, setEdges, setNodes]
	);

	const onSelectionChange = useCallback<OnSelectionChangeFunc>(({ nodes }) => {
		const stageNode = nodes.find(
			(node): node is Node<StageNodeData> => node.type === "stageNode"
		);
		setSelectedNode(stageNode);
	}, []);

	const setReactFlowInstance = useCallback(
		(instance: ReactFlowInstance<Node<StageNodeData>, Edge>) => {
			setRfInstance(instance);
		},
		[]
	);

	const applyFlow = useCallback(
		(next: PathwayFlowData) => {
			isLocalChangeRef.current = false;
			setNodes(next.nodes as Node<StageNodeData>[]);
			setEdges(next.edges);
			setViewport(next.viewport ?? DEFAULT_VIEWPORT);
			lastFlowRef.current = next;
		},
		[setEdges, setNodes, setViewport]
	);

	const getFlowSnapshot = useCallback((): PathwayFlowData => {
		if (rfInstance) {
			return rfInstance.toObject() as PathwayFlowData;
		}

		return {
			nodes,
			edges,
			viewport: getViewport() ?? DEFAULT_VIEWPORT,
		};
	}, [edges, getViewport, nodes, rfInstance]);

	return {
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
		applyFlow,
		getFlowSnapshot,
		isLocalChangeRef,
	};
}
