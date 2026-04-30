import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getToolIcon } from "@/lib/tool-icons";
import { CATEGORIES, TOOLS, getTool, searchTools, type Tool } from "@/lib/tools";
import {
  ArrowRight,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo } from "react";

const creatorClipToolIds = [
  "direct-mp4-downloader",
  "video-to-audio",
  "video-thumbnail-maker",
  "video-to-frames",
  "video-clipper",
] as const;

const creatorPlanningToolIds = [
  "clip-idea-generator",
  "video-hook-generator",
  "shorts-script-generator",
  "content-calendar-generator",
] as const;

const creatorClipTools = creatorClipToolIds
  .map((toolId) => getTool(toolId))
  .filter((tool): tool is Tool => Boolean(tool));

const creatorPlanningTools = creatorPlanningToolIds
  .map((toolId) => getTool(toolId))
  .filter((tool): tool is Tool => Boolean(tool));

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
                Video clips, reel hooks, Shorts scripts, and creator planning in one stack
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
                Repurpose podcasts, local video files, interviews, and webinars into clip ideas, reel
                hooks, YouTube Shorts scripts, captions, and content calendar drafts. Local media tools
                also cover audio extraction, frame capture, and no-watermark video trimming for files you
                already own or are allowed to use.
              </p>

              <a
                href="/tool/clip-idea-generator"
                className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-xs transition-[color,box-shadow] hover:bg-accent/90"
              >
                Try clip idea generator
              </a>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Clip utilities
                </p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  {creatorClipTools.map((tool) => {
                    const Icon = getToolIcon(tool.icon);
                    return (
                      <a
                        key={tool.id}
                        href={`/tool/${tool.id}`}
                        className="group rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-accent">
                              {tool.name}
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

              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Creator copy
                </p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  {creatorPlanningTools.map((tool) => {
                    const Icon = getToolIcon(tool.icon);
                    return (
                      <a
                        key={tool.id}
                        href={`/tool/${tool.id}`}
                        className="group rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-accent">
                              {tool.name}
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
