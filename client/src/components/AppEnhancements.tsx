import CookieConsentBanner from "@/components/CookieConsentBanner";
import CookieVisitTracker from "@/components/CookieVisitTracker";
import VercelAnalyticsBridge from "@/components/VercelAnalyticsBridge";
import VercelSpeedInsightsBridge from "@/components/VercelSpeedInsightsBridge";
import { Toaster } from "@/components/ui/sonner";

export default function AppEnhancements() {
  return (
    <>
      <Toaster />
      <VercelAnalyticsBridge />
      <VercelSpeedInsightsBridge />
      <CookieVisitTracker />
      <CookieConsentBanner />
    </>
  );
}
