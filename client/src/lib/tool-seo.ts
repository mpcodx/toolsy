import type { MetadataConfig } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/seo";
import type { Tool } from "@/lib/tools";

export interface ToolSeoFaq {
  question: string;
  answer: string;
}

export interface ToolSeoContent {
  intro: string;
  highlights: string[];
  steps: string[];
  faqs: ToolSeoFaq[];
  searchPhrases: string[];
  supportedInput: string;
  supportedOutput: string;
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
};

function normalizePhrase(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function unique(values: string[]) {
  return Array.from(new Set(values.map(normalizePhrase))).filter(Boolean);
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
    };
  }

  if (tool.category === "PDF") {
    if (name.includes("to image")) {
      return {
        focus: "convert PDF pages into images",
        supportedInput: "PDF files",
        supportedOutput: "JPG, PNG, or WebP images",
        extraKeywords: ["pdf to image", "pdf pages to images", "pdf converter"],
      };
    }

    if (name.includes("compress")) {
      return {
        focus: "reduce PDF file size while keeping documents usable",
        supportedInput: "PDF files",
        supportedOutput: "smaller PDF files",
        extraKeywords: ["pdf compressor", "compress pdf", "reduce pdf size"],
      };
    }

    if (name.includes("merg")) {
      return {
        focus: "merge multiple PDF files into one document",
        supportedInput: "multiple PDF files",
        supportedOutput: "a single merged PDF",
        extraKeywords: ["pdf merger", "merge pdf files", "combine pdfs"],
      };
    }

    if (name.includes("split")) {
      return {
        focus: "split a PDF into individual pages or page ranges",
        supportedInput: "PDF files",
        supportedOutput: "split PDF pages or page ranges",
        extraKeywords: ["pdf splitter", "split pdf", "extract pdf pages"],
      };
    }

    if (name.includes("watermark")) {
      return {
        focus: "add text or image watermarks to PDF documents",
        supportedInput: "PDF files",
        supportedOutput: "watermarked PDF files",
        extraKeywords: ["pdf watermark", "add watermark to pdf", "pdf security"],
      };
    }

    if (name.includes("to word")) {
      return {
        focus: "extract PDF content into editable Word documents",
        supportedInput: "PDF files",
        supportedOutput: "editable Word documents",
        extraKeywords: ["pdf to word", "pdf to docx", "convert pdf to word"],
      };
    }

    return {
      focus: "handle PDF document workflows quickly",
      supportedInput: "PDF files",
      supportedOutput: "PDF-based results",
      extraKeywords: ["pdf tool", "document converter", "pdf workflow"],
    };
  }

  if (tool.category === "Document") {
    if (name.includes("word to pdf")) {
      return {
        focus: "convert Word documents into PDF files",
        supportedInput: "DOCX and DOC files",
        supportedOutput: "PDF documents",
        extraKeywords: ["word to pdf", "docx to pdf", "document converter"],
      };
    }

    if (name.includes("excel")) {
      return {
        focus: "convert spreadsheets into PDF documents",
        supportedInput: "XLSX and XLS spreadsheets",
        supportedOutput: "PDF documents",
        extraKeywords: ["excel to pdf", "spreadsheet to pdf", "sheet converter"],
      };
    }

    if (name.includes("ppt")) {
      return {
        focus: "turn presentation slides into PDF documents",
        supportedInput: "PowerPoint presentations",
        supportedOutput: "PDF documents",
        extraKeywords: ["ppt to pdf", "powerpoint to pdf", "slide converter"],
      };
    }

    if (name.includes("pdf to word")) {
      return {
        focus: "convert PDFs into editable Word documents",
        supportedInput: "PDF files",
        supportedOutput: "editable Word documents",
        extraKeywords: ["pdf to word", "pdf to docx", "document converter"],
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
      };
    }

    if (name.includes("compress")) {
      return {
        focus: "compress images while preserving quality",
        supportedInput: "JPG, PNG, or WebP images",
        supportedOutput: "smaller image files",
        extraKeywords: ["image compressor", "compress image", "image optimizer"],
      };
    }

    if (name.includes("convert")) {
      return {
        focus: "convert images between common formats",
        supportedInput: "JPG, PNG, WebP, GIF, or BMP images",
        supportedOutput: "converted image files",
        extraKeywords: ["image converter", "jpg to png", "webp converter"],
      };
    }

    if (name.includes("crop")) {
      return {
        focus: "crop images to the right frame and size",
        supportedInput: "image files",
        supportedOutput: "cropped image files",
        extraKeywords: ["image cropper", "crop image", "trim image"],
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
      };
    }

    if (name.includes("thumbnail")) {
      return {
        focus: "capture a video frame and save it as a thumbnail",
        supportedInput: "uploaded video files",
        supportedOutput: "thumbnail images",
        extraKeywords: ["thumbnail maker", "video thumbnail", "video to pic"],
      };
    }

    if (name.includes("frame")) {
      return {
        focus: "export video frames as a ZIP archive of images",
        supportedInput: "uploaded video files",
        supportedOutput: "a ZIP archive of image frames",
        extraKeywords: ["video to frames", "video to images", "frame extractor"],
      };
    }

    if (name.includes("clip")) {
      return {
        focus: "trim uploaded videos into shorter clips",
        supportedInput: "uploaded video files",
        supportedOutput: "short WebM clips",
        extraKeywords: ["video clip cutter", "video to clip", "video trimmer"],
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
      };
    }

    if (name.includes("json")) {
      return {
        focus: "format, validate, and minify JSON data",
        supportedInput: "JSON text",
        supportedOutput: "formatted or minified JSON",
        extraKeywords: ["json formatter", "json validator", "minify json"],
      };
    }

    return {
      focus: "clean, format, and transform text content",
      supportedInput: "plain text",
      supportedOutput: "formatted text",
      extraKeywords: ["text formatter", "text cleanup", "copywriter tools"],
    };
  }

  if (tool.category === "Archive") {
    if (name.includes("extract")) {
      return {
        focus: "extract files from ZIP or RAR archives",
        supportedInput: "ZIP or RAR archives",
        supportedOutput: "extracted files",
        extraKeywords: ["zip extractor", "rar extractor", "archive tool"],
      };
    }

    return {
      focus: "create compressed ZIP archives from files",
      supportedInput: "files and folders",
      supportedOutput: "ZIP archives",
      extraKeywords: ["zip creator", "create zip", "archive maker"],
    };
  }

  if (tool.category === "Utility") {
    if (name.includes("qr")) {
      return {
        focus: "generate QR codes from text or URLs",
        supportedInput: "text or URLs",
        supportedOutput: "QR code images",
        extraKeywords: ["qr code generator", "qr maker", "qr creator"],
      };
    }

    if (name.includes("barcode")) {
      return {
        focus: "create barcodes in several formats",
        supportedInput: "text or numeric values",
        supportedOutput: "barcode images",
        extraKeywords: ["barcode generator", "barcode maker", "barcode creator"],
      };
    }

    if (name.includes("hash")) {
      return {
        focus: "generate secure hashes from text or files",
        supportedInput: "text or files",
        supportedOutput: "hash values",
        extraKeywords: ["hash generator", "md5 sha256", "checksum tool"],
      };
    }

    if (name.includes("color")) {
      return {
        focus: "convert colors between HEX, RGB, and HSL",
        supportedInput: "HEX, RGB, and HSL color values",
        supportedOutput: "converted color values",
        extraKeywords: ["color converter", "hex to rgb", "rgb to hsl"],
      };
    }

    if (name.includes("unit")) {
      return {
        focus: "convert common measurements and units",
        supportedInput: "numbers and measurement units",
        supportedOutput: "converted values",
        extraKeywords: ["unit converter", "measurement converter", "conversion tool"],
      };
    }

    if (name.includes("base64")) {
      return {
        focus: "encode or decode Base64 content",
        supportedInput: "text or Base64 strings",
        supportedOutput: "encoded or decoded text",
        extraKeywords: ["base64 encoder", "base64 decoder", "encode text"],
      };
    }
  }

  return {
    focus: `handle ${tool.category.toLowerCase()} workflows`,
    supportedInput: `${tool.category.toLowerCase()} inputs`,
    supportedOutput: `${tool.category.toLowerCase()} outputs`,
    extraKeywords: [description, `${tool.category.toLowerCase()} tool`],
  };
}

function buildIntro(tool: Tool, profile: ToolProfile) {
  if (tool.id === "direct-mp4-downloader") {
    return "Paste a direct public MP4 file URL and download it with a clean browser link. The page is limited to direct file URLs, not platform pages.";
  }

  return `Use ${tool.name} to ${profile.focus}. This free ${tool.category.toLowerCase()} page keeps the workflow clear, searchable, and easy to use.`;
}

function buildHighlights(tool: Tool, profile: ToolProfile) {
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

function buildMetadata(tool: Tool, profile: ToolProfile): MetadataConfig {
  const canonical = `${SITE_CONFIG.url}/tool/${tool.id}`;

  return {
    title:
      tool.id === "direct-mp4-downloader"
        ? "Direct MP4 Downloader - Download Public MP4 File URLs"
        : `${tool.name} - Free ${tool.category} Tool | Toolsy`,
    description:
      tool.id === "direct-mp4-downloader"
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

  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.name,
      description: content.intro,
      applicationCategory: tool.category,
      operatingSystem: "Web",
      url: canonical,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
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
  };

  return {
    metadata: buildMetadata(tool, profile),
    content,
    schemas: buildSchemas(tool, content),
  };
}
