import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readCookieConsent,
} from "@/lib/cookie-consent";
import { disableVercelSpeedInsights } from "@/lib/analytics";
import { useEffect, useState } from "react";

export default function VercelSpeedInsightsBridge() {
  const [isEnabled, setIsEnabled] = useState(
    () => readCookieConsent() === "accepted"
  );

  useEffect(() => {
    const syncConsent = () => {
      const nextEnabled = readCookieConsent() === "accepted";
      setIsEnabled(nextEnabled);

      if (!nextEnabled) {
        disableVercelSpeedInsights();
      }
    };

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      disableVercelSpeedInsights();
    }
  }, [isEnabled]);

  return isEnabled ? <SpeedInsights /> : null;
}
