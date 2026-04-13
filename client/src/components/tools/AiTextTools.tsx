import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { Copy, Download, Sparkles } from "lucide-react";
import { useState } from "react";

type ToolId =
  | "ai-meta-generator"
  | "ai-paragraph-rewriter"
  | "ai-title-generator"
  | "keyword-clustering-tool"
  | "schema-markup-generator"
  | "faq-generator"
  | "commit-message-generator"
  | "regex-explainer"
  | "curl-command-generator"
  | "hashtag-generator"
  | "instagram-caption-generator"
  | "youtube-description-generator";

type FieldType = "text" | "textarea" | "select";

interface ToolField {
  key: string;
  label: string;
  placeholder?: string;
  type?: FieldType;
  required?: boolean;
  rows?: number;
  helpText?: string;
  options?: string[];
}

interface ToolConfig {
  title: string;
  intro: string;
  submitLabel: string;
  resultLabel: string;
  resultFilename: string;
  helperPoints: string[];
  fields: ToolField[];
  defaults?: Record<string, string>;
}

const TOOL_CONFIGS: Record<ToolId, ToolConfig> = {
  "ai-meta-generator": {
    title: "AI Meta Generator",
    intro:
      "Generate SEO-friendly title and description options from your topic, keywords, and audience. When OpenRouter is configured the tool uses AI, and when it is not it still returns a free local draft.",
    submitLabel: "Generate meta tags",
    resultLabel: "Meta tag ideas",
    resultFilename: "meta-tags.txt",
    helperPoints: [
      "Great for landing pages, blog posts, and category pages.",
      "Use a clear primary keyword plus one or two supporting modifiers.",
      "Outputs are designed to be easy to copy into your CMS.",
    ],
    fields: [
      {
        key: "topic",
        label: "Page topic",
        placeholder: "AI meta generator for ecommerce product pages",
        type: "text",
        required: true,
      },
      {
        key: "keywords",
        label: "Target keywords",
        placeholder: "ai meta generator, meta title generator, meta description generator",
        type: "textarea",
        rows: 4,
        required: true,
      },
      {
        key: "audience",
        label: "Audience",
        placeholder: "SEO managers, founders, content teams",
        type: "text",
      },
      {
        key: "tone",
        label: "Tone",
        type: "select",
        options: ["Clear", "Professional", "Click-worthy", "Friendly"],
      },
    ],
    defaults: {
      tone: "Click-worthy",
    },
  },
  "ai-paragraph-rewriter": {
    title: "AI Paragraph Rewriter",
    intro:
      "Rewrite rough text for clarity, tone, and readability. This is useful for product copy, emails, introductions, and blog paragraphs that need a cleaner second draft.",
    submitLabel: "Rewrite paragraph",
    resultLabel: "Rewritten text",
    resultFilename: "rewritten-paragraph.txt",
    helperPoints: [
      "Paste one or more paragraphs of source text.",
      "Choose the tone you want the rewrite to follow.",
      "Best for polishing drafts without opening a full editor.",
    ],
    fields: [
      {
        key: "text",
        label: "Source text",
        placeholder: "Paste the paragraph you want to rewrite...",
        type: "textarea",
        rows: 8,
        required: true,
      },
      {
        key: "tone",
        label: "Tone",
        type: "select",
        options: ["Professional", "Simple", "Persuasive", "Conversational", "Concise"],
      },
      {
        key: "goal",
        label: "Rewrite goal",
        placeholder: "Make it clearer and shorter for a landing page",
        type: "text",
      },
    ],
    defaults: {
      tone: "Professional",
    },
  },
  "ai-title-generator": {
    title: "AI Title Generator",
    intro:
      "Create headline ideas for blog posts, landing pages, YouTube videos, and social content. The generator works well for idea expansion and CTR-focused title variations.",
    submitLabel: "Generate titles",
    resultLabel: "Title ideas",
    resultFilename: "title-ideas.txt",
    helperPoints: [
      "Add a topic and the audience you want to attract.",
      "Use the count field to get more options in one pass.",
      "Try the same topic with different tones to compare angles.",
    ],
    fields: [
      {
        key: "topic",
        label: "Topic",
        placeholder: "Free AI tools for small business SEO",
        type: "text",
        required: true,
      },
      {
        key: "audience",
        label: "Audience",
        placeholder: "Small business owners",
        type: "text",
      },
      {
        key: "tone",
        label: "Tone",
        type: "select",
        options: ["SEO", "Educational", "Bold", "Friendly", "Expert"],
      },
      {
        key: "count",
        label: "Number of titles",
        type: "select",
        options: ["5", "10", "15"],
      },
    ],
    defaults: {
      tone: "SEO",
      count: "10",
    },
  },
  "keyword-clustering-tool": {
    title: "Keyword Clustering Tool",
    intro:
      "Group keyword lists into topic clusters you can turn into pages, supporting sections, and internal links. The local fallback keeps this tool free even without an API key.",
    submitLabel: "Cluster keywords",
    resultLabel: "Keyword clusters",
    resultFilename: "keyword-clusters.txt",
    helperPoints: [
      "Paste one keyword per line or separate them with commas.",
      "Use the output to build pillar pages and supporting articles.",
      "Clusters are especially useful for topical authority planning.",
    ],
    fields: [
      {
        key: "keywords",
        label: "Keywords",
        placeholder: "ai meta generator\nmeta description generator\nseo title checker\nschema markup tool",
        type: "textarea",
        rows: 10,
        required: true,
      },
      {
        key: "topic",
        label: "Primary topic",
        placeholder: "SEO tools",
        type: "text",
      },
      {
        key: "intent",
        label: "Search intent focus",
        type: "select",
        options: ["Mixed", "Informational", "Commercial", "Transactional"],
      },
    ],
    defaults: {
      intent: "Mixed",
    },
  },
  "schema-markup-generator": {
    title: "Schema Markup Generator",
    intro:
      "Generate JSON-LD for common schema types without leaving the page. This tool is useful for SEO audits, landing pages, article markup, and software application pages.",
    submitLabel: "Generate schema",
    resultLabel: "JSON-LD schema",
    resultFilename: "schema-markup.json",
    helperPoints: [
      "Choose a schema type and complete the basic page details.",
      "The result can be pasted into a script tag or SEO plugin.",
      "SoftwareApplication output is useful for tool landing pages like this site.",
    ],
    fields: [
      {
        key: "schemaType",
        label: "Schema type",
        type: "select",
        options: ["SoftwareApplication", "Article", "FAQPage", "Product", "LocalBusiness"],
        required: true,
      },
      {
        key: "name",
        label: "Name",
        placeholder: "AI Meta Generator",
        type: "text",
        required: true,
      },
      {
        key: "url",
        label: "Page URL",
        placeholder: "https://example.com/ai-meta-generator",
        type: "text",
        required: true,
      },
      {
        key: "description",
        label: "Description",
        placeholder: "Free tool to generate SEO-friendly titles and descriptions.",
        type: "textarea",
        rows: 5,
        required: true,
      },
      {
        key: "brand",
        label: "Brand or author",
        placeholder: "Toolsy",
        type: "text",
      },
    ],
    defaults: {
      schemaType: "SoftwareApplication",
      brand: "Toolsy",
    },
  },
  "faq-generator": {
    title: "FAQ Generator",
    intro:
      "Generate question-and-answer sets for landing pages, feature pages, and SaaS tools. FAQ content helps users scan faster and gives you material for FAQ schema.",
    submitLabel: "Generate FAQs",
    resultLabel: "FAQ draft",
    resultFilename: "faq-draft.txt",
    helperPoints: [
      "Give the tool a focused topic and a few target keywords.",
      "Use outputs as raw material, then edit for accuracy and brand voice.",
      "Works well for tool pages, pricing pages, and service pages.",
    ],
    fields: [
      {
        key: "topic",
        label: "Page or product topic",
        placeholder: "Keyword clustering tool",
        type: "text",
        required: true,
      },
      {
        key: "keywords",
        label: "Target keywords",
        placeholder: "keyword clustering tool, group keywords for seo, keyword cluster generator",
        type: "textarea",
        rows: 4,
      },
      {
        key: "audience",
        label: "Audience",
        placeholder: "SEO specialists and content marketers",
        type: "text",
      },
      {
        key: "count",
        label: "Number of FAQs",
        type: "select",
        options: ["4", "6", "8"],
      },
    ],
    defaults: {
      count: "6",
    },
  },
  "commit-message-generator": {
    title: "Commit Message Generator",
    intro:
      "Turn a rough summary of your code changes into a cleaner commit message. The output supports conventional commit formatting and gives you a short body when useful.",
    submitLabel: "Generate commit message",
    resultLabel: "Commit message",
    resultFilename: "commit-message.txt",
    helperPoints: [
      "Paste a plain-English summary of what changed.",
      "Choose the conventional commit type you want.",
      "Useful when you know the change but want sharper phrasing.",
    ],
    fields: [
      {
        key: "summary",
        label: "Change summary",
        placeholder: "Added shared AI text tools, new SEO categories, and OpenRouter route support",
        type: "textarea",
        rows: 6,
        required: true,
      },
      {
        key: "type",
        label: "Commit type",
        type: "select",
        options: ["feat", "fix", "refactor", "docs", "chore", "test"],
      },
      {
        key: "scope",
        label: "Scope",
        placeholder: "seo",
        type: "text",
      },
    ],
    defaults: {
      type: "feat",
    },
  },
  "regex-explainer": {
    title: "Regex Explainer",
    intro:
      "Explain what a regular expression does in plain language, including a token-by-token breakdown where possible. It is useful for onboarding, code reviews, and debugging unfamiliar patterns.",
    submitLabel: "Explain regex",
    resultLabel: "Regex explanation",
    resultFilename: "regex-explanation.txt",
    helperPoints: [
      "Paste the pattern exactly as it appears in your code.",
      "Optional sample text helps clarify what the match should catch.",
      "The local fallback covers common regex tokens and quantifiers.",
    ],
    fields: [
      {
        key: "pattern",
        label: "Regex pattern",
        placeholder: "^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]{2,}$",
        type: "text",
        required: true,
      },
      {
        key: "sample",
        label: "Sample text",
        placeholder: "https://toolsy.rayonweb.com",
        type: "text",
      },
      {
        key: "flavor",
        label: "Regex flavor",
        type: "select",
        options: ["JavaScript", "PCRE", "Python", "General"],
      },
    ],
    defaults: {
      flavor: "JavaScript",
    },
  },
  "curl-command-generator": {
    title: "cURL Command Generator",
    intro:
      "Generate ready-to-run cURL commands from a URL, method, headers, and JSON body. This is useful for documentation, debugging APIs, and quick terminal tests.",
    submitLabel: "Generate cURL command",
    resultLabel: "cURL command",
    resultFilename: "curl-command.txt",
    helperPoints: [
      "Add one HTTP header per line using Header-Name: value format.",
      "Body is optional for GET requests.",
      "The output is formatted so it is easy to read and copy.",
    ],
    fields: [
      {
        key: "method",
        label: "HTTP method",
        type: "select",
        options: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      },
      {
        key: "url",
        label: "Request URL",
        placeholder: "https://api.example.com/v1/tools",
        type: "text",
        required: true,
      },
      {
        key: "headers",
        label: "Headers",
        placeholder: "Authorization: Bearer token\nContent-Type: application/json",
        type: "textarea",
        rows: 5,
      },
      {
        key: "body",
        label: "JSON body",
        placeholder: "{\n  \"topic\": \"ai meta generator\"\n}",
        type: "textarea",
        rows: 6,
      },
    ],
    defaults: {
      method: "POST",
    },
  },
  "hashtag-generator": {
    title: "Hashtag Generator",
    intro:
      "Generate grouped hashtags for discovery, niche relevance, and branded posts. The tool is useful for creators, agencies, ecommerce teams, and social freelancers.",
    submitLabel: "Generate hashtags",
    resultLabel: "Hashtag set",
    resultFilename: "hashtags.txt",
    helperPoints: [
      "Add your topic plus a few keywords or niches.",
      "Choose a platform to shape the output style.",
      "Mix broad, niche, and branded tags instead of only large tags.",
    ],
    fields: [
      {
        key: "topic",
        label: "Post topic",
        placeholder: "AI tools for content creators",
        type: "text",
        required: true,
      },
      {
        key: "keywords",
        label: "Keywords or niches",
        placeholder: "content marketing, small business, seo, creator tools",
        type: "textarea",
        rows: 4,
      },
      {
        key: "platform",
        label: "Platform",
        type: "select",
        options: ["Instagram", "TikTok", "YouTube Shorts", "LinkedIn", "X"],
      },
      {
        key: "brand",
        label: "Brand name",
        placeholder: "Toolsy",
        type: "text",
      },
    ],
    defaults: {
      platform: "Instagram",
    },
  },
  "instagram-caption-generator": {
    title: "Instagram Caption Generator",
    intro:
      "Build Instagram captions with a hook, body copy, CTA, and optional hashtag block. This helps when you have the idea but need a cleaner post draft quickly.",
    submitLabel: "Generate caption",
    resultLabel: "Instagram caption",
    resultFilename: "instagram-caption.txt",
    helperPoints: [
      "Include the offer, takeaway, or story you want to share.",
      "Choose a tone that matches your brand voice.",
      "The output is formatted for quick edits before posting.",
    ],
    fields: [
      {
        key: "topic",
        label: "Post topic",
        placeholder: "Launching our free keyword clustering tool",
        type: "text",
        required: true,
      },
      {
        key: "offer",
        label: "Offer or key takeaway",
        placeholder: "It helps SEO teams group related search terms faster",
        type: "textarea",
        rows: 4,
      },
      {
        key: "cta",
        label: "Call to action",
        placeholder: "Try it from the link in bio",
        type: "text",
      },
      {
        key: "tone",
        label: "Tone",
        type: "select",
        options: ["Confident", "Friendly", "Playful", "Educational"],
      },
    ],
    defaults: {
      tone: "Friendly",
    },
  },
  "youtube-description-generator": {
    title: "YouTube Description Generator",
    intro:
      "Write a fuller YouTube description with keyword coverage, a value summary, and a CTA. This is useful for tutorials, explainers, reviews, and channel growth workflows.",
    submitLabel: "Generate description",
    resultLabel: "YouTube description",
    resultFilename: "youtube-description.txt",
    helperPoints: [
      "Add the video title and a short summary.",
      "Use target keywords you want included naturally.",
      "The result gives you a clean starting point, not a final truth claim.",
    ],
    fields: [
      {
        key: "title",
        label: "Video title",
        placeholder: "How to Cluster Keywords for Topical Authority",
        type: "text",
        required: true,
      },
      {
        key: "summary",
        label: "Video summary",
        placeholder: "A walkthrough of how to group related keywords into content clusters.",
        type: "textarea",
        rows: 5,
        required: true,
      },
      {
        key: "keywords",
        label: "Target keywords",
        placeholder: "keyword clustering, topical authority, seo content strategy",
        type: "textarea",
        rows: 4,
      },
      {
        key: "cta",
        label: "Call to action",
        placeholder: "Subscribe for more SEO workflow tutorials",
        type: "text",
      },
    ],
  },
};

function buildInitialValues(config: ToolConfig) {
  return config.fields.reduce<Record<string, string>>((result, field) => {
    result[field.key] = config.defaults?.[field.key] ?? field.options?.[0] ?? "";
    return result;
  }, {});
}

function copyText(value: string) {
  return navigator.clipboard.writeText(value);
}

function downloadText(contents: string, filename: string, type = "text/plain;charset=utf-8") {
  downloadBlob(new Blob([contents], { type }), filename);
}

function toolIdToProviderLabel(provider: string | null) {
  if (provider === "openrouter") {
    return "AI-enhanced";
  }

  if (provider === "fallback") {
    return "Local free draft";
  }

  return null;
}

function AiGeneratorTool({ toolId }: { toolId: ToolId }) {
  const config = TOOL_CONFIGS[toolId];
  const [values, setValues] = useState<Record<string, string>>(() => buildInitialValues(config));
  const [output, setOutput] = useState("");
  const [provider, setProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const missingRequiredField = config.fields.find(
    (field) => field.required && !values[field.key]?.trim()
  );

  const handleChange = (key: string, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setValues(buildInitialValues(config));
    setOutput("");
    setProvider(null);
    setError("");
  };

  const handleGenerate = async () => {
    if (missingRequiredField) {
      setError(`${missingRequiredField.label} is required.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId,
          inputs: values,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        output?: string;
        provider?: string;
      };

      if (!response.ok || !payload.output) {
        throw new Error(payload.error || "Unable to generate content right now.");
      }

      setOutput(payload.output);
      setProvider(payload.provider || null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate content right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border bg-card/70 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Free text workflow
            </p>
            <h2 className="mt-2 text-2xl font-display font-bold text-foreground">
              {config.title}
            </h2>
            <p className="mt-3 text-sm md:text-base leading-7 text-muted-foreground">
              {config.intro}
            </p>
          </div>
          <div className="rounded-2xl bg-accent/10 p-3 text-accent">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {config.helperPoints.map((point) => (
            <div key={point} className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm leading-6 text-muted-foreground">{point}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-5">
            {config.fields.map((field) => (
              <div key={field.key}>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {field.label}
                </label>

                {field.type === "select" ? (
                  <select
                    value={values[field.key] ?? ""}
                    onChange={(event) => handleChange(field.key, event.currentTarget.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    value={values[field.key] ?? ""}
                    onChange={(event) => handleChange(field.key, event.currentTarget.value)}
                    placeholder={field.placeholder}
                    rows={field.rows ?? 5}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                ) : (
                  <input
                    value={values[field.key] ?? ""}
                    onChange={(event) => handleChange(field.key, event.currentTarget.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                )}

                {field.helpText ? (
                  <p className="mt-2 text-xs text-muted-foreground">{field.helpText}</p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loading ? "Generating..." : config.submitLabel}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
              Reset
            </Button>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Results
              </p>
              <h3 className="mt-2 text-xl font-display font-bold text-foreground">
                {config.resultLabel}
              </h3>
            </div>
            {toolIdToProviderLabel(provider) ? (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                {toolIdToProviderLabel(provider)}
              </span>
            ) : null}
          </div>

          <textarea
            value={output}
            readOnly
            placeholder="Your generated result will appear here."
            rows={18}
            className="mt-5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => copyText(output)}
              disabled={!output}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                downloadText(
                  output,
                  config.resultFilename,
                  config.resultFilename.endsWith(".json")
                    ? "application/ld+json;charset=utf-8"
                    : "text/plain;charset=utf-8"
                )
              }
              disabled={!output}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          <p className="mt-5 text-xs leading-6 text-muted-foreground">
            Tip: review generated copy before publishing. The tool is designed to save time, not replace
            your final editorial or technical checks.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AiMetaGenerator() {
  return <AiGeneratorTool toolId="ai-meta-generator" />;
}

export function AiParagraphRewriter() {
  return <AiGeneratorTool toolId="ai-paragraph-rewriter" />;
}

export function AiTitleGenerator() {
  return <AiGeneratorTool toolId="ai-title-generator" />;
}

export function KeywordClusteringTool() {
  return <AiGeneratorTool toolId="keyword-clustering-tool" />;
}

export function SchemaMarkupGenerator() {
  return <AiGeneratorTool toolId="schema-markup-generator" />;
}

export function FaqGenerator() {
  return <AiGeneratorTool toolId="faq-generator" />;
}

export function CommitMessageGenerator() {
  return <AiGeneratorTool toolId="commit-message-generator" />;
}

export function RegexExplainer() {
  return <AiGeneratorTool toolId="regex-explainer" />;
}

export function CurlCommandGenerator() {
  return <AiGeneratorTool toolId="curl-command-generator" />;
}

export function HashtagGenerator() {
  return <AiGeneratorTool toolId="hashtag-generator" />;
}

export function InstagramCaptionGenerator() {
  return <AiGeneratorTool toolId="instagram-caption-generator" />;
}

export function YoutubeDescriptionGenerator() {
  return <AiGeneratorTool toolId="youtube-description-generator" />;
}
