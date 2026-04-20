import {
  Analytics,
  disableAnalytics,
  initializeAnalytics,
} from "@/lib/analytics";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  clearVisitorCookies,
  recordVisitorCookies,
  readCookieConsent,
} from "@/lib/cookie-consent";
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

export default function CookieVisitTracker() {
  const [location] = useLocation();
  const previousLocationRef = useRef<string | null>(null);

  useEffect(() => {
    if (readCookieConsent() === "accepted") {
      recordVisitorCookies();
      initializeAnalytics();
      Analytics.getInstance().trackPageView(
        location,
        previousLocationRef.current ?? document.referrer ?? undefined
      );
      previousLocationRef.current = location;
    }
  }, [location]);

  useEffect(() => {
    const handleConsentChange = () => {
      const consent = readCookieConsent();

      if (consent === "accepted") {
        recordVisitorCookies();
        initializeAnalytics();
        Analytics.getInstance().trackPageView(
          location,
          previousLocationRef.current ?? document.referrer ?? undefined
        );
        previousLocationRef.current = location;
        return;
      }

      if (consent === "rejected") {
        clearVisitorCookies();
        disableAnalytics();
        previousLocationRef.current = null;
      }
    };

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
    };
  }, [location]);

  return null;
}
