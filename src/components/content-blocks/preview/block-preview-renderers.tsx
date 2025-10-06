"use client";

import { clinicalComponentRegistry } from "@/components/clinical/clinical-component-registry";
import {
	AssessmentBlockData,
	AssessmentResultData,
	ComponentBlockData,
	DropdownBlockData,
	ExternalRecommendationData,
	ImageBlockData,
	IntroBlockData,
	ParagraphBlockData,
	RecommendationBlockData,
	TitleBlockData,
	VideoBlockData,
} from "@/types/content";
import Image from "next/image";

import ReactPlayer from "react-player";
import { useEffect, useState, type ComponentType } from "react";
import { useServices } from "@/providers/services/use-services";
import { LoaderIcon } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import {
	ButtonSelectField,
	SelectField,
	CheckboxField,
} from "@/components/ui/form-fields";
import type { FormItem } from "@/types/content";

import "./styles.css";

interface BlockPreviewProps<T> {
	data: T;
}

export const TitleBlockRenderer = ({
	data,
}: BlockPreviewProps<TitleBlockData>) => {
	const { level, text } = data;
	console.log(typeof level);

	const parsedLevel = typeof level === "string" ? parseInt(level) : 1;

	const renderTitle = () => {
		switch (parsedLevel) {
			case 1:
				return (
					<h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 my-0">
						{text}
					</h1>
				);
			case 2:
				return (
					<h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 my-0">
						{text}
					</h2>
				);
			case 3:
				return (
					<h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 my-0">
						{text}
					</h3>
				);
			case 4:
				return (
					<h4 className="text-base md:text-lg lg:text-xl font-medium text-gray-700 my-0">
						{text}
					</h4>
				);
			case 5:
				return (
					<h5 className="text-sm md:text-base lg:text-lg font-medium text-gray-700 my-0">
						{text}
					</h5>
				);
			case 6:
				return (
					<h6 className="text-sm md:text-sm lg:text-base font-normal text-gray-600 my-0">
						{text}
					</h6>
				);
			default:
				// Fallback to a paragraph if level is missing or out of range
				return <p className="my-0">{text}</p>;
		}
	};

	return renderTitle();
};

export const ParagraphBlockRenderer = ({
	data,
}: BlockPreviewProps<ParagraphBlockData>) => {
	const { text, html } = data;

	const renderParagraph = () => {
		if (html) {
			return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
		} else {
			return <p className="whitespace-pre-line">{text}</p>;
		}
	};

	return renderParagraph();
};

export const VideoBlockRenderer = ({
	data,
}: BlockPreviewProps<VideoBlockData>) => {
	const { url, caption } = data;

	return (
		<>
			{url && (
				<div className="relative w-full h-[400px] rounded-lg overflow-hidden">
					<ReactPlayer
						src={url}
						style={{
							width: "100%",
							height: "100%",
						}}
					/>
				</div>
			)}
		</>
	);
};

export const ImageBlockRenderer = ({
	data,
}: BlockPreviewProps<ImageBlockData>) => {
	const { url, alt, caption } = data;

	return (
		<div className="w-full relative h-[400px] rounded-lg overflow-hidden">
			{url && <Image src={url} alt={alt} fill className="object-cover" />}
		</div>
	);
};

export const ComponentBlockRenderer = ({
	data,
}: BlockPreviewProps<ComponentBlockData>) => {
	const { component } = data;

	// Lookup the component in the registry. The registry exports component
	// constructors (function components), so we need to instantiate them as JSX.
	const RegistryComponent = (
		clinicalComponentRegistry as Record<string, ComponentType<any>>
	)[component];

	if (!RegistryComponent) {
		return (
			<p className="text-sm text-red-600">Unknown component: {component}</p>
		);
	}

	return <RegistryComponent />;
};

export const RecommendationBlockRenderer = ({
	data,
}: BlockPreviewProps<RecommendationBlockData>) => {
	const { services, test } = data;

	const { loading, getServiceBySlug } = useServices();

	// Handle loading state
	if (loading) {
		return <LoaderIcon className="animate-spin" />;
	}

	// Main component render
	return (
		<div className="flex w-full flex-col md:flex-row gap-4 justify-center">
			{services.map((service, i) => {
				const serviceData = test ? test : getServiceBySlug(service.slug);
				if (serviceData) {
					return (
						<div
							key={`service-${service.slug}-${i}`}
							className="relative h-full"
						>
							<div
								className={clsx(
									"service-card",
									service.config?.type
										? `service-card-${service.config.type}`
										: "service-card-medium",
									service.config?.theme
										? `service-card-${service.config.theme}`
										: "service-card-white"
								)}
							>
								<div className="service-card-image-container">
									{/* SERVICE IMAGE */}
									<img
										className="service-card-image"
										src={serviceData.image}
										alt={
											serviceData.name
												? `Image representing ${serviceData.name}`
												: "Service image"
										}
									/>
								</div>

								{/* SERVICE DETAILS */}
								<div className="service-card-content">
									<h2 className="title">{serviceData.title}</h2>
									{serviceData.summary?.headline && (
										<h3 className="subtitle">
											{serviceData.summary?.headline}
										</h3>
									)}
									{serviceData.summary?.description && (
										<p className="description">
											{serviceData.summary?.description}
										</p>
									)}
								</div>
							</div>
						</div>
					);
				}
			})}
		</div>
	);
};

export const ExternalRecommendationRenderer = ({
	data,
}: BlockPreviewProps<ExternalRecommendationData>) => {
	const { services } = data;

	return <p>{services[0].title}</p>;
};

export const AssessmentBlockRenderer = ({
	data,
}: BlockPreviewProps<AssessmentBlockData>) => {
	const { formId, form } = data;

	// State to manage form values
	const [formValues, setFormValues] = useState<
		Record<string, string | boolean | undefined>
	>({});

	// Initialize form values
	useEffect(() => {
		const initialValues: Record<string, string | boolean | undefined> = {};
		form.forEach((field) => {
			if (field.type === "checkbox") {
				initialValues[field.id] = false;
			} else {
				// Use empty string for select fields, but we'll handle it specially
				initialValues[field.id] = "";
			}
		});
		setFormValues(initialValues);
	}, [form]);

	// Handle form field changes
	const handleFieldChange = (fieldId: string, value: string | boolean) => {
		setFormValues((prev) => ({
			...prev,
			[fieldId]: value,
		}));
	};

	useEffect(() => {
		console.log(formValues);
	}, [formValues]);

	// Render individual form field based on type
	const renderFormField = (field: FormItem) => {
		const { id, type, label, options = [] } = field;

		switch (type) {
			case "buttonSelect":
				return (
					<ButtonSelectField
						key={id}
						label={label}
						value={(formValues[id] as string) || ""}
						onChange={(value) => handleFieldChange(id, value)}
						options={options.map((option) => ({
							label: option,
							value: option,
						}))}
						className="mb-4"
					/>
				);

			case "dropdownSelect":
				return (
					<SelectField
						key={id}
						label={label}
						value={formValues[id] as string | ""}
						onChange={(value) => handleFieldChange(id, value)}
						options={options.map((option) => {
							if (option !== "") {
								return {
									label: option,
									value: option,
								};
							} else {
								return {
									label: "New Option",
									value: "New Option",
								};
							}
						})}
						className="mb-4"
					/>
				);

			case "checkbox":
				return (
					<CheckboxField
						key={id}
						label={label}
						checked={(formValues[id] as boolean) || false}
						onChange={(checked) => handleFieldChange(id, checked)}
						className="mb-4"
					/>
				);

			default:
				return (
					<div
						key={id}
						className="mb-4 p-3 bg-red-50 border border-red-200 rounded"
					>
						<p className="text-red-600 text-sm">
							Unsupported field type: {type}
						</p>
					</div>
				);
		}
	};

	return (
		<div className="assessment-form space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Assessment Form
			</h3>

			{form.length === 0 ? (
				<p className="text-gray-500 text-sm">No form fields configured.</p>
			) : (
				<div className="space-y-4">{form.map(renderFormField)}</div>
			)}

			{/* Form ID for debugging/tracking */}
			{process.env.NODE_ENV === "development" && (
				<div className="mt-6 pt-4 border-t border-gray-100">
					<p className="text-xs text-gray-400">Form ID: {formId}</p>
				</div>
			)}
		</div>
	);
};

export const HtmlBlockRenderer = ({ data }: BlockPreviewProps<string>) => {
	return <p>{data}</p>;
};

export const IntroBlockRenderer = ({
	data,
}: BlockPreviewProps<IntroBlockData>) => {
	const { overview, steps } = data;

	return <p>Intro Block</p>;
};

export const DropdownBlockRenderer = ({
	data,
}: BlockPreviewProps<DropdownBlockData>) => {
	const { title, content } = data;

	return <p>{title.text}</p>;
};

export const AssessmentResultRenderer = ({
	data,
}: BlockPreviewProps<AssessmentResultData>) => {
	const { title, paragraph, cardStyles } = data;

	return <p>{title.text}</p>;
};
