"use client";

import { RecommendationBlockRenderer } from "@/components/content-blocks/preview/block-preview-renderers";
import { servicesDemo } from "@/service";

export default function Test() {
	return (
		<RecommendationBlockRenderer
			data={{
				services: [
					{
						slug: "slug",
						council: "lothian",
						metadata: {
							title: servicesDemo[0].title,
							image: servicesDemo[0].image,
							excerpt: servicesDemo[0].excerpt,
						},
					},
				],
				test: servicesDemo[0],
			}}
		/>
	);
}
