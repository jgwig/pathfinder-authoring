import type { CollectionConfig } from "payload";
import type { ContentBlockType } from "@/types/content";

// All content block types for the select field
const blockTypeOptions: { label: string; value: ContentBlockType }[] = [
	{ label: "Intro", value: "intro" },
	{ label: "Title", value: "title" },
	{ label: "Paragraph", value: "paragraph" },
	{ label: "Video", value: "video" },
	{ label: "Image", value: "image" },
	{ label: "Assessment", value: "assessment" },
	{ label: "Recommendation", value: "recommendation" },
	{ label: "Assessment Result", value: "assessmentResult" },
	{ label: "External Recommendation", value: "externalRecommendation" },
	{ label: "Component", value: "component" },
	{ label: "Dropdown", value: "dropdown" },
	{ label: "HTML", value: "html" },
	{ label: "Column Layout", value: "column" },
];

export const BlockLibrary: CollectionConfig = {
	slug: "block-library",
	labels: {
		singular: "Block Library Item",
		plural: "Block Library",
	},
	admin: {
		useAsTitle: "name",
		defaultColumns: ["name", "blockType", "user", "createdAt"],
	},
	timestamps: true,
	defaultSort: "-createdAt",
	access: {
		// Users can only read their own blocks
		read: ({ req }) => {
			if (req.user?.role === "admin") return true;
			if (req.user) {
				return {
					user: {
						equals: req.user.id,
					},
				};
			}
			return false;
		},
		// Users can only create blocks for themselves
		create: ({ req }) => !!req.user,
		// Users can only update their own blocks
		update: ({ req }) => {
			if (req.user?.role === "admin") return true;
			if (req.user) {
				return {
					user: {
						equals: req.user.id,
					},
				};
			}
			return false;
		},
		// Users can only delete their own blocks
		delete: ({ req }) => {
			if (req.user?.role === "admin") return true;
			if (req.user) {
				return {
					user: {
						equals: req.user.id,
					},
				};
			}
			return false;
		},
	},
	fields: [
		{
			type: "text",
			name: "name",
			label: "Name",
			required: true,
			admin: {
				description: "A memorable name for this block",
			},
		},
		{
			type: "textarea",
			name: "description",
			label: "Description",
			admin: {
				description: "Optional description to help identify this block",
			},
		},
		{
			type: "relationship",
			relationTo: "users",
			name: "user",
			label: "Owner",
			required: true,
			admin: {
				readOnly: true,
			},
		},
		{
			type: "json",
			name: "blockData",
			label: "Block Data",
			required: true,
			admin: {
				description: "Serialized ContentBlock data",
			},
		},
		{
			type: "select",
			name: "blockType",
			label: "Block Type",
			required: true,
			options: blockTypeOptions,
			admin: {
				description: "The type of content block",
			},
		},
		{
			type: "array",
			name: "tags",
			label: "Tags",
			admin: {
				description: "Tags for organizing blocks",
			},
			fields: [
				{
					type: "text",
					name: "tag",
					required: true,
				},
			],
		},
		{
			type: "upload",
			relationTo: "media",
			name: "thumbnail",
			label: "Thumbnail",
			admin: {
				description: "Optional visual preview",
			},
		},
	],
};
