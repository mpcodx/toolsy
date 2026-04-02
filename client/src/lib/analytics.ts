/**
 * Analytics and Tracking Utilities
 * Tracks user interactions and tool usage for insights
 */

import { readCookieConsent } from "@/lib/cookie-consent";

const DEFAULT_GOOGLE_TAG_ID = "G-RVWB8SMX27";
const UMAMI_SCRIPT_SELECTOR = 'script[data-toolsy-analytics="umami"]';
const GOOGLE_TAG_SCRIPT_SELECTOR = 'script[data-toolsy-analytics="gtag"]';
const GOOGLE_TAG_SCRIPT_URL = "https://www.googletagmanager.com/gtag/js";
const UMAMI_DEFAULT_SCRIPT_PATH = "/script.js";
type GtagCommand = IArguments;

let umamiScriptLoaded = false;
let googleTagScriptLoaded = false;
let googleTagBootstrapped = false;

export interface ToolUsageEvent {
  toolId: string;
  toolName: string;
  timestamp: number;
  duration?: number;
  success: boolean;
  fileSize?: number;
}

export interface PageViewEvent {
  page: string;
  timestamp: number;
  referrer?: string;
}

export class Analytics {
  private static instance: Analytics;
  private events: (ToolUsageEvent | PageViewEvent)[] = [];
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackToolUsage(event: ToolUsageEvent): void {
    this.events.push(event);
    this.sendToAnalytics(event);
  }

  trackPageView(page: string, referrer?: string): void {
    const event: PageViewEvent = {
      page,
      timestamp: Date.now(),
      referrer,
    };
    this.events.push(event);
    this.sendToAnalytics(event);
  }

  private sendToAnalytics(event: any): void {
    // Send to analytics endpoint (e.g., Umami, Google Analytics)
    if (readCookieConsent() !== "accepted") {
      return;
    }

    if (typeof window !== "undefined" && window.umami) {
      if ("toolId" in event) {
        window.umami.track("tool_used", {
          toolId: event.toolId,
          toolName: event.toolName,
          success: event.success,
        });
      } else {
        window.umami.track("page_view", {
          page: event.page,
        });
      }
    }

    if (typeof window !== "undefined" && window.gtag) {
      if ("toolId" in event) {
        const params: Record<string, unknown> = {
          tool_id: event.toolId,
          tool_name: event.toolName,
          success: event.success,
        };

        if (typeof event.duration === "number") {
          params.tool_duration_ms = event.duration;
        }

        if (typeof event.fileSize === "number") {
          params.file_size_bytes = event.fileSize;
        }

        window.gtag("event", "tool_used", params);
      } else {
        const params: Record<string, unknown> = {
          page_path: event.page,
          page_location: window.location.href,
        };

        if (event.referrer) {
          params.page_referrer = event.referrer;
        }

        window.gtag("event", "page_view", params);
      }
    }
  }

  getEvents(): (ToolUsageEvent | PageViewEvent)[] {
    return this.events;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  clearEvents(): void {
    this.events = [];
  }
}

function isUsableAnalyticsEndpoint(endpoint: string) {
  const trimmed = endpoint.trim();

  if (!trimmed || trimmed === "test" || trimmed.includes("%VITE_ANALYTICS")) {
    return false;
  }

  return true;
}

function resolveUmamiScriptUrl(endpoint: string) {
  const trimmed = endpoint.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.endsWith(".js")) {
    return trimmed;
  }

  return `${trimmed.replace(/\/$/, "")}${UMAMI_DEFAULT_SCRIPT_PATH}`;
}

function isUsableGoogleTagId(tagId: string) {
  const trimmed = tagId.trim();

  if (!trimmed || trimmed === "test" || trimmed.includes("%VITE_GOOGLE_TAG_ID")) {
    return false;
  }

  return trimmed.startsWith("G-");
}

function getGoogleTagId() {
  return import.meta.env.VITE_GOOGLE_TAG_ID?.trim() || DEFAULT_GOOGLE_TAG_ID;
}

function bootstrapGoogleTag(tagId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments as unknown as GtagCommand);
  };

  window.gtag("js", new Date());
  window.gtag("config", tagId, { send_page_view: false });
  googleTagBootstrapped = true;
}

function initializeUmamiAnalytics() {
  if (umamiScriptLoaded) {
    return;
  }

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT?.trim() ?? "";
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID?.trim() ?? "";
  const scriptUrl = resolveUmamiScriptUrl(endpoint);

  if (!isUsableAnalyticsEndpoint(endpoint) || !websiteId || !scriptUrl) {
    return;
  }

  if (window.umami) {
    umamiScriptLoaded = true;
    return;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(UMAMI_SCRIPT_SELECTOR);

  if (existingScript) {
    umamiScriptLoaded = true;
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.src = scriptUrl;
  script.setAttribute("data-website-id", websiteId);
  script.setAttribute("data-toolsy-analytics", "umami");
  script.onerror = () => {
    console.warn("Analytics script failed to load.");
  };

  document.head.appendChild(script);
  umamiScriptLoaded = true;
}

function initializeGoogleAnalytics() {
  if (googleTagScriptLoaded) {
    return;
  }

  const tagId = getGoogleTagId();

  if (!isUsableGoogleTagId(tagId)) {
    return;
  }

  if (!googleTagBootstrapped) {
    bootstrapGoogleTag(tagId);
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    GOOGLE_TAG_SCRIPT_SELECTOR
  );

  if (existingScript) {
    googleTagScriptLoaded = true;
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `${GOOGLE_TAG_SCRIPT_URL}?id=${encodeURIComponent(tagId)}`;
  script.setAttribute("data-toolsy-analytics", "gtag");
  script.onerror = () => {
    console.warn("Google tag failed to load.");
  };

  document.head.appendChild(script);
  googleTagScriptLoaded = true;
}

export function initializeAnalytics() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  if (readCookieConsent() !== "accepted") {
    return;
  }

  initializeUmamiAnalytics();
  initializeGoogleAnalytics();
}

export function disableAnalytics() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  umamiScriptLoaded = false;
  googleTagScriptLoaded = false;
  googleTagBootstrapped = false;

  const scripts = document.querySelectorAll<HTMLScriptElement>(
    `${UMAMI_SCRIPT_SELECTOR}, ${GOOGLE_TAG_SCRIPT_SELECTOR}`
  );

  scripts.forEach((script) => script.remove());

  if (window.umami) {
    window.umami = undefined;
  }

  if (window.gtag) {
    window.gtag = undefined;
  }

  window.dataLayer = [];
}

// Extend Window interface for Umami
declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, any>) => void;
    };
    dataLayer?: GtagCommand[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Tool Usage Statistics
 * Aggregates usage data for insights
 */

export class ToolStatistics {
  private static instance: ToolStatistics;
  private stats: Map<string, { count: number; successCount: number }> = new Map();

  static getInstance(): ToolStatistics {
    if (!ToolStatistics.instance) {
      ToolStatistics.instance = new ToolStatistics();
    }
    return ToolStatistics.instance;
  }

  recordUsage(toolId: string, success: boolean): void {
    const current = this.stats.get(toolId) || { count: 0, successCount: 0 };
    this.stats.set(toolId, {
      count: current.count + 1,
      successCount: current.successCount + (success ? 1 : 0),
    });
  }

  getStats(toolId: string): { count: number; successRate: number } | null {
    const stat = this.stats.get(toolId);
    if (!stat) return null;

    return {
      count: stat.count,
      successRate: stat.count > 0 ? (stat.successCount / stat.count) * 100 : 0,
    };
  }

  getAllStats(): Record<string, { count: number; successRate: number }> {
    const result: Record<string, { count: number; successRate: number }> = {};

    this.stats.forEach((stat, toolId) => {
      result[toolId] = {
        count: stat.count,
        successRate: stat.count > 0 ? (stat.successCount / stat.count) * 100 : 0,
      };
    });

    return result;
  }

  getMostUsedTools(limit: number = 5): Array<[string, number]> {
    return Array.from(this.stats.entries())
      .map(([toolId, stat]) => [toolId, stat.count] as [string, number])
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, limit);
  }
}

/**
 * Error Tracking
 * Captures and logs errors for debugging
 */

export class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: Array<{ message: string; stack?: string; timestamp: number }> =
    [];

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  captureError(error: Error | string, context?: string): void {
    const errorData = {
      message: typeof error === "string" ? error : error.message,
      stack: typeof error === "string" ? undefined : error.stack,
      timestamp: Date.now(),
      context,
    };

    this.errors.push(errorData);
    console.error("Error tracked:", errorData);

    // Send to error tracking service if available
    if (typeof window !== "undefined" && window.umami) {
      window.umami.track("error", {
        message: errorData.message,
        context,
      });
    }

    if (typeof window !== "undefined" && window.gtag) {
      const params: Record<string, unknown> = {
        description: errorData.message,
        fatal: false,
      };

      if (context) {
        params.context = context;
      }

      window.gtag("event", "exception", params);
    }
  }

  getErrors(): Array<{ message: string; stack?: string; timestamp: number }> {
    return this.errors;
  }

  clearErrors(): void {
    this.errors = [];
  }
}
