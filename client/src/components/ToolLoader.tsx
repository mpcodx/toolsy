import { Suspense, lazy } from "react";
import { getTool } from "@/lib/tools";
import ComingSoon from "./tools/ComingSoon";

const lazyNamed = (loader: () => Promise<any>, exportName: string) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })));

// Lazy load tool components
const toolComponents: Record<string, any> = {
  "pdf-to-image": lazy(() => import("./tools/PdfToImage")),
  "image-to-pdf": lazy(() => import("./tools/ImageToPdf")),
  "text-to-speech": lazy(() => import("./tools/TextToSpeech")),
  "video-to-audio": lazy(() => import("./tools/VideoToAudio")),
  "video-thumbnail-maker": lazyNamed(() => import("./tools/VideoTools"), "VideoThumbnailMaker"),
  "video-to-frames": lazyNamed(() => import("./tools/VideoTools"), "VideoToFrames"),
  "video-clipper": lazyNamed(() => import("./tools/VideoTools"), "VideoClipper"),
  "direct-mp4-downloader": lazy(() => import("./tools/DirectMp4Downloader")),
  "pdf-compressor": lazyNamed(() => import("./tools/PdfTools"), "PdfCompressor"),
  "pdf-merger": lazyNamed(() => import("./tools/PdfTools"), "PdfMerger"),
  "pdf-splitter": lazyNamed(() => import("./tools/PdfTools"), "PdfSplitter"),
  "pdf-watermark": lazyNamed(() => import("./tools/PdfTools"), "PdfWatermark"),
  "word-to-pdf": lazyNamed(() => import("./tools/PdfTools"), "WordToPdf"),
  "excel-to-pdf": lazyNamed(() => import("./tools/PdfTools"), "ExcelToPdf"),
  "ppt-to-pdf": lazyNamed(() => import("./tools/PdfTools"), "PptToPdf"),
  "pdf-to-word": lazyNamed(() => import("./tools/PdfTools"), "PdfToWord"),
  "image-resizer": lazyNamed(() => import("./tools/ImageTools"), "ImageResizer"),
  "image-compressor": lazyNamed(() => import("./tools/ImageTools"), "ImageCompressor"),
  "image-converter": lazyNamed(() => import("./tools/ImageTools"), "ImageConverter"),
  "image-cropper": lazyNamed(() => import("./tools/ImageTools"), "ImageCropper"),
  "zip-extractor": lazyNamed(() => import("./tools/ArchiveTools"), "ZipExtractor"),
  "zip-creator": lazyNamed(() => import("./tools/ArchiveTools"), "ZipCreator"),
  "text-formatter": lazyNamed(() => import("./tools/UtilityTools"), "TextFormatter"),
  "json-formatter": lazyNamed(() => import("./tools/UtilityTools"), "JsonFormatter"),
  "hash-generator": lazyNamed(() => import("./tools/UtilityTools"), "HashGenerator"),
  "color-converter": lazyNamed(() => import("./tools/UtilityTools"), "ColorConverter"),
  "unit-converter": lazyNamed(() => import("./tools/UtilityTools"), "UnitConverter"),
  "base64-encoder": lazyNamed(() => import("./tools/UtilityTools"), "Base64EncoderDecoder"),
  "qr-code-generator": lazyNamed(() => import("./tools/UtilityTools"), "QrCodeGenerator"),
  "barcode-generator": lazyNamed(() => import("./tools/UtilityTools"), "BarcodeGenerator"),
  "ai-meta-generator": lazyNamed(() => import("./tools/AiTextTools"), "AiMetaGenerator"),
  "ai-paragraph-rewriter": lazyNamed(() => import("./tools/AiTextTools"), "AiParagraphRewriter"),
  "ai-title-generator": lazyNamed(() => import("./tools/AiTextTools"), "AiTitleGenerator"),
  "keyword-clustering-tool": lazyNamed(() => import("./tools/AiTextTools"), "KeywordClusteringTool"),
  "schema-markup-generator": lazyNamed(() => import("./tools/AiTextTools"), "SchemaMarkupGenerator"),
  "faq-generator": lazyNamed(() => import("./tools/AiTextTools"), "FaqGenerator"),
  "commit-message-generator": lazyNamed(() => import("./tools/AiTextTools"), "CommitMessageGenerator"),
  "regex-explainer": lazyNamed(() => import("./tools/AiTextTools"), "RegexExplainer"),
  "curl-command-generator": lazyNamed(() => import("./tools/AiTextTools"), "CurlCommandGenerator"),
  "hashtag-generator": lazyNamed(() => import("./tools/AiTextTools"), "HashtagGenerator"),
  "instagram-caption-generator": lazyNamed(() => import("./tools/AiTextTools"), "InstagramCaptionGenerator"),
  "youtube-description-generator": lazyNamed(() => import("./tools/AiTextTools"), "YoutubeDescriptionGenerator"),
  "clip-idea-generator": lazyNamed(() => import("./tools/AiTextTools"), "ClipIdeaGenerator"),
  "video-hook-generator": lazyNamed(() => import("./tools/AiTextTools"), "VideoHookGenerator"),
  "shorts-script-generator": lazyNamed(() => import("./tools/AiTextTools"), "ShortsScriptGenerator"),
  "content-calendar-generator": lazyNamed(() => import("./tools/AiTextTools"), "ContentCalendarGenerator"),
};

interface ToolLoaderProps {
  toolId: string;
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading tool...</p>
      </div>
    </div>
  );
}

export default function ToolLoader({ toolId }: ToolLoaderProps) {
  const ToolComponent = toolComponents[toolId];
  const tool = getTool(toolId);

  if (!tool) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Tool not found</p>
      </div>
    );
  }

  // Show fully implemented tool with lazy loading
  if (ToolComponent) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ToolComponent />
      </Suspense>
    );
  }

  // Show coming soon for tools under development
  return <ComingSoon toolId={toolId} toolName={tool.name} />;
}
