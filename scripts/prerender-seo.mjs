import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getRouteEntries,
  getSchemas,
  SITE_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "./seo-data.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "..", "dist", "public");
const INDEX_FILE = path.join(DIST_DIR, "index.html");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toHtmlFilePath(routePath) {
  if (routePath === "/") {
    return INDEX_FILE;
  }

  return path.join(DIST_DIR, `${routePath.slice(1)}.html`);
}

function buildManagedHead(entry) {
  const title = escapeHtml(entry.title);
  const description = escapeHtml(entry.description);
  const keywords = escapeHtml(entry.keywords.join(", "));
  const canonical = escapeHtml(entry.url);
  const image = escapeHtml(SITE_IMAGE);
  const schemas = JSON.stringify(getSchemas(entry));

  return `    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <link rel="canonical" href="${canonical}" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:url" content="${canonical}" />
    <meta name="twitter:image" content="${image}" />
    <script type="application/ld+json" data-seo-schema>${schemas}</script>`;
}

function getFallbackLinks(entry) {
  if (entry.path === "/") {
    return [
      { href: `${SITE_URL}/tool/video-clipper`, label: "Clip Cutter" },
      { href: `${SITE_URL}/tool/video-clipper`, label: "clipcutter" },
      { href: `${SITE_URL}/tool/video-clipper`, label: "Clips Cutter" },
      { href: `${SITE_URL}/tool/video-clipper`, label: "Video Cutter Online" },
      { href: `${SITE_URL}/tool/pdf-merger`, label: "Merge PDF" },
      { href: `${SITE_URL}/tool/pdf-merger`, label: "Merge PDF Free" },
      { href: `${SITE_URL}/sitemap.xml`, label: "XML Sitemap" },
    ];
  }

  if (entry.tool?.id === "video-clipper") {
    return [
      { href: entry.url, label: "Clip Cutter" },
      { href: entry.url, label: "Video Cutter Online" },
      { href: `${SITE_URL}/tool/video-compressor`, label: "Video Compressor" },
      { href: `${SITE_URL}/`, label: "Browse all tools" },
      { href: `${SITE_URL}/sitemap.xml`, label: "XML Sitemap" },
    ];
  }

  if (entry.tool?.id === "pdf-merger") {
    return [
      { href: entry.url, label: "Merge PDF" },
      { href: entry.url, label: "Merge PDF Free" },
      { href: `${SITE_URL}/tool/pdf-page-remover`, label: "PDF Page Remover" },
      { href: `${SITE_URL}/`, label: "Browse all tools" },
      { href: `${SITE_URL}/sitemap.xml`, label: "XML Sitemap" },
    ];
  }

  if (entry.tool) {
    return [
      { href: entry.url, label: entry.tool.name },
      { href: `${SITE_URL}/`, label: "Browse all tools" },
      { href: `${SITE_URL}/sitemap.xml`, label: "XML Sitemap" },
    ];
  }

  return [
    { href: `${SITE_URL}/`, label: "Home" },
    { href: `${SITE_URL}/sitemap.xml`, label: "XML Sitemap" },
  ];
}

function buildManagedFallback(entry) {
  const pageTitle = escapeHtml(entry.title.replace(/\s+\|\s+Toolsy$/, ""));
  const description = escapeHtml(entry.description);
  const keywords = escapeHtml(entry.keywords.slice(0, 8).join(", "));
  const links = getFallbackLinks(entry)
    .map(
      link =>
        `        <li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`
    )
    .join("\n");

  return `  <noscript data-seo-fallback>
    <section style="max-width:960px;margin:0 auto;padding:32px 20px;font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <h1 style="margin:0 0 12px;font-size:2rem;line-height:1.2;">${pageTitle}</h1>
      <p style="margin:0 0 16px;">${description}</p>
      <p style="margin:0 0 16px;"><strong>Keywords:</strong> ${keywords}</p>
      <ul style="margin:0;padding-left:20px;">
${links}
      </ul>
    </section>
  </noscript>`;
}

function removeManagedHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, "")
    .replace(
      /<meta\s+(?:name|property)=["'](?:description|keywords|robots|googlebot|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi,
      ""
    )
    .replace(/<link\s+rel=["'](?:canonical|sitemap)["'][^>]*>\s*/gi, "")
    .replace(
      /<script\s+type=["']application\/ld\+json["']\s+data-seo-schema[\s\S]*?<\/script>\s*/gi,
      ""
    );
}

function removeManagedFallback(html) {
  return html.replace(
    /<noscript\s+data-seo-fallback[\s\S]*?<\/noscript>\s*/gi,
    ""
  );
}

function applyMetadata(html, entry) {
  const cleanHtml = removeManagedFallback(removeManagedHead(html));
  const managedHead = `\n${buildManagedHead(entry)}\n`;
  const managedFallback = `\n${buildManagedFallback(entry)}\n`;
  const htmlWithHead = cleanHtml.includes("<!-- Google Tag Manager -->")
    ? cleanHtml.replace(
        /(\s*)<!-- Google Tag Manager -->/i,
        `${managedHead}$1<!-- Google Tag Manager -->`
      )
    : cleanHtml.replace(/(\s*)<\/head>/i, `${managedHead}$1</head>`);

  return htmlWithHead.replace(/(\s*)<\/body>/i, `${managedFallback}$1</body>`);
}

if (!existsSync(INDEX_FILE)) {
  throw new Error(
    "dist/public/index.html does not exist. Run the Vite build first."
  );
}

const template = readFileSync(INDEX_FILE, "utf8");
const routes = getRouteEntries();

for (const route of routes) {
  const filePath = toHtmlFilePath(route.path);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, applyMetadata(template, route), "utf8");
}

console.log(`Prerendered route metadata for ${routes.length} canonical URLs.`);
