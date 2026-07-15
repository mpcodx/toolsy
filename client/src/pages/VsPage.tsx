import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { updateMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/seo";
import { ArrowLeftRight, Check, ChevronLeft, ShieldAlert, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";

interface VsComparison {
  title: string;
  toolName: string;
  toolLink: string;
  competitorName: string;
  description: string;
  keywords: string[];
  summary: string;
  metrics: Array<{
    name: string;
    toolsy: string;
    competitor: string;
    toolsyBetter: boolean;
  }>;
  pros: string[];
}

const COMPARISONS: Record<string, VsComparison> = {
  "adobe-acrobat-pdf-merger": {
    title: "Toolsy PDF Merger vs Adobe Acrobat PDF Merger",
    toolName: "PDF Merger",
    toolLink: "/tool/pdf-merger",
    competitorName: "Adobe Acrobat PDF Merger",
    description: "Compare Toolsy's client-side browser PDF combiner with Adobe Acrobat. Understand how Toolsy offers a free, privacy-first PDF merger with zero cloud uploads or limits.",
    keywords: ["Toolsy pdf merger", "Adobe Acrobat comparison", "free pdf combiner online", "privacy-first pdf joiner"],
    summary: "Toolsy's PDF Merger provides a local, browser-first workflow designed to merge multiple PDF files in seconds. Unlike Adobe Acrobat, which uploads files to external servers and enforces signup walls, Toolsy works completely offline inside your browser memory.",
    metrics: [
      { name: "Pricing", toolsy: "Free forever", competitor: "Paid subscription / Limited free", toolsyBetter: true },
      { name: "Sign-up Required", toolsy: "No signup", competitor: "Forced account signup", toolsyBetter: true },
      { name: "File Processing", toolsy: "100% Client-side (in-browser)", competitor: "Cloud server upload", toolsyBetter: true },
      { name: "Daily Limit", toolsy: "Unlimited", competitor: "1 free action per 24 hours", toolsyBetter: true },
      { name: "Watermarks", toolsy: "None", competitor: "None (on paid version)", toolsyBetter: true },
    ],
    pros: [
      "Absolute privacy: PDF files are combined locally in browser memory without leaving your computer.",
      "Speed: Instant compilation using WASM, avoiding slow upload and download cycles.",
      "No limits: Process as many PDF files and page combinations as your system resources allow.",
    ],
  },
  "handbrake-video-trimmer": {
    title: "Toolsy Video Cutter vs Handbrake Video Trimmer",
    toolName: "Video Clip Cutter",
    toolLink: "/tool/video-clipper",
    competitorName: "Handbrake Video Trimmer",
    description: "Compare Toolsy's online browser video clip trimmer with Handbrake's desktop converter. Discover why Toolsy is the fastest way to trim clips without desktop installs.",
    keywords: ["Toolsy video cutter", "Handbrake trimmer", "online video trimmer no watermark", "trim mp4 in browser"],
    summary: "Toolsy's Video Clip Cutter is designed for instant vertical shorts and reels clipping. Instead of downloading and configuring Handbrake on your desktop, Toolsy opens in any browser and trims MP4/WebM videos locally without watermarks.",
    metrics: [
      { name: "Installation", toolsy: "None (runs in browser)", competitor: "Desktop application install", toolsyBetter: true },
      { name: "Learning Curve", toolsy: "Simple slider interface", competitor: "Complex settings and presets", toolsyBetter: true },
      { name: "Clip Speed", toolsy: "Instant client-side export", competitor: "Requires full encoding time", toolsyBetter: true },
      { name: "File Size Output", toolsy: "Optimized WebM/MP4", competitor: "Depends on container setups", toolsyBetter: false },
      { name: "Platform Support", toolsy: "Desktop & Mobile devices", competitor: "Desktop environments only", toolsyBetter: true },
    ],
    pros: [
      "Instant launch: Trim your video clips within 10 seconds of opening the webpage.",
      "Visual timeline preview: See the exact frames you are clipping with active timeline support.",
      "Watermark-free: Export clean, professional short-form videos ready for TikTok or YouTube.",
    ],
  },
  "smallpdf-pdf-compressor": {
    title: "Toolsy PDF Compressor vs Smallpdf PDF Compressor",
    toolName: "PDF Compressor",
    toolLink: "/tool/pdf-compressor",
    competitorName: "Smallpdf PDF Compressor",
    description: "Compare Toolsy's client-side PDF compressor with Smallpdf. Learn how Toolsy achieves high-ratio document compression without daily limits or account registration.",
    keywords: ["Toolsy pdf compressor", "Smallpdf comparison", "compress pdf free online", "reduce pdf size no limits"],
    summary: "Toolsy's PDF Compressor offers local-browser downsizing for PDF files. Unlike Smallpdf, which restricts non-paying users to a single compression file daily and uploads private documents to remote cloud storage, Toolsy operates entirely on-device.",
    metrics: [
      { name: "Daily Limit", toolsy: "Unlimited", competitor: "1 file per day (free tier)", toolsyBetter: true },
      { name: "Security Model", toolsy: "Private client-side memory", competitor: "Uploaded to Smallpdf servers", toolsyBetter: true },
      { name: "Pricing", toolsy: "100% Free", competitor: "Subscription ($12/month for pro)", toolsyBetter: true },
      { name: "Quality Control", toolsy: "Adjustable DPI / Compression presets", competitor: "Limited options on free tier", toolsyBetter: true },
    ],
    pros: [
      "Privacy-first: Highly sensitive tax papers, bank statements, and contracts stay on your device.",
      "Unlimited batch runs: Compress, adjust quality, and repeat as many times as needed.",
      "High efficiency: Direct client-side canvas scaling and stream compression.",
    ],
  },
  "canva-thumbnail-maker": {
    title: "Toolsy Thumbnail Maker vs Canva Thumbnail Maker",
    toolName: "Thumbnail Maker",
    toolLink: "/tool/video-thumbnail-maker",
    competitorName: "Canva Thumbnail Maker",
    description: "Compare Toolsy's video-to-thumbnail converter with Canva templates. Learn how to extract frame thumbnails in one click directly from video files.",
    keywords: ["Toolsy thumbnail generator", "Canva thumbnail maker", "video frame grabber", "youtube thumbnail capture"],
    summary: "Toolsy's Video Thumbnail Maker is built for creators who want to extract high-fidelity frames from actual video footage. Instead of designing a thumbnail from scratch or using cookie-cutter templates in Canva, Toolsy lets you grab the perfect frame natively.",
    metrics: [
      { name: "Workflow Focus", toolsy: "Extract frame from video file", competitor: "Design graphic from templates", toolsyBetter: false },
      { name: "Execution Time", toolsy: "Under 5 seconds", competitor: "Several minutes of editing", toolsyBetter: true },
      { name: "Design Control", toolsy: "Raw high-res screenshot capture", competitor: "Add text / filters / layouts", toolsyBetter: false },
      { name: "Price", toolsy: "Free", competitor: "Paid assets / Pro tier needed", toolsyBetter: true },
    ],
    pros: [
      "Exact frame capture: Seek through local video frames to find the exact high-impact expression.",
      "Browser execution: No heavy editor interfaces to load or signups to bypass.",
      "Direct export: Save high-res JPG or PNG images instantly at your video's native resolution.",
    ],
  },
};

interface VsPageProps {
  params: {
    slug: string;
  };
}

export default function VsPage({ params }: VsPageProps) {
  const [, setLocation] = useLocation();
  const comparison = useMemo(() => COMPARISONS[params.slug], [params.slug]);

  useEffect(() => {
    if (!comparison) {
      return;
    }

    updateMetadata({
      title: `${comparison.title} | Toolsy`,
      description: comparison.description,
      keywords: comparison.keywords,
      image: SITE_CONFIG.image,
      url: `${SITE_CONFIG.url}/vs/${params.slug}`,
      type: "article",
      canonical: `${SITE_CONFIG.url}/vs/${params.slug}`,
    });
  }, [comparison, params.slug]);

  if (!comparison) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Comparison Page Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The comparison route you are trying to view does not exist.
          </p>
          <Button onClick={() => setLocation("/")} className="bg-accent text-accent-foreground">
            Back to Home
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Banner Section */}
        <section className="py-12 md:py-16 border-b border-border bg-card/50">
          <div className="container">
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Button>

            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }}>Home</a>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Comparison</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{comparison.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
                <ArrowLeftRight className="w-4 h-4" />
                Feature Comparison
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl font-display font-bold leading-tight text-foreground">
                {comparison.title}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {comparison.summary}
              </p>
              <Button
                onClick={() => setLocation(comparison.toolLink)}
                className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Use Toolsy {comparison.toolName} &rarr;
              </Button>
            </div>
          </div>
        </section>

        {/* Comparison Table & Pros */}
        <section className="container py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Table */}
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">Head-to-Head Comparison</h2>
              <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="p-4 font-bold text-foreground">Metric</th>
                      <th className="p-4 font-bold text-accent">Toolsy {comparison.toolName}</th>
                      <th className="p-4 font-bold text-muted-foreground">{comparison.competitorName}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {comparison.metrics.map((metric) => (
                      <tr key={metric.name} className="hover:bg-accent/5 transition-colors">
                        <td className="p-4 font-medium text-foreground">{metric.name}</td>
                        <td className="p-4 text-sm">
                          <div className="flex items-center gap-2 font-semibold text-accent">
                            {metric.toolsyBetter ? <Check className="w-4 h-4 text-emerald-500" /> : null}
                            {metric.toolsy}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {!metric.toolsyBetter ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-rose-500" />}
                            {metric.competitor}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pros & Benefits */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-foreground mb-4">Why Choose Toolsy?</h3>
                <div className="space-y-4">
                  {comparison.pros.map((pro, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </div>
                      <p className="text-sm text-muted-foreground leading-6">
                        {pro}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground">Data Privacy Warning</h4>
                    <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-6">
                      Uploading files containing personal details, financial records, or credentials to public cloud compression platforms exposes your data to processing storage risk. Toolsy resolves this constraint by carrying out all file modifications locally on your device.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
