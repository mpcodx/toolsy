import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, TOOLS, getTool, searchTools, type Tool } from "@/lib/tools";
import {
  ArrowRight,
  Film,
  Image,
  Link2,
  Search,
  Scissors,
  ShieldCheck,
  Video,
} from "lucide-react";
import { useMemo } from "react";

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

const spotlightToolIds = [
  "ai-meta-generator",
  "keyword-clustering-tool",
  "schema-markup-generator",
  "commit-message-generator",
  "regex-explainer",
  "instagram-caption-generator",
  "youtube-description-generator",
  "pdf-to-image",
] as const;

const trustPoints = [
  {
    title: "Free-first stack",
    description:
      "The new catalog works without forced signup and can fall back to local generation when no AI key is configured.",
    icon: ShieldCheck,
  },
  {
    title: "Search-friendly",
    description:
      "Keyword-rich titles, internal links, and sitemap coverage help each tool target a specific search intent.",
    icon: Search,
  },
  {
    title: "Simple to build",
    description:
      "Shared UI and one backend route make it easy to keep shipping more rankable tool pages without duplicating code.",
    icon: ArrowRight,
  },
] as const;

const deferredSectionStyle = {
  contentVisibility: "auto",
  containIntrinsicSize: "1px 900px",
} as const;

interface HomeCatalogProps {
  searchQuery: string;
  selectedCategory: string | null;
  setSearchQuery: (value: string) => void;
  setSelectedCategory: (value: string | null) => void;
  clearFilters: () => void;
}

export default function HomeCatalog({
  searchQuery,
  selectedCategory,
  setSearchQuery,
  setSelectedCategory,
  clearFilters,
}: HomeCatalogProps) {
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

  return (
    <>
      <section className="py-16 md:py-24" style={deferredSectionStyle}>
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

      <section className="border-y border-border bg-card/50 py-16 md:py-24" style={deferredSectionStyle}>
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

              <a
                href="/tool/video-thumbnail-maker"
                className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-xs transition-[color,box-shadow] hover:bg-accent/90"
              >
                Open video tools
              </a>
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

      <section id="tools-grid" className="py-16 md:py-24" style={deferredSectionStyle}>
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
                className={
                  selectedCategory === null ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""
                }
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
                  className={
                    selectedCategory === category
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : ""
                  }
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
                  Search terms like “ai meta generator”, “regex explainer”, or “pdf merger”.
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

      <section
        className="border-t border-border bg-card/40 py-16 md:py-24"
        style={deferredSectionStyle}
      >
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

      <Footer />
    </>
  );
}
