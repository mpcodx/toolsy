# Toolsy Developer Documentation Index

This directory serves as the technical documentation index for the Toolsy platform library, core client-side modules, and API integrations.

---

## 1. Client-Side Libraries & Utilities
Toolsy implements specialized client-side processing files, categorized below by utility path:

- [Image to PDF Module](file:///home/dev/Documents/tools-website/client/src/lib/image-to-pdf.ts) - Handles image resizing, aspect-ratio scaling, and compilation into PDF binaries using `pdf-lib`.
- [Image Tools Module](file:///home/dev/Documents/tools-website/client/src/lib/image-tools.ts) - Implements browser Canvas conversions, JPEG/PNG compressors, and crop operations.
- [Video Processing Module](file:///home/dev/Documents/tools-website/client/src/lib/video-tools.ts) - Integrates native HTML5 video frame capturing and client-side trimming.
- [QR Code Generation](file:///home/dev/Documents/tools-website/client/src/lib/qr-code.ts) - Handles client-side matrix rendering and custom styles for QR/barcode vectors.
- [Encoding & Decoding](file:///home/dev/Documents/tools-website/client/src/lib/encoding-tools.ts) - Client-side Base64, Hex, URL, and HTML entity converters.

---

## 2. API Integrations & Fallbacks
For AI writing and GEO optimization tasks:
- **API File**: [Tool API Handler](file:///home/dev/Documents/tools-website/client/src/lib/tool-api.ts)
- **Shared Schemas**: [AI Tools Core Definitions](file:///home/dev/Documents/tools-website/shared/ai-tools-core.ts)
- **Execution Workflow**:
  - The client makes a POST request to `/api/ai/generate` sending the `toolId` and a payload of input fields.
  - The server verifies if the tool is supported.
  - If process variables contain an `OPENROUTER_API_KEY`, the server triggers an OpenRouter chat completion.
  - If key retrieval fails or the model returns an error, the server falls back to client-side rule-based generators defined in `ai-tools-core.ts` to guarantee service continuity.

---

## 3. SEO & Structured Data Architecture
- [Global SEO Constants](file:///home/dev/Documents/tools-website/client/src/lib/seo.ts) - Contains static metadata, global layout schemas, and robots configuration.
- [Dynamic Tool SEO Engine](file:///home/dev/Documents/tools-website/client/src/lib/tool-seo.ts) - Automates custom titles, descriptions, FAQs, and schemas for all active tools.
- [Pre-rendering Script](file:///home/dev/Documents/tools-website/scripts/prerender-seo.mjs) - Evaluates routes during production build to output crawlers-ready flat HTML pages.
