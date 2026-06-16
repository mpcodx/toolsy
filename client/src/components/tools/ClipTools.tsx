import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Tv,
  Layers,
  Upload,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Download
} from "lucide-react";

// -------------------------------------------------------------
// 1. CLIP PACING & DURATION CALCULATOR
// -------------------------------------------------------------
export function ClipDurationCalculator() {
  const [scriptText, setScriptText] = useState("");
  const [wpm, setWpm] = useState(150); // words per minute
  const [platformLimit, setPlatformLimit] = useState(60); // seconds
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    seconds: 0.0,
    percentage: 0,
    isOverLimit: false,
    wordsToCut: 0
  });

  useEffect(() => {
    const cleanText = scriptText.trim();
    if (!cleanText) {
      setStats({
        words: 0,
        characters: 0,
        seconds: 0,
        percentage: 0,
        isOverLimit: false,
        wordsToCut: 0
      });
      return;
    }

    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
    const charCount = cleanText.length;
    const estimatedSeconds = parseFloat(((wordCount / wpm) * 60).toFixed(1));
    const percentage = Math.min(150, Math.round((estimatedSeconds / platformLimit) * 100));
    const isOverLimit = estimatedSeconds > platformLimit;

    // Calculate how many words need to be cut to fit the limit
    const maxWords = Math.floor((platformLimit / 60) * wpm);
    const wordsToCut = Math.max(0, wordCount - maxWords);

    setStats({
      words: wordCount,
      characters: charCount,
      seconds: estimatedSeconds,
      percentage,
      isOverLimit,
      wordsToCut
    });
  }, [scriptText, wpm, platformLimit]);

  const getProgressBarColor = () => {
    if (stats.isOverLimit) return "bg-rose-500 text-rose-500";
    if (stats.percentage >= 85) return "bg-amber-500 text-amber-500";
    return "bg-emerald-500 text-emerald-500";
  };

  const getPacingRating = () => {
    if (wpm <= 130) return { label: "Conversational & Measured", desc: "Perfect for educational explanations, stories, or professional SaaS product pitches." };
    if (wpm <= 160) return { label: "Standard Pacing", desc: "Excellent, natural speaking pace for YouTube Shorts, Instagram Reels, and ads." };
    return { label: "High Energy / Fast-Paced", desc: "Classic TikTok/Gen-Z speed. Requires editing out pauses and speaking enthusiastically." };
  };

  const pacing = getPacingRating();

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="rounded-3xl border border-border bg-card/70 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              Clip Creator Utility
            </span>
            <h2 className="mt-3 text-2xl font-display font-bold text-foreground">
              Clip Pacing & Duration Calculator
            </h2>
            <p className="mt-3 text-sm md:text-base leading-7 text-muted-foreground">
              Short-form platforms enforce strict cutoffs (typically 60 or 90 seconds). Paste your video scripts, adjust speaking paces, and check if your content fits target clip boundaries instantly before recording.
            </p>
          </div>
          <div className="rounded-2xl bg-accent/10 p-3 text-accent">
            <Calculator className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Side: Script Editor */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Video Script text
            </label>
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Paste or type your video script here to analyze duration. (For example: Hey creators! Are you trying to boost your Shorts visibility? Today, I am showing you the secret safe-zone trick...)"
              rows={10}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Target Speaking Pace (WPM)
              </label>
              <select
                value={wpm}
                onChange={(e) => setWpm(parseInt(e.target.value))}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="120">Slow / Explainer (120 WPM)</option>
                <option value="135">Conversational (135 WPM)</option>
                <option value="150">Standard speaking pace (150 WPM)</option>
                <option value="165">Fast-paced (165 WPM)</option>
                <option value="180">High Speed / TikTok style (180 WPM)</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Platform Duration Limit
              </label>
              <select
                value={platformLimit}
                onChange={(e) => setPlatformLimit(parseInt(e.target.value))}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="15">15 Seconds (Standard Story / Quick Hook)</option>
                <option value="30">30 Seconds (Instagram / Ad default)</option>
                <option value="60">60 Seconds (YouTube Shorts / TikTok limit)</option>
                <option value="90">90 Seconds (Instagram Reels limit)</option>
                <option value="180">180 Seconds (3-Minute TikTok)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setScriptText("")}
              className="w-full sm:w-auto"
            >
              Clear Script
            </Button>
          </div>
        </div>

        {/* Right Side: Visual Metrics */}
        <div className="space-y-6">
          {/* Duration Meter Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-display font-bold text-foreground mb-4 flex items-center">
              <Sliders className="mr-2 h-5 w-5 text-accent" />
              Duration Analysis
            </h3>

            {/* Estimated time display */}
            <div className="flex items-center gap-6 mb-6">
              <div className={`relative flex items-center justify-center w-24 h-24 rounded-full border-4 ${stats.isOverLimit ? "border-rose-500/20 bg-rose-500/5" : "border-accent/20 bg-accent/5"}`}>
                <span className={`text-3xl font-display font-black ${stats.isOverLimit ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                  {stats.seconds}s
                </span>
                <span className="absolute -bottom-2 text-[9px] font-bold bg-secondary border border-border text-muted-foreground px-2 py-0.5 rounded-full">
                  ESTIMATED
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-sm font-semibold text-foreground">
                  {stats.words} Words | {stats.characters} Chars
                </div>
                <div className="text-xs text-muted-foreground">
                  Speaking speed: {wpm} words/min ({Math.round(wpm / 60)} words/sec).
                </div>
              </div>
            </div>

            {/* Progress Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Duration Limit Usage</span>
                <span className={stats.isOverLimit ? "text-rose-500" : "text-foreground"}>
                  {stats.percentage}%
                </span>
              </div>
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor()}`}
                  style={{ width: `${Math.min(100, stats.percentage)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>0s</span>
                <span>{platformLimit}s Limit ({platformLimit === 60 ? "YouTube Shorts" : `${platformLimit}s`})</span>
              </div>
            </div>

            {/* Recommendations/Warning block */}
            {stats.words > 0 && (
              <div className="mt-6 border-t border-border pt-4">
                {stats.isOverLimit ? (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-600 dark:text-rose-400 flex gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                    <div>
                      <p className="font-semibold">Too Long for Platform!</p>
                      <p className="mt-1 leading-normal">
                        Your script is estimated to run **{stats.seconds} seconds**, which exceeds the {platformLimit}s limit. You must **shorten your script by approximately {stats.wordsToCut} words** or select a faster speaking pace.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <div>
                      <p className="font-semibold">Perfect Safe Duration!</p>
                      <p className="mt-1 leading-normal">
                        At a pacing of {wpm} WPM, your script fits safely within the {platformLimit}s cutoff. You have approximately **{platformLimit - stats.seconds} seconds of buffer time** remaining.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pacing guide card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pacing Analysis
            </h4>
            <div className="text-sm font-semibold text-foreground">{pacing.label}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {pacing.desc} Use fast speeds (165-180 WPM) for viral trend summaries or comedy clips. Standard speeds (135-150 WPM) are better for retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. VERTICAL CLIP SAFEZONE HELPER
// -------------------------------------------------------------
type PlatformOverlay = "tiktok" | "reels" | "shorts";

export function ClipSafezoneVisualizer() {
  const [platform, setPlatform] = useState<PlatformOverlay>("tiktok");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBgImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    setBgImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="rounded-3xl border border-border bg-card/70 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              Retention Utility
            </span>
            <h2 className="mt-3 text-2xl font-display font-bold text-foreground">
              Vertical Clip Safe Zone Helper
            </h2>
            <p className="mt-3 text-sm md:text-base leading-7 text-muted-foreground">
              Social platforms cover vertical videos with overlays (profiles, descriptions, buttons, tags). Upload a frame screenshot or video thumbnail to visually inspect if your captions will be hidden or cropped by platform overlays.
            </p>
          </div>
          <div className="rounded-2xl bg-accent/10 p-3 text-accent">
            <Tv className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Left Side: Mock Editor & Instructions */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-display font-bold text-foreground flex items-center">
            <Sliders className="mr-2 h-5 w-5 text-accent" />
            Display Options
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Target Overlay Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "tiktok", label: "TikTok" },
                  { id: "reels", label: "Reels" },
                  { id: "shorts", label: "Shorts" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPlatform(item.id as PlatformOverlay)}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                      platform === item.id
                        ? "bg-accent border-accent text-accent-foreground shadow-sm"
                        : "border-border bg-background hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm font-medium text-foreground">Highlight Safe Zone Area</span>
              <button
                type="button"
                onClick={() => setShowSafeZone(!showSafeZone)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showSafeZone ? "bg-accent" : "bg-secondary"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showSafeZone ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Upload Mock Frame Image
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
                {bgImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResetImage}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  >
                    Reset
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Supports JPG, PNG, and WebP screenshots. Upload a frame exported from your video editor to align text overlays before rendering.
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4 rounded-2xl bg-secondary/10 p-4 border border-dashed">
            <h4 className="font-display font-semibold text-xs text-foreground mb-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              Platform Safe Zone Rules:
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• **TikTok:** Avoid bottom 25% (caption & profile links) and right 18% (sidebar buttons).</li>
              <li>• **Reels:** The profile tag and captions block out the bottom 22%. Right sidebar buttons occupy 15%.</li>
              <li>• **Shorts:** Subtitles must avoid bottom 28% due to player icons, sound tags, and comments overlay.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Interactive Mobile Canvas Viewport */}
        <div className="flex flex-col items-center justify-center p-4 rounded-3xl border border-border bg-card shadow-sm">
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Mobile Canvas Viewport (9:16)
          </h4>

          {/* Device Mockup Wrapper */}
          <div className="relative w-[280px] h-[498px] sm:w-[320px] sm:h-[569px] border-4 border-slate-700 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden bg-black flex flex-col justify-between">
            {/* Camera notch cutout */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-20 bg-slate-700 dark:bg-slate-800 rounded-full z-40" />

            {/* Custom Uploaded Background Image */}
            {bgImage ? (
              <img
                src={bgImage}
                alt="mock frame"
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-0 bg-slate-950 text-slate-500">
                <Tv className="h-8 w-8 text-slate-700 mb-2" />
                <p className="text-xs font-medium">No background image</p>
                <p className="text-[10px] text-slate-600 mt-1">
                  Click 'Choose Image' to upload your own video frame screenshot.
                </p>
              </div>
            )}

            {/* 1. Safe Zone overlay mask */}
            {showSafeZone && (
              <div className="absolute inset-x-[15%] top-[12%] bottom-[25%] border-2 border-dashed border-emerald-500/80 bg-emerald-500/5 rounded-xl z-20 flex flex-col items-center justify-center pointer-events-none">
                <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  SAFE TEXT CAPTION AREA
                </span>
                <span className="text-[8px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Place text/captions here
                </span>
              </div>
            )}

            {/* 2. Platform Overlays UI Mock */}
            {/* Top Bar Overlay */}
            <div className="absolute top-0 inset-x-0 h-[12%] bg-gradient-to-b from-black/60 to-transparent z-10 flex items-end justify-between px-4 pb-2 text-[10px] text-white font-semibold pointer-events-none">
              <span>Following</span>
              <span className="underline decoration-white underline-offset-4">For You</span>
              <span>🔍</span>
            </div>

            {/* Right Action Icons Overlay */}
            <div className="absolute right-2 bottom-[24%] w-[15%] flex flex-col items-center gap-4 text-white z-10 pointer-events-none">
              <div className="w-8 h-8 rounded-full border border-white bg-slate-700 flex items-center justify-center text-xs">👤</div>
              <div className="flex flex-col items-center">
                <span className="text-sm">❤️</span>
                <span className="text-[8px]">84K</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm">💬</span>
                <span className="text-[8px]">1.2K</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm">⭐</span>
                <span className="text-[8px]">512</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm">↩️</span>
                <span className="text-[8px]">Share</span>
              </div>
            </div>

            {/* Bottom Meta Overlay */}
            <div className="absolute bottom-0 inset-x-0 h-[24%] bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 flex flex-col justify-end p-4 text-white pointer-events-none">
              <div className="space-y-1.5 max-w-[80%]">
                <p className="text-xs font-bold">@creator_brand</p>
                <p className="text-[10px] text-slate-200 line-clamp-2 leading-relaxed">
                  Optimizing captions for shorts safeboxes! Check out our new #creator tools #retention #GEO
                </p>
                <p className="text-[9px] text-slate-300 flex items-center gap-1">
                  🎵 Original Sound - creator_brand
                </p>
              </div>
            </div>

            {/* Red overlay indicators (for blocked/unsafe zones) */}
            <div className="absolute inset-x-0 bottom-0 h-[24%] bg-rose-500/10 border-t border-rose-500/30 pointer-events-none z-10 flex items-center justify-center">
              <span className="text-[8px] font-bold text-rose-600 dark:text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20">
                BLOCKED BY PLATFORM CAPTIONS
              </span>
            </div>
            <div className="absolute right-0 bottom-[24%] w-[16%] top-[12%] bg-rose-500/10 border-l border-rose-500/30 pointer-events-none z-10 flex items-center justify-center">
              <span className="text-[8px] font-bold text-rose-600 dark:text-rose-400 bg-rose-950/40 px-1 py-1 rounded border border-rose-500/20 [writing-mode:vertical-lr] rotate-180">
                BLOCKED BY BUTTONS
              </span>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground mt-4 max-w-sm text-center leading-normal">
            The red zones indicate overlays. Captions or critical visuals placed in these red areas will be cropped, covered, or hidden from users on {platform.toUpperCase()}.
          </p>
        </div>
      </div>
    </div>
  );
}
