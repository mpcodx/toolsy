import type { Request, Response } from "express";

type SupportedToolId =
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

type ToolInputs = Record<string, string>;

const SUPPORTED_TOOL_IDS = new Set<SupportedToolId>([
  "ai-meta-generator",
  "ai-paragraph-rewriter",
  "ai-title-generator",
  "keyword-clustering-tool",
  "schema-markup-generator",
  "faq-generator",
  "commit-message-generator",
  "regex-explainer",
  "curl-command-generator",
  "hashtag-generator",
  "instagram-caption-generator",
  "youtube-description-generator",
]);

const LOCAL_ONLY_TOOL_IDS = new Set<SupportedToolId>([
  "schema-markup-generator",
  "curl-command-generator",
]);

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeInputs(value: unknown): ToolInputs {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<ToolInputs>((result, [key, raw]) => {
    result[key] = getString(raw);
    return result;
  }, {});
}

function sentenceCase(value: string) {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitList(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function trimToLength(value: string, limit: number) {
  if (value.length <= limit) {
    return value;
  }

  const trimmed = value.slice(0, limit - 1);
  const cutAt = trimmed.lastIndexOf(" ");
  return `${(cutAt > 20 ? trimmed.slice(0, cutAt) : trimmed).trim()}…`;
}

function importantKeyword(keywords: string[]) {
  return keywords[0] || "";
}

function buildMetaOptions(inputs: ToolInputs) {
  const topic = inputs.topic || "your page";
  const keywords = splitList(inputs.keywords);
  const audience = inputs.audience || "searchers";
  const tone = (inputs.tone || "Clear").toLowerCase();
  const primaryKeyword = importantKeyword(keywords) || topic;

  const titlePatterns = [
    `${titleCase(primaryKeyword)} for ${titleCase(audience)}`,
    `${titleCase(primaryKeyword)}: Fast ${titleCase(topic)}`,
    `Free ${titleCase(primaryKeyword)} Tool`,
    `${titleCase(topic)} Made Simpler`,
    `${titleCase(primaryKeyword)} Without Signup`,
  ];

  const descriptionPatterns = [
    `Create ${topic} faster with a free tool built for ${audience}. Generate clearer metadata and ship pages with less guesswork.`,
    `Use this free tool to turn ${topic} ideas into SEO-ready titles and descriptions for ${audience}. No signup required.`,
    `Generate better metadata for ${topic} using target keywords, audience cues, and a ${tone} tone that is easier to publish.`,
    `Build sharper meta titles and descriptions for ${topic}. Great for ${audience} who need faster SEO drafts.`,
    `Draft search-friendly metadata for ${topic} in a few seconds. Add keywords, choose a tone, and copy the best option.`,
  ];

  return titlePatterns
    .map((title, index) => ({
      title: trimToLength(title, 60),
      description: trimToLength(descriptionPatterns[index], 160),
      slug: `/${slugify(primaryKeyword || topic)}`,
    }))
    .map(
      (option, index) =>
        `Option ${index + 1}\nTitle: ${option.title}\nDescription: ${option.description}\nSuggested slug: ${option.slug}`
    )
    .join("\n\n");
}

function buildParagraphRewrite(inputs: ToolInputs) {
  const source = inputs.text.replace(/\s+/g, " ").trim();
  const tone = inputs.tone || "Professional";
  const goal = inputs.goal || "Improve clarity";
  const sentences = source
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const draft =
    tone === "Concise"
      ? sentences.slice(0, Math.min(3, sentences.length)).join(" ")
      : sentences.join(" ");

  const refined = sentenceCase(draft)
    .replace(/\bvery\b/gi, "")
    .replace(/\breally\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return [
    `Tone: ${tone}`,
    `Goal: ${goal}`,
    "",
    refined || source,
  ].join("\n");
}

function buildTitleIdeas(inputs: ToolInputs) {
  const topic = inputs.topic || "your topic";
  const audience = inputs.audience || "your audience";
  const tone = inputs.tone || "SEO";
  const count = Number.parseInt(inputs.count || "10", 10);

  const templates = [
    `${titleCase(topic)} for ${titleCase(audience)}`,
    `${titleCase(topic)}: A ${tone} Guide`,
    `How to Use ${titleCase(topic)} Without Guesswork`,
    `${titleCase(topic)} That Actually Saves Time`,
    `${titleCase(topic)} Ideas for ${titleCase(audience)}`,
    `The Smarter Way to Handle ${titleCase(topic)}`,
    `${titleCase(topic)} Explained Simply`,
    `Best ${titleCase(topic)} Tips for ${titleCase(audience)}`,
    `Why ${titleCase(topic)} Matters Right Now`,
    `${titleCase(topic)} Playbook for Faster Results`,
    `A Practical ${titleCase(topic)} Workflow`,
    `${titleCase(topic)} Mistakes to Avoid`,
    `${titleCase(topic)} in Plain English`,
    `${titleCase(topic)} for Lean Teams`,
    `What ${titleCase(audience)} Should Know About ${titleCase(topic)}`,
  ];

  return templates
    .slice(0, Number.isFinite(count) ? count : 10)
    .map((title, index) => `${index + 1}. ${title}`)
    .join("\n");
}

function chooseClusterName(keyword: string, fallback: string) {
  const stopWords = new Set([
    "a",
    "an",
    "and",
    "for",
    "how",
    "in",
    "of",
    "on",
    "the",
    "to",
    "with",
  ]);

  const tokens = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token && !stopWords.has(token));

  return titleCase(tokens.slice(0, 2).join(" ") || fallback || "General");
}

function buildKeywordClusters(inputs: ToolInputs) {
  const keywords = splitList(inputs.keywords);
  const fallbackTopic = inputs.topic || "General";
  const clusters = new Map<string, string[]>();

  keywords.forEach((keyword) => {
    const clusterName = chooseClusterName(keyword, fallbackTopic);
    const current = clusters.get(clusterName) || [];
    current.push(keyword);
    clusters.set(clusterName, current);
  });

  return Array.from(clusters.entries())
    .sort((left, right) => right[1].length - left[1].length)
    .map(([cluster, items], index) => {
      const lines = items.map((item) => `- ${item}`).join("\n");
      return `Cluster ${index + 1}: ${cluster}\n${lines}`;
    })
    .join("\n\n");
}

function buildSchemaMarkup(inputs: ToolInputs) {
  const schemaType = inputs.schemaType || "SoftwareApplication";
  const name = inputs.name || "Tool";
  const url = inputs.url || "https://example.com";
  const description = inputs.description || "Free online tool.";
  const brand = inputs.brand || "Toolsy";

  let schema: Record<string, unknown>;

  if (schemaType === "Article") {
    schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: name,
      description,
      author: {
        "@type": "Organization",
        name: brand,
      },
      publisher: {
        "@type": "Organization",
        name: brand,
      },
      mainEntityOfPage: url,
    };
  } else if (schemaType === "FAQPage") {
    schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What is ${name}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: description,
          },
        },
      ],
    };
  } else if (schemaType === "Product") {
    schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name,
      description,
      brand: {
        "@type": "Brand",
        name: brand,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url,
      },
    };
  } else if (schemaType === "LocalBusiness") {
    schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name,
      url,
      description,
      brand: {
        "@type": "Brand",
        name: brand,
      },
    };
  } else {
    schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name,
      url,
      description,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: {
        "@type": "Organization",
        name: brand,
      },
    };
  }

  return JSON.stringify(schema, null, 2);
}

function buildFaqDraft(inputs: ToolInputs) {
  const topic = inputs.topic || "this tool";
  const keywords = splitList(inputs.keywords);
  const audience = inputs.audience || "users";
  const count = Number.parseInt(inputs.count || "6", 10);
  const seedTerms = keywords.length ? keywords : [topic, `${topic} online`, `free ${topic}`];

  const questions = [
    `What is ${topic}?`,
    `How does ${topic} work?`,
    `Is ${topic} free to use?`,
    `Who should use ${topic}?`,
    `What inputs does ${topic} support?`,
    `What output can I expect from ${topic}?`,
    `Why is ${topic} useful for ${audience}?`,
    `Can ${topic} help with ${seedTerms[0]}?`,
  ];

  return questions
    .slice(0, Number.isFinite(count) ? count : 6)
    .map((question, index) => {
      const keyword = seedTerms[index % seedTerms.length];
      return `Q${index + 1}. ${question}\nA${index + 1}. ${sentenceCase(
        `${topic} helps ${audience} handle ${keyword} faster with a simpler workflow and clearer output.`
      )}`;
    })
    .join("\n\n");
}

function buildCommitMessage(inputs: ToolInputs) {
  const type = inputs.type || "feat";
  const scope = inputs.scope ? `(${slugify(inputs.scope)})` : "";
  const summaryLine = splitLines(inputs.summary)[0] || "update project files";
  const bodyLines = splitLines(inputs.summary).slice(1);
  const header = `${type}${scope}: ${summaryLine.charAt(0).toLowerCase()}${summaryLine.slice(1)}`;

  if (bodyLines.length === 0) {
    return header;
  }

  return [header, "", ...bodyLines.map((line) => `- ${line}`)].join("\n");
}

function tokenizeRegex(pattern: string) {
  const tokens: string[] = [];

  for (let index = 0; index < pattern.length; index += 1) {
    const current = pattern[index];

    if (current === "\\") {
      tokens.push(pattern.slice(index, index + 2));
      index += 1;
      continue;
    }

    if (current === "[") {
      const end = pattern.indexOf("]", index);
      if (end !== -1) {
        tokens.push(pattern.slice(index, end + 1));
        index = end;
        continue;
      }
    }

    if (current === "{") {
      const end = pattern.indexOf("}", index);
      if (end !== -1) {
        tokens.push(pattern.slice(index, end + 1));
        index = end;
        continue;
      }
    }

    tokens.push(current);
  }

  return tokens;
}

function explainRegexToken(token: string) {
  const exactMap: Record<string, string> = {
    "^": "Start of the string or line.",
    "$": "End of the string or line.",
    ".": "Any single character except a newline in many regex engines.",
    "*": "Repeat the previous token zero or more times.",
    "+": "Repeat the previous token one or more times.",
    "?": "Make the previous token optional or switch a group into a non-greedy form in some cases.",
    "|": "Match the token on the left or the token on the right.",
    "(": "Start of a capture group.",
    ")": "End of a capture group.",
    "\\d": "Any digit from 0 to 9.",
    "\\D": "Any non-digit character.",
    "\\w": "Any word character such as a letter, number, or underscore.",
    "\\W": "Any non-word character.",
    "\\s": "Whitespace such as spaces, tabs, or line breaks.",
    "\\S": "Any non-whitespace character.",
  };

  if (exactMap[token]) {
    return exactMap[token];
  }

  if (token.startsWith("[") && token.endsWith("]")) {
    return `Character class that matches one character from ${token}.`;
  }

  if (token.startsWith("{") && token.endsWith("}")) {
    return `Quantifier that controls how many times the previous token can repeat: ${token}.`;
  }

  if (token.startsWith("\\")) {
    return `Escaped token ${token}.`;
  }

  return `Literal token "${token}".`;
}

function buildRegexExplanation(inputs: ToolInputs) {
  const pattern = inputs.pattern || "";
  const sample = inputs.sample;
  const flavor = inputs.flavor || "General";
  const tokens = tokenizeRegex(pattern);

  return [
    `Regex flavor: ${flavor}`,
    `Pattern: ${pattern}`,
    sample ? `Sample text: ${sample}` : "",
    "",
    "Token breakdown:",
    ...tokens.map((token, index) => `${index + 1}. ${token} -> ${explainRegexToken(token)}`),
  ]
    .filter(Boolean)
    .join("\n");
}

function escapeSingleQuotes(value: string) {
  return value.replace(/'/g, `'\\''`);
}

function buildCurlCommand(inputs: ToolInputs) {
  const method = inputs.method || "POST";
  const url = inputs.url || "https://api.example.com";
  const headers = splitLines(inputs.headers);
  const body = inputs.body.trim();
  const parts = [`curl -X ${method} '${escapeSingleQuotes(url)}'`];

  headers.forEach((header) => {
    parts.push(`  -H '${escapeSingleQuotes(header)}'`);
  });

  if (body) {
    parts.push(`  --data-raw '${escapeSingleQuotes(body)}'`);
  }

  return parts.join(" \\\n");
}

function buildHashtags(inputs: ToolInputs) {
  const topic = inputs.topic || "content";
  const platform = inputs.platform || "Instagram";
  const brand = inputs.brand ? `#${slugify(inputs.brand).replace(/-/g, "")}` : "";
  const keywords = splitList(inputs.keywords);
  const topicToken = slugify(topic).replace(/-/g, "");
  const baseTags = [
    `#${topicToken}`,
    `#${topicToken}tips`,
    `#${topicToken}ideas`,
    `#${platform.toLowerCase().replace(/\s+/g, "")}`,
    "#digitalmarketing",
    "#contentcreation",
    "#growthmarketing",
  ];

  const keywordTags = keywords.map((keyword) => `#${slugify(keyword).replace(/-/g, "")}`);
  const tags = Array.from(new Set([...baseTags, ...keywordTags, brand].filter(Boolean)));

  return [
    "Core hashtags:",
    tags.slice(0, 10).join(" "),
    "",
    "Niche hashtags:",
    tags.slice(10, 20).join(" ") || tags.slice(0, 8).join(" "),
  ].join("\n");
}

function buildInstagramCaption(inputs: ToolInputs) {
  const topic = inputs.topic || "your post";
  const offer = inputs.offer || `A quick update about ${topic}.`;
  const cta = inputs.cta || "Save this post for later.";
  const tone = inputs.tone || "Friendly";

  return [
    `${tone} hook: ${sentenceCase(`If ${topic} feels harder than it should, this helps.`)}`,
    "",
    sentenceCase(offer),
    "",
    sentenceCase(cta),
    "",
    "Suggested closing hashtags:",
    buildHashtags({
      topic,
      keywords: topic,
      platform: "Instagram",
      brand: "",
    }),
  ].join("\n");
}

function buildYoutubeDescription(inputs: ToolInputs) {
  const title = inputs.title || "Untitled video";
  const summary = inputs.summary || "This video explains the topic clearly.";
  const cta = inputs.cta || "Subscribe for more videos like this.";
  const keywords = splitList(inputs.keywords);

  return [
    title,
    "",
    sentenceCase(summary),
    "",
    keywords.length ? `Topics covered: ${keywords.join(", ")}` : "",
    "",
    sentenceCase(cta),
    "",
    "Hashtags:",
    buildHashtags({
      topic: title,
      keywords: keywords.join(", "),
      platform: "YouTube Shorts",
      brand: "",
    }),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildFallback(toolId: SupportedToolId, inputs: ToolInputs) {
  switch (toolId) {
    case "ai-meta-generator":
      return buildMetaOptions(inputs);
    case "ai-paragraph-rewriter":
      return buildParagraphRewrite(inputs);
    case "ai-title-generator":
      return buildTitleIdeas(inputs);
    case "keyword-clustering-tool":
      return buildKeywordClusters(inputs);
    case "schema-markup-generator":
      return buildSchemaMarkup(inputs);
    case "faq-generator":
      return buildFaqDraft(inputs);
    case "commit-message-generator":
      return buildCommitMessage(inputs);
    case "regex-explainer":
      return buildRegexExplanation(inputs);
    case "curl-command-generator":
      return buildCurlCommand(inputs);
    case "hashtag-generator":
      return buildHashtags(inputs);
    case "instagram-caption-generator":
      return buildInstagramCaption(inputs);
    case "youtube-description-generator":
      return buildYoutubeDescription(inputs);
    default:
      return "This tool is not supported.";
  }
}

function buildPrompt(toolId: SupportedToolId, inputs: ToolInputs) {
  const fallback = buildFallback(toolId, inputs);
  const inputSummary = JSON.stringify(inputs, null, 2);

  switch (toolId) {
    case "ai-meta-generator":
      return {
        system:
          "You are an SEO copywriter. Return plain text only. Generate 5 title and meta description pairs. Keep titles under 60 characters and descriptions under 160 characters.",
        user: `Inputs:\n${inputSummary}\n\nUse this local draft as a baseline and improve it:\n${fallback}`,
      };
    case "ai-paragraph-rewriter":
      return {
        system:
          "You rewrite text while preserving the core meaning. Return only the rewritten draft in plain text.",
        user: `Inputs:\n${inputSummary}\n\nBaseline draft:\n${fallback}`,
      };
    case "ai-title-generator":
      return {
        system:
          "You generate compelling titles for web content. Return a numbered list in plain text only.",
        user: `Inputs:\n${inputSummary}\n\nBaseline ideas:\n${fallback}`,
      };
    case "keyword-clustering-tool":
      return {
        system:
          "You cluster SEO keywords into logical content groups. Return plain text only with cluster names and bullet lists.",
        user: `Inputs:\n${inputSummary}\n\nBaseline clustering:\n${fallback}`,
      };
    case "faq-generator":
      return {
        system:
          "You write SEO-friendly FAQ content. Return plain text only with clear Q and A formatting.",
        user: `Inputs:\n${inputSummary}\n\nBaseline FAQ draft:\n${fallback}`,
      };
    case "commit-message-generator":
      return {
        system:
          "You write crisp conventional commit messages. Return plain text only. Keep the header concise and professional.",
        user: `Inputs:\n${inputSummary}\n\nBaseline commit draft:\n${fallback}`,
      };
    case "regex-explainer":
      return {
        system:
          "You explain regular expressions in clear plain English. Return plain text only and keep the explanation easy to scan.",
        user: `Inputs:\n${inputSummary}\n\nBaseline explanation:\n${fallback}`,
      };
    case "hashtag-generator":
      return {
        system:
          "You create social media hashtag sets. Return plain text only and group hashtags by intent.",
        user: `Inputs:\n${inputSummary}\n\nBaseline hashtag set:\n${fallback}`,
      };
    case "instagram-caption-generator":
      return {
        system:
          "You write Instagram captions with a hook, body, CTA, and hashtags. Return plain text only.",
        user: `Inputs:\n${inputSummary}\n\nBaseline caption:\n${fallback}`,
      };
    case "youtube-description-generator":
      return {
        system:
          "You write keyword-aware YouTube descriptions. Return plain text only with clear spacing and a CTA.",
        user: `Inputs:\n${inputSummary}\n\nBaseline description:\n${fallback}`,
      };
    default:
      return {
        system: "You are a helpful assistant. Return plain text only.",
        user: `Inputs:\n${inputSummary}\n\nBaseline output:\n${fallback}`,
      };
  }
}

async function callOpenRouter(toolId: SupportedToolId, inputs: ToolInputs) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || LOCAL_ONLY_TOOL_IDS.has(toolId)) {
    return null;
  }

  const { system, user } = buildPrompt(toolId, inputs);
  const referer = process.env.PUBLIC_SITE_URL || "http://localhost:3000";
  const model = process.env.OPENROUTER_MODEL;

  const payload: Record<string, unknown> = {
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: user,
      },
    ],
    temperature: 0.4,
  };

  if (model) {
    payload.model = model;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": referer,
      "X-Title": "Toolsy",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "OpenRouter request failed.");
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  return content || null;
}

export async function handleAiGenerateRoute(req: Request, res: Response) {
  const toolId = getString(req.body?.toolId) as SupportedToolId;
  const inputs = normalizeInputs(req.body?.inputs);

  if (!SUPPORTED_TOOL_IDS.has(toolId)) {
    res.status(400).json({ error: "Unsupported tool ID." });
    return;
  }

  try {
    const aiOutput = await callOpenRouter(toolId, inputs);

    if (aiOutput) {
      res.json({
        output: aiOutput,
        provider: "openrouter",
      });
      return;
    }

    res.json({
      output: buildFallback(toolId, inputs),
      provider: "fallback",
    });
  } catch (error) {
    console.error("/api/ai/generate failed:", error);

    res.json({
      output: buildFallback(toolId, inputs),
      provider: "fallback",
    });
  }
}
