import { ContentBlockType, AnyBlockData } from "@/types/content";

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
			if (typeof data === "object" && data !== null) {
				const titleData = data as any;
				if (!titleData.text || titleData.text.trim() === "") {
					errors.push({ field: "text", message: "Title text is required" });
				}
				if (!titleData.level || titleData.level < 1 || titleData.level > 6) {
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
			if (typeof data === "object" && data !== null) {
				const paragraphData = data as any;
				if (
					!paragraphData.html &&
					(!paragraphData.text || paragraphData.text.trim() === "")
				) {
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
			if (typeof data === "object" && data !== null) {
				const videoData = data as any;
				if (!videoData.url || videoData.url.trim() === "") {
					errors.push({ field: "url", message: "Video URL is required" });
				} else if (!isValidUrl(videoData.url)) {
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
			if (typeof data === "object" && data !== null) {
				const imageData = data as any;
				if (!imageData.url || imageData.url.trim() === "") {
					errors.push({ field: "url", message: "Image URL is required" });
				} else if (!isValidUrl(imageData.url)) {
					errors.push({
						field: "url",
						message: "Image URL must be a valid URL",
					});
				}
				if (!imageData.alt || imageData.alt.trim() === "") {
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
			if (typeof data === "object" && data !== null) {
				const componentData = data as any;
				if (!componentData.component || componentData.component.trim() === "") {
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
			if (typeof data === "object" && data !== null) {
				const assessmentData = data as any;
				if (!assessmentData.formId || assessmentData.formId.trim() === "") {
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
			if (typeof data === "object" && data !== null) {
				const recommendationData = data as any;
				if (
					!Array.isArray(recommendationData.services) ||
					recommendationData.services.length === 0
				) {
					errors.push({
						field: "services",
						message: "At least one service is required",
					});
				} else {
					recommendationData.services.forEach((service: any, index: number) => {
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
			if (typeof data === "object" && data !== null) {
				const externalData = data as any;
				if (
					!Array.isArray(externalData.services) ||
					externalData.services.length === 0
				) {
					errors.push({
						field: "services",
						message: "At least one external service is required",
					});
				} else {
					externalData.services.forEach((service: any, index: number) => {
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
	} catch (_) {
		return false;
	}
}
