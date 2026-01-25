import {
	AnyBlockData,
	AssessmentBlockData,
	AssessmentResultData,
	ComponentBlockData,
	DropdownBlockData,
	ExternalRecommendationData,
	ImageBlockData,
	IntroBlockData,
	ParagraphBlockData,
	RecommendationBlockData,
	TitleBlockData,
	VideoBlockData,
	ColumnBlockData,
} from "@/types/content";
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
	ColumnBlockRenderer,
} from "./block-preview-renderers";

export function BlockPreview({ block }: { block: ContentBlock<AnyBlockData> }) {
	const renderBlockPreview = () => {
		const data = block.data;

		switch (block.type) {
			case "title":
				return <TitleBlockRenderer data={data as TitleBlockData} />;
			case "paragraph":
				return <ParagraphBlockRenderer data={data as ParagraphBlockData} />;
			case "video":
				return <VideoBlockRenderer data={data as VideoBlockData} />;
			case "image":
				return <ImageBlockRenderer data={data as ImageBlockData} />;
			case "component":
				return <ComponentBlockRenderer data={data as ComponentBlockData} />;
			case "recommendation":
				return (
					<RecommendationBlockRenderer data={data as RecommendationBlockData} />
				);
			case "externalRecommendation":
				return (
					<ExternalRecommendationRenderer
						data={data as ExternalRecommendationData}
					/>
				);
			case "assessment":
				return <AssessmentBlockRenderer data={data as AssessmentBlockData} />;
			case "html":
				return <HtmlBlockRenderer data={data as string} />;
			case "intro":
				return <IntroBlockRenderer data={data as IntroBlockData} />;
			case "dropdown":
				return <DropdownBlockRenderer data={data as DropdownBlockData} />;
			case "assessmentResult":
				return <AssessmentResultRenderer data={data as AssessmentResultData} />;
			case "column":
				return <ColumnBlockRenderer data={data as ColumnBlockData} />;
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
