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

export const PageLibrary: CollectionConfig = {
	slug: "page-library",
	labels: {
		singular: "Page Library Item",
		plural: "Page Library",
	},
	admin: {
		useAsTitle: "name",
		defaultColumns: ["name", "blockCount", "user", "createdAt"],
	},
	timestamps: true,
	defaultSort: "-createdAt",
	access: {
		// Users can only read their own pages
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
		// Users can only create pages for themselves
		create: ({ req }) => !!req.user,
		// Users can only update their own pages
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
		// Users can only delete their own pages
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
				description: "A memorable name for this page",
			},
		},
		{
			type: "textarea",
			name: "description",
			label: "Description",
			admin: {
				description: "Optional description to help identify this page",
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
			name: "stageData",
			label: "Stage Data",
			required: true,
			admin: {
				description: "Serialized StageNodeData (blocks, title, state)",
			},
		},
		{
			type: "number",
			name: "blockCount",
			label: "Block Count",
			admin: {
				readOnly: true,
				description: "Number of blocks in this page",
			},
		},
		{
			type: "select",
			name: "blockTypes",
			label: "Block Types",
			hasMany: true,
			options: blockTypeOptions,
			admin: {
				readOnly: true,
				description: "Types of blocks contained in this page",
			},
		},
		{
			type: "array",
			name: "tags",
			label: "Tags",
			admin: {
				description: "Tags for organizing pages",
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
