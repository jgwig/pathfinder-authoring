import { ContentBlock } from "@/types/content";
import {
	AssessmentBlockRenderer,
	AssessmentResultRenderer,
	ComponentBlockRenderer,
	DropdownBlockRenderer,
	ExternalRecommendationRenderer,
	HtmlBlockRenderer,
	ImageBlockRenderer,
	IntroBlockRenderer,
	ParagraphBlockRenderer,
	RecommendationBlockRenderer,
	TitleBlockRenderer,
	VideoBlockRenderer,
} from "./block-preview-renderers";

export function BlockPreview({ block }: { block: ContentBlock<any> }) {
	const renderBlockPreview = () => {
		const data = block.data;

		switch (block.type) {
			case "title":
				return <TitleBlockRenderer data={data as any} />;
			case "paragraph":
				return <ParagraphBlockRenderer data={data as any} />;
			case "video":
				return <VideoBlockRenderer data={data as any} />;
			case "image":
				return <ImageBlockRenderer data={data as any} />;
			case "component":
				return <ComponentBlockRenderer data={data as any} />;
			case "recommendation":
				return <RecommendationBlockRenderer data={data as any} />;
			case "externalRecommendation":
				return <ExternalRecommendationRenderer data={data as any} />;
			case "assessment":
				return <AssessmentBlockRenderer data={data as any} />;
			case "html":
				return <HtmlBlockRenderer data={data as string} />;
			case "intro":
				return <IntroBlockRenderer data={data as any} />;
			case "dropdown":
				return <DropdownBlockRenderer data={data as any} />;
			case "assessmentResult":
				return <AssessmentResultRenderer data={data as any} />;
			default:
				return (
					<div className="p-4 bg-muted rounded-lg">
						<p className="text-sm text-muted-foreground">
							No editor available for block type: {block.type}
						</p>
					</div>
				);
		}
	};

	return renderBlockPreview();
}
