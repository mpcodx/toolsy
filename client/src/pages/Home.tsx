import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { updateMetadata } from "@/lib/metadata";
import { SITE_CONFIG, STRUCTURED_DATA } from "@/lib/seo";
import { lazy, Suspense } from "react";
import {
  CheckCircle2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const HomeCatalog = lazy(() => import("@/components/home/HomeCatalog"));

const quickSearches = [
  "ai meta generator",
  "keyword clustering tool",
  "schema markup generator",
  "commit message generator",
  "regex explainer",
  "instagram caption generator",
  "pdf merger",
];

const TOOL_COUNT_LABEL = "40+";
const CATEGORY_COUNT_LABEL = "10+";

function scrollToTools() {
  document.getElementById("tools-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [location, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    updateMetadata({
      title: SITE_CONFIG.title,
      description: SITE_CONFIG.description,
      keywords: SITE_CONFIG.keywords,
      image: SITE_CONFIG.image,
      url: `${SITE_CONFIG.url}/`,
      type: "website",
      canonical: `${SITE_CONFIG.url}/`,
    });
  }, []);

  useEffect(() => {
    const scriptId = "home-jsonld";
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(STRUCTURED_DATA.website);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const query = params.get("search") || "";
    setSearchQuery(query);
  }, [location]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setSelectedCategory(null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_30%)]" />
          <div className="absolute -top-24 right-[-5rem] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-[-6rem] left-[-6rem] h-80 w-80 rounded-full bg-slate-900/10 blur-3xl" />

          <div className="container relative py-16 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="max-w-3xl">
                <Badge className="rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-accent hover:bg-accent/10">
                  {TOOL_COUNT_LABEL} free tools for AI, SEO, developer, social, PDF, and media work
                </Badge>

                <h1 className="mt-6 text-4xl md:text-6xl font-display font-bold leading-tight text-foreground">
                  Toolsy: free tools for{" "}
                  <span className="text-accent">SEO, AI workflows, creators, and everyday files</span>.
                </h1>

                <p className="mt-5 text-lg md:text-xl leading-relaxed text-muted-foreground">
                  Search tools for meta generation, keyword clustering, regex explanations, captions,
                  hashtags, PDF workflows, video utilities, and image conversion. Each page is built to
                  solve one real problem with clear UX and strong SEO intent.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setLocation("/tool/ai-meta-generator")}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 text-base"
                  >
                    Try AI meta generator
                  </Button>
                  <Button
                    variant="outline"
                    onClick={scrollToTools}
                    className="px-6 py-3 text-base"
                  >
                    Browse tools
                  </Button>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="relative max-w-2xl">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(event) => handleSearch(event.currentTarget.value)}
                      placeholder="Search ai meta generator, regex explainer, pdf merger..."
                      className="h-14 rounded-2xl border-border bg-background/95 pl-12 pr-4 text-base shadow-sm"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Popular searches:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickSearches.map((query) => (
                      <Button
                        key={query}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(query)}
                        className="rounded-full border-border bg-card/80 text-sm"
                      >
                        {query}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Tools
                  </p>
                  <p className="mt-2 text-4xl font-display font-bold text-foreground">
                    {TOOL_COUNT_LABEL}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Free utilities for AI drafting, SEO, developer work, social media, PDFs, videos, and images.
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Categories
                  </p>
                  <p className="mt-2 text-4xl font-display font-bold text-foreground">
                    {CATEGORY_COUNT_LABEL}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    AI, SEO, developer, social media, document, video, image, archive, utility, and text tools.
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white shadow-lg sm:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-white/70">
                        Free and focused
                      </p>
                      <p className="text-lg font-semibold">No signup, clear search intent, and room to scale the catalog.</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/75">
                    The catalog now spans AI generators, SEO helpers, developer utilities, social media drafts,
                    and classic file tools. That mix gives you more organic entry points without making the UX noisy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card/30 py-6">
          <div className="container flex flex-wrap items-center justify-center gap-2">
            {[
              "ai meta generator",
              "keyword clustering tool",
              "schema markup generator",
              "regex explainer",
              "instagram caption generator",
              "pdf merger",
            ].map(
              (keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {keyword}
                </Badge>
              )
            )}
          </div>
        </section>

        <Suspense fallback={<CatalogFallback />}>
          <HomeCatalog
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            setSearchQuery={setSearchQuery}
            setSelectedCategory={setSelectedCategory}
            clearFilters={clearFilters}
          />
        </Suspense>
      </main>
    </div>
  );
}

function CatalogFallback() {
  return (
    <div className="container py-16">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-52 rounded-3xl border border-border bg-card/70 shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}
