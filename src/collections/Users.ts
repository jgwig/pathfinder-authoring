import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
	slug: "users",
	admin: {
		useAsTitle: "email",
	},
	access: {
		read: async ({ req: { user } }) => {
			if (!user) return false;
			if (user.role === "admin") return true;
			// Only allow 'user' role to read their own data
			if (user.role === "user") {
				return {
					id: {
						equals: user.id,
					},
				};
			}
			return false;
		},
	},
	auth: true,
	fields: [
		// Email added by default
		// Add more fields as needed
		{
			type: "select",
			options: [
				{ value: "admin", label: "Admin" },
				{ value: "user", label: "User" },
			],
			name: "role",
			defaultValue: "user",
			required: true,
		},
	],
};
