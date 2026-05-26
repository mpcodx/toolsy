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
  title: "Free AI, SEO, Creator, Developer, PDF & Video Tools | Toolsy",
  description:
    "Free online AI, SEO, creator, developer, PDF, and video tools for meta titles, keyword clusters, clip cutter, merge PDF free, Shorts scripts, captions, and file conversion. No signup required.",
  keywords: [
    "free AI tools",
    "SEO tools",
    "creator tools",
    "developer tools",
    "meta title generator",
    "meta description generator",
    "ai meta generator",
    "keyword clustering tool",
    "schema markup generator",
    "faq generator",
    "commit message generator",
    "regex explainer",
    "instagram caption generator",
    "youtube description generator",
    "reel hook generator",
    "youtube shorts script generator",
    "clip idea generator",
    "creator content calendar",
    "video trimmer no watermark",
    "video clip cutter",
    "clip cutter",
    "clipcutter",
    "clips cutter",
    "video cutter online",
    "merge pdf",
    "merge pdf free",
    "direct mp4 downloader",
    "PDF to image",
    "image to PDF",
    "online file converter",
  ],
  image:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663075906499/HGEeKYb69GRxsTr6fzPE7i/hero-banner-i64GCUGHWUe83zmTExApQ7.webp",
  url: "https://toolsylab.xyz",
  type: "website",
  canonical: "https://www.toolsylab.xyz/",
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
      "online tool",
      "free tool",
      "creator tool",
      ...DEFAULT_METADATA.keywords,
    ],
  };
}
