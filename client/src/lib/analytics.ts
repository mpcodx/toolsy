/**
 * Analytics and Tracking Utilities
 * Tracks user interactions and tool usage for insights
 */

import { readCookieConsent } from "@/lib/cookie-consent";

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

let analyticsScriptLoaded = false;

function isUsableAnalyticsEndpoint(endpoint: string) {
  const trimmed = endpoint.trim();

  if (!trimmed || trimmed === "test" || trimmed.includes("%VITE_ANALYTICS")) {
    return false;
  }

  return true;
}

export function initializeAnalytics() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  if (analyticsScriptLoaded) {
    return;
  }

  if (readCookieConsent() !== "accepted") {
    return;
  }

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT?.trim() ?? "";
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID?.trim() ?? "";

  if (!isUsableAnalyticsEndpoint(endpoint) || !websiteId) {
    return;
  }

  if (window.umami) {
    analyticsScriptLoaded = true;
    return;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[data-toolsy-analytics="umami"]'
  );

  if (existingScript) {
    analyticsScriptLoaded = true;
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.src = `${endpoint.replace(/\/$/, "")}/umami`;
  script.setAttribute("data-website-id", websiteId);
  script.setAttribute("data-toolsy-analytics", "umami");
  script.onerror = () => {
    console.warn("Analytics script failed to load.");
  };

  document.head.appendChild(script);
  analyticsScriptLoaded = true;
}

export function disableAnalytics() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  analyticsScriptLoaded = false;

  const script = document.querySelector<HTMLScriptElement>(
    'script[data-toolsy-analytics="umami"]'
  );

  script?.remove();

  if (window.umami) {
    window.umami = undefined;
  }
}

// Extend Window interface for Umami
declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, any>) => void;
    };
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
  }

  getErrors(): Array<{ message: string; stack?: string; timestamp: number }> {
    return this.errors;
  }

  clearErrors(): void {
    this.errors = [];
  }
}
