export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  featured?: boolean;
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
  },
  {
    id: "video-thumbnail-maker",
    name: "Thumbnail Maker",
    description: "Capture a frame from your uploaded video and save it as a thumbnail",
    category: "Video",
    icon: "Image",
    color: "from-fuchsia-500 to-fuchsia-600",
    featured: true,
  },
  {
    id: "video-to-frames",
    name: "Video to Frames",
    description: "Export video frames as a ZIP of images from a selected time range",
    category: "Video",
    icon: "Film",
    color: "from-cyan-500 to-sky-600",
    featured: true,
  },
  {
    id: "video-clipper",
    name: "Video Clip Cutter",
    description: "Trim an uploaded video into a shorter clip with start and end times",
    category: "Video",
    icon: "Scissors",
    color: "from-emerald-600 to-lime-500",
    featured: true,
  },
  {
    id: "direct-mp4-downloader",
    name: "Direct MP4 Downloader",
    description: "Download direct public MP4 file URLs with a browser download link",
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
];

export const CATEGORIES = Array.from(new Set(TOOLS.map((tool) => tool.category)));

export function getTool(id: string): Tool | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function searchTools(query: string): Tool[] {
  const lowerQuery = query.toLowerCase();
  return TOOLS.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.category.toLowerCase().includes(lowerQuery)
  );
}

export function getToolsByCategory(category: string): Tool[] {
  return TOOLS.filter((tool) => tool.category === category);
}

export function getFeaturedTools(): Tool[] {
  return TOOLS.filter((tool) => tool.featured);
}
