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
	ColumnBlockData,
	ContentBlock,
	AnyBlockData,
} from "@/types/content";
import { Service } from "@/types/service/service";
import Image from "next/image";

import ReactPlayer from "react-player";
import { useEffect, useState, type ComponentType } from "react";
import { useServices } from "@/providers/services/use-services";
import { LoaderIcon } from "lucide-react";
import clsx from "clsx";
import {
	ButtonSelectField,
	SelectField,
	CheckboxField,
} from "@/components/ui/form-fields";
import type { FormItem } from "@/types/content";

import "./styles.css";
import { useReactFlow, useNodeId } from "@xyflow/react";
import { BlockPreview } from "./block-preview";

interface BlockPreviewProps<T> {
	data: T;
}

export const TitleBlockRenderer = ({
	data,
}: BlockPreviewProps<TitleBlockData>) => {
	const { level, text } = data;
	const parsedLevel = typeof level === "string" ? parseInt(level) : level;

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
			return <p className="my-0">{text}</p>;
	}
};

export const ParagraphBlockRenderer = ({
	data,
}: BlockPreviewProps<ParagraphBlockData>) => {
	const { text, html } = data;

	if (html) {
		return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
	}

	return <p className="whitespace-pre-line">{text}</p>;
};

export const VideoBlockRenderer = ({
	data,
}: BlockPreviewProps<VideoBlockData>) => {
	const { url, caption } = data;

	return (
		<>
			{url && (
				<div className="space-y-2">
					<div className="relative w-full h-[400px] rounded-lg overflow-hidden">
						<ReactPlayer
							src={url}
							style={{
								width: "100%",
								height: "100%",
							}}
						/>
					</div>
					{caption && <p className="text-sm text-gray-600">{caption}</p>}
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
		<div className="space-y-2">
			<div className="w-full relative h-[400px] rounded-lg overflow-hidden">
				{url && <Image src={url} alt={alt} fill className="object-cover" />}
			</div>
			{caption && (
				<p className="text-sm text-gray-600" aria-label="image caption">
					{caption}
				</p>
			)}
		</div>
	);
};

export const ComponentBlockRenderer = ({
	data,
}: BlockPreviewProps<ComponentBlockData>) => {
	const { component } = data;
	const RegistryComponent = (
		clinicalComponentRegistry as Record<string, ComponentType<unknown>>
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
	const { loading, getServiceBySlug, getServiceFromCouncil, council } =
		useServices();
	const [serviceDataMap, setServiceDataMap] = useState<
		Map<string, { service?: Service; usedMetadata: boolean }>
	>(new Map());
	const [isLoadingServices, setIsLoadingServices] = useState(true);

	// Fetch services with fallback to metadata
	useEffect(() => {
		const fetchServices = async () => {
			setIsLoadingServices(true);
			const dataMap = new Map<
				string,
				{ service?: Service; usedMetadata: boolean }
			>();

			for (const serviceRef of services) {
				let serviceData: Service | undefined;
				let usedMetadata = false;

				// Priority 1: Use test data if available
				if (test) {
					serviceData = test;
				} else {
					// Get the council (use current council as fallback for backward compatibility)
					const serviceCouncil = serviceRef.council || council;

					// Priority 2: Try to fetch from the service's original council
					if (serviceCouncil === council) {
						// Service is from current council, use cached lookup
						serviceData = getServiceBySlug(serviceRef.slug, serviceCouncil);
					} else {
						// Service is from a different council, fetch it
						try {
							serviceData = await getServiceFromCouncil(
								serviceRef.slug,
								serviceCouncil
							);
						} catch (error) {
							console.warn(
								`Failed to fetch service ${serviceRef.slug} from ${serviceCouncil}`,
								error
							);
						}
					}

					// Priority 3: If service not found and we have metadata, use it
					if (!serviceData && serviceRef.metadata) {
						serviceData = {
							name: serviceRef.slug,
							title: serviceRef.metadata.title,
							image: serviceRef.metadata.image,
							excerpt: serviceRef.metadata.excerpt,
						} as Service;
						usedMetadata = true;
					}
				}

				dataMap.set(serviceRef.slug, { service: serviceData, usedMetadata });
			}

			setServiceDataMap(dataMap);
			setIsLoadingServices(false);
		};

		fetchServices();
	}, [services, test, getServiceBySlug, getServiceFromCouncil, council]);

	if (loading || isLoadingServices) {
		return <LoaderIcon className="animate-spin" />;
	}

	return (
		<div className="flex w-full flex-col md:flex-row gap-4 justify-center md:items-stretch">
			{services.map((service, i) => {
				const serviceInfo = serviceDataMap.get(service.slug);
				const serviceData = serviceInfo?.service;
				const usedMetadata = serviceInfo?.usedMetadata || false;

				if (!serviceData) return null;

				return (
					<div key={`service-${service.slug}-${i}`} className="flex flex-1">
						<div
							className={clsx(
								"service-card flex-1",
								service.config?.type
									? `service-card-${service.config.type}`
									: "service-card-medium",
								service.council
									? `service-card-${service.council}`
									: "service-card-white",
								usedMetadata && "ring-2 ring-yellow-400"
							)}
						>
							{usedMetadata && (
								<div className="bg-yellow-100 border-b border-yellow-300 px-3 py-1 text-xs text-yellow-800 flex items-center gap-1">
									<span className="font-semibold">⚠</span>
									<span>
										Using cached data (service unavailable from{" "}
										{service.council})
									</span>
								</div>
							)}
							<div className="service-card-image-container">
								<Image
									className="service-card-image"
									src={serviceData.image}
									alt={
										serviceData.name
											? `Image representing ${serviceData.name}`
											: "Service image"
									}
									width={300}
									height={200}
								/>
							</div>

							<div className="service-card-content">
								<h2 className="title">{serviceData.title}</h2>
								{serviceData.summary?.headline && (
									<h3 className="subtitle">{serviceData.summary?.headline}</h3>
								)}
								{serviceData.summary?.description && (
									<p className="description">
										{serviceData.summary?.description}
									</p>
								)}
								{!serviceData.summary?.description && serviceData.excerpt && (
									<p className="description">{serviceData.excerpt}</p>
								)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export const ExternalRecommendationRenderer = ({
	data,
}: BlockPreviewProps<ExternalRecommendationData>) => {
	const { services } = data;

	return <p>{services[0]?.title}</p>;
};

export const AssessmentBlockRenderer = ({
	data,
}: BlockPreviewProps<AssessmentBlockData>) => {
	const { formId, form } = data;
	const nodeId = useNodeId();
	const { updateNodeData, getNode } = useReactFlow();

	type FormStateRecord = Record<string, string | boolean | undefined>;
	const [formValues, setFormValues] = useState<FormStateRecord>({});

	useEffect(() => {
		const node = nodeId ? getNode(nodeId) : null;
		const existingState = node?.data?.state as
			| Record<string, unknown>
			| undefined;
		const formState = existingState?.[formId] as FormStateRecord | undefined;

		const initialValues: FormStateRecord = {};
		form.forEach((field) => {
			if (formState && field.name in formState) {
				initialValues[field.name] = formState[field.name];
			} else if (field.type === "checkbox") {
				initialValues[field.name] = false;
			} else {
				initialValues[field.name] = "";
			}
		});
		setFormValues(initialValues);
	}, [form, formId, nodeId, getNode]);

	const handleFieldChange = (fieldName: string, value: string | boolean) => {
		setFormValues((prev) => ({
			...prev,
			[fieldName]: value,
		}));
	};

	useEffect(() => {
		if (nodeId) {
			const node = getNode(nodeId);
			const existingState =
				(node?.data?.state as Record<string, unknown>) || {};

			updateNodeData(nodeId, {
				state: {
					...existingState,
					[formId]: formValues,
				},
			});
		}
	}, [nodeId, formValues, formId, updateNodeData, getNode]);

	const renderFormField = (field: FormItem) => {
		const { id, type, label, options = [], name } = field;

		switch (type) {
			case "buttonSelect":
				return (
					<ButtonSelectField
						key={id}
						label={label}
						value={(formValues[name] as string) || ""}
						onChange={(value) => handleFieldChange(name, value)}
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
						value={formValues[name] as string | ""}
						onChange={(value) => handleFieldChange(name, value)}
						options={options.map((option) => {
							if (option !== "") {
								return {
									label: option,
									value: option,
								};
							}
							return {
								label: "New Option",
								value: "New Option",
							};
						})}
						className="mb-4"
					/>
				);

			case "checkbox":
				return (
					<CheckboxField
						key={id}
						label={label}
						checked={(formValues[name] as boolean) || false}
						onChange={(checked) => handleFieldChange(name, checked)}
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

	const renderParagraphs = (paragraphs: ParagraphBlockData[]) =>
		paragraphs.map((paragraph, index) => (
			<ParagraphBlockRenderer
				key={`${paragraph.text}-${index}`}
				data={paragraph}
			/>
		));

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<TitleBlockRenderer data={overview.title} />
				{renderParagraphs(overview.text)}
			</div>
			<div className="space-y-3">
				<TitleBlockRenderer data={steps.title} />
				{renderParagraphs(steps.text)}
			</div>
		</div>
	);
};

export const DropdownBlockRenderer = ({
	data,
}: BlockPreviewProps<DropdownBlockData>) => {
	const { title, content } = data;

	return (
		<div className="space-y-3">
			<TitleBlockRenderer data={title} />
			{content.length ? (
				<ul className="space-y-2 text-sm text-gray-700">
					{content.map((block) => (
						<li
							key={block.id}
							className="rounded border border-gray-100 bg-gray-50 px-3 py-2"
						>
							<span className="font-medium">{block.type}</span>
						</li>
					))}
				</ul>
			) : (
				<p className="text-sm text-gray-500">No dropdown content configured.</p>
			)}
		</div>
	);
};

export const AssessmentResultRenderer = ({
	data,
}: BlockPreviewProps<AssessmentResultData>) => {
	const { title, paragraph } = data;

	return (
		<div className="space-y-2">
			<h3 className="font-semibold text-gray-900">{title.text}</h3>
			{paragraph?.text && (
				<p className="text-gray-700 whitespace-pre-line">{paragraph.text}</p>
			)}
		</div>
	);
};

export const ColumnBlockRenderer = ({
	data,
}: BlockPreviewProps<ColumnBlockData>) => {
	const { leftColumn = [], rightColumn = [] } = data;

	const renderColumn = (blocks: ContentBlock<AnyBlockData>[]) => {
		if (blocks.length === 0) {
			return (
				<div className="text-sm text-gray-400 italic">
					No content in this column
				</div>
			);
		}

		return (
			<div className="space-y-4">
				{blocks.map((block) => (
					<div key={block.id}>
						<BlockPreview block={block} />
					</div>
				))}
			</div>
		);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div className="column-left">{renderColumn(leftColumn)}</div>
			<div className="column-right">{renderColumn(rightColumn)}</div>
		</div>
	);
};
