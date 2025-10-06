"use client";

import { RecommendationBlockRenderer } from "@/components/content-blocks/preview/block-preview-renderers";
import { servicesDemo } from "@/service";

export default function Test() {
	return (
		<RecommendationBlockRenderer
			data={{ services: [{ slug: "slug" }], test: servicesDemo[0] }}
		/>
	);
}
