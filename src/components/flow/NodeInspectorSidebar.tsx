"use client";

import { Inspector } from "../layout/inspector-sidebar";
import { useFlowContext } from "@/providers/flow/flow-context";

export function NodeInspectorSidebar() {
	const { selectedNode } = useFlowContext();
	return <Inspector node={selectedNode} />;
}
