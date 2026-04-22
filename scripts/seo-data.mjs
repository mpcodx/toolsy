import { readFileSync } from "node:fs";
import ts from "typescript";

export const SITE_URL = "https://www.toolsylab.xyz";
export const SITE_NAME = "Toolsy";
export const SITE_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663075906499/HGEeKYb69GRxsTr6fzPE7i/hero-banner-i64GCUGHWUe83zmTExApQ7.webp";

const TOOLS_FILE = new URL("../client/src/lib/tools.ts", import.meta.url);

export const HOME_ROUTE = {
  path: "/",
  changeFrequency: "daily",
  priority: 1,
  title: "Toolsy - Free AI, SEO, Developer, Social, PDF & Media Tools",
  description:
    "Toolsy is a free online hub for AI, SEO, developer, social media, PDF, video, and image tools. Generate metadata, cluster keywords, explain regex, write captions, and handle file workflows with no signup required.",
  keywords: [
    "Toolsy",
    "AI tools",
    "SEO tools",
    "developer tools",
    "social media tools",
    "PDF converter",
    "image converter",
    "video to audio",
    "online tools",
    "free converter",
  ],
};

export const STATIC_ROUTES = [
  {
    path: "/privacy-policy",
    changeFrequency: "monthly",
    priority: 0.5,
    title: "Privacy Policy | Toolsy",
    description:
      "Read the Toolsy Privacy Policy for details about browser-first tools, cookies, analytics consent, and data handling.",
    keywords: [
      "Toolsy privacy policy",
      "privacy policy",
      "cookies",
      "analytics consent",
    ],
  },
  {
    path: "/about-us",
    changeFrequency: "monthly",
    priority: 0.5,
    title: "About Us | Toolsy",
    description:
      "Learn about Toolsy, a free-first collection of practical online tools for AI, SEO, developer, creator, PDF, image, and video workflows.",
    keywords: [
      "about Toolsy",
      "free online tools",
      "SEO tools",
      "creator tools",
    ],
  },
  {
    path: "/contact-us",
    changeFrequency: "monthly",
    priority: 0.5,
    title: "Contact Us | Toolsy",
    description:
      "Contact Toolsy for support issues, privacy questions, business inquiries, legal concerns, or tool feedback.",
    keywords: [
      "contact Toolsy",
      "support",
      "privacy requests",
      "business inquiries",
    ],
  },
  {
    path: "/terms-and-conditions",
    changeFrequency: "monthly",
    priority: 0.5,
    title: "Terms & Conditions | Toolsy",
    description:
      "Read the Toolsy Terms & Conditions covering acceptable use, user responsibilities, service availability, and legal limitations.",
    keywords: [
      "Toolsy terms",
      "terms and conditions",
      "acceptable use",
      "service terms",
    ],
  },
];

function getPropertyName(name) {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  ) {
    return name.text;
  }

  return undefined;
}

function getLiteralValue(expression) {
  if (
    ts.isStringLiteral(expression) ||
    ts.isNoSubstitutionTemplateLiteral(expression)
  ) {
    return expression.text;
  }

  if (expression.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }

  if (expression.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }

  return undefined;
}

function extractObjectLiteral(objectLiteral) {
  const value = {};

  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }

    const name = getPropertyName(property.name);
    if (!name) {
      continue;
    }

    value[name] = getLiteralValue(property.initializer);
  }

  return value;
}

export function getTools() {
  const sourceText = readFileSync(TOOLS_FILE, "utf8");
  const sourceFile = ts.createSourceFile(
    TOOLS_FILE.pathname,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  let toolsArray;

  sourceFile.forEachChild(node => {
    if (!ts.isVariableStatement(node)) {
      return;
    }

    for (const declaration of node.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === "TOOLS" &&
        declaration.initializer &&
        ts.isArrayLiteralExpression(declaration.initializer)
      ) {
        toolsArray = declaration.initializer;
      }
    }
  });

  if (!toolsArray) {
    throw new Error("Could not find TOOLS array in client/src/lib/tools.ts");
  }

  return toolsArray.elements
    .filter(ts.isObjectLiteralExpression)
    .map(extractObjectLiteral)
    .filter(
      tool => typeof tool.id === "string" && typeof tool.name === "string"
    );
}

function getToolTitle(tool) {
  if (tool.id === "ai-meta-generator") {
    return "AI Meta Generator for SEO Titles & Descriptions";
  }

  if (tool.id === "video-clipper") {
    return "Video Clip Cutter - Free Online Video Trimmer, No Watermark | Toolsy";
  }

  if (tool.id === "direct-mp4-downloader") {
    return "Direct MP4 Downloader - Download Public MP4 File URLs";
  }

  return `${tool.name} - Free ${tool.category} Tool | Toolsy`;
}

function getToolDescription(tool) {
  if (tool.id === "ai-meta-generator") {
    return "Generate SEO titles and meta descriptions in seconds with Toolsy's AI Meta Generator. Great for blogs, landing pages, product pages, and ecommerce SEO workflows.";
  }

  if (tool.id === "video-clipper") {
    return "Trim videos online in seconds with Toolsy. Free, secure, fast, and no watermark. No signup needed. Supports MP4, MOV, WebM, MKV, and AVI.";
  }

  if (tool.id === "direct-mp4-downloader") {
    return "Paste a direct public MP4 file URL and use a browser-safe download link to save it locally. Direct file URLs only, no platform pages.";
  }

  return `${tool.description}. Free ${String(tool.category).toLowerCase()} tool with no signup required.`;
}

function getToolKeywords(tool) {
  return [
    tool.name,
    tool.description,
    `${tool.category} tool`,
    "free online tool",
    "Toolsy",
  ].filter(Boolean);
}

export function getRouteEntries() {
  const toolRoutes = getTools().map(tool => ({
    path: `/tool/${tool.id}`,
    changeFrequency: "weekly",
    priority: tool.featured ? 0.9 : 0.8,
    title: getToolTitle(tool),
    description: getToolDescription(tool),
    keywords: getToolKeywords(tool),
    tool,
  }));

  return [HOME_ROUTE, ...STATIC_ROUTES, ...toolRoutes].map(entry => ({
    ...entry,
    url: `${SITE_URL}${entry.path === "/" ? "/" : entry.path}`,
  }));
}

export function getSchemas(entry) {
  if (entry.path === "/") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        description: entry.description,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/?search={search_term_string}`,
          },
          query_input: "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.svg`,
      },
    ];
  }

  if (entry.tool) {
    return [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: entry.tool.name,
        description: entry.description,
        url: entry.url,
        applicationCategory: entry.tool.category,
        operatingSystem: "Web",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      getBreadcrumbSchema([
        { name: "Home", url: `${SITE_URL}/` },
        { name: entry.tool.name, url: entry.url },
      ]),
    ];
  }

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: entry.title.replace(" | Toolsy", ""),
      description: entry.description,
      url: entry.url,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
    getBreadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/` },
      { name: entry.title.replace(" | Toolsy", ""), url: entry.url },
    ]),
  ];
}

function getBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
