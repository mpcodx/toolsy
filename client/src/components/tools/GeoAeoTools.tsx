import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import {
  Copy,
  Download,
  Sparkles,
  Check,
  SearchCheck,
  MessageCircleQuestion,
  FilePenLine,
  TerminalSquare,
  AlertCircle,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Layers,
  CheckCircle2
} from "lucide-react";

// Helper for copying text with feedback
function CopyButton({ text, disabled }: { text: string; disabled: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      disabled={disabled || !text}
      className="transition-all duration-300"
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </>
      )}
    </Button>
  );
}

// -------------------------------------------------------------
// 1. GEO CONTENT OPTIMIZER
// -------------------------------------------------------------
export function GeoContentOptimizer() {
  const [inputText, setInputText] = useState("");
  const [optimizedText, setOptimizedText] = useState("");
  const [engine, setEngine] = useState("All Engines");
  const [focus, setFocus] = useState("Authoritative Citations");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState<string | null>(null);

  // Score metrics
  const [scores, setScores] = useState({
    citations: 0,
    evidence: 0,
    directAnswer: 0,
    structure: 0,
    readability: 0,
    total: 0
  });

  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Calculate GEO score based on heuristics
  useEffect(() => {
    if (!inputText.trim()) {
      setScores({ citations: 0, evidence: 0, directAnswer: 0, structure: 0, readability: 0, total: 0 });
      setRecommendations([
        "Paste or type content in the input box to analyze your GEO visibility score in real-time."
      ]);
      return;
    }

    const text = inputText.toLowerCase();

    // 1. Citations & Source Credibility (max 20)
    const citationKeywords = [
      "according to", "stated by", "reported by", "study by", "researchers at",
      "source:", "cited", "reference", "published in", "journal", "professor",
      "dr.", "phd", "university", "institute", "data from"
    ];
    let citationCount = 0;
    citationKeywords.forEach(kw => {
      const regex = new RegExp(kw, "g");
      const matches = text.match(regex);
      if (matches) citationCount += matches.length;
    });
    const hasLinks = text.includes("http") || text.includes("www") || text.includes(".org") || text.includes(".edu");
    const citationsScore = Math.min(20, (citationCount * 7) + (hasLinks ? 10 : 0));

    // 2. Information Density & Evidence (max 20)
    const numbersCount = (inputText.match(/\b\d+(?!\w)/g) || []).filter(n => n.length < 4 || (n !== "2024" && n !== "2025" && n !== "2026")).length;
    const percentagesCount = (text.match(/\d+%/g) || []).length;
    const yearsCount = (text.match(/\b(19|20)\d{2}\b/g) || []).length;
    const evidenceScore = Math.min(20, (numbersCount * 4) + (percentagesCount * 8) + (yearsCount * 8));

    // 3. Direct Answer Alignment (max 20)
    const definitionVerbs = ["is a", "are a", "refers to", "defined as", "denotes", "means", "is defined as"];
    const firstTwoSentences = inputText.split(/[.!?]+/).slice(0, 2).join(" ").toLowerCase();
    const hasDefinition = definitionVerbs.some(verb => firstTwoSentences.includes(verb));
    const directAnswerScore = hasDefinition ? 20 : 5;

    // 4. Structure & Scanability (max 20)
    const hasLists = inputText.includes("- ") || inputText.includes("* ") || text.match(/\n\d+\.\s/) !== null;
    const hasBolding = inputText.includes("**") || inputText.includes("__");
    const structureScore = (hasLists ? 10 : 0) + (hasBolding ? 10 : 0);

    // 5. Readability & Plain Language (max 20)
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = inputText.split(/\s+/).filter(w => w.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
    let readabilityScore = 5;
    if (avgSentenceLength > 0) {
      if (avgSentenceLength <= 14) readabilityScore = 20;
      else if (avgSentenceLength <= 18) readabilityScore = 17;
      else if (avgSentenceLength <= 24) readabilityScore = 13;
      else if (avgSentenceLength <= 30) readabilityScore = 8;
    }

    // Total score calculation
    const total = citationsScore + evidenceScore + directAnswerScore + structureScore + readabilityScore;

    setScores({
      citations: citationsScore,
      evidence: evidenceScore,
      directAnswer: directAnswerScore,
      structure: structureScore,
      readability: readabilityScore,
      total
    });

    // Generate recommendations list
    const recs: string[] = [];
    if (citationsScore < 15) {
      recs.push("Add authoritative sources or reference citations (e.g. 'According to studies by...') to increase credibility.");
    }
    if (evidenceScore < 15) {
      recs.push("Integrate statistical evidence, percentage values, or historical years to dense up the factual information.");
    }
    if (directAnswerScore < 15) {
      recs.push("Start your text with a direct, conversational assertion or definition of the primary term so AI models can easily summarize it.");
    }
    if (structureScore < 20) {
      recs.push("Use markdown bullet lists (e.g., '- ') or bold key technical phrases to enhance visual and cognitive scanability.");
    }
    if (readabilityScore < 15) {
      recs.push(`Shorten sentences (currently averaging ${Math.round(avgSentenceLength)} words/sentence). Aim for 12 to 18 words to boost AI comprehension.`);
    }

    if (recs.length === 0) {
      recs.push("Excellent! Your text incorporates all major Generative Engine Optimization ranking features.");
    }

    setRecommendations(recs);
  }, [inputText]);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to optimize.");
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
          toolId: "geo-content-optimizer",
          inputs: {
            text: inputText,
            engine,
            focus
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.output) {
        throw new Error(data.error || "Failed to generate optimized text.");
      }

      setOptimizedText(data.output);
      setProvider(data.provider || "openrouter");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while generating optimized text.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputText("");
    setOptimizedText("");
    setError("");
    setProvider(null);
  };

  // Determine score color class
  const getScoreColorClass = (val: number, max = 20) => {
    const pct = val / max;
    if (pct >= 0.8) return "bg-emerald-500 text-emerald-500";
    if (pct >= 0.5) return "bg-amber-500 text-amber-500";
    return "bg-rose-500 text-rose-500";
  };

  const getScoreBorderClass = (val: number, max = 20) => {
    const pct = val / max;
    if (pct >= 0.8) return "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400";
    if (pct >= 0.5) return "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400";
    return "border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400";
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="rounded-3xl border border-border bg-card/70 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              New: Search 2.0 Feature
            </span>
            <h2 className="mt-3 text-2xl font-display font-bold text-foreground">
              GEO Content Optimizer
            </h2>
            <p className="mt-3 text-sm md:text-base leading-7 text-muted-foreground">
              Generative Engine Optimization (GEO) is the practice of shaping your copy to be easily read, summarized, and cited by LLM search engines. Paste your copy below to receive an instant visibility score and optimize it with AI.
            </p>
          </div>
          <div className="rounded-2xl bg-accent/10 p-3 text-accent">
            <SearchCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <h4 className="font-display font-semibold text-sm text-foreground mb-1">Citation Matching</h4>
            <p className="text-xs text-muted-foreground">Adding credentials increases citation probabilities by 30-40% in AI models.</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <h4 className="font-display font-semibold text-sm text-foreground mb-1">Direct Assertions</h4>
            <p className="text-xs text-muted-foreground">Conversational agents prefer clear, definitions placed directly at the top of topics.</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <h4 className="font-display font-semibold text-sm text-foreground mb-1">Stat Density</h4>
            <p className="text-xs text-muted-foreground">LLMs search for hard empirical evidence when generating comparative summaries.</p>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        {/* Left Side: Input & Settings */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Source Content to Optimize
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your blog intro, product description, or landing page paragraph here to analyze its GEO score..."
              rows={10}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Target Search Engine
              </label>
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="All Engines">All Engines (Universal)</option>
                <option value="Gemini">Google Gemini / SGE</option>
                <option value="ChatGPT / SearchGPT">OpenAI SearchGPT</option>
                <option value="Perplexity">Perplexity AI</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Optimization Priority
              </label>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="Authoritative Citations">Authoritative Citations & Quotes</option>
                <option value="Direct Q&A Formatting">Direct Q&A Formatting</option>
                <option value="Data & Statistics Integration">Data & Statistics Integration</option>
                <option value="Tone & Readability">Tone & Comprehensibility</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Optimize with AI
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
              Reset
            </Button>
          </div>

          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-start">
              <AlertCircle className="mr-2 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Side: Score Card & Output */}
        <div className="space-y-6">
          {/* Real-time GEO Scorecard */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-display font-bold text-foreground mb-4 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-accent" />
              GEO Visibility Scorecard
            </h3>

            {/* Big Score Meter */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-muted">
                <span className="text-3xl font-display font-black text-foreground">
                  {scores.total}
                </span>
                <span className="absolute -bottom-2 text-[10px] font-semibold bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                  / 100
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">
                  {scores.total >= 80 ? "🔥 Excellent GEO Index" : scores.total >= 50 ? "⚡ Moderate GEO Optimization" : "⚠️ Needs Optimization"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Higher scores indicate standard writing structures that search LLMs prefer when citing sources in summaries.
                </p>
              </div>
            </div>

            {/* Score Breakdown Bars */}
            <div className="space-y-3">
              {[
                { label: "Citation & Trust", val: scores.citations, desc: "References, Dr/PhD, org/edu sites" },
                { label: "Data & Evidence Density", val: scores.evidence, desc: "Stats, percentages, specific numbers" },
                { label: "Direct Answer Focus", val: scores.directAnswer, desc: "Immediate terms definition ('is a')" },
                { label: "Structure & Scanability", val: scores.structure, desc: "Markdown bold, bullet points" },
                { label: "Readability (Short Sentences)", val: scores.readability, desc: "Comprehension limits per sentence" }
              ].map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-foreground">{item.label}</span>
                    <span className="text-muted-foreground">{item.val} / 20</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getScoreColorClass(item.val)}`}
                      style={{ width: `${(item.val / 20) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/80">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Real-time Suggestions List */}
            <div className="mt-6 border-t border-border pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                GEO Recommendations
              </h4>
              <ul className="space-y-2">
                {recommendations.map((rec, i) => (
                  <li key={i} className={`text-xs p-2 rounded-lg border ${scores.total === 0 ? "border-border/60 bg-transparent text-muted-foreground" : getScoreBorderClass(0, 1)} flex gap-2`}>
                    {scores.total > 0 && rec.startsWith("Excellent") ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-accent/80" />
                    )}
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Output Box */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                  Results
                </p>
                <h3 className="mt-2 text-xl font-display font-bold text-foreground">
                  Optimized Content
                </h3>
              </div>
              {provider && (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  {provider === "openrouter" ? "AI-enhanced" : "Local free draft"}
                </span>
              )}
            </div>

            <textarea
              value={optimizedText}
              readOnly
              placeholder="Your optimized text with source references, bold headers, and structured facts will appear here after clicking 'Optimize with AI'."
              rows={12}
              className="mt-5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
            />

            <div className="mt-5 flex flex-wrap gap-3">
              <CopyButton text={optimizedText} disabled={!optimizedText} />
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadBlob(new Blob([optimizedText], { type: "text/plain;charset=utf-8" }), "geo-optimized-content.txt")}
                disabled={!optimizedText}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. ANSWER ENGINE FAQ GENERATOR (AEO)
// -------------------------------------------------------------
export function AeoAnswerGenerator() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("Direct & Concise");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [output, setOutput] = useState("");
  const [provider, setProvider] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "schema">("text");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic or question.");
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
          toolId: "aeo-answer-generator",
          inputs: {
            topic,
            keywords,
            tone
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.output) {
        throw new Error(data.error || "Failed to generate AEO content.");
      }

      setOutput(data.output);
      setProvider(data.provider || "openrouter");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Extract Q&As from raw text output to construct JSON-LD
  const generateSchema = () => {
    if (!output) return "";
    
    // Parse Q: and A:
    const qaRegex = /(?:Q|Question|Q\d+):\s*([\s\S]+?)\n+(?:A|Answer|A\d+):\s*([\s\S]+?)(?=\n+(?:Q|Question|Q\d+):|$)/g;
    const faqs = [];
    let match;
    const cleanOutput = output.replace(/\r/g, "");
    
    while ((match = qaRegex.exec(cleanOutput)) !== null) {
      faqs.push({
        question: match[1].trim().replace(/\*\*|\*/g, ""),
        answer: match[2].trim().replace(/\*\*|\*/g, "")
      });
    }

    // Fallback if formatting is standard bullet lines
    if (faqs.length === 0) {
      const lines = cleanOutput.split("\n").filter(l => l.trim().length > 0);
      let currentQ = "";
      let currentA = "";
      for (const line of lines) {
        if (line.endsWith("?") || line.toLowerCase().startsWith("how") || line.toLowerCase().startsWith("what") || line.toLowerCase().startsWith("why")) {
          if (currentQ && currentA) {
            faqs.push({ question: currentQ, answer: currentA });
            currentA = "";
          }
          currentQ = line.replace(/^\d+\.\s+|^-\s+|^Q:\s*/i, "").trim();
        } else if (currentQ) {
          currentA += (currentA ? " " : "") + line.replace(/^A:\s*/i, "").trim();
        }
      }
      if (currentQ && currentA) {
        faqs.push({ question: currentQ, answer: currentA });
      }
    }

    if (faqs.length === 0) {
      // Stub if parsing failed
      faqs.push({
        question: `What is ${topic}?`,
        answer: output.split("\n").slice(0, 3).join(" ")
      });
    }

    const schemaObj = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer
        }
      }))
    };

    return JSON.stringify(schemaObj, null, 2);
  };

  const schemaCode = generateSchema();

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="rounded-3xl border border-border bg-card/70 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-500 dark:text-rose-400">
              Answer Engine Optimization
            </span>
            <h2 className="mt-3 text-2xl font-display font-bold text-foreground">
              Answer Engine FAQ Generator
            </h2>
            <p className="mt-3 text-sm md:text-base leading-7 text-muted-foreground">
              Create concise, direct Q&A sets formatted for conversational search summaries (Siri, Alexa, ChatGPT, Perplexity, Gemini). The tool automatically compiles an structured FAQ Page JSON-LD schema to deploy on your site.
            </p>
          </div>
          <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-500">
            <MessageCircleQuestion className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        {/* Left Side: Inputs */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Topic or Question
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., How does Generative Engine Optimization work?"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Supporting Keywords (Optional)
            </label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. GEO vs SEO, LLM search engine citation metrics, search visibility scores"
              rows={4}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              AEO Voice Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="Direct & Concise">Direct & Concise (Best for Voice Search)</option>
              <option value="Informative">Informative & Explanatory</option>
              <option value="Authoritative">Authoritative & Technical</option>
              <option value="Conversational">Conversational & Friendly</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loading ? "Generating..." : "Generate FAQ & Schema"}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setTopic(""); setKeywords(""); setOutput(""); }} disabled={loading}>
              Reset
            </Button>
          </div>

          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Right Side: Output Tabs */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex border-b border-border">
              <button
                className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "text" ? "border-accent text-accent" : "border-transparent text-muted-foreground"}`}
                onClick={() => setActiveTab("text")}
              >
                Q&A Answers Draft
              </button>
              <button
                className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "schema" ? "border-accent text-accent" : "border-transparent text-muted-foreground"}`}
                onClick={() => setActiveTab("schema")}
              >
                JSON-LD Schema
              </button>
            </div>
            {provider && (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                {provider === "openrouter" ? "AI-enhanced" : "Local free draft"}
              </span>
            )}
          </div>

          {activeTab === "text" ? (
            <div className="space-y-4">
              <textarea
                value={output}
                readOnly
                placeholder="The Q&A drafts designed to answer generative query searches will appear here..."
                rows={14}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex flex-wrap gap-3">
                <CopyButton text={output} disabled={!output} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadBlob(new Blob([output], { type: "text/plain;charset=utf-8" }), "aeo-faq-draft.txt")}
                  disabled={!output}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={schemaCode}
                readOnly
                placeholder="Schema code will generate automatically based on Q&As..."
                rows={14}
                className="w-full font-mono text-xs rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex flex-wrap gap-3">
                <CopyButton text={schemaCode} disabled={!schemaCode} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadBlob(new Blob([schemaCode], { type: "application/ld+json;charset=utf-8" }), "faq-schema.json")}
                  disabled={!schemaCode}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Schema
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Tip: Paste this JSON-LD schema in a <code>&lt;script type=&quot;application/ld+json&quot;&gt;</code> tag on your webpage. Search crawlers use this to construct FAQ highlights in search layouts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. BRAND MENTION OPTIMIZER
// -------------------------------------------------------------
export function BrandMentionOptimizer() {
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [niche, setNiche] = useState("");
  const [usp, setUsp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [output, setOutput] = useState("");
  const [provider, setProvider] = useState<string | null>(null);

  // Score metrics
  const [brandScore, setBrandScore] = useState(0);
  const [scoreList, setScoreList] = useState<{ label: string; val: number }[]>([]);

  useEffect(() => {
    if (!description.trim() && !brand.trim()) {
      setBrandScore(0);
      setScoreList([]);
      return;
    }

    const b = brand.toLowerCase().trim();
    const d = description.toLowerCase();
    const n = niche.toLowerCase().trim();
    const u = usp.toLowerCase().trim();

    // 1. Brand Prominence (max 20)
    const brandMatches = b ? (d.match(new RegExp(b, "g")) || []).length : 0;
    const firstSentenceHasBrand = b ? d.split(/[.!?]+/).slice(0, 1)[0].includes(b) : false;
    const prominence = Math.min(20, (brandMatches * 4) + (firstSentenceHasBrand ? 8 : 0));

    // 2. Niche Association (max 20)
    const hasNiche = n ? d.includes(n) : false;
    const categoryWords = ["software", "platform", "tool", "agency", "service", "company", "app", "startup", "provider"];
    const hasCategoryWord = categoryWords.some(w => d.includes(w));
    const association = (hasNiche ? 10 : 0) + (hasCategoryWord ? 10 : 0);

    // 3. USP Integration (max 20)
    const hasUsp = u ? d.includes(u) : false;
    const uspKeywords = ["features", "benefits", "helps you", "solves", "unlike", "unique", "compared to", "alternative"];
    const hasUspWord = uspKeywords.some(w => d.includes(w));
    const uspScore = (hasUsp ? 10 : 0) + (hasUspWord ? 10 : 0);

    // 4. plain explanations / readability (max 20)
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = description.split(/\s+/).filter(w => w.trim().length > 0);
    const avgLen = sentences.length > 0 ? words.length / sentences.length : 0;
    let readability = 5;
    if (avgLen > 0 && avgLen <= 22) readability = 20;
    else if (avgLen > 0 && avgLen <= 28) readability = 15;
    else if (avgLen > 0) readability = 10;

    // 5. Authority Signals (max 20)
    const authorityWords = ["founded in", "reviews", "ratings", "trusted", "secure", "best", "certified", "proven", "award"];
    const authorityCount = authorityWords.filter(w => d.includes(w)).length;
    const authority = Math.min(20, authorityCount * 5);

    const total = prominence + association + uspScore + readability + authority;
    setBrandScore(total);
    setScoreList([
      { label: "Brand Prominence", val: prominence },
      { label: "Category Association", val: association },
      { label: "USP Integration", val: uspScore },
      { label: "Text Readability", val: readability },
      { label: "Trust Signals", val: authority }
    ]);
  }, [description, brand, niche, usp]);

  const handleGenerate = async () => {
    if (!description.trim() || !brand.trim()) {
      setError("Brand name and Description are required.");
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
          toolId: "brand-mention-optimizer",
          inputs: {
            description,
            brand,
            niche,
            usp
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.output) {
        throw new Error(data.error || "Failed to generate.");
      }

      setOutput(data.output);
      setProvider(data.provider || "openrouter");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="rounded-3xl border border-border bg-card/70 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-500 dark:text-blue-400">
              Authority Optimization
            </span>
            <h2 className="mt-3 text-2xl font-display font-bold text-foreground">
              Brand Mention Optimizer
            </h2>
            <p className="mt-3 text-sm md:text-base leading-7 text-muted-foreground">
              Generative engines associate brands with specific query categories. By optimizing your bios, press pages, and listings to directly link your brand with industry terms and trust indicators, you increase the likelihood of appearing in comparative LLM summaries.
            </p>
          </div>
          <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-500">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Input Details */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Brand/Product Name
              </label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Toolsy"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Industry / Niche
              </label>
              <input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Free online utility tool hub"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Unique Selling Proposition (USP)
            </label>
            <input
              value={usp}
              onChange={(e) => setUsp(e.target.value)}
              placeholder="e.g. no signup required, secure client-side tools, completely free"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Current Description/Profile
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write or paste your brand profile, biography, or company description..."
              rows={6}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Optimize Brand Bio
            </Button>
            <Button type="button" variant="outline" onClick={() => { setBrand(""); setDescription(""); setNiche(""); setUsp(""); setOutput(""); }} disabled={loading}>
              Reset
            </Button>
          </div>

          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Scoring Card & Results */}
        <div className="space-y-6">
          {/* Brand Authority Meter */}
          {(brand || description) && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-base font-display font-bold text-foreground mb-4">
                Brand Authority Breakdown
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-2xl font-black text-accent">{brandScore} <span className="text-xs text-muted-foreground font-normal">/ 100</span></div>
                <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${brandScore}%` }} />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {scoreList.map(item => (
                  <div key={item.label} className="text-xs p-2 rounded-lg border border-border bg-secondary/10 flex justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.val}/20</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result Output */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-display font-bold text-foreground">
                Optimized Brand Bio
              </h3>
              {provider && (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  {provider === "openrouter" ? "AI-enhanced" : "Local free draft"}
                </span>
              )}
            </div>

            <textarea
              value={output}
              readOnly
              placeholder="Your optimized brand copy will generate here, introducing authoritative terms that link your brand with search category nodes..."
              rows={8}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
            />

            <div className="flex flex-wrap gap-3">
              <CopyButton text={output} disabled={!output} />
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadBlob(new Blob([output], { type: "text/plain;charset=utf-8" }), "brand-optimized.txt")}
                disabled={!output}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. SEARCH TO PROMPT CONVERTER
// -------------------------------------------------------------
export function LlmPromptToQuery() {
  const [prompt, setPrompt] = useState("");
  const [engine, setEngine] = useState("Google Search");
  const [depth, setDepth] = useState("Academic/Source Finder");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [output, setOutput] = useState("");
  const [provider, setProvider] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a research prompt.");
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
          toolId: "llm-prompt-to-query",
          inputs: {
            prompt,
            engine,
            depth
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.output) {
        throw new Error(data.error || "Failed to generate queries.");
      }

      setOutput(data.output);
      setProvider(data.provider || "openrouter");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="rounded-3xl border border-border bg-card/70 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
              Search Operators
            </span>
            <h2 className="mt-3 text-2xl font-display font-bold text-foreground">
              Search to Prompt Converter
            </h2>
            <p className="mt-3 text-sm md:text-base leading-7 text-muted-foreground">
              Generative content requires authoritative citations to satisfy search engines. Translate conversational questions into advanced search queries using precise filters (such as site, filetype, and logical operators) to quickly uncover research and citations.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-500/10 p-3 text-slate-600 dark:text-slate-400">
            <TerminalSquare className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Left Side: Inputs */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Conversational Prompt / Research Goal
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Find recent studies or reports on the impact of LLMs on traditional search engine traffic during 2024 and 2025."
              rows={5}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Search Engine
              </label>
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="Google Search">Google Search</option>
                <option value="Perplexity">Perplexity AI</option>
                <option value="Google Scholar">Google Scholar</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Query Style
              </label>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="Academic/Source Finder">Academic / PDF Finder</option>
                <option value="News & Trends">News & Trends (Recency focus)</option>
                <option value="Corporate/Industry Reports">Corporate Reports & PDFs</option>
                <option value="General Operators mix">General Advanced Mix</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Generate Search Queries
            </Button>
            <Button type="button" variant="outline" onClick={() => { setPrompt(""); setOutput(""); }} disabled={loading}>
              Reset
            </Button>
          </div>

          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Right Side: Output */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              Advanced Search Queries
            </h3>
            {provider && (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                {provider === "openrouter" ? "AI-enhanced" : "Local free draft"}
              </span>
            )}
          </div>

          <textarea
            value={output}
            readOnly
            placeholder="Your advanced search query strings using parameters like site:arxiv.org, filetype:pdf, before/after dates, and quotes will output here..."
            rows={13}
            className="w-full font-mono text-xs rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          <div className="flex flex-wrap gap-3">
            <CopyButton text={output} disabled={!output} />
            <Button
              type="button"
              variant="outline"
              onClick={() => downloadBlob(new Blob([output], { type: "text/plain;charset=utf-8" }), "search-queries.txt")}
              disabled={!output}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
