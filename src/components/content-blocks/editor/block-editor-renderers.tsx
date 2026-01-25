import {
	TitleBlockData,
	ParagraphBlockData,
	VideoBlockData,
	ImageBlockData,
	AssessmentBlockData,
	RecommendationBlockData,
	ExternalRecommendationData,
	ComponentBlockData,
	DropdownBlockData,
	AssessmentResultData,
	IntroBlockData,
	ServiceCardConfig,
	FormItemType,
	FormItem,
	ColumnBlockData,
	ContentBlock,
	AnyBlockData,
	contentBlockOptions,
	getDefaultDataForType,
	ContentBlockType,
} from "@/types/content";
import {
	TextField,
	TextAreaField,
	SelectField,
	UrlField,
	ComboboxField,
} from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import React, { useCallback, useEffect, useState } from "react";
import { clinicalComponentsTypes } from "@/components/clinical/clinical-component-registry";
import { LoaderCircle } from "lucide-react";
import { useServices } from "@/providers/services/use-services";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssessmentField } from "@/components/ui/assessment-field";
import { FormFieldEditorModal } from "@/components/form-editor/form-field-editor-modal";
import { Sortable, SortableItem } from "@/components/ui/sortable";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { BlockEditor } from "./block-editor";

interface BlockRendererProps<T> {
	data: T;
	onChange: (data: T) => void;
}

export const TitleBlockRenderer = ({
	data,
	onChange,
}: BlockRendererProps<TitleBlockData>) => {
	const handleChange = <K extends keyof TitleBlockData>(
		field: K,
		value: TitleBlockData[K]
	) => {
		onChange({ ...data, [field]: value });
	};

	const headingOptions = [
		{ label: "H1 - Main Title", value: "1" },
		{ label: "H2 - Section Title", value: "2" },
		{ label: "H3 - Subsection", value: "3" },
		{ label: "H4 - Minor Heading", value: "4" },
		{ label: "H5 - Small Heading", value: "5" },
		{ label: "H6 - Smallest Heading", value: "6" },
	];

	return (
		<div className="space-y-6">
			<TextField
				label="Title Text"
				value={data.text || ""}
				onChange={(value) => handleChange("text", value)}
				placeholder="Enter title text"
				required
			/>
			<SelectField
				label="Heading Level"
				value={data.level.toString() || "1"}
				onChange={(value) =>
					handleChange("level", Number(value) as TitleBlockData["level"])
				}
				options={headingOptions}
				required
			/>
			{/* TODO: Add replace array editor for styled text */}
		</div>
	);
};

export const ParagraphBlockRenderer = ({
	data,
	onChange,
}: BlockRendererProps<ParagraphBlockData>) => {
	const [useHtml, setUseHtml] = useState(!!data.html);

	const handleChange = <K extends keyof ParagraphBlockData>(
		field: K,
		value: ParagraphBlockData[K]
	) => {
		onChange({ ...data, [field]: value });
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center space-x-2">
				<input
					type="checkbox"
					id="use-html"
					checked={useHtml}
					onChange={(e) => {
						setUseHtml(e.target.checked);
						if (!e.target.checked) {
							handleChange("html", undefined);
						}
					}}
					className="rounded border-gray-300"
				/>
				<label htmlFor="use-html" className="text-sm font-medium">
					Use HTML instead of plain text
				</label>
			</div>

			{useHtml ? (
				<TextAreaField
					label="HTML Content"
					value={data.html || ""}
					onChange={(value) => handleChange("html", value)}
					placeholder="Enter HTML content"
					rows={6}
				/>
			) : (
				<TextAreaField
					label="Paragraph Text"
					value={data.text || ""}
					onChange={(value) => handleChange("text", value)}
					placeholder="Enter paragraph text"
					required
				/>
			)}
			{/* TODO: Add replace array editor for styled text */}
		</div>
	);
};

export const VideoBlockRenderer = ({
	data,
	onChange,
}: BlockRendererProps<VideoBlockData>) => {
	const handleChange = <K extends keyof VideoBlockData>(
		field: K,
		value: VideoBlockData[K]
	) => {
		onChange({ ...data, [field]: value });
	};

	return (
		<div className="space-y-4">
			<UrlField
				label="Video URL"
				value={data.url || ""}
				onChange={(value) => handleChange("url", value)}
				placeholder="https://youtube.com/watch?v=..."
				required
			/>
			<TextField
				label="Caption (Optional)"
				value={data.caption || ""}
				onChange={(value) => handleChange("caption", value)}
				placeholder="Video description or caption"
			/>
		</div>
	);
};

export const ImageBlockRenderer = ({
	data,
	onChange,
}: BlockRendererProps<ImageBlockData>) => {
	const handleChange = <K extends keyof ImageBlockData>(
		field: K,
		value: ImageBlockData[K]
	) => {
		onChange({ ...data, [field]: value });
	};

	return (
		<div className="space-y-4">
			<UrlField
				label="Image URL"
				value={data.url || ""}
				onChange={(value) => handleChange("url", value)}
				placeholder="https://example.com/image.jpg"
				required
			/>
			<TextField
				label="Alt Text"
				value={data.alt || ""}
				onChange={(value) => handleChange("alt", value)}
				placeholder="Describe the image for accessibility"
				required
			/>
			<TextField
				label="Caption (Optional)"
				value={data.caption || ""}
				onChange={(value) => handleChange("caption", value)}
				placeholder="Image caption or description"
			/>
		</div>
	);
};

export const ComponentBlockRenderer = ({
	data,
	onChange,
}: BlockRendererProps<ComponentBlockData>) => {
	const handleChange = <K extends keyof ComponentBlockData>(
		field: K,
		value: ComponentBlockData[K]
	) => {
		onChange({ ...data, [field]: value });
	};

	const componentOptions = Object.entries(clinicalComponentsTypes).map(
		([key, value]) => ({
			label: value,
			value: key,
		})
	);

	return (
		<div className="space-y-4">
			<SelectField
				label="Component"
				value={data.component || "sitStandTest"}
				onChange={(value) => handleChange("component", value)}
				options={componentOptions}
				required
			/>
		</div>
	);
};

export const RecommendationBlockRenderer = ({
	data,
	onChange,
}: BlockRendererProps<RecommendationBlockData>) => {
	const { loading, council, services } = useServices();
	const previousCouncilRef = React.useRef<string | undefined>(undefined);
	const handleServicesChange = useCallback(
		(services: typeof data.services) => {
			onChange({ ...data, services });
		},
		[data, onChange]
	);

	useEffect(() => {
		// Only clear services when council actually changes (not on initial mount)
		if (previousCouncilRef.current && previousCouncilRef.current !== council) {
			handleServicesChange([]);
		}
		previousCouncilRef.current = council;
	}, [council, handleServicesChange]);

	const addService = () => {
		handleServicesChange([
			...data.services,
			{ slug: "", council, config: { type: "medium" } },
		]);
	};

	const removeService = (index: number) => {
		handleServicesChange(data.services.filter((_, i) => i !== index));
	};

	const updateServiceSlug = (index: number, slug: string) => {
		// Find the full service object to capture metadata
		const selectedService = services?.find((s) => s.name === slug);

		handleServicesChange(
			data.services.map((service, i) =>
				i === index
					? {
							...service,
							slug,
							council, // Store current council
							metadata: selectedService
								? {
										title: selectedService.title,
										image: selectedService.image,
										excerpt: selectedService.excerpt,
								  }
								: service.metadata, // Preserve existing metadata if service not found
					  }
					: service
			)
		);
	};

	const updateServiceType = (
		index: number,
		type: ServiceCardConfig["type"]
	) => {
		handleServicesChange(
			data.services.map((service, i) =>
				i === index
					? {
							...service,
							config: {
								...service.config,
								type,
							},
					  }
					: service
			)
		);
	};

	const cardTypeOptions: {
		label: string;
		value: NonNullable<ServiceCardConfig["type"]>;
	}[] = [
		{
			label: "Micro",
			value: "micro",
		},
		{
			label: "Slim",
			value: "slim",
		},
		{
			label: "Medium",
			value: "medium",
		},
		{
			label: "Large",
			value: "large",
		},
	];

	return (
		<div className="space-y-4">
			{loading ? (
				<div className="flex items-center justify-center">
					<LoaderCircle className="w-8 h-8 animate-spin" />
				</div>
			) : (
				<>
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium">Services</h3>
						<Button
							type="button"
							onClick={addService}
							size="sm"
							variant="outline"
						>
							Add Service
						</Button>
					</div>

					{data.services.map((service, index) => (
						<div key={index} className="p-4 border rounded-lg space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Service {index + 1}</span>
								<Button
									type="button"
									onClick={() => removeService(index)}
									size="sm"
									variant="destructive"
								>
									Remove
								</Button>
							</div>

							<ComboboxField
								label="Select Service"
								value={service.slug}
								onChange={(value) => updateServiceSlug(index, value)}
								options={
									services?.map((service) => ({
										label: service.title,
										value: service.name,
									})) || []
								}
								placeholder="Choose a service..."
								searchPlaceholder="Search services..."
								required
							/>
							<SelectField
								label="Card Type"
								options={cardTypeOptions}
								value={service.config?.type || "medium"}
								onChange={(value) =>
									updateServiceType(index, value as ServiceCardConfig["type"])
								}
							/>
						</div>
					))}
				</>
			)}
		</div>
	);
};

export const ExternalRecommendationRenderer = ({
	data,
	onChange,
}: BlockRendererProps<ExternalRecommendationData>) => {
	const handleServicesChange = (services: typeof data.services) => {
		onChange({ ...data, services });
	};

	const addService = () => {
		handleServicesChange([
			...data.services,
			{ title: "", description: "", url: "" },
		]);
	};

	const removeService = (index: number) => {
		handleServicesChange(data.services.filter((_, i) => i !== index));
	};

	const updateService = <
		K extends keyof ExternalRecommendationData["services"][number]
	>(
		index: number,
		field: K,
		value: ExternalRecommendationData["services"][number][K]
	) => {
		const updatedServices = [...data.services];
		updatedServices[index] = { ...updatedServices[index], [field]: value };
		handleServicesChange(updatedServices);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium">External Services</h3>
				<Button type="button" onClick={addService} size="sm" variant="outline">
					Add Service
				</Button>
			</div>

			{data.services.map((service, index) => (
				<div key={index} className="p-4 border rounded-lg space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">
							External Service {index + 1}
						</span>
						<Button
							type="button"
							onClick={() => removeService(index)}
							size="sm"
							variant="destructive"
						>
							Remove
						</Button>
					</div>

					<TextField
						label="Title"
						value={service.title}
						onChange={(value) => updateService(index, "title", value)}
						placeholder="Service title"
						required
					/>

					<TextField
						label="Subtitle (Optional)"
						value={service.subtitle || ""}
						onChange={(value) => updateService(index, "subtitle", value)}
						placeholder="Service subtitle"
					/>

					<TextAreaField
						label="Description"
						value={service.description}
						onChange={(value) => updateService(index, "description", value)}
						placeholder="Service description"
						required
						rows={3}
					/>

					<UrlField
						label="URL"
						value={service.url}
						onChange={(value) => updateService(index, "url", value)}
						placeholder="https://example.com"
						required
					/>
				</div>
			))}
		</div>
	);
};

export const AssessmentBlockRenderer = ({
	data,
	onChange,
}: BlockRendererProps<AssessmentBlockData>) => {
	const handleChange = <K extends keyof AssessmentBlockData>(
		field: K,
		value: AssessmentBlockData[K]
	) => {
		onChange({ ...data, [field]: value });
	};

	const handleFieldsChange = (form: FormItem[]) => {
		onChange({ ...data, form });
	};

	const addFormField = (type: FormItemType) => {
		handleFieldsChange([
			...data.form,
			{ type: type, name: "", label: "", id: crypto.randomUUID() },
		]);
	};

	const removeFormField = (id: string) => {
		console.log("being called");
		handleFieldsChange(data.form.filter((field) => field.id !== id));
	};

	const updateFormField = (id: string, updatedField: FormItem) => {
		const updatedForm = data.form.map((field) =>
			field.id === id ? updatedField : field
		);
		handleFieldsChange(updatedForm);
	};

	const [isFormEditorOpen, setIsFormEditorOpen] = useState(false);

	const formItemOptions: { label: string; value: FormItemType }[] = [
		{
			label: "Button Select",
			value: "buttonSelect",
		},
		{
			label: "Dropdown Select",
			value: "dropdownSelect",
		},
		{
			label: "Checkbox",
			value: "checkbox",
		},
	];

	return (
		<>
			<div className="space-y-4">
				<TextField
					label="Form ID"
					value={data.formId || ""}
					onChange={(value) => handleChange("formId", value)}
					placeholder="unique-form-id"
					required
				/>
				<Button variant={"outline"} onClick={() => setIsFormEditorOpen(true)}>
					Configure
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className=" w-full">
							Add Field
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{formItemOptions.map((option) => (
							<DropdownMenuItem
								key={option.value}
								onClick={() => addFormField(option.value as FormItemType)}
							>
								{option.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				{data.form.map((field) => {
					return (
						<div key={field.id} className="p-4 border rounded-lg">
							<AssessmentField
								field={field}
								removeField={removeFormField}
								onChange={(updatedField) =>
									updateFormField(field.id, updatedField)
								}
							/>
						</div>
					);
				})}
			</div>
			<FormFieldEditorModal
				open={isFormEditorOpen}
				onOpenChange={setIsFormEditorOpen}
			/>
		</>
	);
};

export const HtmlBlockRenderer = ({
	data,
	onChange,
}: BlockRendererProps<string>) => {
	return (
		<div className="space-y-4">
			<TextAreaField
				label="HTML Content"
				value={data || ""}
				onChange={onChange}
				placeholder="Enter raw HTML content"
				rows={8}
				required
			/>
		</div>
	);
};

// Simplified renderers for complex nested types
export const IntroBlockRenderer = ({
	data: _data,
	onChange: _onChange,
}: BlockRendererProps<IntroBlockData>) => {
	void _data;
	void _onChange;
	return (
		<div className="p-4 bg-muted rounded-lg">
			<p className="text-sm text-muted-foreground">
				Intro blocks have complex nested structure (overview + steps). Consider
				implementing as a specialized component.
			</p>
		</div>
	);
};

export const DropdownBlockRenderer = ({
	data: _data,
	onChange: _onChange,
}: BlockRendererProps<DropdownBlockData>) => {
	void _data;
	void _onChange;
	return (
		<div className="p-4 bg-muted rounded-lg">
			<p className="text-sm text-muted-foreground">
				Dropdown blocks contain nested content blocks. Consider implementing as
				a specialized component with recursive editing.
			</p>
		</div>
	);
};

export const AssessmentResultRenderer = ({
	data: _data,
	onChange: _onChange,
}: BlockRendererProps<AssessmentResultData>) => {
	void _data;
	void _onChange;
	return (
		<div className="p-4 bg-muted rounded-lg">
			<p className="text-sm text-muted-foreground">
				Assessment result blocks contain nested title and paragraph blocks.
				Consider implementing as a specialized component.
			</p>
		</div>
	);
};

export const ColumnBlockRenderer = ({
	data,
	onChange,
}: BlockRendererProps<ColumnBlockData>) => {
	const [showLeftAddMenu, setShowLeftAddMenu] = useState(false);
	const [showRightAddMenu, setShowRightAddMenu] = useState(false);

	const handleAddBlock = (column: "left" | "right", blockType: string) => {
		const blockTypeTyped = blockType as ContentBlockType;
		const newBlock = new ContentBlock({
			type: blockTypeTyped,
			data: getDefaultDataForType(blockTypeTyped),
		});

		if (column === "left") {
			onChange({
				...data,
				leftColumn: [...(data.leftColumn || []), newBlock],
			});
			setShowLeftAddMenu(false);
		} else {
			onChange({
				...data,
				rightColumn: [...(data.rightColumn || []), newBlock],
			});
			setShowRightAddMenu(false);
		}
	};

	const handleUpdateBlock = (
		column: "left" | "right",
		blockId: string,
		updatedBlock: ContentBlock<AnyBlockData>
	) => {
		if (column === "left") {
			onChange({
				...data,
				leftColumn: (data.leftColumn || []).map((block) =>
					block.id === blockId ? updatedBlock : block
				),
			});
		} else {
			onChange({
				...data,
				rightColumn: (data.rightColumn || []).map((block) =>
					block.id === blockId ? updatedBlock : block
				),
			});
		}
	};

	const handleDeleteBlock = (column: "left" | "right", blockId: string) => {
		if (column === "left") {
			onChange({
				...data,
				leftColumn: (data.leftColumn || []).filter(
					(block) => block.id !== blockId
				),
			});
		} else {
			onChange({
				...data,
				rightColumn: (data.rightColumn || []).filter(
					(block) => block.id !== blockId
				),
			});
		}
	};

	const handleReorderBlocks = (
		column: "left" | "right",
		reorderedBlocks: ContentBlock<AnyBlockData>[]
	) => {
		if (column === "left") {
			onChange({
				...data,
				leftColumn: reorderedBlocks,
			});
		} else {
			onChange({
				...data,
				rightColumn: reorderedBlocks,
			});
		}
	};

	const renderColumn = (
		column: "left" | "right",
		blocks: ContentBlock<AnyBlockData>[],
		showAddMenu: boolean,
		setShowAddMenu: (show: boolean) => void
	) => {
		return (
			<div className="flex-1 border rounded-lg p-4 space-y-4 bg-muted/30">
				<div className="flex items-center justify-between mb-2">
					<h4 className="font-medium text-sm">
						{column === "left" ? "Left Column" : "Right Column"}
					</h4>
					<DropdownMenu open={showAddMenu} onOpenChange={setShowAddMenu}>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<Plus className="h-4 w-4 mr-1" />
								Add Block
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							{Object.entries(contentBlockOptions)
								.filter(([key]) => key !== "column") // Don't allow nested columns
								.map(([key, label]) => (
									<DropdownMenuItem
										key={key}
										onClick={() => handleAddBlock(column, key)}
									>
										{label}
									</DropdownMenuItem>
								))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{blocks.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground text-sm">
						No blocks yet. Click "Add Block" to get started.
					</div>
				) : (
					<Sortable
						value={blocks}
						onValueChange={(reorderedBlocks) =>
							handleReorderBlocks(column, reorderedBlocks)
						}
						getItemValue={(block) => block.id}
					>
						{blocks.map((block) => (
							<SortableItem key={block.id} value={block.id} asChild>
								<div className="bg-background border rounded-lg p-3 space-y-3">
									<div className="flex items-start gap-2">
										<button className="cursor-grab active:cursor-grabbing mt-1">
											<GripVertical className="h-4 w-4 text-muted-foreground" />
										</button>
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between mb-2">
												<span className="text-xs font-medium text-muted-foreground">
													{contentBlockOptions[block.type]}
												</span>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteBlock(column, block.id)}
													className="h-6 w-6 p-0"
												>
													<Trash2 className="h-3 w-3" />
												</Button>
											</div>
											<BlockEditor
												block={block}
												handleUpdateBlock={(updatedBlock) =>
													handleUpdateBlock(column, block.id, updatedBlock)
												}
											/>
										</div>
									</div>
								</div>
							</SortableItem>
						))}
					</Sortable>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground">
				Create a two-column layout by adding content blocks to each column. Drag
				to reorder items within each column.
			</div>
			<div className="flex flex-col gap-4">
				{renderColumn(
					"left",
					data.leftColumn || [],
					showLeftAddMenu,
					setShowLeftAddMenu
				)}
				{renderColumn(
					"right",
					data.rightColumn || [],
					showRightAddMenu,
					setShowRightAddMenu
				)}
			</div>
		</div>
	);
};
