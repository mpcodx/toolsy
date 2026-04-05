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

function getToolProfile(tool: Tool): ToolProfile {
  const name = normalizePhrase(tool.name);
  const description = normalizePhrase(tool.description);

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

    if (name.includes("merg")) {
      return {
        focus: "merge multiple PDF files into one document",
        supportedInput: "multiple PDF files",
        supportedOutput: "a single merged PDF",
        extraKeywords: ["pdf merger", "merge pdf files", "combine pdfs"],
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
        extraKeywords: ["pdf watermark", "add watermark to pdf", "pdf security"],
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
        extraKeywords: ["excel to pdf", "spreadsheet to pdf", "sheet converter"],
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
        extraKeywords: ["image compressor", "compress image", "image optimizer"],
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
        extraKeywords: ["video to frames", "video to images", "frame extractor"],
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
        extraKeywords: ["barcode generator", "barcode maker", "barcode creator"],
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
        extraKeywords: ["unit converter", "measurement converter", "conversion tool"],
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

  return {
    focus: `handle ${tool.category.toLowerCase()} workflows`,
    supportedInput: `${tool.category.toLowerCase()} inputs`,
    supportedOutput: `${tool.category.toLowerCase()} outputs`,
    extraKeywords: [description, `${tool.category.toLowerCase()} tool`],
    trustBadges: ["Free", "Secure", "No Signup"],
  };
}

function buildIntro(tool: Tool, profile: ToolProfile) {
  if (isVideoClipper(tool)) {
    return "Toolsy's free online video trimmer helps you cut the exact part you need without opening a heavy editor. Upload a local file, choose the start and end points, and download a clean, watermark-free WebM clip. The workflow is fast, secure, and does not require signup.";
  }

  if (tool.id === "direct-mp4-downloader") {
    return "Paste a direct public MP4 file URL and download it with a clean browser link. The page is limited to direct file URLs, not platform pages.";
  }

  return `Use ${tool.name} to ${profile.focus}. This free ${tool.category.toLowerCase()} page keeps the workflow clear, searchable, and easy to use.`;
}

function buildHighlights(tool: Tool, profile: ToolProfile) {
  if (isVideoClipper(tool)) {
    return [
      "Trim videos online with a focused tool built for fast, everyday cuts.",
      `Input: ${profile.supportedInput}. Output: ${profile.supportedOutput}.`,
      "Secure browser processing, no signup, and no watermark on the exported clip.",
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
  if (isVideoClipper(tool)) {
    return [
      `Upload a local video file such as ${profile.supportedInput}.`,
      "Set the start and end time for the section you want to keep.",
      `Download the trimmed ${profile.supportedOutput}.`,
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

  const commonFaqs: ToolSeoFaq[] = [
    {
      question: `Is ${tool.name} free?`,
      answer: "Yes. This tool is free to use and does not require signup.",
    },
    {
      question: "Do I need an account?",
      answer: "No account is needed. Open the page, add your input, and run the tool.",
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
  if (isVideoClipper(tool)) {
    return unique([
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
      "watermark-free video cutter",
      "trim uploaded video privately",
      "fast video trimmer",
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
    title:
      isVideoClipper(tool)
        ? "Video Clip Cutter - Free Online Video Trimmer, No Watermark | Toolsy"
        : tool.id === "direct-mp4-downloader"
        ? "Direct MP4 Downloader - Download Public MP4 File URLs"
        : `${tool.name} - Free ${tool.category} Tool | Toolsy`,
    description:
      isVideoClipper(tool)
        ? "Trim videos online in seconds with Toolsy. Free, secure, fast, and no watermark. No signup needed. Supports MP4, MOV, WebM, MKV, and AVI."
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
  const applicationCategory = isVideoClipper(tool) ? "MultimediaApplication" : tool.category;

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.name,
      description: content.intro,
      url: canonical,
      applicationCategory,
      operatingSystem: "Web",
      browserRequirements: isVideoClipper(tool) ? "Modern browser with HTML5 video support" : undefined,
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
      mainEntity: content.faqs.map((faq) => ({
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
