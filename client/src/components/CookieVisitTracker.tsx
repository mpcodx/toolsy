import { initializeAnalytics, disableAnalytics } from "@/lib/analytics";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  clearVisitorCookies,
  recordVisitorCookies,
  readCookieConsent,
} from "@/lib/cookie-consent";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function CookieVisitTracker() {
  const [location] = useLocation();

  useEffect(() => {
    if (readCookieConsent() === "accepted") {
      recordVisitorCookies();
      initializeAnalytics();
    }
  }, [location]);

  useEffect(() => {
    const handleConsentChange = () => {
      const consent = readCookieConsent();

      if (consent === "accepted") {
        recordVisitorCookies();
        initializeAnalytics();
        return;
      }

      if (consent === "rejected") {
        clearVisitorCookies();
        disableAnalytics();
      }
    };

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
    };
  }, []);

  return null;
}
