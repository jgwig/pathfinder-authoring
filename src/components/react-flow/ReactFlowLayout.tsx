"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@/providers/auth/use-auth";
import { usePathway } from "@/providers/pathway/use-pathway";
import { PathwayFlowData } from "@/types/flow/flow";
import { FlowProvider } from "@/providers/flow/flow-provider";
import { createInitialFlowData } from "@/types/pathway";
import { FlowShell } from "@/components/flow/FlowShell";

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

	if (!user) {
		redirect("login");
	}

	const initialFlow = flow ?? createInitialFlowData();

	return (
		<FlowProvider
			initialFlow={initialFlow}
			flowFromSource={flow}
			isPreviewingVersion={isPreviewingVersion}
			canPersist={Boolean(pathway)}
			autoSave={autoSave}
			savePathway={(data) => savePathway(data as PathwayFlowData)}
		>
			<FlowShell
				isLoading={isLoading}
				isDirty={isDirty}
				isAutoSaving={isAutoSaving}
				pathwayName={pathway?.name}
				isPreviewingVersion={isPreviewingVersion}
				previewVersionDate={previewVersion?.createdAt}
				onCancelPreview={clearPreview}
				onRestorePreviewedVersion={
					previewVersion ? () => restoreVersion(previewVersion.id) : undefined
				}
			/>
		</FlowProvider>
	);
}

export default ReactFlowLayout;
