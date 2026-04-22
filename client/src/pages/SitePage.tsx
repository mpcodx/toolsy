import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { updateMetadata } from "@/lib/metadata";
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/lib/cookie-consent";
import { SITE_CONFIG } from "@/lib/seo";
import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

type SitePageId =
  | "privacy-policy"
  | "about-us"
  | "contact-us"
  | "terms-and-conditions";

interface SitePageSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

interface SitePageSummaryCard {
  label: string;
  value: string;
}

interface SitePageContent {
  id: SitePageId;
  title: string;
  eyebrow: string;
  description: string;
  lastUpdated: string;
  keywords: string[];
  summaryCards: SitePageSummaryCard[];
  sections: SitePageSection[];
}

const SITE_PAGE_LINKS: Array<{ id: SitePageId; label: string; href: string }> = [
  { id: "privacy-policy", label: "Privacy Policy", href: "/privacy-policy" },
  { id: "about-us", label: "About Us", href: "/about-us" },
  { id: "contact-us", label: "Contact Us", href: "/contact-us" },
  {
    id: "terms-and-conditions",
    label: "Terms & Conditions",
    href: "/terms-and-conditions",
  },
];

const SITE_PAGES: Record<SitePageId, SitePageContent> = {
  "privacy-policy": {
    id: "privacy-policy",
    title: "Privacy Policy",
    eyebrow: "Privacy and data use",
    description:
      "This Privacy Policy explains how Toolsy approaches browser-first processing, cookies, analytics, and data handling when you use the site and its tools.",
    lastUpdated: "April 16, 2026",
    keywords: [
      "Toolsy privacy policy",
      "privacy policy",
      "cookies",
      "analytics consent",
      "browser-first tools",
      "data handling",
    ],
    summaryCards: [
      { label: "Core model", value: "Browser-first tools with no forced signup" },
      { label: "Cookies", value: "Essential cookies by default, analytics only after consent" },
      { label: "Scope", value: "Applies to Toolsy pages, tools, and supporting site features" },
    ],
    sections: [
      {
        title: "Information we process",
        paragraphs: [
          "Toolsy is designed to keep data collection limited. Many tools work directly in your browser, which means files or text can often be processed locally without creating an account.",
          "Some features may still require server-side processing to complete a request, such as selected conversion workflows, AI-assisted tools, or infrastructure needed to deliver the site reliably.",
        ],
        bullets: [
          "Information you actively provide, such as uploaded files, pasted text, or tool inputs",
          "Technical context needed to serve the site, such as browser type, device information, and basic request metadata",
          "Cookie preference choices and anonymous visit data when you choose to allow optional cookies",
        ],
      },
      {
        title: "How cookies and analytics work",
        paragraphs: [
          "Toolsy stores a cookie preference so the site can remember whether you accepted or rejected optional analytics cookies. If you decline, the site keeps to essential behavior only.",
          "When you accept analytics cookies, Toolsy may store anonymous visit cookies such as visit count and first-seen or last-seen timestamps to better understand product usage.",
        ],
        bullets: [
          "Essential cookies help preserve the basic app experience and your consent choice",
          "Optional analytics cookies are activated only after you grant permission",
          "You can revisit your choice at any time through the Cookie settings control",
        ],
      },
      {
        title: "Third-party services",
        paragraphs: [
          "Toolsy may rely on hosting, analytics, or AI providers to operate certain features. If a tool uses a third-party provider that has been configured by the site operator, information relevant to that request may be processed by that provider.",
          "Those services operate under their own terms and privacy policies, so you should avoid submitting highly sensitive information unless you understand the processing path for the tool you are using.",
        ],
      },
      {
        title: "Retention and security",
        paragraphs: [
          "Toolsy aims to minimize retained data and keep the experience lightweight. Because the site includes both local-browser workflows and server-supported features, retention can vary depending on the tool and hosting setup.",
          "Reasonable technical safeguards may be used to protect the site, but no online service can promise absolute security. Use care when sharing files or text through any web application.",
        ],
      },
      {
        title: "Your choices",
        paragraphs: [
          "You can stop using the service at any time, reject optional analytics cookies, and avoid uploading personal or confidential material into tools that do not require it.",
          "If you have a privacy-related question or request, please review the Contact Us page for the best way to share the page URL and relevant context with the site operator.",
        ],
      },
    ],
  },
  "about-us": {
    id: "about-us",
    title: "About Us",
    eyebrow: "What Toolsy is built for",
    description:
      "Toolsy is a free-first collection of practical online tools for AI, SEO, developer, creator, and file workflows, built for speed, clarity, and search-friendly discovery.",
    lastUpdated: "April 16, 2026",
    keywords: [
      "about toolsy",
      "about us",
      "free online tools",
      "seo tools",
      "creator tools",
      "developer tools",
    ],
    summaryCards: [
      { label: "Mission", value: "Make useful online tools simple, fast, and easy to return to" },
      { label: "Focus", value: "AI, SEO, file, creator, and everyday utility workflows" },
      { label: "Approach", value: "Clear UX, no forced signup, and search-friendly landing pages" },
    ],
    sections: [
      {
        title: "Our mission",
        paragraphs: [
          "Toolsy exists to remove friction from common online tasks. Whether you need to generate metadata, format text, convert files, extract media, or create simple assets, the goal is to make the job clear and fast.",
          "The product is intentionally free-first and lightweight so people can solve one real problem without a long setup flow or account wall.",
        ],
      },
      {
        title: "What we build",
        paragraphs: [
          "Toolsy brings together tools across AI, SEO, developer, social, PDF, image, video, archive, and utility categories.",
          "Each page is designed to stand on its own, with a focused workflow, straightforward controls, and content that helps users understand what the tool does before they commit time to it.",
        ],
        bullets: [
          "Search-friendly landing pages for high-intent tool queries",
          "Browser-first experiences where local processing makes sense",
          "Lightweight server support for workflows that need it",
          "Mobile-friendly layouts with clear calls to action",
        ],
      },
      {
        title: "How we think about product quality",
        paragraphs: [
          "Good utility software should be easy to discover, easy to trust, and easy to repeat. Toolsy emphasizes readable interfaces, direct outcomes, and metadata that makes pages understandable to both people and search engines.",
          "That means we spend time on details such as page performance, clear naming, internal linking, and a consistent design system rather than burying useful tools behind clutter.",
        ],
      },
      {
        title: "Who Toolsy helps",
        paragraphs: [
          "Toolsy is useful for founders, marketers, creators, students, developers, and anyone else who needs a focused web tool without opening a heavyweight desktop app.",
          "Some visitors come for a one-off conversion, while others use the catalog as a repeat workspace for keyword planning, captions, PDFs, media extraction, and quick utilities.",
        ],
      },
      {
        title: "Where we are headed",
        paragraphs: [
          "The catalog is built to grow over time with more practical tools, stronger internal linking, and better task-specific experiences.",
          "As Toolsy expands, the aim is to keep the same values intact: useful pages, simple UX, and a free-first experience that respects the user's time.",
        ],
      },
    ],
  },
  "contact-us": {
    id: "contact-us",
    title: "Contact Us",
    eyebrow: "Support, privacy, and partnership requests",
    description:
      "Use this page to understand what information helps most when contacting Toolsy about support issues, privacy questions, business inquiries, or legal concerns.",
    lastUpdated: "April 16, 2026",
    keywords: [
      "contact toolsy",
      "contact us",
      "support",
      "privacy requests",
      "business inquiries",
    ],
    summaryCards: [
      { label: "Best for", value: "Bug reports, privacy requests, and business conversations" },
      { label: "Helpful detail", value: "Include the exact page URL, device, and reproduction steps" },
      { label: "Current site", value: "https://toolsy.rayonweb.com" },
    ],
    sections: [
      {
        title: "What to contact us about",
        paragraphs: [
          "You can use this page as the reference point for support requests, tool issues, privacy questions, rights-related concerns, and partnership conversations.",
          "The more specific the message, the faster it is to understand what happened and whether the issue relates to a browser limitation, a site bug, or an expected workflow.",
        ],
        bullets: [
          "Broken or confusing tool behavior",
          "Questions about privacy, cookies, or site data use",
          "Copyright or content concerns tied to a specific page",
          "Partnership, licensing, or integration inquiries",
        ],
      },
      {
        title: "What to include in a support request",
        paragraphs: [
          "If you are reporting a problem, include enough detail for someone else to reproduce it without guessing. That usually matters more than a long explanation.",
        ],
        bullets: [
          "The full page URL where the problem happened",
          "Your browser, device type, and operating system",
          "The action you took and the result you expected",
          "Any error message, file type, or file size that may be relevant",
        ],
      },
      {
        title: "Privacy and legal requests",
        paragraphs: [
          "If your question relates to personal data, cookies, or a rights-related concern, include the exact page involved and describe the issue clearly so it can be reviewed in context.",
          "Requests that identify the page, tool, and date of the incident are easier to process than general descriptions.",
        ],
      },
      {
        title: "Contact channel note",
        paragraphs: [
          "Toolsy can be deployed in different environments, so the public contact method may depend on the operator of the specific deployment you are using.",
          "If you are running this project yourself, replace this page with your preferred mailbox, help desk, form, or business address. If you are using the hosted Toolsy site, use the official contact details published by that deployment.",
        ],
      },
    ],
  },
  "terms-and-conditions": {
    id: "terms-and-conditions",
    title: "Terms & Conditions",
    eyebrow: "Rules for using Toolsy",
    description:
      "These Terms & Conditions explain the basic rules for using Toolsy, including acceptable use, user responsibilities, service availability, and general legal limitations.",
    lastUpdated: "April 16, 2026",
    keywords: [
      "toolsy terms",
      "terms and conditions",
      "acceptable use",
      "service terms",
    ],
    summaryCards: [
      { label: "Use model", value: "Free-first tools provided for lawful, responsible use" },
      { label: "User duty", value: "You are responsible for the content and files you submit" },
      { label: "Availability", value: "Features may change, improve, or be removed over time" },
    ],
    sections: [
      {
        title: "Acceptance of these terms",
        paragraphs: [
          "By using Toolsy, you agree to follow these Terms & Conditions and any additional notices presented within the site.",
          "If you do not agree with these terms, you should stop using the service.",
        ],
      },
      {
        title: "Acceptable use",
        paragraphs: [
          "Toolsy is intended for lawful use and for workflows you are authorized to perform. You may not use the service in a way that harms the platform, other users, or third parties.",
        ],
        bullets: [
          "Do not upload, process, or share content that you do not have the right to use",
          "Do not attempt to abuse, reverse engineer, overload, or disrupt the service",
          "Do not use the site for illegal, infringing, deceptive, or harmful activity",
        ],
      },
      {
        title: "Your content and responsibility",
        paragraphs: [
          "You remain responsible for the files, text, prompts, links, and other inputs you submit to Toolsy. That includes checking that you have the right to use the material and that sharing it through a web tool is appropriate.",
          "Toolsy does not guarantee that every output will be accurate, complete, or suitable for every purpose, especially for generated or automated results.",
        ],
      },
      {
        title: "Service availability and updates",
        paragraphs: [
          "Toolsy may add, remove, pause, or modify features at any time to improve the product, address technical issues, or respond to operational needs.",
          "Because the service depends on browsers, hosting, and sometimes third-party providers, uninterrupted availability cannot be guaranteed.",
        ],
      },
      {
        title: "Disclaimers and limits",
        paragraphs: [
          "Toolsy is provided on an as-is and as-available basis to the extent allowed by applicable law. Use the site with appropriate judgment, especially for important business, legal, or sensitive workflows.",
          "To the extent permitted by law, Toolsy is not liable for indirect losses, lost data, lost profits, or issues caused by misuse, third-party systems, or circumstances outside reasonable control.",
        ],
      },
      {
        title: "Changes to these terms",
        paragraphs: [
          "These terms may be updated from time to time. When material changes are made, the updated version may be posted on this page with a revised date.",
          "Continuing to use Toolsy after changes take effect means you accept the updated terms.",
        ],
      },
    ],
  },
};

function getSitePage(pageId: SitePageId) {
  return SITE_PAGES[pageId];
}

function toSectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function SitePage({ pageId }: { pageId: SitePageId }) {
  const [, setLocation] = useLocation();
  const page = getSitePage(pageId);
  const canonicalUrl = `${SITE_CONFIG.url}/${page.id}`;
  const otherPages = SITE_PAGE_LINKS.filter((item) => item.id !== pageId);

  useEffect(() => {
    updateMetadata({
      title: `${page.title} | Toolsy`,
      description: page.description,
      keywords: page.keywords,
      image: SITE_CONFIG.image,
      url: canonicalUrl,
      canonical: canonicalUrl,
      type: "website",
    });

    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: page.title,
        description: page.description,
        url: canonicalUrl,
        isPartOf: {
          "@type": "WebSite",
          name: "Toolsy",
          url: SITE_CONFIG.url,
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
            name: page.title,
            item: canonicalUrl,
          },
        ],
      },
    ];

    const scripts = schemas.map((schema, index) => {
      const script = document.createElement("script");
      script.id = `site-page-jsonld-${page.id}-${index}`;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      return script;
    });

    return () => {
      scripts.forEach((script) => script.remove());
    };
  }, [canonicalUrl, page]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border bg-card/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_32%)]" />
          <div className="absolute -top-20 right-[-3rem] h-60 w-60 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute bottom-[-6rem] left-[-4rem] h-72 w-72 rounded-full bg-slate-900/8 blur-3xl" />

          <div className="container relative py-12 md:py-16">
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <a
                      href="/"
                      onClick={(event) => {
                        event.preventDefault();
                        setLocation("/");
                      }}
                    >
                      Home
                    </a>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{page.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                {page.eyebrow}
              </p>
              <h1 className="mt-4 text-4xl md:text-5xl font-display font-bold text-foreground">
                {page.title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                {page.description}
              </p>
              <div className="mt-6 inline-flex rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted-foreground">
                Last updated {page.lastUpdated}
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {page.summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-border bg-background/85 p-5 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="space-y-6">
              {page.sections.map((section) => {
                const sectionId = toSectionId(section.title);

                return (
                  <section
                    key={section.title}
                    id={sectionId}
                    className="scroll-mt-24 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm"
                  >
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      {section.title}
                    </h2>
                    <div className="mt-4 space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-sm md:text-base leading-7 text-muted-foreground"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="mt-5 space-y-3">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm leading-6 text-muted-foreground"
                          >
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>

            <aside className="lg:sticky lg:top-24">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                  On this page
                </p>
                <div className="mt-4 space-y-2">
                  {page.sections.map((section) => (
                    <a
                      key={section.title}
                      href={`#${toSectionId(section.title)}`}
                      className="block rounded-2xl border border-transparent bg-background/70 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                    >
                      {section.title}
                    </a>
                  ))}
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Company pages
                  </p>
                  <div className="mt-4 space-y-2">
                    {otherPages.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block rounded-2xl border border-transparent bg-background/70 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                        onClick={(event) => {
                          event.preventDefault();
                          setLocation(item.href);
                        }}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    type="button"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => setLocation("/")}
                  >
                    Browse tools
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
                    }
                  >
                    Cookie settings
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export function PrivacyPolicyPage() {
  return <SitePage pageId="privacy-policy" />;
}

export function AboutUsPage() {
  return <SitePage pageId="about-us" />;
}

export function ContactUsPage() {
  return <SitePage pageId="contact-us" />;
}

export function TermsAndConditionsPage() {
  return <SitePage pageId="terms-and-conditions" />;
}
