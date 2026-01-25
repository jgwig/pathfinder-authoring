import { Panel } from "@xyflow/react";
import { Button } from "../ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import {
	LoaderCircle,
	Save,
	RotateCcw,
	History,
	CloudUpload,
	Eye,
	X,
} from "lucide-react";
import { useServices } from "@/providers/services/use-services";
import { useEffect } from "react";

interface ActionPanelProps {
	onSave: () => void;
	onRestore: () => void;
	onReset: () => void;
	isLoading?: boolean;
	isDirty?: boolean;
	isAutoSaving?: boolean;
	pathwayName?: string;
	isPreviewingVersion?: boolean;
	previewVersionDate?: string;
	onCancelPreview?: () => void;
	onRestorePreviewedVersion?: () => void;
}

export function ActionPanel({
	onSave,
	onRestore,
	onReset,
	isLoading = false,
	isDirty = false,
	isAutoSaving = false,
	pathwayName,
	isPreviewingVersion = false,
	previewVersionDate,
	onCancelPreview,
	onRestorePreviewedVersion,
}: ActionPanelProps) {
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

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Show preview mode banner
	if (isPreviewingVersion && previewVersionDate) {
		return (
			<Panel position="top-right" className="flex flex-row gap-2 items-center">
				<div className="bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 px-4 py-2 rounded-md flex items-center gap-3">
					<Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
					<div className="flex flex-col">
						<span className="text-sm font-medium text-blue-800 dark:text-blue-200">
							Previewing Version
						</span>
						<span className="text-xs text-blue-600 dark:text-blue-400">
							{formatDateTime(previewVersionDate)}
						</span>
					</div>
					<div className="flex gap-2 ml-2">
						<Button
							variant="outline"
							size="sm"
							onClick={onCancelPreview}
							className="gap-1 bg-white dark:bg-gray-800"
						>
							<X className="w-3 h-3" />
							Cancel
						</Button>
						<Button
							size="sm"
							onClick={onRestorePreviewedVersion}
							disabled={isLoading}
							className="gap-1"
						>
							{isLoading ? (
								<LoaderCircle className="w-3 h-3 animate-spin" />
							) : (
								<RotateCcw className="w-3 h-3" />
							)}
							Restore This Version
						</Button>
					</div>
				</div>
			</Panel>
		);
	}

	return (
		<Panel position="top-right" className="flex flex-row gap-2 items-center">
			{/* Pathway name indicator */}
			{pathwayName && (
				<div className="bg-white px-3 py-1.5 rounded-md border text-sm font-medium flex items-center gap-2">
					<span>{pathwayName}</span>
					{isAutoSaving ? (
						<span
							className="flex items-center gap-1 text-blue-600"
							title="Auto-saving..."
						>
							<CloudUpload className="w-3.5 h-3.5 animate-pulse" />
						</span>
					) : isDirty ? (
						<span
							className="w-2 h-2 bg-amber-500 rounded-full"
							title="Unsaved changes"
						/>
					) : null}
				</div>
			)}

			<Button
				variant={"outline"}
				onClick={() => onSave()}
				disabled={isLoading}
				className="gap-2"
			>
				{isLoading ? (
					<LoaderCircle className="w-4 h-4 animate-spin" />
				) : (
					<Save className="w-4 h-4" />
				)}
				Save
			</Button>
			<Button variant={"outline"} onClick={() => onRestore()} className="gap-2">
				<History className="w-4 h-4" />
				Restore
			</Button>
			<Button variant={"outline"} onClick={() => onReset()} className="gap-2">
				<RotateCcw className="w-4 h-4" />
				Reset
			</Button>
			<Select value={council} onValueChange={(value) => setCouncil(value)}>
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
	);
}
