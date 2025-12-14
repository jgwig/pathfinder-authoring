import type { CollectionConfig } from "payload";

export const Pathways: CollectionConfig = {
	slug: "pathways",
	// Enable versioning to track changes over time
	versions: {
		maxPerDoc: 50, // Keep last 50 versions per pathway
	},
	fields: [
		{
			type: "text",
			name: "name",
			required: true,
		},
		{
			type: "relationship",
			relationTo: "users",
			name: "user",
			required: true,
		},
		{
			type: "json",
			name: "data",
			required: true,
		},
	],
};
