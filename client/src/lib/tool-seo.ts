import type { MetadataConfig } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/seo";
import type { Tool } from "@/lib/tools";

export interface ToolSeoFaq {
  question: string;
  answer: string;
}

export interface ToolSeoSection {
  heading: string;
  paragraphs: string[];
}

export interface ToolSeoContent {
  intro: string;
  highlights: string[];
  steps: string[];
  faqs: ToolSeoFaq[];
  searchPhrases: string[];
  supportedInput: string;
  supportedOutput: string;
  trustBadges: string[];
  sections: ToolSeoSection[];
}

export interface ToolSeoBundle {
  metadata: MetadataConfig;
  content: ToolSeoContent;
  schemas: Record<string, unknown>[];
}

type ToolProfile = {
  focus: string;
  supportedInput: string;
  supportedOutput: string;
  extraKeywords: string[];
  trustBadges: string[];
};

function normalizePhrase(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function unique(values: string[]) {
  return Array.from(new Set(values.map(normalizePhrase))).filter(Boolean);
}

function isVideoClipper(tool: Tool) {
  return tool.id === "video-clipper";
}

function isAiMetaGenerator(tool: Tool) {
  return tool.id === "ai-meta-generator";
}

function isPdfMerger(tool: Tool) {
  return tool.id === "pdf-merger";
}

function getToolProfile(tool: Tool): ToolProfile {
  const name = normalizePhrase(tool.name);
  const description = normalizePhrase(tool.description);

  if (tool.id === "code-to-image") {
    return {
      focus:
        "convert code snippets into beautiful screenshot cards with customized gradients, themes, and canvas shadows",
      supportedInput: "raw code blocks in various programming languages",
      supportedOutput: "high-definition PNG screenshots and sharing cards",
      extraKeywords: [
        "code screenshot maker",
        "code to image",
        "code beautifier",
        "beautify code online",
        "private offline code screenshot maker",
        "code screenshot online",
        "carbon tool alternative",
        "pretty code exporter",
        "code share card generator",
      ],
      trustBadges: ["Free", "Secure", "No Signup", "100% Client-Side"],
    };
  }

  if (tool.id === "linkedin-carousel") {
    return {
      focus:
        "design multi-page slide presentations with custom colors, watermarks, and export them as high-quality PDF carousels",
      supportedInput:
        "custom titles, paragraphs, bullet points, and color selections for multiple slides",
      supportedOutput:
        "multi-page PDF carousels matching LinkedIn square/portrait standards",
      extraKeywords: [
        "linkedin carousel pdf",
        "linkedin slides maker",
        "pdf slides builder",
        "linkedin post generator",
        "create pdf carousel online",
        "linkedin carousel creator",
        "generate linkedin pdf carousel",
        "slides presentation builder",
      ],
      trustBadges: ["Free", "Secure", "No Signup", "No Watermark Limit"],
    };
  }

  if (tool.id === "image-sanitizer") {
    return {
      focus:
        "compress image files and strip metadata such as EXIF details, GPS tags, and device types completely offline",
      supportedInput: "JPEG, PNG, WebP, GIF, or BMP image files",
      supportedOutput: "sanitized and compressed image files",
      extraKeywords: [
        "image sanitizer",
        "strip image metadata",
        "exif data remover",
        "remove gps from image",
        "local image compressor",
        "offline image metadata cleaner",
        "compress image offline",
        "private image compressor",
        "clean exif data",
      ],
      trustBadges: ["Free", "Secure", "No Signup", "100% Offline"],
    };
  }

  if (tool.id === "svg-customizer") {
    return {
      focus:
        "parse SVG vector graphics, customize colors, adjust stroke widths, and export clean SVGs or PNG cards",
      supportedInput: "raw SVG file uploads or vector graphic code",
      supportedOutput:
        "modified SVG vector files or rendered PNG presentation cards",
      extraKeywords: [
        "svg customizer",
        "svg color changer",
        "vector editor",
        "edit svg colors",
        "svg to png cards",
        "customize svg online",
        "raw svg editor",
        "change colors in svg file",
      ],
      trustBadges: ["Free", "Secure", "No Signup", "Real-Time Editor"],
    };
  }

  if (tool.id === "direct-mp4-downloader") {
    return {
      focus: "download direct public MP4 file URLs with a browser-safe link",
      supportedInput: "direct public MP4 file URLs",
      supportedOutput: "downloaded MP4 files",
      extraKeywords: [
        "mp4 downloader",
        "direct mp4 downloader",
        "video url downloader",
        "public mp4 download",
        "video link download",
      ],
      trustBadges: ["Free", "Secure", "No Signup"],
    };
  }

  if (isVideoClipper(tool)) {
    return {
      focus: "trim videos online in a secure browser-based editor",
      supportedInput: "MP4, MOV, WebM, M4V, MKV, and AVI video files",
      supportedOutput: "watermark-free WebM clip",
      extraKeywords: [
        "free online video trimmer",
        "video cutter online",
        "trim video online",
        "video clip cutter",
        "video trimmer no watermark",
        "online video cutter",
        "browser-based video trimmer",
        "secure video trimmer",
        "no signup video cutter",
        "cut video online free",
        "trim mp4 video online",
        "local video clip cutter",
      ],
      trustBadges: ["Free", "Secure", "No Signup", "No Watermark"],
    };
  }

  if (tool.category === "PDF") {
    if (isPdfMerger(tool)) {
      return {
        focus: "merge multiple PDF files into one clean document",
        supportedInput: "multiple PDF files",
        supportedOutput: "a single merged PDF document",
        extraKeywords: [
          "merge pdf",
          "merge pdf free",
          "merge pdf online",
          "free pdf merger",
          "pdf combiner",
          "combine pdf files",
        ],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("to image")) {
      return {
        focus: "convert PDF pages into images",
        supportedInput: "PDF files",
        supportedOutput: "JPG, PNG, or WebP images",
        extraKeywords: ["pdf to image", "pdf pages to images", "pdf converter"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("compress")) {
      return {
        focus: "reduce PDF file size while keeping documents usable",
        supportedInput: "PDF files",
        supportedOutput: "smaller PDF files",
        extraKeywords: ["pdf compressor", "compress pdf", "reduce pdf size"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("split")) {
      return {
        focus: "split a PDF into individual pages or page ranges",
        supportedInput: "PDF files",
        supportedOutput: "split PDF pages or page ranges",
        extraKeywords: ["pdf splitter", "split pdf", "extract pdf pages"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("watermark")) {
      return {
        focus: "add text or image watermarks to PDF documents",
        supportedInput: "PDF files",
        supportedOutput: "watermarked PDF files",
        extraKeywords: [
          "pdf watermark",
          "add watermark to pdf",
          "pdf security",
        ],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("to word")) {
      return {
        focus: "extract PDF content into editable Word documents",
        supportedInput: "PDF files",
        supportedOutput: "editable Word documents",
        extraKeywords: ["pdf to word", "pdf to docx", "convert pdf to word"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    return {
      focus: "handle PDF document workflows quickly",
      supportedInput: "PDF files",
      supportedOutput: "PDF-based results",
      extraKeywords: ["pdf tool", "document converter", "pdf workflow"],
      trustBadges: ["Free", "Secure", "No Signup"],
    };
  }

  if (tool.category === "Document") {
    if (name.includes("word to pdf")) {
      return {
        focus: "convert Word documents into PDF files",
        supportedInput: "DOCX and DOC files",
        supportedOutput: "PDF documents",
        extraKeywords: ["word to pdf", "docx to pdf", "document converter"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("excel")) {
      return {
        focus: "convert spreadsheets into PDF documents",
        supportedInput: "XLSX and XLS spreadsheets",
        supportedOutput: "PDF documents",
        extraKeywords: [
          "excel to pdf",
          "spreadsheet to pdf",
          "sheet converter",
        ],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("ppt")) {
      return {
        focus: "turn presentation slides into PDF documents",
        supportedInput: "PowerPoint presentations",
        supportedOutput: "PDF documents",
        extraKeywords: ["ppt to pdf", "powerpoint to pdf", "slide converter"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("pdf to word")) {
      return {
        focus: "convert PDFs into editable Word documents",
        supportedInput: "PDF files",
        supportedOutput: "editable Word documents",
        extraKeywords: ["pdf to word", "pdf to docx", "document converter"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }
  }

  if (tool.category === "Image") {
    if (name.includes("resize")) {
      return {
        focus: "resize images to custom dimensions",
        supportedInput: "JPG, PNG, or WebP images",
        supportedOutput: "resized image files",
        extraKeywords: ["image resizer", "resize image", "image size"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("compress")) {
      return {
        focus: "compress images while preserving quality",
        supportedInput: "JPG, PNG, or WebP images",
        supportedOutput: "smaller image files",
        extraKeywords: [
          "image compressor",
          "compress image",
          "image optimizer",
        ],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("convert")) {
      return {
        focus: "convert images between common formats",
        supportedInput: "JPG, PNG, WebP, GIF, or BMP images",
        supportedOutput: "converted image files",
        extraKeywords: ["image converter", "jpg to png", "webp converter"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("crop")) {
      return {
        focus: "crop images to the right frame and size",
        supportedInput: "image files",
        supportedOutput: "cropped image files",
        extraKeywords: ["image cropper", "crop image", "trim image"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }
  }

  if (tool.category === "Video") {
    if (name.includes("audio")) {
      return {
        focus: "extract audio from uploaded video files",
        supportedInput: "uploaded video files",
        supportedOutput: "browser-compatible audio files",
        extraKeywords: ["video to audio", "audio extractor", "video converter"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("thumbnail")) {
      return {
        focus: "capture a video frame and save it as a thumbnail",
        supportedInput: "uploaded video files",
        supportedOutput: "thumbnail images",
        extraKeywords: ["thumbnail maker", "video thumbnail", "video to pic"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("frame")) {
      return {
        focus: "export video frames as a ZIP archive of images",
        supportedInput: "uploaded video files",
        supportedOutput: "a ZIP archive of image frames",
        extraKeywords: [
          "video to frames",
          "video to images",
          "frame extractor",
        ],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (tool.id === "video-compressor") {
      return {
        focus: "compress video files online to reduce file size",
        supportedInput: "uploaded MP4, MOV, WebM, M4V, MKV, or AVI video files",
        supportedOutput: "smaller video files",
        extraKeywords: [
          "video compressor",
          "compress video online",
          "reduce video size",
          "online video compressor",
          "video file compressor",
        ],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("clip")) {
      return {
        focus: "trim uploaded videos into shorter clips",
        supportedInput: "uploaded video files",
        supportedOutput: "short WebM clips",
        extraKeywords: ["video clip cutter", "video to clip", "video trimmer"],
        trustBadges: ["Free", "Secure", "No Signup", "No Watermark"],
      };
    }
  }

  if (tool.category === "Text") {
    if (name.includes("speech")) {
      return {
        focus: "convert text into audio",
        supportedInput: "plain text",
        supportedOutput: "audio files",
        extraKeywords: ["text to speech", "tts", "audio generator"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("json")) {
      return {
        focus: "format, validate, and minify JSON data",
        supportedInput: "JSON text",
        supportedOutput: "formatted or minified JSON",
        extraKeywords: ["json formatter", "json validator", "minify json"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("counter")) {
      return {
        focus:
          "count words, characters, sentences, and reading time in real time",
        supportedInput: "plain text or pasted content",
        supportedOutput: "word, character, sentence counts and reading time",
        extraKeywords: [
          "word counter",
          "character counter",
          "count words online",
          "text length checker",
          "reading time calculator",
        ],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    return {
      focus: "clean, format, and transform text content",
      supportedInput: "plain text",
      supportedOutput: "formatted text",
      extraKeywords: ["text formatter", "text cleanup", "copywriter tools"],
      trustBadges: ["Free", "Secure", "No Signup"],
    };
  }

  if (tool.category === "Archive") {
    if (name.includes("extract")) {
      return {
        focus: "extract files from ZIP or RAR archives",
        supportedInput: "ZIP or RAR archives",
        supportedOutput: "extracted files",
        extraKeywords: ["zip extractor", "rar extractor", "archive tool"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    return {
      focus: "create compressed ZIP archives from files",
      supportedInput: "files and folders",
      supportedOutput: "ZIP archives",
      extraKeywords: ["zip creator", "create zip", "archive maker"],
      trustBadges: ["Free", "Secure", "No Signup"],
    };
  }

  if (tool.category === "Utility") {
    if (name.includes("qr")) {
      return {
        focus: "generate QR codes from text or URLs",
        supportedInput: "text or URLs",
        supportedOutput: "QR code images",
        extraKeywords: ["qr code generator", "qr maker", "qr creator"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("barcode")) {
      return {
        focus: "create barcodes in several formats",
        supportedInput: "text or numeric values",
        supportedOutput: "barcode images",
        extraKeywords: [
          "barcode generator",
          "barcode maker",
          "barcode creator",
        ],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("hash")) {
      return {
        focus: "generate secure hashes from text or files",
        supportedInput: "text or files",
        supportedOutput: "hash values",
        extraKeywords: ["hash generator", "md5 sha256", "checksum tool"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("color")) {
      return {
        focus: "convert colors between HEX, RGB, and HSL",
        supportedInput: "HEX, RGB, and HSL color values",
        supportedOutput: "converted color values",
        extraKeywords: ["color converter", "hex to rgb", "rgb to hsl"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("unit")) {
      return {
        focus: "convert common measurements and units",
        supportedInput: "numbers and measurement units",
        supportedOutput: "converted values",
        extraKeywords: [
          "unit converter",
          "measurement converter",
          "conversion tool",
        ],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }

    if (name.includes("base64")) {
      return {
        focus: "encode or decode Base64 content",
        supportedInput: "text or Base64 strings",
        supportedOutput: "encoded or decoded text",
        extraKeywords: ["base64 encoder", "base64 decoder", "encode text"],
        trustBadges: ["Free", "Secure", "No Signup"],
      };
    }
  }

  if (tool.category === "AI") {
    if (tool.id === "ai-meta-generator") {
      return {
        focus:
          "generate SEO meta titles and descriptions from a topic and keyword list",
        supportedInput:
          "page topics, target keywords, audience notes, and tone preferences",
        supportedOutput: "meta title and description drafts",
        extraKeywords: [
          "ai meta generator",
          "meta title generator",
          "meta description generator",
          "seo metadata generator",
          "free ai seo tool",
        ],
        trustBadges: ["Free", "No Signup", "OpenRouter Optional"],
      };
    }

    if (tool.id === "ai-paragraph-rewriter") {
      return {
        focus: "rewrite paragraphs for clarity, tone, and readability",
        supportedInput: "plain text paragraphs and rewrite instructions",
        supportedOutput: "rewritten paragraph drafts",
        extraKeywords: [
          "ai paragraph rewriter",
          "rewrite paragraph online",
          "text rewriter tool",
          "rewrite content with ai",
        ],
        trustBadges: ["Free", "No Signup", "OpenRouter Optional"],
      };
    }

    return {
      focus: "generate titles and copy ideas from a short prompt",
      supportedInput: "topics, audiences, keywords, and tone preferences",
      supportedOutput: "title or text drafts",
      extraKeywords: [
        "ai title generator",
        "headline generator",
        "blog title generator",
        "free ai writing tool",
      ],
      trustBadges: ["Free", "No Signup", "OpenRouter Optional"],
    };
  }

  if (tool.category === "SEO") {
    if (tool.id === "keyword-clustering-tool") {
      return {
        focus:
          "group related keywords into SEO clusters for topical authority planning",
        supportedInput: "keyword lists and topic hints",
        supportedOutput: "keyword clusters and content group ideas",
        extraKeywords: [
          "keyword clustering tool",
          "group keywords for seo",
          "keyword cluster generator",
          "seo keyword grouping tool",
        ],
        trustBadges: ["Free", "No Signup", "Search Intent Ready"],
      };
    }

    if (tool.id === "schema-markup-generator") {
      return {
        focus:
          "create JSON-LD schema markup for tool pages, articles, products, and FAQs",
        supportedInput: "schema type selections and page details",
        supportedOutput: "JSON-LD schema markup",
        extraKeywords: [
          "schema markup generator",
          "json ld generator",
          "software application schema",
          "faq schema generator",
        ],
        trustBadges: ["Free", "No Signup", "JSON-LD"],
      };
    }

    if (tool.id === "slug-generator") {
      return {
        focus: "turn titles or phrases into clean, SEO-friendly URL slugs",
        supportedInput: "page titles, blog headlines, or any phrase",
        supportedOutput: "hyphenated, underscore, and camelCase slug variants",
        extraKeywords: [
          "slug generator",
          "url slug generator",
          "seo slug tool",
          "convert title to slug",
          "slugify text",
        ],
        trustBadges: ["Free", "No Signup", "Instant"],
      };
    }

    if (tool.id === "open-graph-tag-generator") {
      return {
        focus: "generate Open Graph meta tags for clean social share previews",
        supportedInput: "page title, description, image URL, and page URL",
        supportedOutput: "ready-to-paste Open Graph meta tags",
        extraKeywords: [
          "open graph tag generator",
          "og tag generator",
          "facebook meta tag generator",
          "social share meta tags",
          "open graph meta tool",
        ],
        trustBadges: ["Free", "No Signup", "Copy-Paste Ready"],
      };
    }

    if (tool.id === "twitter-card-generator") {
      return {
        focus: "generate Twitter/X Card meta tags for richer link previews",
        supportedInput: "card title, description, image URL, and handle",
        supportedOutput: "ready-to-paste Twitter Card meta tags",
        extraKeywords: [
          "twitter card generator",
          "x card generator",
          "twitter meta tag generator",
          "social card meta tags",
          "twitter preview tags",
        ],
        trustBadges: ["Free", "No Signup", "Copy-Paste Ready"],
      };
    }

    if (tool.id === "faq-schema-generator") {
      return {
        focus: "turn question and answer pairs into valid FAQPage JSON-LD",
        supportedInput: "repeatable question and answer pairs",
        supportedOutput: "FAQPage JSON-LD structured data",
        extraKeywords: [
          "faq schema generator",
          "faq json ld generator",
          "structured data faq tool",
          "faq markup generator",
          "faq rich results schema",
        ],
        trustBadges: ["Free", "No Signup", "JSON-LD"],
      };
    }

    if (tool.id === "serp-snippet-preview-tool") {
      return {
        focus:
          "preview how a title, URL, and description look in Google search results",
        supportedInput: "title tag, meta description, and page URL",
        supportedOutput:
          "a live search-result style preview with length warnings",
        extraKeywords: [
          "serp snippet preview tool",
          "google snippet preview",
          "meta preview tool",
          "search result preview",
          "serp preview generator",
        ],
        trustBadges: ["Free", "No Signup", "Live Preview"],
      };
    }

    if (tool.id === "robots-txt-generator") {
      return {
        focus:
          "build a valid robots.txt file with allow, disallow, and sitemap rules",
        supportedInput: "site URL, crawl rules, and optional crawl-delay",
        supportedOutput: "a ready-to-upload robots.txt file",
        extraKeywords: [
          "robots txt generator",
          "robots.txt generator",
          "create robots txt",
          "seo robots file tool",
          "free robots txt tool",
        ],
        trustBadges: ["Free", "No Signup", "Instant"],
      };
    }

    if (tool.id === "utm-link-builder") {
      return {
        focus:
          "build UTM-tagged campaign URLs for accurate marketing attribution",
        supportedInput:
          "a base URL plus source, medium, campaign, term, and content values",
        supportedOutput: "a UTM-tagged campaign tracking URL",
        extraKeywords: [
          "utm link builder",
          "utm builder",
          "utm campaign builder",
          "google analytics utm generator",
          "campaign url builder",
        ],
        trustBadges: ["Free", "No Signup", "Analytics Ready"],
      };
    }

    return {
      focus:
        "generate SEO-friendly FAQ copy for landing pages and content hubs",
      supportedInput: "page topics, keywords, audience notes, and FAQ counts",
      supportedOutput: "FAQ question and answer drafts",
      extraKeywords: [
        "faq generator",
        "seo faq generator",
        "landing page faq tool",
        "faq schema content generator",
      ],
      trustBadges: ["Free", "No Signup", "SERP Friendly"],
    };
  }

  if (tool.category === "Developer") {
    if (tool.id === "commit-message-generator") {
      return {
        focus:
          "turn rough change summaries into clean conventional commit messages",
        supportedInput: "change summaries, scopes, and commit types",
        supportedOutput: "formatted commit messages",
        extraKeywords: [
          "commit message generator",
          "conventional commit generator",
          "git commit message tool",
        ],
        trustBadges: ["Free", "No Signup", "Dev Friendly"],
      };
    }

    if (tool.id === "regex-explainer") {
      return {
        focus:
          "explain regular expressions in plain English with token breakdowns",
        supportedInput:
          "regex patterns, optional sample text, and regex flavor notes",
        supportedOutput: "regex explanations",
        extraKeywords: [
          "regex explainer",
          "explain regex online",
          "regex to english",
          "regular expression helper",
        ],
        trustBadges: ["Free", "No Signup", "Plain English"],
      };
    }

    return {
      focus:
        "build cURL commands from request details without hand-writing terminal flags",
      supportedInput: "request URLs, methods, headers, and JSON bodies",
      supportedOutput: "ready-to-run cURL commands",
      extraKeywords: [
        "curl command generator",
        "http request to curl",
        "api curl builder",
      ],
      trustBadges: ["Free", "No Signup", "Developer Workflow"],
    };
  }

  if (tool.category === "Social Media") {
    if (tool.id === "hashtag-generator") {
      return {
        focus: "generate grouped hashtags for niche reach and discovery",
        supportedInput: "post topics, keywords, platforms, and brand names",
        supportedOutput: "hashtag sets",
        extraKeywords: [
          "hashtag generator",
          "instagram hashtag generator",
          "tiktok hashtag generator",
          "social media hashtags",
        ],
        trustBadges: ["Free", "No Signup", "Creator Ready"],
      };
    }

    if (tool.id === "clip-idea-generator") {
      return {
        focus:
          "turn long videos, podcasts, and interviews into short-form clip ideas",
        supportedInput: "topics, source formats, audiences, and clip goals",
        supportedOutput: "clip idea lists with hooks and call-to-action angles",
        extraKeywords: [
          "clip idea generator",
          "podcast clip ideas",
          "short-form content ideas",
          "video clip ideas",
        ],
        trustBadges: ["Free", "No Signup", "Creator Ready"],
      };
    }

    if (tool.id === "video-hook-generator") {
      return {
        focus:
          "create opening hooks for reels, shorts, and talking-head videos",
        supportedInput: "topics, audiences, platforms, and tone preferences",
        supportedOutput: "scroll-stopping hook ideas",
        extraKeywords: [
          "video hook generator",
          "reels hook generator",
          "youtube shorts hook ideas",
          "tiktok hook generator",
        ],
        trustBadges: ["Free", "No Signup", "Creator Ready"],
      };
    }

    if (tool.id === "shorts-script-generator") {
      return {
        focus:
          "draft short-form video scripts with hooks, beats, and calls to action",
        supportedInput:
          "topics, takeaways, platforms, clip lengths, and CTA notes",
        supportedOutput: "shorts and reels script drafts",
        extraKeywords: [
          "shorts script generator",
          "youtube shorts script generator",
          "reels script generator",
          "short video script",
        ],
        trustBadges: ["Free", "No Signup", "Creator Ready"],
      };
    }

    if (tool.id === "content-calendar-generator") {
      return {
        focus:
          "plan creator content calendars across short-form platforms and posting cycles",
        supportedInput: "niches, platforms, offers, goals, and timeframes",
        supportedOutput: "content calendar ideas and posting plans",
        extraKeywords: [
          "content calendar generator",
          "creator content planner",
          "social media content calendar",
          "monthly content ideas",
        ],
        trustBadges: ["Free", "No Signup", "Creator Ready"],
      };
    }

    if (tool.id === "clip-duration-calculator") {
      return {
        focus:
          "calculate script word counts and pacing speed to optimize for 60-second vertical videos",
        supportedInput:
          "video scripts, custom pacing speeds, and platform limits",
        supportedOutput:
          "estimated duration, limit usage progress bars, and pacing ratings",
        extraKeywords: [
          "clip duration calculator",
          "pacing calculator",
          "shorts pacing tool",
          "video script word count",
          "shorts length calculator",
        ],
        trustBadges: ["Free", "No Signup", "Creator Ready"],
      };
    }

    if (tool.id === "clip-safezone-visualizer") {
      return {
        focus:
          "visualize vertical safe zone overlays for TikTok, Instagram Reels, and YouTube Shorts to keep captions readable",
        supportedInput:
          "mobile viewport selections, highlights triggers, and mock frame uploads",
        supportedOutput:
          "interactive 9:16 canvas mockups with overlaid safe zone markings",
        extraKeywords: [
          "vertical safe zone",
          "shorts safe zone mockup",
          "tiktok safe zone overlays",
          "instagram reels layout safe zone",
          "captions safe zone helper",
        ],
        trustBadges: ["Free", "No Signup", "Visual Preview"],
      };
    }

    if (tool.id === "instagram-caption-generator") {
      return {
        focus:
          "create Instagram captions with hooks, body copy, and calls to action",
        supportedInput: "post topics, offers, CTAs, and tone preferences",
        supportedOutput: "Instagram caption drafts",
        extraKeywords: [
          "instagram caption generator",
          "caption generator for instagram",
          "social caption generator",
        ],
        trustBadges: ["Free", "No Signup", "Creator Ready"],
      };
    }

    return {
      focus:
        "write YouTube descriptions with keyword coverage and channel calls to action",
      supportedInput: "video titles, summaries, keywords, and CTA notes",
      supportedOutput: "YouTube description drafts",
      extraKeywords: [
        "youtube description generator",
        "video description generator",
        "youtube seo description tool",
      ],
      trustBadges: ["Free", "No Signup", "Creator Ready"],
    };
  }

  if (tool.category === "GEO & AEO") {
    if (tool.id === "geo-content-optimizer") {
      return {
        focus:
          "optimize text content to maximize visibility and citations in Generative AI Search Engines",
        supportedInput: "draft articles, landing page copy, or product details",
        supportedOutput: "citation-optimized text drafts and GEO score reports",
        extraKeywords: [
          "geo content optimizer",
          "generative engine optimization",
          "optimize content for gemini",
          "perplexity citation optimization",
          "llm search optimizer",
        ],
        trustBadges: ["Free", "No Signup", "GEO Scored"],
      };
    }
    if (tool.id === "aeo-answer-generator") {
      return {
        focus:
          "generate concise, structured Q&A sets and FAQ schema optimized for answer engine visibility",
        supportedInput:
          "page topics, target keywords, and voice tone preferences",
        supportedOutput: "direct answer drafts and JSON-LD FAQ schema",
        extraKeywords: [
          "aeo answer generator",
          "answer engine optimization",
          "chatgpt search tool",
          "conversational search faq builder",
        ],
        trustBadges: ["Free", "No Signup", "AEO Schema"],
      };
    }
    if (tool.id === "brand-mention-optimizer") {
      return {
        focus:
          "optimize brand description and authority keywords to boost brand citations in generative summaries",
        supportedInput:
          "brand names, company descriptions, niches, and unique selling points",
        supportedOutput: "citation-optimized brand copy",
        extraKeywords: [
          "brand mention optimization",
          "llm brand citation booster",
          "perplexity brand mentions",
          "ai search brand strategy",
        ],
        trustBadges: ["Free", "No Signup", "Authority Boost"],
      };
    }
    return {
      focus:
        "translate conversational questions into advanced search queries with search operators to gather source citations",
      supportedInput: "conversational query prompts and search goals",
      supportedOutput: "advanced search engine query strings with operators",
      extraKeywords: [
        "prompt to query converter",
        "advanced search query builder",
        "google search operators tool",
        "citations search query maker",
      ],
      trustBadges: ["Free", "No Signup", "Operators Ready"],
    };
  }

  return {
    focus: `handle ${tool.category.toLowerCase()} workflows`,
    supportedInput: `${tool.category.toLowerCase()} inputs`,
    supportedOutput: `${tool.category.toLowerCase()} outputs`,
    extraKeywords: [description, `${tool.category.toLowerCase()} tool`],
    trustBadges: ["Free", "Secure", "No Signup"],
  };
}

function buildIntro(tool: Tool, profile: ToolProfile) {
  if (isAiMetaGenerator(tool)) {
    return "Writing strong metadata sounds simple until you need to do it consistently across blog posts, landing pages, category pages, and product listings. Toolsy's AI Meta Generator helps marketers, founders, ecommerce teams, and agencies turn a topic plus target keywords into clearer, more compelling title tags and meta descriptions in seconds.";
  }

  if (isVideoClipper(tool)) {
    return "Toolsy's free online video trimmer helps you cut the exact part you need without opening a heavy editor. Upload a local file, choose the start and end points, and download a clean, watermark-free WebM clip. The workflow is fast, secure, and does not require signup.";
  }

  if (isPdfMerger(tool)) {
    return "Toolsy's PDF Merger gives you a simple way to merge PDF files free online without adding account friction. Upload the documents you want to combine, keep them in the right order, and export one cleaner PDF for sharing, storage, or review.";
  }

  if (tool.id === "direct-mp4-downloader") {
    return "Paste a direct public MP4 file URL and download it with a clean browser link. The page is limited to direct file URLs, not platform pages.";
  }

  return `Use ${tool.name} to ${profile.focus}. This free ${tool.category.toLowerCase()} page keeps the workflow clear, searchable, and easy to use.`;
}

function buildHighlights(tool: Tool, profile: ToolProfile) {
  if (isAiMetaGenerator(tool)) {
    return [
      "Generate multiple title tag and meta description options from one topic and keyword set.",
      `Input: ${profile.supportedInput}. Output: ${profile.supportedOutput}.`,
      "Useful for blog posts, landing pages, product pages, and ongoing SEO refreshes.",
    ];
  }

  if (isVideoClipper(tool)) {
    return [
      "Trim videos online with a focused tool built for fast, everyday cuts.",
      `Input: ${profile.supportedInput}. Output: ${profile.supportedOutput}.`,
      "Secure browser processing, no signup, and no watermark on the exported clip.",
    ];
  }

  if (isPdfMerger(tool)) {
    return [
      "Merge PDF files online with a workflow that stays focused on one clear job.",
      `Input: ${profile.supportedInput}. Output: ${profile.supportedOutput}.`,
      "Useful when you need one shareable PDF for contracts, reports, invoices, or combined exports.",
    ];
  }

  if (tool.id === "direct-mp4-downloader") {
    return [
      "Direct file URLs only, with no platform-page proxying.",
      `Input: ${profile.supportedInput}. Output: ${profile.supportedOutput}.`,
      "Open the file or download it locally with a browser-safe link.",
    ];
  }

  return [
    `Built for ${tool.category.toLowerCase()} workflows with a focused interface.`,
    `Input: ${profile.supportedInput}. Output: ${profile.supportedOutput}.`,
    "Helpful for quick conversion tasks, clearer search intent, and easier sharing.",
  ];
}

function buildSteps(tool: Tool, profile: ToolProfile) {
  if (isAiMetaGenerator(tool)) {
    return [
      "Add the page topic, your main keyword, and any supporting terms you want included.",
      "Choose the audience and tone that best fit the page you are optimizing.",
      "Generate several metadata drafts, then edit the strongest option before publishing.",
    ];
  }

  if (isVideoClipper(tool)) {
    return [
      `Upload a local video file such as ${profile.supportedInput}.`,
      "Set the start and end time for the section you want to keep.",
      `Download the trimmed ${profile.supportedOutput}.`,
    ];
  }

  if (isPdfMerger(tool)) {
    return [
      "Upload the PDF files you want to combine into one document.",
      "Arrange the files in the order you want them to appear.",
      "Merge the PDFs and download the final combined document.",
    ];
  }

  if (tool.id === "direct-mp4-downloader") {
    return [
      "Paste a direct public MP4 file URL into the input field.",
      "Optionally adjust the filename before saving.",
      "Open the file in a new tab or start the download.",
    ];
  }

  return [
    `Open ${tool.name} and add your ${profile.supportedInput.toLowerCase()}.`,
    "Choose the options that fit your project, if the tool offers any.",
    "Generate the result and download the output file.",
  ];
}

function buildFaqs(tool: Tool, profile: ToolProfile): ToolSeoFaq[] {
  if (isAiMetaGenerator(tool)) {
    return [
      {
        question: "What is an AI Meta Generator?",
        answer:
          "An AI Meta Generator creates title tags and meta descriptions from a page topic, target keywords, and audience cues. It gives you faster first drafts for SEO without writing every snippet manually.",
      },
      {
        question: "How does an AI Meta Generator help SEO?",
        answer:
          "It helps you create clearer metadata that better matches search intent and supports stronger click-through potential. The page content still matters, but stronger snippets make the result easier to understand in search.",
      },
      {
        question: "Is this tool only a meta title generator?",
        answer:
          "No. It works as both a meta title generator and a meta description generator, so you can create complete metadata sets for blog posts, landing pages, service pages, and product URLs.",
      },
      {
        question: "Can I use the AI Meta Generator for ecommerce pages?",
        answer:
          "Yes. The tool is useful for product pages, collection pages, category pages, and promotional landing pages where teams need metadata ideas quickly and consistently.",
      },
      {
        question: "Should I publish AI-generated metadata without editing it?",
        answer:
          "It is better to review and refine the output first. A good SEO metadata generator saves time and gives you strong options, but a quick human edit keeps the copy aligned with brand voice and page intent.",
      },
    ];
  }

  if (isVideoClipper(tool)) {
    return [
      {
        question: "Is the Video Clip Cutter free?",
        answer:
          "Yes. Toolsy's free online video trimmer is free to use, and you can trim videos without paying or signing up.",
      },
      {
        question: "Does the video clip cutter add a watermark?",
        answer:
          "No. The exported clip is watermark-free, so it is ready for social media, client work, or internal sharing.",
      },
      {
        question: "Is it secure to trim a video online?",
        answer:
          "Yes. The clipper works in your browser, which keeps the workflow more private than a typical upload-and-edit service.",
      },
      {
        question: "What formats can I upload to the video trimmer?",
        answer:
          "You can upload MP4, MOV, WebM, M4V, MKV, and AVI files, then download the result as a WebM clip.",
      },
      {
        question: "Do I need an account or signup?",
        answer:
          "No. There is no signup required. Open the page, choose your file, and trim video online in a few steps.",
      },
    ];
  }

  if (isPdfMerger(tool)) {
    return [
      {
        question: "Can I merge PDF free online with this tool?",
        answer:
          "Yes. Toolsy works as a free online PDF merger so you can combine multiple PDF files without signup.",
      },
      {
        question: "Is there a limit to how I arrange files before merging?",
        answer:
          "You can put the files in the order you want before creating the final merged PDF, which helps when combining reports, invoices, or multi-part exports.",
      },
      {
        question: "What does the PDF merger output?",
        answer:
          "The output is one combined PDF document created from the files you uploaded for the merge workflow.",
      },
      {
        question: "Is this a PDF combiner and a PDF merger?",
        answer:
          "Yes. People search for both terms, but the result is the same: one final PDF assembled from multiple source PDF files.",
      },
      {
        question: "Do I need to install software to merge PDFs?",
        answer:
          "No. Open the page in your browser, upload the files, and run the merge workflow online.",
      },
    ];
  }

  const commonFaqs: ToolSeoFaq[] = [
    {
      question: `Is ${tool.name} free?`,
      answer: "Yes. This tool is free to use and does not require signup.",
    },
    {
      question: "Do I need an account?",
      answer:
        "No account is needed. Open the page, add your input, and run the tool.",
    },
    {
      question: `What input and output does ${tool.name} support?`,
      answer: `It accepts ${profile.supportedInput.toLowerCase()} and produces ${profile.supportedOutput.toLowerCase()}. The labels on the page show the exact controls and formats.`,
    },
  ];

  if (tool.id === "direct-mp4-downloader") {
    commonFaqs.push({
      question: "Can I use YouTube or Instagram page links?",
      answer:
        "No. This tool is only for direct public MP4 file URLs that you are already allowed to download.",
    });
  } else if (tool.category === "Video") {
    commonFaqs.push({
      question: "Can I use YouTube or Instagram page links?",
      answer:
        "No. The video tools are designed for uploaded files or direct media files you are already allowed to use, not platform page links.",
    });
  } else if (tool.category === "Archive") {
    commonFaqs.push({
      question: "Can I keep folder structure when creating ZIP files?",
      answer:
        "Yes. ZIP creation keeps file paths where available, and extraction shows the files inside the archive.",
    });
  } else if (tool.category === "Text") {
    commonFaqs.push({
      question: "Can I copy or download the result?",
      answer:
        "Yes. The text tools are built for quick copy-and-download workflows so you can reuse the output immediately.",
    });
  } else if (tool.category === "GEO & AEO") {
    commonFaqs.push({
      question: "What is GEO / AEO and why is it important?",
      answer:
        "Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) are methodologies designed to structure and refine website content so that AI engines (like ChatGPT, Perplexity, and Gemini) can easily read, summarize, and cite it as an authoritative source.",
    });
    commonFaqs.push({
      question:
        "Do these optimization tools save or process my text on a server?",
      answer:
        "No. The live scoring analyzer runs completely client-side in your browser, and the optional AI enhancements run via stateless API calls that never store your input.",
    });
  } else if (tool.category === "Social Media") {
    commonFaqs.push({
      question: "Will these tools help grow my channel visibility?",
      answer:
        "Yes. Optimizing script pacing to fit under limits, avoiding covered safe-zones for captions, and writing engaging hooks are standard techniques to boost retention and trigger recommendation algorithms.",
    });
    commonFaqs.push({
      question: "Can I use these clip tools on mobile devices?",
      answer:
        "Yes. Toolsy is designed to be fully responsive, so you can calculate script lengths, paste descriptions, and test vertical layouts directly on your phone.",
    });
  } else {
    commonFaqs.push({
      question: "Will this work on mobile?",
      answer:
        "Yes. The page is responsive, though large files and batch jobs are often easier on desktop.",
    });
  }

  return commonFaqs;
}

function buildSearchPhrases(tool: Tool, profile: ToolProfile) {
  if (isAiMetaGenerator(tool)) {
    return unique([
      "ai meta generator",
      "meta title generator",
      "meta description generator",
      "seo metadata generator",
      "free ai meta generator",
      "generate meta title and description",
      "meta generator for blog posts",
      "meta generator for landing pages",
      "ecommerce meta description generator",
      "seo title and description tool",
      tool.name,
    ]);
  }

  if (isVideoClipper(tool)) {
    return unique([
      "free online video trimmer",
      "clip cutter",
      "clipcutter",
      "clips cutter",
      "video cutter online",
      "trim video online",
      "video clip cutter",
      "video trimmer no watermark",
      "online video cutter",
      "browser-based video trimmer",
      "secure video trimmer",
      "no signup video cutter",
      "cut video online free",
      "trim mp4 video online",
      "local video clip cutter",
      "watermark-free video cutter",
      "trim uploaded video privately",
      "fast video trimmer",
      tool.name,
    ]);
  }

  if (isPdfMerger(tool)) {
    return unique([
      "merge pdf",
      "merge pdf free",
      "merge pdf online",
      "pdf merger",
      "free pdf merger",
      "pdf combiner",
      "combine pdf files",
      "combine pdf online",
      tool.name,
    ]);
  }

  return unique([
    tool.name,
    `free ${tool.name} online`,
    `${tool.category} tool`,
    profile.focus,
    tool.description,
    ...profile.extraKeywords,
    `${tool.id.replace(/-/g, " ")}`,
  ]);
}

function buildSections(tool: Tool, profile: ToolProfile): ToolSeoSection[] {
  if (isAiMetaGenerator(tool)) {
    return [
      {
        heading: "Why use an AI Meta Generator?",
        paragraphs: [
          "Metadata has an outsized effect on how a page presents in search. Even when your page ranks, the title tag and meta description still shape whether the right person clicks or keeps scrolling. That makes metadata a conversion layer, not just a technical SEO field. Toolsy's AI Meta Generator helps you move from a rough topic to cleaner, clearer metadata without getting stuck on the first draft.",
          "This matters most for teams publishing at scale. A founder updating landing pages, a content marketer shipping weekly articles, or an ecommerce team optimizing dozens of product and category URLs all face the same bottleneck: writing good metadata consistently takes time. A focused meta title generator and meta description generator reduces that friction by turning the blank page into several usable directions you can quickly review and refine.",
        ],
      },
      {
        heading: "How the tool fits real SEO workflows",
        paragraphs: [
          "The best use case for an AI Meta Generator is not blind automation. It is faster drafting. You enter the page topic, include your primary keyword, add a few supporting terms, and define the audience or tone. The tool then returns several metadata options designed to match intent more naturally than a one-size-fits-all template. That makes it easier to choose the version that fits the actual page instead of forcing every URL into the same style.",
          "This approach also supports better collaboration. Writers can create first drafts faster, SEO specialists can review messaging more easily, and founders or editors can compare multiple angles before publishing. Instead of debating wording from zero, the team reacts to a set of options. That alone can save meaningful time across a growing website.",
        ],
      },
      {
        heading: "What makes a strong meta title generator useful",
        paragraphs: [
          "A useful meta title generator does more than place a keyword into a sentence. It helps make the page promise obvious. If the page solves a problem, the title should make that benefit clear. If the page is a tool, the snippet should show why the tool is worth opening. Searchers do not click because a title merely contains a phrase. They click because the title signals relevance, clarity, and value in one quick scan.",
          "That is why short, readable titles usually win over overly clever ones. A clear title with a relevant angle often performs better than something vague or overloaded. The strongest title drafts usually emphasize one core outcome, one main keyword, and one obvious audience. When an AI Meta Generator helps you produce several clean options in that format, it becomes far more useful than a generic writing assistant.",
        ],
      },
      {
        heading: "Why a meta description generator still matters",
        paragraphs: [
          "Meta descriptions are not a magic ranking factor, but they still matter because they help frame the click. A strong description supports the title, adds context, and gives the searcher a reason to choose your page. In practical terms, that means explaining the outcome, naming the audience, or clarifying why the page is worth opening now. A good meta description generator helps teams do that quickly and consistently.",
          "Descriptions are especially helpful when several results on the page target similar topics. If competing titles feel close, a better description can improve perceived usefulness. That is why this tool focuses on realistic SEO drafting rather than inflated promises. The goal is to create metadata that sounds helpful, trustworthy, and aligned with the page behind it, which is exactly what strong organic snippets need.",
        ],
      },
      {
        heading: "Who gets the most value from an SEO metadata generator",
        paragraphs: [
          "Bloggers and publishers can use the tool to create title and description ideas for new posts without slowing down the writing process. SaaS teams can use it for feature pages, comparison pages, integration pages, and product launches. Ecommerce teams can draft metadata for collections, product groups, and seasonal campaigns. Agencies and freelancers can use it to produce faster first drafts across many client URLs while keeping messaging more consistent.",
          "The common thread is scale. When you only write metadata once a month, manual drafting may be enough. When you publish regularly or manage large sets of URLs, repetition becomes expensive. A reliable SEO metadata generator helps you protect quality while reducing the time spent on repetitive work. It also makes it easier to revisit underperforming pages and generate fresh snippet ideas when click-through rate needs improvement.",
        ],
      },
      {
        heading: "How to get better results from this AI Meta Generator",
        paragraphs: [
          "Start with a specific topic and one clear primary keyword. Do not try to force every possible variation into the same draft. Use secondary keywords only where they fit naturally. Include the audience when it matters, especially if the page is meant for founders, marketers, agencies, ecommerce teams, or a specific niche. The more focused the input, the easier it is for the tool to return drafts that feel publishable instead of generic.",
          "Then treat the output as a shortlist, not a final answer. Review for tone, accuracy, and search intent match. Compare which version communicates the benefit most clearly. If the page already has impressions but weak clicks, use the tool to test new angles rather than rewriting from scratch. That iterative workflow is what turns an AI Meta Generator into a practical SEO asset instead of a novelty.",
        ],
      },
      {
        heading: "A smarter way to scale metadata without losing quality",
        paragraphs: [
          "The real advantage of an AI Meta Generator is not that it writes instead of you. It is that it helps you move faster toward stronger drafts. That makes metadata easier to maintain across blog posts, landing pages, product pages, and category URLs. For most teams, that is the difference between metadata that gets done well and metadata that gets rushed at the last minute.",
          "If you want a faster path to clearer titles and descriptions, this tool gives you a practical place to start. Generate a few options, keep the best one, refine it with human judgment, and publish with more confidence. That workflow supports better SEO hygiene, cleaner collaboration, and a more scalable content system over time.",
        ],
      },
    ];
  }

  if (isVideoClipper(tool)) {
    return [
      {
        heading: "A simpler way to cut a video online",
        paragraphs: [
          "Most people do not need a full editing suite when they are only trying to trim a few seconds from a recording. They need a video cutter online that opens quickly, feels obvious, and gets the job done without distractions. Toolsy focuses on that exact intent: upload a file, choose the start and end points, and export the clip you actually want.",
          "That single-purpose workflow is why the page performs well for search intent and for real visitors. A free online video trimmer should answer the user's question immediately, and this one does it with a clear interface, strong keyword relevance, and a no-watermark result that is ready to share.",
        ],
      },
      {
        heading: "Secure browser-based trimming",
        paragraphs: [
          "The clipper works in the browser, which keeps the trim process more private than a typical upload-heavy tool. Your file stays on your device while you set the cut range, and the browser handles the export locally. That privacy-first flow is a good fit for drafts, internal demos, lessons, and quick social edits.",
          "It also helps the experience feel fast. There is no signup wall, no account setup, and no extra steps that slow down a tiny job. When someone searches for a secure video trimmer, the value they want is speed plus confidence, and that is exactly what this tool aims to provide.",
        ],
      },
      {
        heading: "Formats, output, and export quality",
        paragraphs: [
          "Toolsy accepts common video formats such as MP4, MOV, WebM, M4V, MKV, and AVI, so most uploaded recordings work without a conversion step first. That matters for CTR and conversion because it reduces friction before the user ever hits the trim action.",
          "The output is a clean WebM clip. It is lightweight, easy to download, and free of watermark branding, which makes it suitable for social sharing, internal reviews, and quick handoffs. If you need a different format later, the clipped file can move into the rest of the Toolsy workflow.",
        ],
      },
      {
        heading: "Best uses for a video clip cutter",
        paragraphs: [
          "A clip cutter is most useful when the goal is a short, polished extract rather than a full edit. That includes YouTube Shorts, Reels, TikTok snippets, product walkthroughs, customer support clips, demo highlights, classroom moments, and short proof-of-concept edits. In each case, the user wants to trim video online quickly and move on.",
          "That single-purpose design makes the page easy to recommend. Creators can share the link with teammates, students can reuse it for assignments, and marketers can use it to turn one long recording into a small, shareable asset. The result is a utility that behaves like a productivity shortcut and a traffic magnet at the same time.",
        ],
      },
      {
        heading: "Why this page can earn clicks and shares",
        paragraphs: [
          "Searchers respond to clear promises. Free, secure, fast, no watermark, and no signup are the exact phrases people scan for when they are deciding which tool to open. Putting those benefits near the top of the page improves perceived relevance, which can lift click-through rate from the search results.",
          "The same clarity helps the page get shared. When someone finishes a quick trim and sees a clean export, they are more likely to forward the tool to a coworker or friend. That behavior is valuable for organic growth because a helpful, low-friction tool page can rank and spread at the same time.",
        ],
      },
    ];
  }

  if (isPdfMerger(tool)) {
    return [
      {
        heading: "Why people search for merge PDF free",
        paragraphs: [
          "When someone needs to combine documents quickly, they usually do not want a full document suite. They want a direct answer to one task: merge PDF files into one clean output. That is why search terms like merge PDF, merge PDF free, and PDF combiner tend to convert well. The visitor already knows the outcome they need, and a focused tool page can solve it in a few steps.",
          "Toolsy is built around that kind of high-intent workflow. Instead of hiding the action behind signup or multi-step navigation, the page makes the job obvious. That clarity matters for both search engines and users because the title, body copy, and interface all line up with the same intent.",
        ],
      },
      {
        heading: "A cleaner PDF merger workflow",
        paragraphs: [
          "A practical PDF merger should help you upload files, keep them in the right order, and export one document without confusion. That is especially helpful for people combining invoices, proposals, reports, onboarding packets, or exported scans. In each case, the goal is not editing every page. It is simply producing one organized file that is easier to send and store.",
          "That focused experience also helps the page stand out in search. When Google sees a route that clearly targets PDF merging with relevant headings, metadata, and supporting copy, it has a better reason to treat the page as a specific result instead of a duplicate utility page.",
        ],
      },
    ];
  }

  return [
    {
      heading: `${tool.name} for fast everyday workflows`,
      paragraphs: [
        `Use ${tool.name} to ${profile.focus}. This keeps the page focused on one clear job instead of trying to be a general-purpose suite. Visitors can see the input, output, and expected result immediately, which makes the page easier to trust and easier to use.`,
        `The structure is intentionally simple: a short intro, a few helpful highlights, clear steps, and search phrases that match the way people actually look for ${tool.name.toLowerCase()} on Google.`,
      ],
    },
  ];
}

function buildMetadata(tool: Tool, profile: ToolProfile): MetadataConfig {
  const canonical = `${SITE_CONFIG.url}/tool/${tool.id}`;

  return {
    title: isAiMetaGenerator(tool)
      ? "AI Meta Generator for SEO Titles & Descriptions"
      : isVideoClipper(tool)
        ? "Video Clip Cutter - Free Online Video Cutter & Trimmer | Toolsy"
        : isPdfMerger(tool)
          ? "Merge PDF Free - Online PDF Merger & Combiner | Toolsy"
          : tool.id === "direct-mp4-downloader"
            ? "Direct MP4 Downloader - Download Public MP4 File URLs"
            : `${tool.name} - Free ${tool.category} Tool | Toolsy`,
    description: isAiMetaGenerator(tool)
      ? "Generate SEO titles and meta descriptions in seconds with Toolsy's AI Meta Generator. Great for blogs, landing pages, product pages, and ecommerce SEO workflows."
      : isVideoClipper(tool)
        ? "Use Toolsy as a free online clip cutter and video cutter to trim local videos fast. No watermark, no signup. Supports MP4, MOV, WebM, MKV, and AVI."
        : isPdfMerger(tool)
          ? "Merge PDF free online with Toolsy. Combine multiple PDF files into one document fast with no signup."
          : tool.id === "direct-mp4-downloader"
            ? "Paste a direct public MP4 file URL and use a browser-safe download link to save it locally. Direct file URLs only, no platform pages."
            : `Use ${tool.name} to ${profile.focus}. Free ${tool.category.toLowerCase()} tool with no signup required.`,
    keywords: unique([
      tool.name,
      tool.description,
      `${tool.category} tool`,
      profile.focus,
      ...profile.extraKeywords,
    ]),
    image: SITE_CONFIG.image,
    url: canonical,
    type: "website",
    canonical,
  };
}

function buildSchemas(tool: Tool, content: ToolSeoContent) {
  const canonical = `${SITE_CONFIG.url}/tool/${tool.id}`;
  const applicationCategory = isVideoClipper(tool)
    ? "MultimediaApplication"
    : tool.category;

  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.name,
      description: content.intro,
      url: canonical,
      applicationCategory,
      operatingSystem: "Web",
      browserRequirements: isVideoClipper(tool)
        ? "Modern browser with HTML5 video support"
        : undefined,
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: content.highlights,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_CONFIG.url}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: tool.category,
          item: `${SITE_CONFIG.url}/?search=${encodeURIComponent(tool.category.toLowerCase())}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: tool.name,
          item: canonical,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];
}

export function buildToolSeo(tool: Tool): ToolSeoBundle {
  const profile = getToolProfile(tool);
  const content: ToolSeoContent = {
    intro: buildIntro(tool, profile),
    highlights: buildHighlights(tool, profile),
    steps: buildSteps(tool, profile),
    faqs: buildFaqs(tool, profile),
    searchPhrases: buildSearchPhrases(tool, profile),
    supportedInput: profile.supportedInput,
    supportedOutput: profile.supportedOutput,
    trustBadges: profile.trustBadges,
    sections: buildSections(tool, profile),
  };

  return {
    metadata: buildMetadata(tool, profile),
    content,
    schemas: buildSchemas(tool, content),
  };
}
