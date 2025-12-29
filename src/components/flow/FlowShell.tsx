"use client";

import { FlowCanvas } from "./FlowCanvas";
import { NodeInspectorSidebar } from "./NodeInspectorSidebar";

export type FlowShellProps = {
	isLoading?: boolean;
	isDirty?: boolean;
	isAutoSaving?: boolean;
	pathwayName?: string;
	isPreviewingVersion?: boolean;
	previewVersionDate?: string;
	onCancelPreview?: () => void;
	onRestorePreviewedVersion?: () => void;
};

export function FlowShell(props: FlowShellProps) {
	return (
		<>
			<div style={{ width: "100%", height: "100%" }}>
				<FlowCanvas {...props} />
			</div>
			<NodeInspectorSidebar />
		</>
	);
}
