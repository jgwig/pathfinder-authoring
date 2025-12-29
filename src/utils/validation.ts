import {
	AnyBlockData,
	AssessmentBlockData,
	ComponentBlockData,
	ContentBlockType,
	ExternalRecommendationData,
	ImageBlockData,
	ParagraphBlockData,
	RecommendationBlockData,
	TitleBlockData,
	VideoBlockData,
} from "@/types/content";

export interface ValidationError {
	field: string;
	message: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
}

export const validateContentBlockData = (
	type: ContentBlockType,
	data: AnyBlockData
): ValidationResult => {
	const errors: ValidationError[] = [];

	switch (type) {
		case "title":
			if (isTitleData(data)) {
				if (!data.text || data.text.trim() === "") {
					errors.push({ field: "text", message: "Title text is required" });
				}
				if (!data.level || data.level < 1 || data.level > 6) {
					errors.push({
						field: "level",
						message: "Heading level must be between 1 and 6",
					});
				}
			} else {
				errors.push({ field: "data", message: "Title data must be an object" });
			}
			break;

		case "paragraph":
			if (isParagraphData(data)) {
				if (!data.html && (!data.text || data.text.trim() === "")) {
					errors.push({
						field: "text",
						message: "Paragraph text or HTML content is required",
					});
				}
			} else {
				errors.push({
					field: "data",
					message: "Paragraph data must be an object",
				});
			}
			break;

		case "video":
			if (isVideoData(data)) {
				if (!data.url || data.url.trim() === "") {
					errors.push({ field: "url", message: "Video URL is required" });
				} else if (!isValidUrl(data.url)) {
					errors.push({
						field: "url",
						message: "Video URL must be a valid URL",
					});
				}
			} else {
				errors.push({ field: "data", message: "Video data must be an object" });
			}
			break;

		case "image":
			if (isImageData(data)) {
				if (!data.url || data.url.trim() === "") {
					errors.push({ field: "url", message: "Image URL is required" });
				} else if (!isValidUrl(data.url)) {
					errors.push({
						field: "url",
						message: "Image URL must be a valid URL",
					});
				}
				if (!data.alt || data.alt.trim() === "") {
					errors.push({
						field: "alt",
						message: "Alt text is required for accessibility",
					});
				}
			} else {
				errors.push({ field: "data", message: "Image data must be an object" });
			}
			break;

		case "component":
			if (isComponentData(data)) {
				if (!data.component || data.component.trim() === "") {
					errors.push({
						field: "component",
						message: "Component name is required",
					});
				}
			} else {
				errors.push({
					field: "data",
					message: "Component data must be an object",
				});
			}
			break;

		case "assessment":
			if (isAssessmentData(data)) {
				if (!data.formId || data.formId.trim() === "") {
					errors.push({ field: "formId", message: "Form ID is required" });
				}
			} else {
				errors.push({
					field: "data",
					message: "Assessment data must be an object",
				});
			}
			break;

		case "html":
			if (typeof data !== "string" || data.trim() === "") {
				errors.push({ field: "html", message: "HTML content is required" });
			}
			break;

		case "recommendation":
			if (isRecommendationData(data)) {
				if (!Array.isArray(data.services) || data.services.length === 0) {
					errors.push({
						field: "services",
						message: "At least one service is required",
					});
				} else {
					data.services.forEach((service, index) => {
						if (!service.slug || service.slug.trim() === "") {
							errors.push({
								field: `services.${index}.slug`,
								message: `Service ${index + 1} slug is required`,
							});
						}
					});
				}
			} else {
				errors.push({
					field: "data",
					message: "Recommendation data must be an object",
				});
			}
			break;

		case "externalRecommendation":
			if (isExternalRecommendationData(data)) {
				if (!Array.isArray(data.services) || data.services.length === 0) {
					errors.push({
						field: "services",
						message: "At least one external service is required",
					});
				} else {
					data.services.forEach((service, index) => {
						if (!service.title || service.title.trim() === "") {
							errors.push({
								field: `services.${index}.title`,
								message: `Service ${index + 1} title is required`,
							});
						}
						if (!service.description || service.description.trim() === "") {
							errors.push({
								field: `services.${index}.description`,
								message: `Service ${index + 1} description is required`,
							});
						}
						if (!service.url || service.url.trim() === "") {
							errors.push({
								field: `services.${index}.url`,
								message: `Service ${index + 1} URL is required`,
							});
						} else if (!isValidUrl(service.url)) {
							errors.push({
								field: `services.${index}.url`,
								message: `Service ${index + 1} URL must be valid`,
							});
						}
					});
				}
			} else {
				errors.push({
					field: "data",
					message: "External recommendation data must be an object",
				});
			}
			break;

		// For complex types like intro, dropdown, assessmentResult, we'll skip validation for now
		case "intro":
		case "dropdown":
		case "assessmentResult":
			// These would require more complex validation logic
			break;

		default:
			break;
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};

function isValidUrl(string: string): boolean {
	try {
		new URL(string);
		return true;
	} catch {
		return false;
	}
}

function isTitleData(data: AnyBlockData): data is TitleBlockData {
	return isObject(data) && "text" in data && "level" in data;
}

function isParagraphData(data: AnyBlockData): data is ParagraphBlockData {
	return isObject(data) && "text" in data;
}

function isVideoData(data: AnyBlockData): data is VideoBlockData {
	return isObject(data) && "url" in data;
}

function isImageData(data: AnyBlockData): data is ImageBlockData {
	return isObject(data) && "url" in data && "alt" in data;
}

function isComponentData(data: AnyBlockData): data is ComponentBlockData {
	return isObject(data) && "component" in data;
}

function isAssessmentData(data: AnyBlockData): data is AssessmentBlockData {
	return isObject(data) && "formId" in data;
}

function isRecommendationData(
	data: AnyBlockData
): data is RecommendationBlockData {
	return isObject(data) && "services" in data;
}

function isExternalRecommendationData(
	data: AnyBlockData
): data is ExternalRecommendationData {
	return isObject(data) && "services" in data;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
