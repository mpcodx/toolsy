/**
 * Performance Optimization Utilities
 * Ensures fast loading and smooth interactions
 */

export function prefetchImages(urls: string[]) {
  if (typeof document === "undefined") return;

  urls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
  });
}

export function preloadFont(fontUrl: string) {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.href = fontUrl;
  link.type = "font/woff2";
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

export function lazyLoadImages() {
  if (typeof document === "undefined") return;

  const images = document.querySelectorAll("img[data-src]");
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || "";
        img.removeAttribute("data-src");
        observer.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export const CRITICAL_IMAGES = [
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663075906499/HGEeKYb69GRxsTr6fzPE7i/hero-banner-i64GCUGHWUe83zmTExApQ7.webp",
];

export const PRELOAD_URLS = [
  "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap",
];

/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals for performance monitoring
 */

export function reportWebVitals() {
  if (typeof window === "undefined") return;

  // Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as any;
    console.log("LCP:", lastEntry.renderTime || lastEntry.loadTime);
  });

  try {
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
  } catch (e) {
    // LCP not supported
  }

  // First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      console.log("FID:", (entry as any).processingDuration);
    });
  });

  try {
    fidObserver.observe({ entryTypes: ["first-input"] });
  } catch (e) {
    // FID not supported
  }

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
        console.log("CLS:", clsValue);
      }
    }
  });

  try {
    clsObserver.observe({ entryTypes: ["layout-shift"] });
  } catch (e) {
    // CLS not supported
  }
}

/**
 * Cache Management
 * Implements efficient caching strategies
 */

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5 minutes default

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    if (ttl) {
      setTimeout(() => this.cache.delete(key), ttl);
    } else {
      setTimeout(() => this.cache.delete(key), this.ttl);
    }
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}
