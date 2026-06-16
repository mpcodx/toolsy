import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { updateMetadata } from "@/lib/metadata";
import { SITE_CONFIG, STRUCTURED_DATA } from "@/lib/seo";
import { CATEGORIES, TOOLS, searchTools } from "@/lib/tools";
import { getToolIcon } from "@/lib/tool-icons";
import { lazy, Suspense } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const HomeCatalog = lazy(() => import("@/components/home/HomeCatalog"));

const quickSearches = [
  "clip cutter",
  "video cutter online",
  "merge pdf free",
  "merge pdf",
  "meta title generator",
  "meta description generator",
  "keyword clustering tool",
  "reel hook generator",
  "youtube shorts script generator",
  "clip idea generator",
  "instagram caption generator",
  "video trimmer no watermark",
];

const TOOL_COUNT_LABEL = `${TOOLS.length}`;
const CATEGORY_COUNT_LABEL = `${CATEGORIES.length}`;

function scrollToTools() {
  document
    .getElementById("tools-grid")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [location, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const suggestions = searchQuery.trim() ? searchTools(searchQuery).slice(0, 5) : [];

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
    script.textContent = JSON.stringify([
      STRUCTURED_DATA.website,
      STRUCTURED_DATA.organization,
      STRUCTURED_DATA.itemList,
    ]);
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
                  {TOOL_COUNT_LABEL} free tools for AI SEO, creator growth,
                  PDFs, and video workflows
                </Badge>

                <h1 className="mt-6 text-4xl md:text-6xl font-display font-bold leading-tight text-foreground">
                  Toolsy: free{" "}
                  <span className="text-accent">
                    AI, SEO, creator, PDF, and video tools
                  </span>{" "}
                  for everyday growth and file workflows.
                </h1>

                <p className="mt-5 text-lg md:text-xl leading-relaxed text-muted-foreground">
                  Use AI meta title and meta description generators, keyword
                  clustering, schema markup, Instagram captions, YouTube Shorts
                  scripts, reel hooks, clip ideas, clip cutter, video cutter
                  online, merge PDF free, and PDF conversion tools without
                  signup.
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
                  <div className="relative max-w-2xl z-30">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={event =>
                        handleSearch(event.currentTarget.value)
                      }
                      placeholder="Search meta description generator, reel hook generator, pdf merger..."
                      className="h-14 rounded-2xl border-border bg-background/95 pl-12 pr-4 text-base shadow-sm focus:ring-2 focus:ring-accent/25 focus:border-accent"
                    />

                    {/* Instant Search Suggestions Dropdown */}
                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-xl overflow-hidden z-50 divide-y divide-border/60">
                        {suggestions.map((tool) => {
                          const IconComp = getToolIcon(tool.icon);
                          return (
                            <button
                              key={tool.id}
                              type="button"
                              onClick={() => setLocation(`/tool/${tool.id}`)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/10 transition-colors duration-200 group"
                            >
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} text-white shrink-0 transition-transform group-hover:scale-110`}>
                                <IconComp className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                                  {tool.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {tool.description}
                                </p>
                              </div>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full shrink-0">
                                {tool.category}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Popular searches:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickSearches.map(query => (
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
                    Free utilities for meta tags, creator content, SEO research,
                    developer workflows, PDFs, videos, and images.
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
                    AI, SEO, developer, social media, PDF, document, video,
                    image, archive, utility, and text tools.
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
                      <p className="text-lg font-semibold">
                        No signup, clear search intent, and room to scale the
                        catalog.
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/75">
                    The catalog now spans AI generators, SEO helpers, creator
                    growth tools, developer utilities, and classic file
                    workflows. That mix gives you more high-intent entry points
                    without making the UX noisy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card/30 py-6">
          <div className="container flex flex-wrap items-center justify-center gap-2">
            {[
              "meta title generator",
              "meta description generator",
              "clip cutter",
              "video cutter online",
              "merge pdf free",
              "merge pdf",
              "clip idea generator",
              "reel hook generator",
              "youtube shorts script generator",
              "keyword clustering tool",
              "instagram caption generator",
              "video trimmer no watermark",
            ].map(keyword => (
              <Badge
                key={keyword}
                variant="secondary"
                className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {keyword}
              </Badge>
            ))}
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
