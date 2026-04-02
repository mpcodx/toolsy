import { Button } from "@/components/ui/button";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  OPEN_COOKIE_SETTINGS_EVENT,
  readCookieConsent,
  saveCookieConsent,
} from "@/lib/cookie-consent";
import { Cookie, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(() => readCookieConsent() === null);
  const [consent, setConsent] = useState(() => readCookieConsent());

  const consentCopy = useMemo(() => {
    if (consent === "accepted") {
      return "Analytics cookies are enabled. You can switch to essential-only cookies at any time.";
    }

    if (consent === "rejected") {
      return "Only essential cookies are active right now. You can enable anonymous visit cookies later.";
    }

    return "We use essential cookies for the app shell and optional anonymous visit cookies only after permission.";
  }, [consent]);

  useEffect(() => {
    const openBanner = () => {
      setConsent(readCookieConsent());
      setIsOpen(true);
    };

    const syncConsent = () => {
      setConsent(readCookieConsent());
    };

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openBanner);
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);

    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openBanner);
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    };
  }, []);

  const handleAccept = () => {
    saveCookieConsent("accepted");
    setConsent("accepted");
    setIsOpen(false);
  };

  const handleReject = () => {
    saveCookieConsent("rejected");
    setConsent("rejected");
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-background/95 shadow-2xl backdrop-blur">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Cookie className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Cookie permissions
              </p>
              <h2 className="mt-2 text-xl font-display font-bold text-foreground sm:text-2xl">
                Help Toolsy improve with your permission
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {consentCopy}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
                  Essential cookies only by default
                </span>
                <span className="inline-flex items-center rounded-full bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
                  Anonymous visit tracking after consent
                </span>
                <span className="inline-flex items-center rounded-full bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
                  Easy to change later
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card/70 p-4 sm:p-5">
            <div className="flex items-center gap-3 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Anonymous, first-party cookies only
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We store a consent choice and, after approval, anonymous visit cookies such as visit
              count and timestamps to understand usage better.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={handleAccept}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Sparkles className="h-4 w-4" />
                Accept cookies
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReject}
              >
                Use essential only
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
