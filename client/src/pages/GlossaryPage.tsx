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
import { SITE_CONFIG } from "@/lib/seo";
import { Book, ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

interface GlossaryTerm {
  term: string;
  definition: string;
  linkText?: string;
  linkUrl?: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Base64 Encoding",
    definition: "A group of binary-to-text encoding schemes that represent binary data in an ASCII string format by translating it into a radix-64 representation. Useful for embedding image data within HTML or CSS stylesheets.",
    linkText: "Base64 Encoder/Decoder",
    linkUrl: "/tool/base64-encoder",
  },
  {
    term: "WebAssembly (WASM)",
    definition: "A binary instruction format for a stack-based virtual machine. WASM is designed as a portable compilation target for programming languages, enabling high-performance client-side execution in web browsers for video, image, and PDF processing.",
    linkText: "Video Clip Cutter",
    linkUrl: "/tool/video-clipper",
  },
  {
    term: "JSON (JavaScript Object Notation)",
    definition: "A lightweight, text-based, language-independent data interchange format. It is easy for humans to read and write and easy for machines to parse and generate.",
    linkText: "JSON Formatter",
    linkUrl: "/tool/json-formatter",
  },
  {
    term: "Generative Engine Optimization (GEO)",
    definition: "The methodology of optimizing web content structures, information density, and citation formats to ensure maximum visibility, relevance, and citation frequency in LLM-powered search engines (e.g., SearchGPT, Perplexity, Gemini).",
    linkText: "GEO Content Optimizer",
    linkUrl: "/tool/geo-content-optimizer",
  },
  {
    term: "Answer Engine Optimization (AEO)",
    definition: "A subset of SEO focusing on optimization for voice search assistants and conversational answer bots by structuring data in clear, direct Q&A formats that directly resolve user search intent.",
    linkText: "Answer Engine FAQ Generator",
    linkUrl: "/tool/aeo-answer-generator",
  },
  {
    term: "JSON-LD (JSON for Linking Data)",
    definition: "A concrete syntax of RDF that uses JSON to serialize Schema.org metadata. It allows search engines to identify structured entities (like SoftwareApplication or Organization) indexable on a web page.",
    linkText: "Schema Markup Generator",
    linkUrl: "/tool/schema-markup-generator",
  },
  {
    term: "Cryptographic Hash Function",
    definition: "An algorithm that maps arbitrary data sizes to fixed-size bit arrays. Secure hash functions (such as SHA-256) are one-way and are utilized for integrity verification, digital signatures, and authentication tokens.",
    linkText: "Hash Generator",
    linkUrl: "/tool/hash-generator",
  },
  {
    term: "Regular Expressions (Regex)",
    definition: "A sequence of characters that specifies a search pattern in text. Used by developers for validation, string searching, and content refactoring in code editor suites.",
    linkText: "Regex Explainer",
    linkUrl: "/tool/regex-explainer",
  },
  {
    term: "cURL (Client URL)",
    definition: "A command-line tool and library for transferring data with URLs. It supports protocols like HTTP, HTTPS, FTP, and IMAP, and is widely used by developer environments to debug API requests.",
    linkText: "cURL Command Generator",
    linkUrl: "/tool/curl-command-generator",
  },
  {
    term: "Keyword Clustering",
    definition: "An SEO technique of grouping keywords with similar search intent into a single topical cluster. Helps publishers create comprehensive content structures that rank for multiple semantic variations.",
    linkText: "Keyword Clustering Tool",
    linkUrl: "/tool/keyword-clustering-tool",
  },
];

export default function GlossaryPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    updateMetadata({
      title: "Developer & SEO Glossary | Toolsy",
      description: "Learn terms and definitions surrounding client-side processing, WebAssembly, JSON-LD, cryptographic hashes, GEO, and AEO optimization.",
      keywords: ["Developer glossary", "SEO glossary", "WebAssembly definition", "GEO explanation", "JSON-LD schema", "Toolsy concepts"],
      image: SITE_CONFIG.image,
      url: `${SITE_CONFIG.url}/docs/glossary`,
      type: "article",
      canonical: `${SITE_CONFIG.url}/docs/glossary`,
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="py-12 md:py-16 border-b border-border bg-card/50">
          <div className="container">
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Button>

            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }}>Home</a>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Developer & SEO Glossary</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
                <Book className="w-4 h-4" />
                Semantic Knowledge Base
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl font-display font-bold text-foreground">
                Developer & SEO Glossary
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Learn the core technologies, algorithms, and concepts powering modern browser utilities and generative engine optimization models.
              </p>
            </div>
          </div>
        </section>

        <section className="container py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6">
              {GLOSSARY_TERMS.map((item) => (
                <div
                  key={item.term}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-accent/30"
                >
                  <h2 className="text-xl font-bold text-foreground mb-3">{item.term}</h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-7 mb-4">
                    {item.definition}
                  </p>
                  {item.linkText && item.linkUrl && (
                    <Button
                      variant="link"
                      onClick={() => setLocation(item.linkUrl!)}
                      className="text-accent hover:text-accent/80 p-0 h-auto font-semibold flex items-center gap-1"
                    >
                      Use the {item.linkText} &rarr;
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
