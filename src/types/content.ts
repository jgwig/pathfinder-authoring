// Types and classes for Pathfinder authoring content blocks

export type ContentBlockType =
	| "intro"
	| "title"
	| "paragraph"
	| "video"
	| "image"
	| "assessment"
	| "recommendation"
	| "assessmentResult"
	| "externalRecommendation"
	| "component"
	| "dropdown"
	| "html";

// Minimal placeholder types for referenced but unspecified shapes
export type ServiceCardConfig = {
	tailwindClasses?: string;
};

export type FormItem<T> = {
	id: string;
	type: string;
	label?: string;
	props?: T;
};

export class ContentBlock<T> {
	type: ContentBlockType;
	id: string;
	data?: T;
	config?: {
		tailwindClasses?: string;
	};

	constructor(data: Partial<ContentBlock<T>>) {
		this.type = data?.type || "paragraph";
		this.data = data?.data;
		this.config = data?.config;
		this.id = data?.id || crypto.randomUUID(); // Generate a unique ID if not provided
	}
}

export interface IntroBlockData {
	overview: {
		title: TitleBlockData;
		text: ParagraphBlockData[];
	};
	steps: {
		title: TitleBlockData;
		text: ParagraphBlockData[];
	};
}

export interface TitleBlockData {
	text: string;
	level: 1 | 2 | 3 | 4 | 5 | 6;
	/**
	 * Replace is used to inject styled text into the heading and is used as follows:
	 * text: 'This is a {1}'
	 * replace: [{id: 1, text: 'dynamic title block', tailwindStyles: 'text-red}]
	 */
	replace?: Array<{
		id: number;
		text: string;
		tailwindStyles: string;
	}>;
}

export interface ParagraphBlockData {
	/**
	 * Plain text content for the paragraph. If 'html' is provided, this is ignored.
	 */
	text: string;
	/**
	 * Optional array of replacements, used in the same way as TitleBlock replace.
	 */
	replace?: Array<{
		id: number;
		text: string;
		tailwindStyles: string;
	}>;
	/**
	 * Optional raw HTML content. If provided, this takes precedence over 'text' and 'replace' for rendering.
	 */
	html?: string;
}

export interface VideoBlockData {
	url: string;
	caption?: string;
}

export interface ImageBlockData {
	url: string;
	alt: string;
	caption?: string;
}

export interface RecommendationBlockData {
	services: {
		slug: string;
		config?: ServiceCardConfig;
	}[];
}

export type ExternalRecommendationData = {
	services: {
		title: string;
		subtitle?: string;
		description: string;
		url: string;
	}[];
};

export type ComponentBlockData = {
	component: string; // e.g., 'PageUnpaidCarersMorayAssessmentComponent'
};

export interface DropdownBlockData {
	title: TitleBlockData;
	content: ContentBlock<any>[];
}

export interface AssessmentBlockData {
	formId: string; // Unique ID for the form, used to store and retrieve form data
	form: FormItem<any>[];
}

export type AssessmentResultData = {
	title: TitleBlockData;
	paragraph: ParagraphBlockData;
	cardStyles: string;
};

export type AnyBlockData =
	| IntroBlockData
	| TitleBlockData
	| ParagraphBlockData
	| VideoBlockData
	| ImageBlockData
	| RecommendationBlockData
	| ExternalRecommendationData
	| ComponentBlockData
	| DropdownBlockData
	| AssessmentBlockData
	| AssessmentResultData
	| string; // for html raw string

export type Stage = {
	id: string;
	blocks: ContentBlock<AnyBlockData>[];
	edges: { id: string; source: string; target: string }[];
};

export const contentBlockOptions: Record<ContentBlockType, string> = {
	intro: "Intro",
	title: "Title",
	paragraph: "Paragraph",
	video: "Video",
	image: "Image",
	assessment: "Assessment",
	recommendation: "Recommendation",
	assessmentResult: "Assessment Result",
	externalRecommendation: "External Recommendation",
	component: "Component",
	dropdown: "Dropdown",
	html: "HTML",
};
