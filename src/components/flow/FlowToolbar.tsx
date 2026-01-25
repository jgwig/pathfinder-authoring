"use client";

import { useFlowContext } from "@/providers/flow/flow-context";
import { ActionPanel } from "../react-flow/ActionPanel";

export type FlowToolbarProps = {
	isLoading?: boolean;
	isDirty?: boolean;
	isAutoSaving?: boolean;
	pathwayName?: string;
	isPreviewingVersion?: boolean;
	previewVersionDate?: string;
	onCancelPreview?: () => void;
	onRestorePreviewedVersion?: () => void;
};

export function FlowToolbar({
	isLoading,
	isDirty,
	isAutoSaving,
	pathwayName,
	isPreviewingVersion,
	previewVersionDate,
	onCancelPreview,
	onRestorePreviewedVersion,
}: FlowToolbarProps) {
	const { onSave, onReset, onRestore } = useFlowContext();

	return (
		<ActionPanel
			onSave={onSave}
			onReset={onReset}
			onRestore={onRestore}
			isLoading={isLoading}
			isDirty={isDirty}
			isAutoSaving={isAutoSaving}
			pathwayName={pathwayName}
			isPreviewingVersion={isPreviewingVersion}
			previewVersionDate={previewVersionDate}
			onCancelPreview={onCancelPreview}
			onRestorePreviewedVersion={onRestorePreviewedVersion}
		/>
	);
}
