import type { CollectionConfig } from "payload";

export const Pathways: CollectionConfig = {
	slug: "pathways",
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
