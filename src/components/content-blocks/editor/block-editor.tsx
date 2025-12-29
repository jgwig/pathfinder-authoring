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
} from "./block-editor-renderers";

interface BlockEditorProps {
	handleUpdateBlock: (data: ContentBlock<AnyBlockData>) => void;
	block: ContentBlock<AnyBlockData>;
}

export function BlockEditor({ block, handleUpdateBlock }: BlockEditorProps) {
	function handleChange(data: AnyBlockData) {
		const updatedBlock: ContentBlock<AnyBlockData> = {
			id: block.id,
			type: block.type,
			data: data,
		};
		handleUpdateBlock(updatedBlock);
	}

	const renderBlockEditor = () => {
		const data = block.data;

		switch (block.type) {
			case "title":
				return (
					<TitleBlockRenderer
						data={data as TitleBlockData}
						onChange={handleChange}
					/>
				);
			case "paragraph":
				return (
					<ParagraphBlockRenderer
						data={data as ParagraphBlockData}
						onChange={handleChange}
					/>
				);
			case "video":
				return (
					<VideoBlockRenderer
						data={data as VideoBlockData}
						onChange={handleChange}
					/>
				);
			case "image":
				return (
					<ImageBlockRenderer
						data={data as ImageBlockData}
						onChange={handleChange}
					/>
				);
			case "component":
				return (
					<ComponentBlockRenderer
						data={data as ComponentBlockData}
						onChange={handleChange}
					/>
				);
			case "recommendation":
				return (
					<RecommendationBlockRenderer
						data={data as RecommendationBlockData}
						onChange={handleChange}
					/>
				);
			case "externalRecommendation":
				return (
					<ExternalRecommendationRenderer
						data={data as ExternalRecommendationData}
						onChange={handleChange}
					/>
				);
			case "assessment":
				return (
					<AssessmentBlockRenderer
						data={data as AssessmentBlockData}
						onChange={handleChange}
					/>
				);
			case "html":
				return (
					<HtmlBlockRenderer data={data as string} onChange={handleChange} />
				);
			case "intro":
				return (
					<IntroBlockRenderer
						data={data as IntroBlockData}
						onChange={handleChange}
					/>
				);
			case "dropdown":
				return (
					<DropdownBlockRenderer
						data={data as DropdownBlockData}
						onChange={handleChange}
					/>
				);
			case "assessmentResult":
				return (
					<AssessmentResultRenderer
						data={data as AssessmentResultData}
						onChange={handleChange}
					/>
				);
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

	return renderBlockEditor();
}
