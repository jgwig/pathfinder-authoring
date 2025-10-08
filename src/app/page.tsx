"use client";

import { useState, useCallback, useEffect } from "react";
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
import { StageNodeData } from "@/nodes/stage-node";
import { Button } from "@/components/ui/button";
import { Inspector } from "@/components/layout/inspector-sidebar";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useServices } from "@/providers/services/use-services";
import { LoaderCircle, Target } from "lucide-react";
import criteriaNode from "@/nodes/criteria-node";
import { CriteriaEdge, CriteriaEdgeData } from "@/edges/criteria-edge";

const nodeTypes = {
	stageNode: StageNode,
	criteriaNode: criteriaNode,
};

const edgeTypes = {
	criteriaEdge: CriteriaEdge,
};

const FLOW_KEY = "pathfinder-flow";

const initialNodes: Node<any>[] = [
	{
		id: "s1",
		position: {
			x: 0,
			y: 0,
		},
		data: {
			blocks: [
				{
					id: "da651a33-66c6-4cc5-94f1-67c492d4b3a3",
					type: "title",
					data: {
						text: "Introduction",
						level: 1,
					},
				},
				{
					id: "0907332b-2707-47c3-ae73-c8bf82303ee1",
					type: "paragraph",
					data: {
						text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada rhoncus dolor in volutpat. Etiam vestibulum tincidunt augue, ut tincidunt tortor rutrum et. Donec et finibus nisi. Donec cursus faucibus augue sed vulputate. Vivamus sodales turpis et venenatis tristique. Aenean id scelerisque urna, id sodales leo. Curabitur varius porta pellentesque. Cras sodales volutpat nibh, eu consectetur ipsum ultrices a. Aliquam id venenatis nunc. Fusce aliquam purus ut eros cursus auctor. Mauris nec elit magna. Curabitur ac magna id nunc vehicula ornare. Vestibulum egestas, risus a viverra aliquet, neque est lacinia odio, sed ornare purus turpis eget lorem.\n\n",
					},
				},
			],
			title: "Introduction",
		},
		type: "stageNode",
		measured: {
			width: 768,
			height: 639,
		},
		selected: false,
	},
	{
		id: "2360aa5a-40da-4667-89e2-4f28f11fa086",
		position: {
			x: 1146.3532756353097,
			y: 5.169924509016596,
		},
		data: {
			blocks: [
				{
					id: "cded22f0-d11c-4cf1-82f7-3cbb5d4709c0",
					type: "title",
					data: {
						text: "Important Information",
						level: 1,
					},
				},
				{
					id: "d9da6583-3cf0-450f-bfdd-ebfcddb46fee",
					type: "paragraph",
					data: {
						text: "",
						html: "<p>The information and suggestions provided by this tool are for general guidance only. <strong>This is not a substitute for professional medical advice, diagnosis, or treatment.</strong></p>",
					},
				},
				{
					id: "39a12bb7-b591-4fd4-b59c-70b0a47ccebf",
					type: "paragraph",
					data: {
						text: "Always seek the advice of your GP or another qualified health professional with any questions or concerns you may have regarding a medical condition.\n\n",
					},
				},
				{
					id: "0c6928a4-0963-4721-95df-61dbdbd633b5",
					type: "assessment",
					data: {
						formId: "disclaimer",
						form: [
							{
								type: "checkbox",
								name: "disclaimer",
								label: "I understand and wish to continue",
								id: "db62bf2d-4d59-49d6-9ca7-52525cbe78af",
							},
						],
					},
				},
			],
			title: "Disclaimer",
			state: {
				disclaimer: {
					disclaimer: false,
				},
			},
		},
		type: "stageNode",
		selected: false,
		measured: {
			width: 768,
			height: 639,
		},
		dragging: false,
	},
	{
		id: "f7693191-f58a-47e9-ae90-b220e522a4a8",
		position: {
			x: 2576.2187399657164,
			y: -0.31389231531989026,
		},
		data: {
			blocks: [
				{
					id: "04f59132-2a3e-473e-abe5-d6da31fcfb0c",
					type: "title",
					data: {
						text: "Understanding Your Risk of Falling",
						level: 1,
					},
				},
				{
					id: "75037933-8cf8-4d3a-8227-0401b23a54dd",
					type: "assessment",
					data: {
						formId: "basic-assessment",
						form: [
							{
								type: "buttonSelect",
								name: "fallInLastYear",
								label: "Have you fallen in the last year?",
								id: "7701720a-4e07-4af7-9881-b8fdfa580b82",
								options: ["Yes", "No"],
							},
							{
								type: "buttonSelect",
								name: "normalFall",
								label:
									"Did the fall happen when you were doing a day-to-day activity that you would normally do and something you expect to have to do regularly?",
								id: "29173fbc-a657-4ce5-947a-54a99d1d46bc",
								options: ["Yes", "No"],
							},
							{
								type: "buttonSelect",
								name: "steadyWhenStanding",
								label: "Do you feel unsteady when standing?",
								id: "2b06c568-dfb2-4b7a-973c-e7860992f58f",
								options: ["Yes", "No"],
							},
							{
								type: "buttonSelect",
								name: "worriedAboutFalling",
								label: "Are you worried about falling?",
								id: "0cfd5a3a-a845-4f24-99aa-8dc028978dde",
								options: ["Yes", "No"],
							},
						],
					},
				},
			],
			title: "Basic Assessment",
			state: {
				"basic-assessment": {
					fallInLastYear: "",
					normalFall: "",
					steadyWhenStanding: "",
					worriedAboutFalling: "",
				},
			},
		},
		type: "stageNode",
		selected: false,
		measured: {
			width: 768,
			height: 639,
		},
		dragging: false,
	},
	{
		id: "58ff0c9c-1ff1-4a27-933f-1659f3ef42b7",
		position: {
			x: 4649.157403661538,
			y: -318.604053110123,
		},
		data: {
			blocks: [
				{
					id: "70617b08-8a80-438a-84dd-3475b4067cda",
					type: "title",
					data: {
						text: "Results & Recommendations",
						level: 1,
					},
				},
				{
					id: "04681b63-90e2-45df-bef8-8a70d289b439",
					type: "paragraph",
					data: {
						text: '<p class="p-4 rounded-lg bg-green-400"></p>',
						html: '<div class="p-4 rounded-lg bg-green-400 text-white">\n<p class="font-bold text-2xl">Your self-assessed falls risk is low\n</p>\n<p>\nBased on the answers you have given, we have built you a bundle of services and information that will help you manage this risk. The good news is that there is a lot of practical support available now that you can access directly in the community. Many of these are proven to reduce your risk. You can take action today and reduce your falls risk.</p>\n</div>',
					},
				},
				{
					id: "ecce54d6-ca34-4017-b380-890110b48e0a",
					type: "title",
					data: {
						text: "Recommended Service",
						level: "2",
					},
				},
				{
					id: "afe6dde2-2b57-410c-b389-7ca804f29298",
					type: "recommendation",
					data: {
						services: [
							{
								slug: "mi-ageing-well",
								config: {
									type: "large",
								},
							},
						],
					},
				},
				{
					id: "c41d81bc-503b-429c-8788-42a967fe45df",
					type: "title",
					data: {
						text: "Other Options",
						level: "2",
					},
				},
				{
					id: "a8a8ba66-8879-4119-9ef6-a64cdc45f8b4",
					type: "recommendation",
					data: {
						services: [
							{
								slug: "mi-steadystepslevel2",
								config: {
									type: "medium",
								},
							},
							{
								slug: "mi-steadystepslevel1-1",
								config: {
									type: "medium",
								},
							},
						],
					},
				},
			],
			title: "Recs Low",
		},
		type: "stageNode",
		selected: false,
		measured: {
			width: 768,
			height: 1112,
		},
		dragging: false,
	},
	{
		id: "4339ec28-36cd-4047-a68d-adc379dbc892",
		position: {
			x: 4672.143004722641,
			y: 980.0443100400473,
		},
		data: {
			blocks: [
				{
					id: "3d00ba6e-e6ae-46c7-b7bc-e821f7483291",
					type: "title",
					data: {
						text: "Understanding More About Your Personal Falls Risk",
						level: 1,
					},
				},
				{
					id: "0e2b9355-1eca-486a-96de-12c219c6c995",
					type: "assessment",
					data: {
						formId: "fall-details-assessment",
						form: [
							{
								type: "buttonSelect",
								name: "fallWithInjury",
								label:
									"Did you have a fall with an injury (severe enough for you to seek medical attention)?",
								id: "3a59d6b9-badf-4f64-b00f-c86a2f469842",
								options: ["Yes", "No"],
							},
							{
								type: "buttonSelect",
								name: "increaseInFalls",
								label:
									"Have you experienced an increase in falls in the last year?",
								id: "25f7854b-caa5-44a3-bf7f-be436aecc22a",
								options: ["Yes", "No"],
							},
							{
								type: "buttonSelect",
								name: "unableToGetUpUnassisted",
								label:
									"When you fell, were you lying on the floor and unable to get up unassisted?",
								id: "e6598fe8-549b-4136-8e1c-1adc2da8187a",
								options: ["Yes", "No"],
							},
							{
								type: "buttonSelect",
								name: "lossOfConsciousness",
								label:
									"When you fell, did you experience a loss of consciousness?",
								id: "3cb24d3f-1d6f-40a2-b9cc-db9ce0a5fbec",
								options: ["Yes", "No"],
							},
						],
					},
				},
			],
			title: "Fall Details Assessment",
			state: {
				"fall-details-assessment": {
					fallWithInjury: "",
					increaseInFalls: "",
					unableToGetUpUnassisted: "",
					"lossOfConsciousness ": "",
				},
			},
		},
		type: "stageNode",
		selected: false,
		measured: {
			width: 768,
			height: 639,
		},
		dragging: false,
	},
	{
		id: "6b1a0a9f-be9e-4e27-b1d8-b9f22395af6d",
		position: {
			x: 6369.853616048354,
			y: 1035.900601102945,
		},
		data: {
			blocks: [],
			title: "New Stage",
		},
		type: "stageNode",
		selected: false,
		measured: {
			width: 768,
			height: 639,
		},
		dragging: false,
	},
	{
		id: "60eb4e49-a45d-4f2f-ada3-8df9a1125b42",
		position: {
			x: 6118.1244790964065,
			y: 2064.247004384992,
		},
		data: {
			blocks: [],
			title: "New Stage",
		},
		type: "stageNode",
		selected: false,
		measured: {
			width: 768,
			height: 639,
		},
		dragging: false,
	},
	{
		id: "d4b542fb-88a6-4d14-bcad-b4bf938a689e",
		position: {
			x: 7320.544861760778,
			y: 2048.9747150304656,
		},
		data: {
			blocks: [],
			title: "New Stage",
		},
		type: "stageNode",
		selected: false,
		measured: {
			width: 768,
			height: 639,
		},
		dragging: false,
	},
];

const initialEdges: Edge<CriteriaEdgeData>[] = [
	{
		id: "2360aa5a-40da-4667-89e2-4f28f11fa086",
		source: "s1",
		target: "2360aa5a-40da-4667-89e2-4f28f11fa086",
		type: "criteriaEdge",
	},
	{
		id: "f7693191-f58a-47e9-ae90-b220e522a4a8",
		source: "2360aa5a-40da-4667-89e2-4f28f11fa086",
		target: "f7693191-f58a-47e9-ae90-b220e522a4a8",
		type: "criteriaEdge",
		data: {
			criteria: {
				conditions: [
					{
						key: "disclaimer.disclaimer",
						value: true,
						operator: "equals",
					},
				],
			},
		},
	},
	{
		id: "58ff0c9c-1ff1-4a27-933f-1659f3ef42b7",
		source: "f7693191-f58a-47e9-ae90-b220e522a4a8",
		target: "58ff0c9c-1ff1-4a27-933f-1659f3ef42b7",
		type: "criteriaEdge",
		data: {
			criteria: {
				type: "and",
				conditions: [
					{
						key: "basic-assessment.fallInLastYear",
						value: "No",
						operator: "equals",
					},
					{
						key: "basic-assessment.normalFall",
						value: "No",
						operator: "equals",
					},
					{
						key: "basic-assessment.steadyWhenStanding",
						value: "No",
						operator: "equals",
					},
					{
						key: "basic-assessment.worriedAboutFalling",
						value: "No",
						operator: "equals",
					},
				],
			},
		},
	},
	{
		id: "4339ec28-36cd-4047-a68d-adc379dbc892",
		source: "f7693191-f58a-47e9-ae90-b220e522a4a8",
		target: "4339ec28-36cd-4047-a68d-adc379dbc892",
		type: "criteriaEdge",
		data: {
			criteria: {
				type: "or",
				conditions: [
					{
						key: "basic-assessment.fallInLastYear",
						value: "Yes",
						operator: "equals",
					},
					{
						key: "basic-assessment.normalFall",
						value: "Yes",
						operator: "equals",
					},
					{
						key: "basic-assessment.steadyWhenStanding",
						value: "Yes",
						operator: "equals",
					},
					{
						key: "basic-assessment.worriedAboutFalling",
						value: "Yes",
						operator: "equals",
					},
				],
			},
		},
	},
	{
		id: "6b1a0a9f-be9e-4e27-b1d8-b9f22395af6d",
		source: "4339ec28-36cd-4047-a68d-adc379dbc892",
		target: "6b1a0a9f-be9e-4e27-b1d8-b9f22395af6d",
		type: "criteriaEdge",
		data: {
			criteria: {
				type: "and",
				conditions: [
					{
						key: "fall-details-assessment.fallWithInjury",
						value: "No",
						operator: "equals",
					},
					{
						key: "fall-details-assessment.increaseInFalls",
						value: "No",
						operator: "equals",
					},
					{
						key: "fall-details-assessment.unableToGetUpUnassisted",
						value: "No",
						operator: "equals",
					},
					{
						key: "fall-details-assessment.lossOfConsciousness",
						value: "No",
						operator: "equals",
					},
				],
			},
		},
	},
	{
		id: "60eb4e49-a45d-4f2f-ada3-8df9a1125b42",
		source: "4339ec28-36cd-4047-a68d-adc379dbc892",
		target: "60eb4e49-a45d-4f2f-ada3-8df9a1125b42",
		type: "criteriaEdge",
		data: {
			criteria: {
				type: "or",
				conditions: [
					{
						key: "fall-details-assessment.fallWithInjury",
						value: "Yes",
						operator: "equals",
					},
					{
						key: "fall-details-assessment.increaseInFalls",
						value: "Yes",
						operator: "equals",
					},
					{
						key: "fall-details-assessment.lossOfConsciousness",
						value: "Yes",
						operator: "equals",
					},
					{
						key: "fall-details-assessment.unableToGetUpUnassisted",
						value: "Yes",
						operator: "equals",
					},
				],
			},
		},
	},
	{
		id: "d4b542fb-88a6-4d14-bcad-b4bf938a689e",
		source: "60eb4e49-a45d-4f2f-ada3-8df9a1125b42",
		target: "d4b542fb-88a6-4d14-bcad-b4bf938a689e",
		type: "criteriaEdge",
	},
];

// ...existing code...

export default function Home() {
	const [nodes, setNodes, onNodesChange] =
		useNodesState<Node<StageNodeData>>(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
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
								type: "criteriaEdge",
						  })
						: eds
				);
			}
		},
		[screenToFlowPosition]
	);

	const { setCouncil, council, loading } = useServices();

	// Update data-theme attribute when council changes
	useEffect(() => {
		if (council) {
			document.documentElement.setAttribute("data-theme", council);
		} else {
			document.documentElement.removeAttribute("data-theme");
		}
	}, [council]);

	const councilOptions = [
		{
			label: "Moray",
			value: "moray",
		},
		{
			label: "Lothian",
			value: "lothian",
		},
		{
			label: "Lanarkshire",
			value: "lanarkshire",
		},
	];

	const reset = () => {
		setEdges(initialEdges);
		setNodes(initialNodes);
	};

	return (
		<div className="flex flex-row min-h-screen w-full">
			<div style={{ width: "100%", height: "100%" }}>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					// connectionLineComponent={Connections}
					onConnectEnd={onConnectEnd}
					onSelectionChange={({ nodes }) =>
						setSelectedNode(nodes.find((node) => node.type === "stageNode"))
					}
					onInit={(instance) => setRfInstance(instance)}
					fitView
					// allow zooming out much further by setting a low minZoom
					minZoom={0.2}
					// optionally keep a reasonable max zoom; increase if you want to zoom in more
					maxZoom={1}
					// keep padding for fitView but remove the restrictive maxZoom there
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
						<Button variant={"outline"} onClick={() => reset()}>
							Reset
						</Button>
						<Select
							value={council}
							onValueChange={(value) => setCouncil(value)}
						>
							<SelectTrigger className="bg-white font-medium">
								<SelectValue placeholder="Select a council" />
								{loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Council</SelectLabel>
									{councilOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</Panel>
				</ReactFlow>
			</div>
			<Inspector node={selectedNode} />
		</div>
	);
}
