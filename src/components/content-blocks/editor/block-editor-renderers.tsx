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
} from "@/types/content";
import {
	TextField,
	TextAreaField,
	SelectField,
	UrlField,
	ComboboxField,
} from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { clinicalComponentsTypes } from "@/components/clinical/clinical-component-registry";
import { getServices } from "@/actions/actions";
import { Database, LoaderCircle } from "lucide-react";
import { Service } from "@/types/service/service";
import { ServiceServerModel } from "@/types/service/server/serviceServerModel";
import { ServiceListServerModel } from "@/types/service/server/serviceListServerModel";
import { useServices } from "@/providers/services/use-services";

interface BlockRendererProps<T> {
	data: T;
	onChange: (data: T) => void;
}

export const TitleBlockRenderer = ({
	data,
	onChange,
}: BlockRendererProps<TitleBlockData>) => {
	const handleChange = (field: keyof TitleBlockData, value: any) => {
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
				onChange={(value) => handleChange("level", value)}
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

	const handleChange = (field: keyof ParagraphBlockData, value: any) => {
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
	const handleChange = (field: keyof VideoBlockData, value: any) => {
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
	const handleChange = (field: keyof ImageBlockData, value: any) => {
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
	const handleChange = (field: keyof ComponentBlockData, value: any) => {
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

	// useEffect(() => {
	// 	// Remove all services when council changes (because they won't exist in that council)
	// 	handleServicesChange([]);
	// }, [council]);

	const handleServicesChange = (services: typeof data.services) => {
		onChange({ ...data, services });
	};

	const addService = () => {
		handleServicesChange([
			...data.services,
			{ slug: "", config: { type: "medium" } },
		]);
	};

	const removeService = (index: number) => {
		handleServicesChange(data.services.filter((_, i) => i !== index));
	};

	const updateService = (index: number, field: string, value: any) => {
		const updatedServices = [...data.services];
		if (field === "type") {
			updatedServices[index] = {
				...updatedServices[index],
				config: {
					...updatedServices[index].config,
					type: value,
				},
			};
		} else {
			updatedServices[index] = { ...updatedServices[index], [field]: value };
		}
		handleServicesChange(updatedServices);
	};

	const cardTypeOptions = [
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
								onChange={(value) => updateService(index, "slug", value)}
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
								onChange={(value) => updateService(index, "type", value)}
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

	const updateService = (index: number, field: string, value: any) => {
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
	const handleChange = (field: keyof AssessmentBlockData, value: any) => {
		onChange({ ...data, [field]: value });
	};

	return (
		<div className="space-y-4">
			<TextField
				label="Form ID"
				value={data.formId || ""}
				onChange={(value) => handleChange("formId", value)}
				placeholder="unique-form-id"
				required
			/>
			<div className="p-4 bg-muted rounded-lg">
				<p className="text-sm text-muted-foreground">
					Form items configuration is complex and should be implemented as a
					separate form builder component.
				</p>
			</div>
		</div>
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
	data,
	onChange,
}: BlockRendererProps<IntroBlockData>) => {
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
	data,
	onChange,
}: BlockRendererProps<DropdownBlockData>) => {
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
	data,
	onChange,
}: BlockRendererProps<AssessmentResultData>) => {
	return (
		<div className="p-4 bg-muted rounded-lg">
			<p className="text-sm text-muted-foreground">
				Assessment result blocks contain nested title and paragraph blocks.
				Consider implementing as a specialized component.
			</p>
		</div>
	);
};
