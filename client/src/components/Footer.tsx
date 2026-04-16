import { OPEN_COOKIE_SETTINGS_EVENT } from "@/lib/cookie-consent";

const footerInfoLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-display font-bold text-foreground mb-2">Toolsy</h3>
            <p className="text-sm text-muted-foreground">
              Free online tools for AI, SEO, developer, social, PDF, video, image, archive, and text workflows. No signup required.
            </p>
          </div>

          {/* SEO and AI */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">SEO & AI Tools</h4>
            <ul className="space-y-2">
              <li>
                <a href="/tool/ai-meta-generator" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  AI Meta Generator
                </a>
              </li>
              <li>
                <a href="/tool/keyword-clustering-tool" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Keyword Clustering Tool
                </a>
              </li>
              <li>
                <a href="/tool/schema-markup-generator" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Schema Markup Generator
                </a>
              </li>
              <li>
                <a href="/tool/faq-generator" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  FAQ Generator
                </a>
              </li>
            </ul>
          </div>

          {/* Developer and Social */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Creator & Dev Tools</h4>
            <ul className="space-y-2">
              <li>
                <a href="/tool/regex-explainer" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Regex Explainer
                </a>
              </li>
              <li>
                <a href="/tool/commit-message-generator" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Commit Message Generator
                </a>
              </li>
              <li>
                <a href="/tool/instagram-caption-generator" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Instagram Caption Generator
                </a>
              </li>
              <li>
                <a href="/tool/youtube-description-generator" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  YouTube Description Generator
                </a>
              </li>
            </ul>
          </div>

          {/* Search tips */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Search Tips</h4>
            <ul className="space-y-2">
              <li>
                <a href="/?search=ai meta generator" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  AI meta generator
                </a>
              </li>
              <li>
                <a href="/?search=keyword clustering tool" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Keyword clustering tool
                </a>
              </li>
              <li>
                <a href="/?search=regex explainer" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Regex explainer
                </a>
              </li>
              <li>
                <a href="/?search=image compressor" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Image compressor
                </a>
              </li>
              <li>
                <a href="/?search=pdf merger" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  PDF merger
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Toolsy. All rights reserved.
            </p>
            <div className="flex flex-col items-center gap-3 text-center md:items-end md:text-right">
              <p className="text-sm text-muted-foreground">
                Built for quick conversions, shareable tool pages, and search-friendly landing pages.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-end">
                {footerInfoLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
                <button
                  type="button"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
                >
                  Cookie settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AdSense Placeholder */}
      <div className="bg-secondary/30 py-4 text-center text-xs text-muted-foreground">
        Advertisement space - AdSense ready
      </div>
    </footer>
  );
}
