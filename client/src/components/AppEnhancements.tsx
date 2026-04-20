import CookieConsentBanner from "@/components/CookieConsentBanner";
import CookieVisitTracker from "@/components/CookieVisitTracker";
import { Toaster } from "@/components/ui/sonner";

export default function AppEnhancements() {
  return (
    <>
      <Toaster />
      <CookieVisitTracker />
      <CookieConsentBanner />
    </>
  );
}
