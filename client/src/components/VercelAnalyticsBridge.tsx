import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readCookieConsent,
} from "@/lib/cookie-consent";
import { disableVercelAnalytics } from "@/lib/analytics";
import { useEffect, useState } from "react";

export default function VercelAnalyticsBridge() {
  const [isEnabled, setIsEnabled] = useState(
    () => readCookieConsent() === "accepted"
  );

  useEffect(() => {
    const syncConsent = () => {
      const nextEnabled = readCookieConsent() === "accepted";
      setIsEnabled(nextEnabled);

      if (!nextEnabled) {
        disableVercelAnalytics();
      }
    };

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      disableVercelAnalytics();
    }
  }, [isEnabled]);

  return isEnabled ? <VercelAnalytics /> : null;
}
