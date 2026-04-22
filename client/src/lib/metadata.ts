export interface MetadataConfig {
  title: string;
  description: string;
  keywords: string[];
  image?: string;
  url?: string;
  type?: string;
  canonical?: string;
}

const DEFAULT_METADATA: MetadataConfig = {
  title: "Toolsy - Free AI, SEO, Developer, Social, PDF & Media Tools",
  description:
    "Toolsy is a free online hub for AI, SEO, developer, social media, PDF, video, and image tools. Generate metadata, cluster keywords, explain regex, write captions, and handle file workflows with no signup required.",
  keywords: [
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
    "mp4 downloader",
    "direct mp4 downloader",
    "video link downloader",
    "free online video trimmer",
    "video trimmer no watermark",
    "watermark-free video cutter",
    "trim uploaded video privately",
    "file conversion",
    "PDF to image",
    "image to PDF",
    "document converter",
    "online tools",
    "free converter",
  ],
  image:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663075906499/HGEeKYb69GRxsTr6fzPE7i/hero-banner-i64GCUGHWUe83zmTExApQ7.webp",
  url: "https://toolsy.rayonweb.com",
  type: "website",
  canonical: "https://toolsy.rayonweb.com/",
};

export function updateMetadata(config: Partial<MetadataConfig> = {}) {
  const metadata = { ...DEFAULT_METADATA, ...config };

  // Update title
  document.title = metadata.title;

  // Update or create meta tags
  updateMetaTag("description", metadata.description);
  updateMetaTag("keywords", metadata.keywords.join(", "));
  updateMetaTag("robots", "index, follow");
  updateMetaTag(
    "googlebot",
    "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
  );
  updateMetaTag("og:site_name", "Toolsy", "property");
  updateMetaTag("og:title", metadata.title, "property");
  updateMetaTag("og:description", metadata.description, "property");
  updateMetaTag("og:image", metadata.image || "", "property");
  updateMetaTag("og:url", metadata.url || "", "property");
  updateMetaTag("og:type", metadata.type || "website", "property");
  updateMetaTag("twitter:title", metadata.title, "name");
  updateMetaTag("twitter:description", metadata.description, "name");
  updateMetaTag("twitter:image", metadata.image || "", "name");
  updateMetaTag("twitter:card", "summary_large_image", "name");
  updateMetaTag(
    "twitter:url",
    metadata.url || metadata.canonical || "",
    "name"
  );
  updateLinkTag("canonical", metadata.canonical || metadata.url || "");
  updateLinkTag("sitemap", "/sitemap.xml");
}

function updateMetaTag(
  name: string,
  content: string,
  attribute: "name" | "property" = "name"
) {
  if (!content) return;

  let tag = document.querySelector(
    `meta[${attribute}="${name}"]`
  ) as HTMLMetaElement;

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }

  tag.content = content;
}

function updateLinkTag(rel: string, href: string) {
  if (!href) return;

  let tag = document.querySelector(
    `link[rel="${rel}"]`
  ) as HTMLLinkElement | null;

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }

  tag.href = href;
}

export function getToolMetadata(toolName: string, toolDescription: string) {
  return {
    title: `${toolName} - Free Online Tool | Toolsy`,
    description: toolDescription,
    keywords: [
      toolName.toLowerCase(),
      "converter",
      "free tool",
      "online tool",
      ...DEFAULT_METADATA.keywords,
    ],
  };
}
