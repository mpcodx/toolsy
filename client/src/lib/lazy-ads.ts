/**
 * Lazy loading helper for Google AdSense
 * Ensures ad scripts are loaded completely after page load and initial interaction,
 * preventing them from blocking critical rendering path.
 */
export function initializeAdSenseLazy() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const loadScript = () => {
    // Avoid double loading
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4412692797128393";
    script.crossOrigin = "anonymous";
    script.setAttribute("data-toolsy-ads", "lazy");

    script.onload = () => {
      console.log("Lazy AdSense script loaded successfully.");
    };

    script.onerror = () => {
      console.warn("Lazy AdSense script failed to load.");
    };

    document.body.appendChild(script);
  };

  const idleCallback = () => {
    // Wait 2500ms after browser becomes idle to load heavy ad scripts
    window.setTimeout(loadScript, 2500);
  };

  const win = window as any;
  if (typeof win.requestIdleCallback === "function") {
    win.requestIdleCallback(idleCallback);
  } else {
    window.addEventListener("load", idleCallback);
  }
}
