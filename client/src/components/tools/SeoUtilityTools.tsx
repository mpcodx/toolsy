import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { Copy, Download, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

function copyText(value: string) {
  return navigator.clipboard.writeText(value);
}

function downloadTextFile(
  contents: string,
  filename: string,
  type = "text/plain"
) {
  downloadBlob(new Blob([contents], { type }), filename);
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "of",
  "in",
  "on",
  "for",
  "to",
  "with",
  "at",
  "by",
  "from",
  "is",
  "are",
]);

function slugify(value: string, separator: string, removeStopWords: boolean) {
  const words = value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter(word => !removeStopWords || !STOP_WORDS.has(word));

  return words.join(separator);
}

function SlugGenerator() {
  const [input, setInput] = useState("10 Best SEO Tools for Beginners in 2026");
  const [separator, setSeparator] = useState("-");
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [maxLength, setMaxLength] = useState(75);

  const fullSlug = slugify(input, separator, removeStopWords);
  const trimmedSlug = fullSlug.slice(0, maxLength).replace(/-+$/, "");
  const underscoreSlug = slugify(input, "_", removeStopWords);
  const camelSlug = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Title or phrase
        </label>
        <textarea
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder="Paste a page title, blog headline, or phrase..."
          className="w-full h-24 p-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Separator
          </label>
          <select
            value={separator}
            onChange={event => setSeparator(event.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="-">Hyphen (-)</option>
            <option value="_">Underscore (_)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Max length: {maxLength}
          </label>
          <input
            type="range"
            min="20"
            max="120"
            step="5"
            value={maxLength}
            onChange={event => setMaxLength(Number(event.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer mt-3"
          />
        </div>

        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={removeStopWords}
              onChange={event => setRemoveStopWords(event.target.checked)}
              className="h-4 w-4"
            />
            Remove stop words (a, the, and...)
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: "SEO slug", value: fullSlug },
          { label: `Trimmed to ${maxLength} characters`, value: trimmedSlug },
          { label: "Underscore variant", value: underscoreSlug },
          { label: "camelCase variant", value: camelSlug },
        ].map(variant => (
          <div
            key={variant.label}
            className="rounded-lg border border-border bg-card/50 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {variant.label}
                </p>
                <p className="mt-1 font-mono text-sm text-foreground break-all">
                  {variant.value || "-"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyText(variant.value)}
                disabled={!variant.value}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenGraphTagGenerator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [type, setType] = useState("website");

  const escapeHtml = (value: string) => value.replace(/"/g, "&quot;");

  const tags = [
    title && `<meta property="og:title" content="${escapeHtml(title)}" />`,
    description &&
      `<meta property="og:description" content="${escapeHtml(description)}" />`,
    image && `<meta property="og:image" content="${escapeHtml(image)}" />`,
    url && `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="${type}" />`,
    siteName &&
      `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
  ].filter(Boolean) as string[];

  const output = tags.join("\n");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Title
          </label>
          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Page title for social sharing"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Page URL
          </label>
          <input
            value={url}
            onChange={event => setUrl(event.target.value)}
            placeholder="https://example.com/page"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Description
        </label>
        <textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="Short description shown when the page is shared"
          className="w-full h-24 p-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Image URL
          </label>
          <input
            value={image}
            onChange={event => setImage(event.target.value)}
            placeholder="https://example.com/share.jpg"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Site name
          </label>
          <input
            value={siteName}
            onChange={event => setSiteName(event.target.value)}
            placeholder="Your brand name"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Type
          </label>
          <select
            value={type}
            onChange={event => setType(event.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="website">website</option>
            <option value="article">article</option>
            <option value="product">product</option>
            <option value="video.other">video.other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Generated Open Graph tags
        </label>
        <textarea
          value={output}
          readOnly
          placeholder="Fill in the fields above to generate tags..."
          className="w-full h-40 p-4 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => copyText(output)}
          disabled={!output}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy tags
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => downloadTextFile(output, "open-graph-tags.html")}
          disabled={!output}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}

function TwitterCardGenerator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [siteHandle, setSiteHandle] = useState("");
  const [cardType, setCardType] = useState("summary_large_image");

  const escapeHtml = (value: string) => value.replace(/"/g, "&quot;");

  const tags = [
    `<meta name="twitter:card" content="${cardType}" />`,
    title && `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    description &&
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    image && `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    siteHandle &&
      `<meta name="twitter:site" content="${escapeHtml(siteHandle.startsWith("@") ? siteHandle : `@${siteHandle}`)}" />`,
  ].filter(Boolean) as string[];

  const output = tags.join("\n");

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Card type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "summary", label: "Summary" },
            { value: "summary_large_image", label: "Summary large image" },
          ].map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCardType(option.value)}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                cardType === option.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Title
          </label>
          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Card title"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            @ Site handle
          </label>
          <input
            value={siteHandle}
            onChange={event => setSiteHandle(event.target.value)}
            placeholder="yourbrand"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Description
        </label>
        <textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="Card description"
          className="w-full h-24 p-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Image URL
        </label>
        <input
          value={image}
          onChange={event => setImage(event.target.value)}
          placeholder="https://example.com/card.jpg"
          className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Generated Twitter Card tags
        </label>
        <textarea
          value={output}
          readOnly
          className="w-full h-36 p-4 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => copyText(output)}
          disabled={!output}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy tags
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => downloadTextFile(output, "twitter-card-tags.html")}
          disabled={!output}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}

interface FaqRow {
  question: string;
  answer: string;
}

function FaqSchemaGenerator() {
  const [rows, setRows] = useState<FaqRow[]>([
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);

  const updateRow = (index: number, field: keyof FaqRow, value: string) => {
    setRows(current =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () =>
    setRows(current => [...current, { question: "", answer: "" }]);
  const removeRow = (index: number) =>
    setRows(current => current.filter((_, rowIndex) => rowIndex !== index));

  const validRows = rows.filter(
    row => row.question.trim() && row.answer.trim()
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validRows.map(row => ({
      "@type": "Question",
      name: row.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: row.answer.trim(),
      },
    })),
  };

  const output = validRows.length ? JSON.stringify(schema, null, 2) : "";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-card/50 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Question {index + 1}
              </p>
              {rows.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(index)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              ) : null}
            </div>
            <input
              value={row.question}
              onChange={event =>
                updateRow(index, "question", event.target.value)
              }
              placeholder="e.g. Is this tool free to use?"
              className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <textarea
              value={row.answer}
              onChange={event => updateRow(index, "answer", event.target.value)}
              placeholder="Write a clear, direct answer..."
              className="w-full h-20 p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
            />
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addRow}>
        <Plus className="w-4 h-4 mr-2" />
        Add question
      </Button>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          FAQPage JSON-LD schema
        </label>
        <textarea
          value={output}
          readOnly
          placeholder="Fill in at least one question and answer to generate schema..."
          className="w-full h-56 p-4 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => copyText(output)}
          disabled={!output}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy JSON-LD
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            downloadTextFile(output, "faq-schema.json", "application/json")
          }
          disabled={!output}
        >
          <Download className="w-4 h-4 mr-2" />
          Download JSON
        </Button>
      </div>
    </div>
  );
}

function SerpSnippetPreviewTool() {
  const [title, setTitle] = useState("Free AI, SEO & Creator Tools | Toolsy");
  const [url, setUrl] = useState("https://www.toolsylab.xyz/");
  const [description, setDescription] = useState(
    "Free online AI, SEO, creator, developer, PDF, and video tools. No signup required."
  );

  const titleLimit = 60;
  const descriptionLimit = 155;

  const displayUrl = useMemo(() => {
    try {
      const parsed = new URL(url);
      return `${parsed.hostname}${parsed.pathname !== "/" ? parsed.pathname : ""}`;
    } catch {
      return url;
    }
  }, [url]);

  const counterClass = (length: number, limit: number) =>
    length > limit
      ? "text-destructive"
      : length > limit * 0.85
        ? "text-amber-500"
        : "text-muted-foreground";

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Page URL
        </label>
        <input
          value={url}
          onChange={event => setUrl(event.target.value)}
          placeholder="https://example.com/page"
          className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">
            Title tag
          </label>
          <span className={`text-xs ${counterClass(title.length, titleLimit)}`}>
            {title.length} / {titleLimit}
          </span>
        </div>
        <input
          value={title}
          onChange={event => setTitle(event.target.value)}
          className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">
            Meta description
          </label>
          <span
            className={`text-xs ${counterClass(description.length, descriptionLimit)}`}
          >
            {description.length} / {descriptionLimit}
          </span>
        </div>
        <textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          className="w-full h-24 p-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-3">
          Search result preview
        </p>
        <div className="rounded-lg border border-border bg-white p-5 font-sans">
          <div className="flex items-center gap-2 text-sm text-[#4d5156]">
            <div className="h-7 w-7 rounded-full bg-gray-200" />
            <span className="truncate">{displayUrl || "example.com"}</span>
          </div>
          <p className="mt-1 truncate text-xl text-[#1a0dab]">
            {title.slice(0, titleLimit) || "Your title tag preview"}
          </p>
          <p className="mt-1 text-sm leading-snug text-[#4d5156] line-clamp-2">
            {description.slice(0, descriptionLimit) ||
              "Your meta description preview appears here."}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/50 p-4 text-sm text-muted-foreground">
        <p>
          Google typically shows titles up to about {titleLimit} characters and
          descriptions up to about {descriptionLimit} characters before
          truncating with an ellipsis. Staying under the limit keeps your full
          message visible in search results.
        </p>
      </div>
    </div>
  );
}

interface RobotsRule {
  userAgent: string;
  disallow: string;
  allow: string;
}

function RobotsTxtGenerator() {
  const [siteUrl, setSiteUrl] = useState("https://example.com");
  const [rules, setRules] = useState<RobotsRule[]>([
    { userAgent: "*", disallow: "/admin/\n/private/", allow: "" },
  ]);
  const [crawlDelay, setCrawlDelay] = useState("");

  const updateRule = (
    index: number,
    field: keyof RobotsRule,
    value: string
  ) => {
    setRules(current =>
      current.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, [field]: value } : rule
      )
    );
  };

  const addRule = () =>
    setRules(current => [
      ...current,
      { userAgent: "*", disallow: "", allow: "" },
    ]);
  const removeRule = (index: number) =>
    setRules(current => current.filter((_, ruleIndex) => ruleIndex !== index));

  const sitemapUrl = siteUrl.trim()
    ? `${siteUrl.trim().replace(/\/+$/, "")}/sitemap.xml`
    : "";

  const output = [
    ...rules.flatMap(rule => {
      const lines = [`User-agent: ${rule.userAgent || "*"}`];
      rule.disallow
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .forEach(path => lines.push(`Disallow: ${path}`));
      rule.allow
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .forEach(path => lines.push(`Allow: ${path}`));
      if (crawlDelay.trim()) {
        lines.push(`Crawl-delay: ${crawlDelay.trim()}`);
      }
      return [...lines, ""];
    }),
    sitemapUrl && `Sitemap: ${sitemapUrl}`,
  ]
    .flat()
    .filter(line => line !== undefined)
    .join("\n")
    .trim();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Site URL
          </label>
          <input
            value={siteUrl}
            onChange={event => setSiteUrl(event.target.value)}
            placeholder="https://example.com"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Crawl-delay (optional, seconds)
          </label>
          <input
            value={crawlDelay}
            onChange={event => setCrawlDelay(event.target.value)}
            placeholder="e.g. 10"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-card/50 p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  User-agent
                </label>
                <input
                  value={rule.userAgent}
                  onChange={event =>
                    updateRule(index, "userAgent", event.target.value)
                  }
                  placeholder="*"
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              {rules.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(index)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              ) : null}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Disallow (one path per line)
                </label>
                <textarea
                  value={rule.disallow}
                  onChange={event =>
                    updateRule(index, "disallow", event.target.value)
                  }
                  placeholder="/admin/"
                  className="w-full h-20 p-2.5 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Allow (one path per line)
                </label>
                <textarea
                  value={rule.allow}
                  onChange={event =>
                    updateRule(index, "allow", event.target.value)
                  }
                  placeholder="/public/"
                  className="w-full h-20 p-2.5 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addRule}>
        <Plus className="w-4 h-4 mr-2" />
        Add rule group
      </Button>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          robots.txt output
        </label>
        <textarea
          value={output}
          readOnly
          className="w-full h-56 p-4 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => copyText(output)}
          disabled={!output}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy robots.txt
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => downloadTextFile(output, "robots.txt")}
          disabled={!output}
        >
          <Download className="w-4 h-4 mr-2" />
          Download robots.txt
        </Button>
      </div>
    </div>
  );
}

function WordCounter() {
  const [input, setInput] = useState("");

  const stats = useMemo(() => {
    const trimmed = input.trim();
    const words = trimmed ? trimmed.split(/\s+/) : [];
    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, "").length;
    const sentences = trimmed
      ? (trimmed.match(/[.!?]+(?=\s|$)/g)?.length ?? (trimmed ? 1 : 0))
      : 0;
    const paragraphs = trimmed
      ? trimmed.split(/\n+/).filter(line => line.trim()).length
      : 0;
    const readingTime = Math.max(1, Math.ceil(words.length / 200));
    const speakingTime = Math.max(1, Math.ceil(words.length / 130));

    const frequency = new Map<string, number>();
    words.forEach(word => {
      const normalized = word.toLowerCase().replace(/[^a-z0-9']/g, "");
      if (!normalized || STOP_WORDS.has(normalized) || normalized.length < 3)
        return;
      frequency.set(normalized, (frequency.get(normalized) ?? 0) + 1);
    });
    const topWords = Array.from(frequency.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8);

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
      topWords,
    };
  }, [input]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Your text
        </label>
        <textarea
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder="Paste or type your text to count words, characters, sentences, and reading time..."
          className="w-full h-56 p-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
        />
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Words", value: stats.words },
          { label: "Characters", value: stats.characters },
          { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
          { label: "Sentences", value: stats.sentences },
          { label: "Paragraphs", value: stats.paragraphs },
          { label: "Reading time", value: `${stats.readingTime} min` },
          { label: "Speaking time", value: `${stats.speakingTime} min` },
        ].map(item => (
          <div
            key={item.label}
            className="rounded-lg border border-border bg-card/50 p-4"
          >
            <p className="text-2xl font-display font-bold text-foreground">
              {item.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {stats.topWords.length ? (
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <h4 className="font-semibold text-foreground mb-3">
            Most repeated words
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.topWords.map(([word, count]) => (
              <span
                key={word}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
              >
                {word}{" "}
                <span className="text-foreground font-semibold">x{count}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => copyText(input)}
          disabled={!input}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy text
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => downloadTextFile(input, "word-counter-text.txt")}
          disabled={!input}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}

function UtmLinkBuilder() {
  const [baseUrl, setBaseUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");

  const output = useMemo(() => {
    if (!baseUrl.trim()) return "";
    try {
      const url = new URL(baseUrl.trim());
      if (source.trim()) url.searchParams.set("utm_source", source.trim());
      if (medium.trim()) url.searchParams.set("utm_medium", medium.trim());
      if (campaign.trim())
        url.searchParams.set("utm_campaign", campaign.trim());
      if (term.trim()) url.searchParams.set("utm_term", term.trim());
      if (content.trim()) url.searchParams.set("utm_content", content.trim());
      return url.toString();
    } catch {
      return "";
    }
  }, [baseUrl, source, medium, campaign, term, content]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Website URL
        </label>
        <input
          value={baseUrl}
          onChange={event => setBaseUrl(event.target.value)}
          placeholder="https://example.com/landing-page"
          className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Campaign source{" "}
            <span className="text-muted-foreground font-normal">
              (utm_source)
            </span>
          </label>
          <input
            value={source}
            onChange={event => setSource(event.target.value)}
            placeholder="newsletter, twitter, google"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Campaign medium{" "}
            <span className="text-muted-foreground font-normal">
              (utm_medium)
            </span>
          </label>
          <input
            value={medium}
            onChange={event => setMedium(event.target.value)}
            placeholder="email, cpc, social"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Campaign name{" "}
            <span className="text-muted-foreground font-normal">
              (utm_campaign)
            </span>
          </label>
          <input
            value={campaign}
            onChange={event => setCampaign(event.target.value)}
            placeholder="spring_sale"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Campaign term{" "}
            <span className="text-muted-foreground font-normal">
              (utm_term, optional)
            </span>
          </label>
          <input
            value={term}
            onChange={event => setTerm(event.target.value)}
            placeholder="running shoes"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Campaign content{" "}
            <span className="text-muted-foreground font-normal">
              (utm_content, optional)
            </span>
          </label>
          <input
            value={content}
            onChange={event => setContent(event.target.value)}
            placeholder="header_link"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Generated campaign URL
        </label>
        <textarea
          value={output}
          readOnly
          placeholder="Enter a valid website URL to build your tracking link..."
          className="w-full h-24 p-4 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => copyText(output)}
          disabled={!output}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy link
        </Button>
      </div>
    </div>
  );
}

export {
  FaqSchemaGenerator,
  OpenGraphTagGenerator,
  RobotsTxtGenerator,
  SerpSnippetPreviewTool,
  SlugGenerator,
  TwitterCardGenerator,
  UtmLinkBuilder,
  WordCounter,
};
