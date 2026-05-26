export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  featured?: boolean;
  searchAliases?: string[];
}

export const TOOLS: Tool[] = [
  // PDF Tools
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    description: "Convert PDF pages to high-quality images (JPG, PNG, WebP)",
    category: "PDF",
    icon: "FileImage",
    color: "from-blue-500 to-blue-600",
    featured: true,
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    description: "Combine multiple images into a single PDF document",
    category: "PDF",
    icon: "Images",
    color: "from-purple-500 to-purple-600",
    featured: true,
  },
  {
    id: "pdf-compressor",
    name: "PDF Compressor",
    description: "Reduce PDF file size while maintaining quality",
    category: "PDF",
    icon: "Zap",
    color: "from-amber-500 to-amber-600",
    featured: true,
  },
  {
    id: "pdf-merger",
    name: "PDF Merger",
    description: "Merge multiple PDF files into one document",
    category: "PDF",
    icon: "Layers",
    color: "from-emerald-500 to-emerald-600",
    featured: true,
    searchAliases: [
      "merge pdf",
      "merge pdf free",
      "merge pdf online",
      "combine pdf",
      "combine pdf files",
      "free pdf merger",
      "pdf combiner",
    ],
  },
  {
    id: "pdf-splitter",
    name: "PDF Splitter",
    description: "Split PDF into individual pages or extract specific pages",
    category: "PDF",
    icon: "Split",
    color: "from-rose-500 to-rose-600",
  },
  {
    id: "pdf-watermark",
    name: "PDF Watermark",
    description: "Add text or image watermarks to PDF documents",
    category: "PDF",
    icon: "Stamp",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    id: "pdf-page-remover",
    name: "PDF Page Remover",
    description:
      "Remove selected pages from PDF files and download a cleaner document",
    category: "PDF",
    icon: "Split",
    color: "from-orange-500 to-red-600",
    searchAliases: [
      "delete pages from pdf",
      "remove page from pdf",
      "pdf page delete",
      "pdf page remover",
      "remove pdf pages online",
    ],
  },

  // Document Conversion
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert DOCX and DOC files to PDF format",
    category: "Document",
    icon: "FileText",
    color: "from-cyan-500 to-cyan-600",
    featured: true,
  },
  {
    id: "excel-to-pdf",
    name: "Excel to PDF",
    description: "Convert XLSX and XLS spreadsheets to PDF",
    category: "Document",
    icon: "Table",
    color: "from-teal-500 to-teal-600",
  },
  {
    id: "ppt-to-pdf",
    name: "PPT to PDF",
    description: "Convert PowerPoint presentations to PDF",
    category: "Document",
    icon: "Presentation",
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    description: "Extract text and convert PDF to editable Word documents",
    category: "Document",
    icon: "FileType",
    color: "from-red-500 to-red-600",
  },
  // Image Tools
  {
    id: "image-resizer",
    name: "Image Resizer",
    description: "Resize images to specific dimensions with quality control",
    category: "Image",
    icon: "Maximize2",
    color: "from-pink-500 to-pink-600",
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Compress images without losing quality",
    category: "Image",
    icon: "Minimize2",
    color: "from-violet-500 to-violet-600",
  },
  {
    id: "image-converter",
    name: "Image Converter",
    description: "Convert between JPG, PNG, WebP, GIF, BMP formats",
    category: "Image",
    icon: "Palette",
    color: "from-fuchsia-500 to-fuchsia-600",
  },
  {
    id: "image-cropper",
    name: "Image Cropper",
    description: "Crop and trim images to desired size",
    category: "Image",
    icon: "Crop",
    color: "from-lime-500 to-lime-600",
  },

  // Text, Video & Media Tools
  {
    id: "text-to-speech",
    name: "Text to Speech",
    description: "Convert text to natural-sounding audio",
    category: "Text",
    icon: "Volume2",
    color: "from-sky-500 to-sky-600",
    featured: true,
  },
  {
    id: "video-to-audio",
    name: "Video to Audio",
    description: "Extract audio from uploaded video files",
    category: "Video",
    icon: "Video",
    color: "from-emerald-500 to-teal-600",
    featured: true,
    searchAliases: [
      "audio extractor",
      "extract audio from video",
      "video sound",
      "creator audio",
    ],
  },
  {
    id: "video-thumbnail-maker",
    name: "Thumbnail Maker",
    description:
      "Capture a frame from your uploaded video and save it as a thumbnail",
    category: "Video",
    icon: "Image",
    color: "from-fuchsia-500 to-fuchsia-600",
    featured: true,
    searchAliases: [
      "video thumbnail generator",
      "frame grabber",
      "video to image",
      "video snapshot",
    ],
  },
  {
    id: "video-to-frames",
    name: "Video to Frames",
    description:
      "Export video frames as a ZIP of images from a selected time range",
    category: "Video",
    icon: "Film",
    color: "from-cyan-500 to-sky-600",
    featured: true,
    searchAliases: [
      "frame extractor",
      "video to images",
      "clip frames",
      "storyboard frames",
    ],
  },
  {
    id: "video-clipper",
    name: "Video Clip Cutter",
    description:
      "Trim uploaded videos into shorter clips with a free, secure, fast, no-watermark workflow",
    category: "Video",
    icon: "Scissors",
    color: "from-emerald-600 to-lime-500",
    featured: true,
    searchAliases: [
      "video trimmer",
      "clip cutter",
      "clipcutter",
      "clips cutter",
      "video cutter online",
      "online video cutter",
      "video cutter",
      "cut clips",
      "short clip editor",
      "clip tool",
    ],
  },
  {
    id: "video-compressor",
    name: "Video Compressor",
    description:
      "Compress video files online to reduce size while keeping quality usable",
    category: "Video",
    icon: "Minimize2",
    color: "from-teal-500 to-cyan-600",
    featured: true,
    searchAliases: [
      "compress video",
      "video file compressor",
      "reduce video size",
      "online video compressor",
      "video optimizer",
    ],
  },
  {
    id: "direct-mp4-downloader",
    name: "Direct MP4 Downloader",
    description:
      "Download direct public MP4 file URLs with a browser download link",
    category: "Video",
    icon: "Link2",
    color: "from-sky-500 to-cyan-500",
    featured: true,
  },
  {
    id: "text-formatter",
    name: "Text Formatter",
    description: "Format, clean, and transform text content",
    category: "Text",
    icon: "Type",
    color: "from-gray-500 to-gray-600",
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON data",
    category: "Text",
    icon: "Code",
    color: "from-yellow-500 to-yellow-600",
  },

  // Archive Tools
  {
    id: "zip-extractor",
    name: "ZIP Extractor",
    description: "Extract files from ZIP and RAR archives",
    category: "Archive",
    icon: "Archive",
    color: "from-green-500 to-green-600",
  },
  {
    id: "zip-creator",
    name: "ZIP Creator",
    description: "Create compressed ZIP archives from files",
    category: "Archive",
    icon: "Package",
    color: "from-blue-400 to-blue-500",
  },

  // Utility Tools
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    description: "Generate QR codes from text or URLs",
    category: "Utility",
    icon: "QrCode",
    color: "from-purple-400 to-purple-500",
  },
  {
    id: "barcode-generator",
    name: "Barcode Generator",
    description: "Create barcodes in various formats",
    category: "Utility",
    icon: "Barcode",
    color: "from-red-400 to-red-500",
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA1, SHA256 hashes",
    category: "Utility",
    icon: "Lock",
    color: "from-indigo-400 to-indigo-500",
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description: "Convert between HEX, RGB, HSL color formats",
    category: "Utility",
    icon: "Palette",
    color: "from-pink-400 to-pink-500",
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    description: "Convert between various units and measurements",
    category: "Utility",
    icon: "Ruler",
    color: "from-cyan-400 to-cyan-500",
  },
  {
    id: "base64-encoder",
    name: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings",
    category: "Utility",
    icon: "Code2",
    color: "from-orange-400 to-orange-500",
  },

  // AI Tools
  {
    id: "ai-meta-generator",
    name: "AI Meta Generator",
    description:
      "Generate SEO meta titles and descriptions from a topic and target keywords",
    category: "AI",
    icon: "Sparkles",
    color: "from-cyan-500 to-blue-600",
    featured: true,
  },
  {
    id: "ai-paragraph-rewriter",
    name: "AI Paragraph Rewriter",
    description:
      "Rewrite paragraphs for clarity, tone, and readability in seconds",
    category: "AI",
    icon: "FilePenLine",
    color: "from-violet-500 to-indigo-600",
    featured: true,
  },
  {
    id: "ai-title-generator",
    name: "AI Title Generator",
    description:
      "Create catchy blog, landing page, and video titles from a simple prompt",
    category: "AI",
    icon: "Heading1",
    color: "from-sky-500 to-cyan-600",
  },

  // SEO Tools
  {
    id: "keyword-clustering-tool",
    name: "Keyword Clustering Tool",
    description:
      "Group related keywords into SEO clusters for content planning and internal links",
    category: "SEO",
    icon: "SearchCheck",
    color: "from-emerald-500 to-teal-600",
    featured: true,
  },
  {
    id: "schema-markup-generator",
    name: "Schema Markup Generator",
    description:
      "Create JSON-LD schema markup for articles, FAQs, products, and software pages",
    category: "SEO",
    icon: "Braces",
    color: "from-amber-500 to-orange-600",
    featured: true,
  },
  {
    id: "faq-generator",
    name: "FAQ Generator",
    description:
      "Generate SEO-friendly frequently asked questions and answers for landing pages",
    category: "SEO",
    icon: "MessageCircleQuestion",
    color: "from-lime-500 to-green-600",
  },

  // Developer Tools
  {
    id: "commit-message-generator",
    name: "Commit Message Generator",
    description:
      "Turn change summaries into clean conventional commits with optional body text",
    category: "Developer",
    icon: "GitCommitHorizontal",
    color: "from-slate-600 to-slate-800",
    featured: true,
  },
  {
    id: "regex-explainer",
    name: "Regex Explainer",
    description:
      "Explain what a regular expression does in plain English with token breakdowns",
    category: "Developer",
    icon: "ScanSearch",
    color: "from-red-500 to-rose-600",
    featured: true,
  },
  {
    id: "curl-command-generator",
    name: "cURL Command Generator",
    description:
      "Build ready-to-run cURL requests from URL, headers, method, and JSON body input",
    category: "Developer",
    icon: "TerminalSquare",
    color: "from-zinc-700 to-zinc-900",
  },

  // Social Media Tools
  {
    id: "hashtag-generator",
    name: "Hashtag Generator",
    description:
      "Generate niche, branded, and discovery hashtags for posts and short videos",
    category: "Social Media",
    icon: "Hash",
    color: "from-fuchsia-500 to-pink-600",
    featured: true,
    searchAliases: [
      "content creator hashtags",
      "reels hashtags",
      "tiktok hashtags",
      "short video hashtags",
    ],
  },
  {
    id: "instagram-caption-generator",
    name: "Instagram Caption Generator",
    description:
      "Create scroll-stopping Instagram captions with hooks, CTAs, and hashtags",
    category: "Social Media",
    icon: "Instagram",
    color: "from-pink-500 to-rose-600",
    featured: true,
    searchAliases: [
      "content creator captions",
      "reels caption generator",
      "short video captions",
    ],
  },
  {
    id: "youtube-description-generator",
    name: "YouTube Description Generator",
    description:
      "Write keyword-aware YouTube descriptions with chapters, CTAs, and hashtags",
    category: "Social Media",
    icon: "Youtube",
    color: "from-red-500 to-orange-600",
    featured: true,
    searchAliases: [
      "youtube shorts description",
      "creator video description",
      "video seo description",
    ],
  },
  {
    id: "clip-idea-generator",
    name: "Clip Idea Generator",
    description:
      "Turn long videos or podcasts into short-form clip ideas with hooks and CTA angles",
    category: "Social Media",
    icon: "Film",
    color: "from-orange-500 to-rose-600",
    searchAliases: [
      "clip ideas",
      "content creator",
      "content creators",
      "content creater",
      "creator clips",
      "podcast clips",
      "reels ideas",
      "shorts ideas",
      "short form content",
    ],
  },
  {
    id: "video-hook-generator",
    name: "Video Hook Generator",
    description:
      "Create opening hooks for Reels, Shorts, TikTok videos, and talking-head clips",
    category: "Social Media",
    icon: "Sparkles",
    color: "from-amber-500 to-pink-600",
    searchAliases: [
      "clip hooks",
      "content creator hooks",
      "content creater hooks",
      "reels hooks",
      "shorts hooks",
      "tiktok hooks",
      "video opener",
    ],
  },
  {
    id: "shorts-script-generator",
    name: "Shorts Script Generator",
    description:
      "Draft short-form video scripts with a hook, beats, CTA, and on-screen text cues",
    category: "Social Media",
    icon: "FilePenLine",
    color: "from-sky-500 to-indigo-600",
    searchAliases: [
      "content creator scripts",
      "content creater scripts",
      "youtube shorts script",
      "reels script",
      "tiktok script",
      "short form video script",
    ],
  },
  {
    id: "content-calendar-generator",
    name: "Content Calendar Generator",
    description:
      "Plan weekly or monthly creator content ideas across Shorts, Reels, TikTok, and more",
    category: "Social Media",
    icon: "Table",
    color: "from-emerald-500 to-cyan-600",
    searchAliases: [
      "content creator planner",
      "content creator calendar",
      "content creater planner",
      "social media planner",
      "creator workflow",
      "creator calendar",
    ],
  },
];

const CATEGORY_ORDER = [
  "AI",
  "SEO",
  "Developer",
  "Social Media",
  "PDF",
  "Document",
  "Image",
  "Video",
  "Text",
  "Archive",
  "Utility",
];

export const CATEGORIES = CATEGORY_ORDER.filter(category =>
  TOOLS.some(tool => tool.category === category)
);

export function getTool(id: string): Tool | undefined {
  return TOOLS.find(tool => tool.id === id);
}

const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "of",
  "on",
  "related",
  "the",
  "to",
  "tool",
  "tools",
  "with",
]);

const SEARCH_TOKEN_NORMALIZATIONS: Record<string, string> = {
  clips: "clip",
  creater: "creator",
  creators: "creator",
  reels: "reel",
  videos: "video",
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeSearchToken(value: string) {
  return SEARCH_TOKEN_NORMALIZATIONS[value] ?? value;
}

function getSearchTokens(value: string) {
  return normalizeSearchText(value)
    .split(" ")
    .map(token => token.trim())
    .filter(Boolean)
    .map(normalizeSearchToken)
    .filter(token => !SEARCH_STOP_WORDS.has(token));
}

export function searchTools(query: string): Tool[] {
  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = getSearchTokens(query);

  if (!normalizedQuery) {
    return TOOLS;
  }

  return TOOLS.map(tool => {
    const searchableText = normalizeSearchText(
      [
        tool.name,
        tool.description,
        tool.category,
        ...(tool.searchAliases ?? []),
      ].join(" ")
    );
    const searchableTokens = new Set(getSearchTokens(searchableText));
    const aliasPhraseMatch = (tool.searchAliases ?? []).some(alias =>
      normalizeSearchText(alias).includes(normalizedQuery)
    );
    const phraseMatch = searchableText.includes(normalizedQuery);
    const matchedTokenCount = queryTokens.filter(token =>
      searchableTokens.has(token)
    ).length;
    const score =
      (phraseMatch ? 6 : 0) +
      (aliasPhraseMatch ? 3 : 0) +
      matchedTokenCount * 2;

    return { matchedTokenCount, score, tool };
  })
    .filter(({ matchedTokenCount, score }) => {
      if (queryTokens.length <= 1) {
        return score > 0;
      }

      return (
        matchedTokenCount >= Math.max(1, Math.ceil(queryTokens.length / 2)) ||
        score >= 6
      );
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.tool.name.localeCompare(right.tool.name)
    )
    .map(({ tool }) => tool);
}

export function getToolsByCategory(category: string): Tool[] {
  return TOOLS.filter(tool => tool.category === category);
}

export function getFeaturedTools(): Tool[] {
  return TOOLS.filter(tool => tool.featured);
}
