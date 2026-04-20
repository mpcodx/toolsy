import { readFileSync, writeFileSync } from "node:fs";

const SITE_URL = "https://www.toolsylab.xyz";
const LASTMOD = new Date().toISOString().slice(0, 10);
const TOOLS_FILE = new URL("../client/src/lib/tools.ts", import.meta.url);
const SITEMAP_FILE = new URL("../client/public/sitemap.xml", import.meta.url);
const STATIC_PAGES = [
  "/privacy-policy",
  "/about-us",
  "/contact-us",
  "/terms-and-conditions",
];

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseTools() {
  const text = readFileSync(TOOLS_FILE, "utf8");
  const lines = text.split("\n");
  const tools = [];
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "{") {
      current = { id: null, featured: false };
      continue;
    }

    if (!current) {
      continue;
    }

    const idMatch = trimmed.match(/^id: "([^"]+)"/);
    if (idMatch) {
      current.id = idMatch[1];
    }

    if (trimmed.startsWith("featured: true")) {
      current.featured = true;
    }

    if (trimmed === "}," || trimmed === "}") {
      if (current.id) {
        tools.push(current);
      }
      current = null;
    }
  }

  return tools;
}

const tools = parseTools();

const urls = [
  {
    loc: `${SITE_URL}/`,
    changefreq: "daily",
    priority: "1.0",
  },
  ...STATIC_PAGES.map((path) => ({
    loc: `${SITE_URL}${path}`,
    changefreq: "monthly",
    priority: "0.5",
  })),
  ...tools.map((tool) => ({
    loc: `${SITE_URL}/tool/${tool.id}`,
    changefreq: "weekly",
    priority: tool.featured ? "0.9" : "0.8",
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync(SITEMAP_FILE, xml, "utf8");

console.log(`Generated sitemap.xml with ${urls.length} URLs on ${LASTMOD}.`);
