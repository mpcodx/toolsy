import { Toaster } from "@/components/ui/sonner";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import CookieVisitTracker from "@/components/CookieVisitTracker";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";

const NotFound = lazy(() => import("./pages/NotFound"));
const ToolPage = lazy(() => import("./pages/ToolPage"));

const lazyNamed = (loader: () => Promise<any>, exportName: string) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })));

const PrivacyPolicyPage = lazyNamed(
  () => import("./pages/SitePage"),
  "PrivacyPolicyPage"
);
const AboutUsPage = lazyNamed(() => import("./pages/SitePage"), "AboutUsPage");
const ContactUsPage = lazyNamed(() => import("./pages/SitePage"), "ContactUsPage");
const TermsAndConditionsPage = lazyNamed(
  () => import("./pages/SitePage"),
  "TermsAndConditionsPage"
);

/**
 * Modern Minimalist Design - Slate Blue & Cyan Accents
 * - Clean, spacious layouts with generous whitespace
 * - Subtle gradient accents in cyan and purple
 * - Professional yet modern aesthetic
 * - Typography-driven hierarchy with Poppins & Inter
 */

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/privacy-policy"} component={PrivacyPolicyPage} />
        <Route path={"/about-us"} component={AboutUsPage} />
        <Route path={"/contact-us"} component={ContactUsPage} />
        <Route path={"/terms-and-conditions"} component={TermsAndConditionsPage} />
        <Route path={"/tool/:id"} component={ToolPage} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full border-4 border-border border-t-accent animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Toaster />
      <CookieVisitTracker />
      <Router />
      <CookieConsentBanner />
    </ErrorBoundary>
  );
}

export default App;
