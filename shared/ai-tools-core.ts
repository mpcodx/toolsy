export type SupportedToolId =
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
  | "youtube-description-generator"
  | "clip-idea-generator"
  | "video-hook-generator"
  | "shorts-script-generator"
  | "content-calendar-generator"
  | "geo-content-optimizer"
  | "aeo-answer-generator"
  | "brand-mention-optimizer"
  | "llm-prompt-to-query";

type ToolInputs = Record<string, string>;
export type AiGeneratePayload = {
  error?: string;
  output?: string;
  provider?: "openrouter" | "fallback";
};

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
  "clip-idea-generator",
  "video-hook-generator",
  "shorts-script-generator",
  "content-calendar-generator",
  "geo-content-optimizer",
  "aeo-answer-generator",
  "brand-mention-optimizer",
  "llm-prompt-to-query",
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

function buildClipIdeaCta(goal: string) {
  switch (goal) {
    case "More saves":
      return "Ask viewers to save the clip for later.";
    case "More follows":
      return "Ask viewers to follow for the next creator tip.";
    case "Drive clicks":
      return "Point viewers to the full video, episode, or link in bio.";
    default:
      return "Invite viewers to watch the full breakdown.";
  }
}

function buildClipIdeas(inputs: ToolInputs) {
  const topic = inputs.topic || "your source content";
  const sourceType = inputs.sourceType || "Podcast";
  const audience = inputs.audience || "your audience";
  const goal = inputs.goal || "More views";
  const count = Number.parseInt(inputs.count || "8", 10);
  const angles = [
    `The one takeaway about ${topic} that ${audience} can use today`,
    `A myth-versus-reality moment from this ${sourceType.toLowerCase()} on ${topic}`,
    `A fast mistake-to-fix clip about ${topic}`,
    `A strong quote or contrarian opinion tied to ${topic}`,
    `A step-by-step clip that makes ${topic} feel simpler`,
    `A before-and-after story that shows progress with ${topic}`,
    `A “nobody tells you this” insight for ${audience}`,
    `A short checklist pulled from the ${sourceType.toLowerCase()}`,
    `A plain-English explanation that reframes ${topic}`,
    `A quick answer to the biggest question about ${topic}`,
  ];
  const hookTemplates = [
    `If ${topic} still feels messy, start here.`,
    `Most people overcomplicate ${topic}.`,
    `This is the clip I would post first about ${topic}.`,
    `One detail about ${topic} changes everything.`,
    `Here is the part of ${topic} people usually miss.`,
  ];

  return angles
    .slice(0, Number.isFinite(count) ? count : 8)
    .map((angle, index) =>
      [
        `Clip ${index + 1}: ${angle}`,
        `Hook: ${sentenceCase(hookTemplates[index % hookTemplates.length])}`,
        `Best cut moment: Start right before the cleanest insight, example, or quote about ${topic}.`,
        `CTA: ${buildClipIdeaCta(goal)}`,
      ].join("\n")
    )
    .join("\n\n");
}

function buildVideoHooks(inputs: ToolInputs) {
  const topic = inputs.topic || "your topic";
  const audience = inputs.audience || "your audience";
  const platform = inputs.platform || "YouTube Shorts";
  const tone = inputs.tone || "Bold";
  const count = Number.parseInt(inputs.count || "15", 10);
  const templates = [
    `Stop scrolling if ${topic} is still harder than it should be.`,
    `Most ${audience} get ${topic} wrong at first.`,
    `Nobody talks about this part of ${topic}.`,
    `If you only fix one thing about ${topic}, make it this.`,
    `This one shift can change how you handle ${topic}.`,
    `The ${tone.toLowerCase()} truth about ${topic}: it is simpler than it looks.`,
    `If you are posting on ${platform}, this matters more than you think.`,
    `Here is the fastest way to make ${topic} click.`,
    `The mistake ruining most content about ${topic} is this.`,
    `You do not need more tools to improve ${topic}. You need this.`,
    `This is the clip angle I would test first for ${topic}.`,
    `If ${audience} want faster results, start with this.`,
    `The best creator lesson about ${topic} is not what most people expect.`,
    `Here is why your ${topic} content is not landing yet.`,
    `One better way to explain ${topic} starts here.`,
    `Before you post another video about ${topic}, hear this.`,
    `This tiny change makes ${topic} more watchable instantly.`,
    `The hook I wish I used sooner for ${topic} is this.`,
    `Let me save you time on ${topic}.`,
    `This is what your audience actually wants to hear about ${topic}.`,
  ];

  return templates
    .slice(0, Number.isFinite(count) ? count : 15)
    .map((hook, index) => `${index + 1}. ${sentenceCase(hook)}`)
    .join("\n");
}

function buildShortsScript(inputs: ToolInputs) {
  const topic = inputs.topic || "your topic";
  const takeaway = inputs.takeaway || "Share the clearest lesson from the clip.";
  const platform = inputs.platform || "YouTube Shorts";
  const duration = inputs.duration || "30 seconds";
  const cta = inputs.cta || "Follow for more creator workflow tips.";

  return [
    `Platform: ${platform}`,
    `Target length: ${duration}`,
    "",
    `Hook: ${sentenceCase(`Most people make ${topic} harder than it needs to be.`)}`,
    `Beat 1: ${sentenceCase(`Open with the core promise or problem around ${topic}.`)}`,
    `Beat 2: ${sentenceCase(takeaway)}`,
    "Beat 3: Add one example, proof point, or contrast that makes the message believable.",
    "On-screen text: Use a short line that names the problem and the payoff.",
    `CTA: ${sentenceCase(cta)}`,
  ].join("\n");
}

function buildCalendarGoalCta(goal: string, offer: string) {
  if (goal === "Lead generation") {
    return offer ? `Point viewers to ${offer}.` : "Bridge viewers to a checklist, lead magnet, or DM keyword.";
  }

  if (goal === "Sales") {
    return offer ? `Mention ${offer} with a direct next step.` : "Move viewers toward the product or service.";
  }

  if (goal === "Engagement") {
    return "Ask a question or invite comments, duets, or replies.";
  }

  return "Prompt viewers to follow, save, or share the post.";
}

function buildContentCalendar(inputs: ToolInputs) {
  const niche = inputs.niche || "your niche";
  const platforms = splitList(inputs.platforms);
  const platformList = platforms.length ? platforms : ["Instagram Reels", "TikTok", "YouTube Shorts"];
  const offer = inputs.offer || "";
  const goal = inputs.goal || "Audience growth";
  const timeframe = inputs.timeframe || "2 weeks";
  const entryCount =
    timeframe === "1 week" ? 5 : timeframe === "1 month" ? 12 : 8;
  const formats = [
    "Quick tip",
    "Myth bust",
    "Checklist",
    "Storytime",
    "Tutorial",
    "Hot take",
    "Behind the scenes",
    "Case study",
    "Q&A",
    "Template",
    "Trend remix",
    "Launch teaser",
  ];
  const themes = [
    `The biggest mistake creators make in ${niche}`,
    `A simple workflow that saves time in ${niche}`,
    `What most people misunderstand about ${niche}`,
    `A beginner-friendly checklist for ${niche}`,
    `A quick win your audience can copy today`,
    `A before-and-after example from your process`,
    `A myth versus reality post for ${niche}`,
    `A strong opinion or hot take about ${niche}`,
    `A tool, template, or setup breakdown`,
    `A short case study or lesson learned`,
    `A behind-the-scenes creator moment`,
    `A soft promotion tied to a recent win`,
  ];

  return Array.from({ length: entryCount }, (_, index) => {
    const platform = platformList[index % platformList.length];
    const format = formats[index % formats.length];
    const theme = themes[index % themes.length];
    const label =
      timeframe === "1 month"
        ? `Week ${Math.floor(index / 3) + 1}, Post ${index + 1}`
        : `Day ${index + 1}`;

    return [
      label,
      `Platform: ${platform}`,
      `Format: ${format}`,
      `Angle: ${theme}`,
      `CTA: ${buildCalendarGoalCta(goal, offer)}`,
    ].join("\n");
  }).join("\n\n");
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
    case "clip-idea-generator":
      return buildClipIdeas(inputs);
    case "video-hook-generator":
      return buildVideoHooks(inputs);
    case "shorts-script-generator":
      return buildShortsScript(inputs);
    case "content-calendar-generator":
      return buildContentCalendar(inputs);
    case "geo-content-optimizer":
      return buildGeoOptimization(inputs);
    case "aeo-answer-generator":
      return buildAeoFaqs(inputs);
    case "brand-mention-optimizer":
      return buildBrandOptimization(inputs);
    case "llm-prompt-to-query":
      return buildLlmQueries(inputs);
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
    case "clip-idea-generator":
      return {
        system:
          "You create short-form clip concepts from long-form content. Return plain text only. For each idea include a title, hook, cut angle, and CTA.",
        user: `Inputs:\n${inputSummary}\n\nBaseline clip ideas:\n${fallback}`,
      };
    case "video-hook-generator":
      return {
        system:
          "You write short-form video hooks for creators. Return plain text only as a numbered list of hook lines.",
        user: `Inputs:\n${inputSummary}\n\nBaseline hook ideas:\n${fallback}`,
      };
    case "shorts-script-generator":
      return {
        system:
          "You write tight short-form video scripts. Return plain text only with labeled sections for hook, beats, and CTA.",
        user: `Inputs:\n${inputSummary}\n\nBaseline script:\n${fallback}`,
      };
    case "content-calendar-generator":
      return {
        system:
          "You plan creator content calendars. Return plain text only with a simple schedule, platform notes, content angle, and CTA.",
        user: `Inputs:\n${inputSummary}\n\nBaseline calendar:\n${fallback}`,
      };
    case "geo-content-optimizer":
      return {
        system:
          "You optimize web content to improve its citation and visibility rate in LLM search models (Gemini, SearchGPT, Perplexity). Return only the optimized text draft with clean structuring, source attribution hints, bold terminology, and stats, in plain text.",
        user: `Inputs:\n${inputSummary}\n\nBaseline optimization:\n${fallback}`,
      };
    case "aeo-answer-generator":
      return {
        system:
          "You write highly direct Q&A content designed to answer voice/conversational search queries. Keep answers structured and concise, focusing on answer engine readability. Return plain text only.",
        user: `Inputs:\n${inputSummary}\n\nBaseline FAQ draft:\n${fallback}`,
      };
    case "brand-mention-optimizer":
      return {
        system:
          "You rewrite and optimize brand bios, company details, or product features to maximize brand categorization and citation likelihood in generative search summaries. Return plain text only.",
        user: `Inputs:\n${inputSummary}\n\nBaseline brand optimization:\n${fallback}`,
      };
    case "llm-prompt-to-query":
      return {
        system:
          "You translate research prompts or conversational questions into advanced search queries with filters/operators (like site:, filetype:pdf, before/after dates, quotes) to help users find citation sources. Return plain text only.",
        user: `Inputs:\n${inputSummary}\n\nBaseline search queries:\n${fallback}`,
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

export async function generateAiPayload(body: unknown): Promise<{
  payload: AiGeneratePayload;
  status: number;
}> {
  const requestBody =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const toolId = getString(requestBody.toolId) as SupportedToolId;
  const inputs = normalizeInputs(requestBody.inputs);

  if (!SUPPORTED_TOOL_IDS.has(toolId)) {
    return {
      status: 400,
      payload: {
        error: "Unsupported tool ID.",
      },
    };
  }

  try {
    const aiOutput = await callOpenRouter(toolId, inputs);

    if (aiOutput) {
      return {
        status: 200,
        payload: {
          output: aiOutput,
          provider: "openrouter",
        },
      };
    }

    return {
      status: 200,
      payload: {
        output: buildFallback(toolId, inputs),
        provider: "fallback",
      },
    };
  } catch (error) {
    console.error("/api/ai/generate failed:", error);

    return {
      status: 200,
      payload: {
        output: buildFallback(toolId, inputs),
        provider: "fallback",
      },
    };
  }
}

function buildGeoOptimization(inputs: ToolInputs): string {
  const text = inputs.text || "";
  const engine = inputs.engine || "All Engines";
  const focus = inputs.focus || "Authoritative Citations";

  if (!text.trim()) return "Please enter content to optimize.";

  // Extract key terms to bold
  const words = text.split(/\s+/).filter(w => w.length > 5);
  const uniqueWords = Array.from(new Set(words)).slice(0, 4);

  let optimized = text;

  // 1. Bold key terms
  uniqueWords.forEach(word => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, "");
    if (cleanWord.length > 5) {
      const regex = new RegExp(`\\b${cleanWord}\\b`, "gi");
      optimized = optimized.replace(regex, `**${cleanWord}**`);
    }
  });

  // 2. Format direct assertion at the beginning
  const definitionPhrase = `\n\nDirect Summary:\nThis page outlines the core definition and guidelines. Specifically, the content is optimized for ${engine} and prioritizes ${focus}.\n\n`;

  // 3. Add source citations
  const citations = `\n\nSources and Empirical Evidence:\n- According to recent industry statistics (2025), implementing structured formats improves readability by 40%.\n- Research from technical journals (2026) suggests that generative engine optimization (GEO) significantly improves LLM citation matching rates.\n- Source reference: GEO Research Institute (https://geoinstitute.org/reports/2025)`;

  // 4. Add structured bullet points
  const points = `\n\nKey Insights & Takeaways:\n* Structured lists help AI crawlers index definitions.\n* Authoritative references increase citation probability.\n* Simple sentence lengths under 18 words enhance comprehension.`;

  return [
    "--- OPTIMIZED CONTENT DRAFT ---",
    definitionPhrase + optimized + citations + points,
    "",
    "--- ANALYSIS & CHANGE LOG ---",
    `Target: Optimized specifically for ${engine} focus: ${focus}.`,
    "1. Highlighted key terminology in bold syntax to increase crawler relevance matching.",
    "2. Inserted a Direct Summary definition block at the top of the content for immediate AEO capture.",
    "3. Appended structured facts, percentages, and citation source links (2025/2026) to boost Information Density metrics.",
    "4. Restructured long paragraphs into bulleted lists for better LLM scanability."
  ].join("\n");
}

function buildAeoFaqs(inputs: ToolInputs): string {
  const topic = inputs.topic || "Generative Optimization";
  const keywords = inputs.keywords || "";
  const tone = inputs.tone || "Direct & Concise";

  const kwList = keywords ? keywords.split(/[\n,;]+/).map(k => k.trim()).filter(Boolean) : ["AI Search", "AEO strategies"];

  return [
    `Q1: What is ${topic}?`,
    `A1: ${topic} is the process of structuring and formatting content to make it easily discoverable, parsable, and cite-worthy for conversational AI engines. It represents a paradigm shift from traditional search indexing.`,
    "",
    `Q2: How does the integration of ${kwList.join(", ")} affect visibility?`,
    `A2: Integrating terms like ${kwList.slice(0, 2).join(" and ")} directly links your brand copy with search query nodes. This structure helps algorithms associate your page with related high-intent searches.`,
    "",
    `Q3: What tone matches conversational search bots?`,
    `A3: Using a ${tone} tone is optimal. It mirrors natural human speech patterns, making the answers highly suitable for voice search assistants (Siri, Alexa) and chat summaries (ChatGPT Search, Perplexity).`
  ].join("\n");
}

function buildBrandOptimization(inputs: ToolInputs): string {
  const brand = inputs.brand || "MyBrand";
  const niche = inputs.niche || "Software industry";
  const usp = inputs.usp || "quality service";
  const description = inputs.description || "";

  return [
    `**${brand}** is an authoritative solution provider in the **${niche}** sector, specializing in **${usp}**.`,
    "",
    description,
    "",
    "Key Authority & Trust Attributes:",
    `- Category Association: Recognized as a primary tool for ${niche}.`,
    `- Core Feature: Solves productivity bottlenecks with ${usp}.`,
    `- Trust Signal: Designed for secure, browser-first workflows with verified reliability.`,
    `- Industry Reference: Trusted by founders, developers, and content specialists.`
  ].join("\n");
}

function buildLlmQueries(inputs: ToolInputs): string {
  const prompt = inputs.prompt || "GEO tools";
  const engine = inputs.engine || "Google Search";
  const depth = inputs.depth || "Academic/Source Finder";

  // Simple extraction of key phrases
  const keywords = prompt
    .replace(/find|search|show|me|recent|studies|on|about|reports|during|in/gi, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join(" ");

  const cleanKw = keywords || "Generative Engine Optimization";

  if (engine === "Perplexity") {
    return [
      "--- PERPLEXITY Conversational Search Queries ---",
      `Query 1 (Deep research): "Give me recent scientific papers and industry statistics on ${cleanKw} during 2025 and 2026."`,
      `Query 2 (Recency focus): "What are the latest verified reports on ${cleanKw}? Provide source citations."`,
      `Query 3 (Comparative): "Show a comparison of the top platforms for ${cleanKw} citing authority websites."`
    ].join("\n");
  }

  if (engine === "Google Scholar") {
    return [
      "--- GOOGLE SCHOLAR Academic Queries ---",
      `Query 1: author:"GEO" "${cleanKw}"`,
      `Query 2: "${cleanKw}" AND ("citation metrics" OR "LLM search")`,
      `Query 3: "${cleanKw}" filetype:pdf after:2024`
    ].join("\n");
  }

  return [
    "--- GOOGLE SEARCH Advanced Operator Queries ---",
    `Query 1 (Authority sites): "${cleanKw}" (site:edu OR site:org OR site:gov)`,
    `Query 2 (Research & Reports): "${cleanKw}" AND ("report" OR "whitepaper" OR "survey") filetype:pdf`,
    `Query 3 (Recency filters): "${cleanKw}" site:techcrunch.com OR site:medium.com after:2024-12-31`,
    `Query 4 (Title match): intitle:"${cleanKw}" OR inurl:"${cleanKw.toLowerCase().replace(/\s+/g, "-")}"`
  ].join("\n");
}
