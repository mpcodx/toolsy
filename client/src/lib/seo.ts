/**
 * SEO and Meta Tags Configuration
 * Optimized for search engines and social media
 */

import { getTool, TOOLS } from "@/lib/tools";

export const SITE_CONFIG = {
  title: "Toolsy - Free AI, SEO, Developer, Social, PDF & Media Tools",
  description:
    "Toolsy is a free online hub for AI, SEO, developer, social media, PDF, video, and image tools. Generate metadata, cluster keywords, explain regex, write captions, and handle file workflows with no signup required.",
  url: "https://toolsylab.xyz",
  image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663075906499/HGEeKYb69GRxsTr6fzPE7i/hero-banner-i64GCUGHWUe83zmTExApQ7.webp",
  author: "Toolsy Team",
  keywords: [
    "Toolsy",
    "AI tools",
    "SEO tools",
    "developer tools",
    "social media tools",
    "ai meta generator",
    "keyword clustering tool",
    "schema markup generator",
    "faq generator",
    "commit message generator",
    "regex explainer",
    "curl command generator",
    "hashtag generator",
    "instagram caption generator",
    "youtube description generator",
    "PDF converter",
    "image converter",
    "video to audio",
    "video to frames",
    "video to pic",
    "video to images",
    "thumbnail maker",
    "video trimmer",
    "video cutter online",
    "video clip cutter",
    "video to clip",
    "free online video trimmer",
    "video trimmer no watermark",
    "watermark-free video cutter",
    "trim uploaded video privately",
    "mp4 downloader",
    "direct mp4 downloader",
    "video link downloader",
    "file conversion",
    "online tools",
    "free converter",
    "PDF to image",
    "image to PDF",
    "document converter",
    "file compressor",
    "text to speech",
  ],
};

export const TOOL_SEO_DATA: Record<string, any> = {
  "pdf-to-image": {
    title: "PDF to Image Converter - Convert PDF Pages to JPG, PNG, WebP",
    description:
      "Convert PDF pages to high-quality images. Support for JPG, PNG, and WebP formats. Fast, free, and no signup required.",
    keywords: ["PDF to image", "PDF converter", "image conversion", "JPG converter"],
  },
  "image-to-pdf": {
    title: "Image to PDF Converter - Combine Images into PDF",
    description:
      "Combine multiple images into a single PDF document. Support for JPG, PNG, WebP, and more. Fast and easy.",
    keywords: ["image to PDF", "PDF creator", "image converter", "PDF maker"],
  },
  "pdf-compressor": {
    title: "PDF Compressor - Reduce PDF File Size Online",
    description:
      "Compress PDF files while maintaining quality. Reduce file size instantly with our free online PDF compressor.",
    keywords: ["PDF compressor", "compress PDF", "reduce PDF size", "PDF optimizer"],
  },
  "word-to-pdf": {
    title: "Word to PDF Converter - Convert DOCX to PDF Online",
    description:
      "Convert Word documents (DOCX, DOC) to PDF format. Preserve formatting and layout. Free and instant.",
    keywords: ["Word to PDF", "DOCX to PDF", "document converter", "PDF maker"],
  },
  "text-to-speech": {
    title: "Text to Speech Converter - Convert Text to Audio",
    description:
      "Convert text to natural-sounding audio. Support for multiple voices and languages. Download as MP3.",
    keywords: ["text to speech", "TTS", "audio converter", "voice generator"],
  },
  "video-to-audio": {
    title: "Video to Audio Converter - Extract Audio from Video Files",
    description:
      "Extract audio from uploaded video files locally in your browser. Fast, private, and no signup required.",
    keywords: ["video to audio", "audio extractor", "video converter", "media converter"],
  },
  "video-thumbnail-maker": {
    title: "Video Thumbnail Maker - Capture a Frame from Your Video",
    description:
      "Capture a frame from an uploaded video and download it as a thumbnail image. Works locally in your browser.",
    keywords: ["thumbnail maker", "video thumbnail", "video to pic", "frame capture", "video to image"],
  },
  "video-to-frames": {
    title: "Video to Frames - Export Video Frames as a ZIP",
    description:
      "Export video frames from a selected time range into a ZIP archive of images. Great for storyboards and previews.",
    keywords: ["video to frames", "video to images", "video to pic", "frame extractor", "ZIP frames"],
  },
  "video-clipper": {
    title: "Video Clip Cutter - Free Online Video Trimmer, No Watermark",
    description:
      "Trim videos online in seconds with Toolsy. Free, secure, fast, and no watermark. No signup needed. Supports MP4, MOV, WebM, MKV, and AVI.",
    keywords: [
      "free online video trimmer",
      "video cutter online",
      "trim video online",
      "video clip cutter",
      "video trimmer no watermark",
      "online video cutter",
      "browser-based video trimmer",
      "watermark-free video cutter",
      "trim uploaded video privately",
    ],
  },
  "direct-mp4-downloader": {
    title: "Direct MP4 Downloader - Download Public MP4 File URLs",
    description:
      "Paste a direct public MP4 file URL and use a browser download link to save it locally. Direct file URLs only, no platform pages.",
    keywords: [
      "mp4 downloader",
      "direct mp4 downloader",
      "video url downloader",
      "public mp4 download",
      "video link download",
    ],
  },
  "image-compressor": {
    title: "Image Compressor - Compress Images Online",
    description:
      "Compress images without losing quality. Support for JPG, PNG, WebP, and more. Reduce file size instantly.",
    keywords: ["image compressor", "compress image", "image optimizer", "file size reducer"],
  },
};

export function generateMetaTags(toolId?: string) {
  const tool = toolId ? getTool(toolId) : undefined;
  const config = toolId && TOOL_SEO_DATA[toolId]
    ? TOOL_SEO_DATA[toolId]
    : tool
      ? {
          title: `${tool.name} - Free Online Tool | Toolsy`,
          description: tool.description,
          keywords: [
            tool.name.toLowerCase(),
            tool.category.toLowerCase(),
            "free tool",
            "online tool",
            ...SITE_CONFIG.keywords,
          ],
          image: SITE_CONFIG.image,
          url: `${SITE_CONFIG.url}/tool/${tool.id}`,
        }
      : SITE_CONFIG;
  const url = config.url || (tool ? `${SITE_CONFIG.url}/tool/${tool.id}` : SITE_CONFIG.url);

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords?.join(", ") || SITE_CONFIG.keywords.join(", "),
    canonical: url,
    og: {
      title: config.title,
      description: config.description,
      image: config.image || SITE_CONFIG.image,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      image: config.image || SITE_CONFIG.image,
    },
  };
}

export const STRUCTURED_DATA = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Toolsy",
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.svg`,
  },
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Toolsy",
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/?search={search_term_string}`,
      },
      query_input: "required name=search_term_string",
    },
  },
};

export const ROBOTS_TXT = `User-agent: *
Allow: /

Disallow: /api/
Disallow: /admin/
Disallow: /private/

Sitemap: https://toolsylab.xyz/sitemap.xml`;

export const SITEMAP_URLS = [
  { url: "/", priority: 1.0, changefreq: "daily" },
  ...TOOLS.map((tool) => ({
    url: `/tool/${tool.id}`,
    priority: tool.featured ? 0.9 : 0.8,
    changefreq: "weekly" as const,
  })),
];
