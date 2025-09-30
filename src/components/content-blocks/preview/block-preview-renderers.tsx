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
import type { ComponentType } from "react";

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
	const { services } = data;

	return (
		<div className="flex flex-col gap-4">
			{services.map((service) => (
				<p key={service.slug}>{service.config?.type}</p>
			))}
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

	return <p>{formId}</p>;
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
