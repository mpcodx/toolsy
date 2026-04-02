import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ToolCard from "@/components/ToolCard";
import ToolLoader from "@/components/ToolLoader";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { getTool, getToolsByCategory, TOOLS } from "@/lib/tools";
import { updateMetadata } from "@/lib/metadata";
import { buildToolSeo } from "@/lib/tool-seo";
import * as Icons from "lucide-react";
import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";

/**
 * Modern Minimalist Design - Tool Detail Page
 * - Tool information and features
 * - Interactive tool interface placeholder
 * - Related tools section
 */

interface ToolPageProps {
  params: {
    id: string;
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const [, setLocation] = useLocation();
  const tool = getTool(params.id);
  const seo = useMemo(() => (tool ? buildToolSeo(tool) : null), [tool]);

  useEffect(() => {
    if (!tool || !seo) {
      return;
    }

    updateMetadata(seo.metadata);

    const scripts = seo.schemas.map((schema, index) => {
      const script = document.createElement("script");
      script.id = `tool-jsonld-${tool.id}-${index}`;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      return script;
    });

    return () => {
      scripts.forEach((script) => script.remove());
    };
  }, [seo, tool]);

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Tool Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The tool you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Back to Home
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const IconComponent = (Icons as any)[tool.icon] || Icons.Zap;
  const relatedTools = getToolsByCategory(tool.category).filter((t) => t.id !== tool.id);
  const categorySearchHref = `/?search=${encodeURIComponent(tool.category.toLowerCase())}`;
  const searchPhrasesToShow = seo?.content.searchPhrases.slice(0, 10) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Tool Header */}
        <section className="py-12 md:py-16 border-b border-border bg-card/50">
          <div className="container">
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <Icons.ChevronLeft className="w-4 h-4 mr-2" />
              Back to Tools
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
                  <BreadcrumbLink asChild>
                    <a
                      href={categorySearchHref}
                      onClick={(event) => {
                        event.preventDefault();
                        setLocation(categorySearchHref);
                      }}
                    >
                      {tool.category}
                    </a>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{tool.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="flex items-start gap-6">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${tool.color}`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
                    {tool.name}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-5 max-w-2xl">
                    {tool.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm">
                      {tool.category}
                    </span>
                    <span className="inline-block px-4 py-2 rounded-full bg-secondary/50 text-muted-foreground font-medium text-sm">
                      Free to use
                    </span>
                    <span className="inline-block px-4 py-2 rounded-full bg-secondary/50 text-muted-foreground font-medium text-sm">
                      No signup required
                    </span>
                  </div>
                </div>
              </div>

              {seo && (
                <div className="rounded-3xl border border-border bg-background/80 p-5 md:p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                    Expert SEO summary
                  </p>
                  <p className="mt-3 text-sm md:text-base leading-7 text-muted-foreground">
                    {seo.content.intro}
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Input
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {seo.content.supportedInput}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Output
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {seo.content.supportedOutput}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {searchPhrasesToShow.slice(0, 4).map((phrase) => (
                      <span
                        key={phrase}
                        className="inline-flex items-center rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground"
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tool Interface */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-sm">
                <ToolLoader toolId={tool.id} />
              </div>

              {seo && (
                <div className="mt-16 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                          What this tool does
                        </p>
                        <h2 className="mt-2 text-2xl font-display font-bold text-foreground">
                          Built for {tool.name.toLowerCase()}
                        </h2>
                      </div>
                      <Icons.Sparkles className="h-6 w-6 text-accent" />
                    </div>
                    <p className="mt-4 text-sm md:text-base leading-7 text-muted-foreground">
                      {seo.content.intro}
                    </p>
                    <div className="mt-6 grid gap-4">
                      {seo.content.highlights.map((highlight, index) => {
                        const HighlightIcon = index === 0 ? Icons.CheckCircle2 : index === 1 ? Icons.ShieldCheck : Icons.Download;

                        return (
                          <div
                            key={highlight}
                            className="flex gap-4 rounded-2xl border border-border/70 bg-background/70 p-4"
                          >
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                              <HighlightIcon className="h-5 w-5 text-accent" />
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground">{highlight}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                          How to use
                        </p>
                        <h2 className="mt-2 text-2xl font-display font-bold text-foreground">
                          {tool.name} in a few steps
                        </h2>
                      </div>
                      <Icons.Route className="h-6 w-6 text-accent" />
                    </div>
                    <ol className="mt-6 space-y-4">
                      {seo.content.steps.map((step, index) => (
                        <li key={step} className="flex gap-4 rounded-2xl border border-border/70 bg-background/70 p-4">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                            {index + 1}
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">{step}</p>
                        </li>
                      ))}
                    </ol>

                    <div className="mt-6 rounded-2xl bg-secondary/40 p-5">
                      <p className="text-sm font-semibold text-foreground">Supported formats</p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Input
                          </p>
                          <p className="mt-2 text-sm text-foreground">
                            {seo.content.supportedInput}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Output
                          </p>
                          <p className="mt-2 text-sm text-foreground">
                            {seo.content.supportedOutput}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {seo && (
                <div className="mt-16 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                        Search intent
                      </p>
                      <h3 className="mt-2 text-2xl font-display font-bold text-foreground">
                        Popular search phrases
                      </h3>
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                      These phrases help the page match real searches while also giving visitors a quick
                      summary of the tool topic.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {searchPhrasesToShow.map((phrase) => (
                      <span
                        key={phrase}
                        className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-2 text-sm text-muted-foreground"
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {seo && (
                <div className="mt-16">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                        FAQ
                      </p>
                      <h3 className="mt-2 text-2xl font-display font-bold text-foreground">
                        Frequently Asked Questions
                      </h3>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    {seo.content.faqs.map((item) => (
                      <div
                        key={item.question}
                        className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                      >
                        <h4 className="font-semibold text-foreground mb-2">{item.question}</h4>
                        <p className="text-sm leading-6 text-muted-foreground">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section className="py-16 md:py-24 bg-card/50 border-t border-border">
            <div className="container">
              <h2 className="text-3xl font-display font-bold text-foreground mb-12 text-center">
                Related Tools
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedTools.slice(0, 3).map((relatedTool) => (
                  <ToolCard key={relatedTool.id} tool={relatedTool} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
