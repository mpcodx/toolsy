import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import CookieVisitTracker from "@/components/CookieVisitTracker";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import {
  AboutUsPage,
  ContactUsPage,
  PrivacyPolicyPage,
  TermsAndConditionsPage,
} from "./pages/SitePage";
import ToolPage from "./pages/ToolPage";

/**
 * Modern Minimalist Design - Slate Blue & Cyan Accents
 * - Clean, spacious layouts with generous whitespace
 * - Subtle gradient accents in cyan and purple
 * - Professional yet modern aesthetic
 * - Typography-driven hierarchy with Poppins & Inter
 */

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/privacy-policy"} component={PrivacyPolicyPage} />
      <Route path={"/about-us"} component={AboutUsPage} />
      <Route path={"/contact-us"} component={ContactUsPage} />
      <Route path={"/terms-and-conditions"} component={TermsAndConditionsPage} />
      <Route path={"/tool/:id"} component={ToolPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <CookieVisitTracker />
          <Router />
          <CookieConsentBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
