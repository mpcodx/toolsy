# Toolsy - Free AI, SEO, Developer, Social, PDF, Video, and Image Tools

Toolsy is a free online hub for AI, SEO, developer, social media, PDF, video, image, text, archive, and utility tools. It is built for speed, clarity, and search visibility, with modern UI, SEO-friendly landing pages, and a simple workflow that works well on desktop and mobile.

Live site: https://www.toolsylab.xyz/

## Overview

Toolsy helps users complete everyday file tasks and lightweight text workflows without installing desktop software. People can generate metadata, cluster keywords, explain regex, write captions, merge PDFs, split documents, convert images, extract audio from videos, make thumbnails, export video frames, create ZIP files, generate QR codes, encode Base64, and much more.

The app uses a modern React stack, lazy-loaded tool components, rich metadata, structured data, sitemap and robots files, and a responsive design system so each tool page can rank and convert well.

## Why Toolsy

- 42 free tools across AI, SEO, developer, social media, PDF, document, image, video, text, archive, and utility workflows
- Fast loading with code splitting and lazy-loaded tool modules
- SEO-ready pages with unique titles, descriptions, canonical URLs, and JSON-LD
- Clean, mobile-friendly interface with strong visual hierarchy
- Browser-first for many workflows, with lightweight server helpers where needed
- Direct MP4 download support for public file URLs you are already allowed to use
- Optional Umami analytics support when configured
- Cookie consent banner with anonymous visit cookies after approval
- No signup required for the core experience

## Tool Catalog

### PDF Tools

- PDF to Image
- Image to PDF
- PDF Compressor
- PDF Merger
- PDF Splitter
- PDF Watermark

### Document Conversion

- Word to PDF
- Excel to PDF
- PPT to PDF
- PDF to Word

### Image Tools

- Image Resizer
- Image Compressor
- Image Converter
- Image Cropper

### Text Tools

- Text to Speech
- Text Formatter
- JSON Formatter

### Video Tools

- Video to Audio
- Thumbnail Maker
- Video to Frames
- Video Clip Cutter
- Direct MP4 Downloader

### Archive Tools

- ZIP Extractor
- ZIP Creator

### Utility Tools

- QR Code Generator
- Barcode Generator
- Hash Generator
- Color Converter
- Unit Converter
- Base64 Encoder/Decoder

### AI Tools

- AI Meta Generator
- AI Paragraph Rewriter
- AI Title Generator

### SEO Tools

- Keyword Clustering Tool
- Schema Markup Generator
- FAQ Generator

### Developer Tools

- Commit Message Generator
- Regex Explainer
- cURL Command Generator

### Social Media Tools

- Hashtag Generator
- Instagram Caption Generator
- YouTube Description Generator

## How It Works

1. Open the Toolsy homepage.
2. Search for a tool or browse by category.
3. Open the tool page you need.
4. Upload a file, paste text, or enter a direct file URL depending on the tool.
5. Adjust the options, generate the result, and download it.

Direct MP4 Downloader note: this tool is only for direct public MP4 file URLs. It does not support YouTube or Instagram page links.

## Tech Stack

- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS 4
- shadcn/ui components
- Wouter routing
- Express server for production
- Sonner for toast notifications
- Lucide React icons

## Key Features

- Home page search and category filtering
- Featured tool sections for better discovery
- Per-tool landing pages with unique SEO metadata
- Breadcrumbs, FAQ content, and schema markup on tool pages
- Canonical URLs for homepage and individual tools
- Sitemap and robots files for crawler support
- Social metadata for sharing
- Sweet alert style toast feedback
- Optional analytics loader

## SEO And Content System

Toolsy is set up to support both search discovery and user experience:

- Unique titles and descriptions for the homepage and tool pages
- Open Graph and Twitter card metadata
- Canonical URLs
- Tool-specific JSON-LD for SoftwareApplication, BreadcrumbList, and FAQPage
- Internal linking between related tools
- Search-friendly keyword phrases on tool pages
- Sitemap and robots files in `client/public`

When adding a new tool, remember to update the tool registry, the SEO helper, and the sitemap so the new page is discoverable.

Blueprints for the new free-first AI and SEO catalog live in `docs/free-tool-blueprints.md`.

## Optional Analytics

Analytics are disabled unless you configure them. If you want Umami tracking or the Google tag, set:

| Variable                    | Purpose                                      | Required |
| --------------------------- | -------------------------------------------- | -------- |
| `VITE_ANALYTICS_ENDPOINT`   | Umami base URL or direct tracker script URL  | No       |
| `VITE_ANALYTICS_WEBSITE_ID` | Umami website ID                             | No       |
| `VITE_GOOGLE_TAG_ID`        | Google Analytics / Google tag measurement ID | No       |

If these values are missing, the Umami and Google Analytics scripts will not load.
On Vercel, the production build gets the same values from `vercel.json`, since `.env` is gitignored and not available to the hosted build by default.
Vercel Web Analytics is also mounted through `@vercel/analytics`, but it stays behind the same cookie-consent gate and only runs after the user accepts analytics cookies.
Vercel Speed Insights is mounted through `@vercel/speed-insights/react` and follows the same consent gate in this app.

For Umami Cloud, set `VITE_ANALYTICS_ENDPOINT` to `https://cloud.umami.is` and the app will load `script.js` from that host with your website ID.

The Google tag is included in the HTML shell for Search Console detection, but consent mode keeps analytics storage denied until the user accepts cookies.

## Project Structure

```text
tools-website/
├── client/
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── logo.svg
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   └── src/
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── Footer.tsx
│       │   ├── ToolCard.tsx
│       │   ├── ToolLoader.tsx
│       │   └── tools/
│       ├── lib/
│       ├── pages/
│       ├── contexts/
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── server/
├── shared/
├── scripts/
├── dist/
└── README.md
```

## Important Files

- `client/src/lib/tools.ts` - tool registry and category data
- `client/src/components/ToolLoader.tsx` - lazy-loaded tool routing
- `client/src/lib/tool-seo.ts` - per-tool SEO content and schema generation
- `client/src/lib/metadata.ts` - page metadata and canonical handling
- `client/src/lib/seo.ts` - site-wide SEO data, robots text, and sitemap URLs
- `client/public/robots.txt` - crawler instructions
- `client/public/sitemap.xml` - crawlable URLs
- `server/index.ts` - production server entry

## Development

### Prerequisites

- Node.js 18 or newer
- pnpm 9 or newer

### Install

```bash
pnpm install
```

### Run Locally

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Preview Build

```bash
pnpm preview
```

### Type Check

```bash
pnpm check
```

### Format Code

```bash
pnpm format
```

## Deployment

The app builds into `dist/` and can be deployed to any Node-capable host that can serve the production server entry.

Typical flow:

```bash
pnpm install
pnpm build
pnpm start
```

The production server serves the built client assets from `dist/public` and handles the app routes.

## Security And Privacy

- Most tools are browser-first and run without a signup flow
- Some tools use lightweight server-side helpers when needed for file generation
- Anonymous visit cookies and analytics only start after the user gives permission
- The direct MP4 downloader only supports direct public file URLs
- Toolsy is designed for clear user consent and allowed-use workflows
- Keep private or sensitive files local when possible

## Browser Support

- Chrome and Edge
- Firefox
- Safari
- Modern mobile browsers

## Contributing

Contributions are welcome. A good change usually includes:

1. Updating the tool registry in `client/src/lib/tools.ts`
2. Adding or wiring the tool component in `client/src/components/tools/`
3. Updating `client/src/lib/tool-seo.ts` for title, description, FAQs, and schema
4. Updating `client/public/sitemap.xml` if the page should be crawlable
5. Checking `client/public/robots.txt` if crawl behavior changes
6. Running `pnpm format` and `pnpm build`

## License

MIT
