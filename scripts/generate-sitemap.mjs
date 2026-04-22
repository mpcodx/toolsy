import { writeFileSync } from "node:fs";
import { escapeXml, getRouteEntries, SITE_URL } from "./seo-data.mjs";

const LASTMOD = new Date().toISOString().slice(0, 10);
const SITEMAP_FILE = new URL("../client/public/sitemap.xml", import.meta.url);
const ROBOTS_FILE = new URL("../client/public/robots.txt", import.meta.url);

const urls = getRouteEntries();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    url => `  <url>
    <loc>${escapeXml(url.url)}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Disallow: /api/
Disallow: /admin/
Disallow: /private/

Sitemap: ${SITE_URL}/sitemap.xml
`;

writeFileSync(SITEMAP_FILE, xml, "utf8");
writeFileSync(ROBOTS_FILE, robots, "utf8");

console.log(
  `Generated sitemap.xml and robots.txt with ${urls.length} URLs on ${LASTMOD}.`
);
