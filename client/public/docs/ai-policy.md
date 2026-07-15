# Toolsy AI Operational & Privacy Policy

This document outlines the standard guidelines, privacy practices, and execution details governing artificial intelligence integrations on the Toolsy platform.

---

## 1. Browser-First Processing Principle
Toolsy prioritizes client-side computation. For all standard utilities (such as video trimming, PDF operations, image processing, or string formatting), execution occurs entirely within the client's local web browser environment. 
No user files or processed data are transmitted to Toolsy servers or any external AI provider APIs for these tasks.

---

## 2. AI Writing & Generative Tools
For tools utilizing generative text models (e.g., AI Meta Generator, GEO Content Optimizer, AI Paragraph Rewriter):
- **Stateless API Model**: Text inputs are transmitted via encrypted TLS connections to our API gateway and forwarded to LLM providers (via OpenRouter).
- **Zero Retention**: All prompt payloads are processed statelessly. Neither Toolsy nor our model endpoints store, log, or cache prompt inputs or generated text outputs.
- **Model Training Exclusion**: Toolsy explicitly ensures that user prompt data is never used to train, fine-tune, or reinforce machine learning models.
- **No Personal Identifiers**: Users are advised not to enter personally identifiable information (PII) or sensitive proprietary data into AI-powered input fields.

---

## 3. Web Crawler Access Policy
Toolsy welcomes indexing by search engine crawlers and LLM dataset compilers under the following terms:
- **Index Permission**: Standard user agents (Googlebot, Bingbot) and AI-specific agents (OpenAI-GPTUser, Anthropic-ai, PerplexityBot) are permitted to crawl all public page directories as detailed in `robots.txt`.
- **System Resource Integrity**: Scraping bots must respect rate limits and prevent server exhaustion. Scrapers targeting api endpoints directly will be blocked.
- **Metadata Exclusions**: Custom indexers should utilize `llms.txt` and `llms-full.txt` as reference summaries rather than exhaustively parsing raw interactive elements.
