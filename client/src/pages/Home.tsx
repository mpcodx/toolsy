import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ToolCard from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { updateMetadata } from "@/lib/metadata";
import { CATEGORIES, TOOLS, getTool, searchTools, type Tool } from "@/lib/tools";
import { SITE_CONFIG, STRUCTURED_DATA } from "@/lib/seo";
import {
  ArrowRight,
  CheckCircle2,
  Film,
  Image,
  Link2,
  Search,
  ShieldCheck,
  Scissors,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

const spotlightToolIds = [
  "pdf-to-image",
  "image-to-pdf",
  "pdf-merger",
  "video-to-audio",
  "video-thumbnail-maker",
  "video-to-frames",
  "direct-mp4-downloader",
] as const;

const creatorTools = [
  {
    title: "Direct MP4 Downloader",
    description: "Paste a direct public MP4 file URL and download it with a browser link.",
    href: "/tool/direct-mp4-downloader",
    icon: Link2,
  },
  {
    title: "Video to Audio",
    description: "Extract audio from uploaded videos in a few clicks.",
    href: "/tool/video-to-audio",
    icon: Video,
  },
  {
    title: "Thumbnail Maker",
    description: "Capture a frame and download a sharp thumbnail image.",
    href: "/tool/video-thumbnail-maker",
    icon: Image,
  },
  {
    title: "Video to Frames",
    description: "Export a time range as a ZIP of PNG frames.",
    href: "/tool/video-to-frames",
    icon: Film,
  },
  {
    title: "Video Clip Cutter",
    description: "Trim an uploaded video into a shorter, watermark-free clip.",
    href: "/tool/video-clipper",
    icon: Scissors,
  },
] as const;

const quickSearches = [
  "pdf merger",
  "video to audio",
  "thumbnail maker",
  "video to frames",
  "video clip cutter",
  "mp4 downloader",
  "image to pdf",
];

const trustPoints = [
  {
    title: "Browser-first",
    description: "Many tools run locally in the browser so the workflow stays fast and private.",
    icon: ShieldCheck,
  },
  {
    title: "Search-friendly",
    description: "Keyword-rich titles, internal links, and sitemap updates help each tool get discovered.",
    icon: Search,
  },
  {
    title: "Built for sharing",
    description: "Social metadata and focused landing pages make the tool pages easy to share.",
    icon: ArrowRight,
  },
] as const;

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

  const filteredTools = useMemo(() => {
    if (searchQuery.trim()) {
      return searchTools(searchQuery);
    }

    if (selectedCategory) {
      return TOOLS.filter((tool) => tool.category === selectedCategory);
    }

    return TOOLS;
  }, [searchQuery, selectedCategory]);

  const spotlightTools = spotlightToolIds
    .map((toolId) => getTool(toolId))
    .filter((tool): tool is Tool => Boolean(tool));

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
                  {TOOLS.length} free tools for PDF, video, and image work
                </Badge>

                <h1 className="mt-6 text-4xl md:text-6xl font-display font-bold leading-tight text-foreground">
                  Toolsy: fast file tools for{" "}
                  <span className="text-accent">PDFs, videos, and images</span>.
                </h1>

                <p className="mt-5 text-lg md:text-xl leading-relaxed text-muted-foreground">
                  Search tools for PDF merging, video to audio, thumbnail maker, direct MP4 file URLs,
                  video to frames ZIP exports, clip cutting, and image conversion. Everything is tuned for
                  quick results and clear SEO landing pages.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setLocation("/tool/direct-mp4-downloader")}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 text-base"
                  >
                    Try MP4 downloader
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
                      placeholder="Search pdf merger, thumbnail maker, video to frames..."
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
                    {TOOLS.length}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Free utilities for PDFs, videos, images, archives, and quick text workflows.
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Categories
                  </p>
                  <p className="mt-2 text-4xl font-display font-bold text-foreground">
                    {CATEGORIES.length}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    PDF, video, image, archive, utility, and text tools grouped for easy scanning.
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white shadow-lg sm:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-white/70">
                        Works on uploaded files
                      </p>
                      <p className="text-lg font-semibold">No signup, no clutter, no platform-only shortcuts.</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/75">
                    We keep the workflow focused on your own files. Video tools support thumbnails, frame ZIPs,
                    clip trimming, and audio extraction, while PDF tools handle conversions and compression.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card/30 py-6">
          <div className="container flex flex-wrap items-center justify-center gap-2">
            {["pdf merger", "video to audio", "thumbnail maker", "video to frames", "video clip cutter", "image to pdf"].map(
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

        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
                  Popular tools
                </p>
                <h2 className="mt-2 text-3xl font-display font-bold text-foreground">
                  The tools people reach for first
                </h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Quick links to the most visited workflows. Each card opens a dedicated page with its own
                  metadata, tool-specific copy, and a cleaner conversion experience.
                </p>
              </div>

              <Button variant="ghost" onClick={clearFilters} className="w-fit text-accent">
                Reset filters
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {spotlightTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card/50 py-16 md:py-24">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <Badge className="rounded-full bg-accent/10 text-accent hover:bg-accent/10">
                  Creator workflow
                </Badge>
                <h2 className="mt-4 text-3xl font-display font-bold text-foreground md:text-4xl">
                  Video thumbnails, frame ZIPs, and clips from uploaded files
                </h2>
                <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
                  We support local video files for audio extraction, thumbnail capture, frame export, and clip
                  trimming. Downloading media from YouTube or Instagram is not included, which keeps the workflow
                  focused on content you own or have rights to use.
                </p>

                <Button
                  onClick={() => setLocation("/tool/video-thumbnail-maker")}
                  className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Open video tools
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {creatorTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <a
                      key={tool.title}
                      href={tool.href}
                      className="group rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-accent">
                            {tool.title}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="tools-grid" className="py-16 md:py-24">
          <div className="container">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
                  Browse all tools
                </p>
                <h2 className="mt-2 text-3xl font-display font-bold text-foreground">
                  Search by task, not by folder
                </h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Filter by category or keyword to jump straight to the right converter, compressor, extractor,
                  or editor.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  variant={selectedCategory === null ? "default" : "outline"}
                  className={selectedCategory === null ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
                >
                  All tools
                </Button>
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(category);
                    }}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={selectedCategory === category ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {filteredTools.length > 0 ? (
              <>
                <div className="mb-8 flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} available
                  </p>
                  <p className="hidden text-sm text-muted-foreground md:block">
                    Search terms like “video to audio”, “thumbnail maker”, or “pdf merger”.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-border bg-card/70 p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">No tools found</h3>
                <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                  Try adjusting the search or category filter to find the tool you want.
                </p>
                <Button onClick={clearFilters} className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                  View all tools
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-border bg-card/40 py-16 md:py-24">
          <div className="container">
            <div className="mb-10">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
                Why Toolsy
              </p>
              <h2 className="mt-2 text-3xl font-display font-bold text-foreground md:text-4xl">
                Clear UX, stronger discovery, and page-level SEO
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {trustPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.title}
                    className="rounded-3xl border border-border bg-background p-6 shadow-sm"
                  >
                    <div className="mb-4 inline-flex rounded-2xl bg-accent/10 p-3 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{point.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
