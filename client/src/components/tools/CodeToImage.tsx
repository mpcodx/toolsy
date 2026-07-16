import { Button } from "@/components/ui/button";
import { Download, Copy, Check, Code, Sliders, Type, Palette } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import Prism from "prismjs";

// Include Prism languages
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-json";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-bash";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "sql", label: "SQL" },
  { value: "json", label: "JSON" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "bash", label: "Bash/Shell" },
];

const GRADIENTS = [
  { id: "sunset", name: "Sunset Glow", value: "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)" },
  { id: "ocean", name: "Ocean Breeze", value: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)" },
  { id: "neon", name: "Neon Fusion", value: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)" },
  { id: "slate", name: "Slate Night", value: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)" },
  { id: "emerald", name: "Emerald Mint", value: "linear-gradient(135deg, #10b981 0%, #059669 50%, #06b6d4 100%)" },
  { id: "lavender", name: "Lavender Dream", value: "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)" },
  { id: "minimal-dark", name: "Minimal Dark", value: "#1e1e1e" },
  { id: "minimal-light", name: "Minimal Light", value: "#f3f4f6" },
];

const SHADOWS = [
  { id: "none", name: "None", value: "none" },
  { id: "soft", name: "Soft Shadow", value: "0 10px 30px -10px rgba(0, 0, 0, 0.5)" },
  { id: "hard", name: "Hard Shadow", value: "0 20px 40px -5px rgba(0, 0, 0, 0.7)" },
  { id: "neon", name: "Neon Glow", value: "0 0 30px 2px rgba(139, 92, 246, 0.4)" },
];

const THEMES = [
  {
    id: "one-dark",
    name: "One Dark",
    bg: "#282c34",
    text: "#abb2bf",
    css: `
      .theme-one-dark .token.keyword { color: #c678dd; font-weight: bold; }
      .theme-one-dark .token.string { color: #98c379; }
      .theme-one-dark .token.comment { color: #5c6370; font-style: italic; }
      .theme-one-dark .token.function { color: #61afef; }
      .theme-one-dark .token.number { color: #d19a66; }
      .theme-one-dark .token.operator { color: #56b6c2; }
      .theme-one-dark .token.punctuation { color: #abb2bf; }
      .theme-one-dark .token.class-name { color: #e5c07b; }
      .theme-one-dark .token.property { color: #e06c75; }
    `
  },
  {
    id: "dracula",
    name: "Dracula",
    bg: "#282a36",
    text: "#f8f8f2",
    css: `
      .theme-dracula .token.keyword { color: #ff79c6; font-weight: bold; }
      .theme-dracula .token.string { color: #f1fa8c; }
      .theme-dracula .token.comment { color: #6272a4; font-style: italic; }
      .theme-dracula .token.function { color: #50fa7b; }
      .theme-dracula .token.number { color: #bd93f9; }
      .theme-dracula .token.operator { color: #ff79c6; }
      .theme-dracula .token.punctuation { color: #f8f8f2; }
      .theme-dracula .token.class-name { color: #8be9fd; }
      .theme-dracula .token.property { color: #66d9ef; }
    `
  },
  {
    id: "night-owl",
    name: "Night Owl",
    bg: "#011627",
    text: "#d6deeb",
    css: `
      .theme-night-owl .token.keyword { color: #c792ea; font-style: italic; }
      .theme-night-owl .token.string { color: #ecc48d; }
      .theme-night-owl .token.comment { color: #637777; font-style: italic; }
      .theme-night-owl .token.function { color: #82aaff; }
      .theme-night-owl .token.number { color: #f78c6c; }
      .theme-night-owl .token.operator { color: #c792ea; }
      .theme-night-owl .token.punctuation { color: #7fdbca; }
      .theme-night-owl .token.class-name { color: #decb6b; }
      .theme-night-owl .token.property { color: #addb67; }
    `
  },
  {
    id: "github-light",
    name: "GitHub Light",
    bg: "#ffffff",
    text: "#24292e",
    css: `
      .theme-github-light .token.keyword { color: #d73a49; font-weight: bold; }
      .theme-github-light .token.string { color: #032f62; }
      .theme-github-light .token.comment { color: #6a737d; font-style: italic; }
      .theme-github-light .token.function { color: #6f42c1; }
      .theme-github-light .token.number { color: #005cc5; }
      .theme-github-light .token.operator { color: #d73a49; }
      .theme-github-light .token.punctuation { color: #24292e; }
      .theme-github-light .token.class-name { color: #e36209; }
      .theme-github-light .token.property { color: #005cc5; }
    `
  },
  {
    id: "synthwave",
    name: "Synthwave '84",
    bg: "#261a30",
    text: "#f0e6f6",
    css: `
      .theme-synthwave .token.keyword { color: #fede5d; text-shadow: 0 0 2px #fede5d; }
      .theme-synthwave .token.string { color: #ff7edb; text-shadow: 0 0 2px #ff7edb; }
      .theme-synthwave .token.comment { color: #848bb3; font-style: italic; }
      .theme-synthwave .token.function { color: #36f9f6; text-shadow: 0 0 2px #36f9f6; }
      .theme-synthwave .token.number { color: #f97e72; }
      .theme-synthwave .token.operator { color: #36f9f6; }
      .theme-synthwave .token.punctuation { color: #f0e6f6; }
      .theme-synthwave .token.class-name { color: #fe4450; }
      .theme-synthwave .token.property { color: #36f9f6; }
    `
  }
];

const DEFAULT_CODE = `// Elegant code screenshot beautifier
function greetUser(username) {
  const message = \`Hello, \${username}! Welcome to Toolsy.\`;
  console.log(message);
  
  return {
    success: true,
    timestamp: Date.now()
  };
}

// Call the function
greetUser("Developer");`;

export default function CodeToImage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("one-dark");
  const [gradient, setGradient] = useState("sunset");
  const [padding, setPadding] = useState("32px");
  const [fontSize, setFontSize] = useState("14px");
  const [shadow, setShadow] = useState("soft");
  const [showWindowControls, setShowWindowControls] = useState(true);
  const [watermark, setWatermark] = useState("toolsy.rayonweb.com");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState("");

  const previewRef = useRef<HTMLDivElement>(null);

  // Update Prism highlighting
  useEffect(() => {
    try {
      const selectedLang = Prism.languages[language] || Prism.languages.javascript;
      const html = Prism.highlight(code, selectedLang, language);
      setHighlightedHtml(html);
    } catch (e) {
      // Fallback
      setHighlightedHtml(code);
    }
  }, [code, language]);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 3, // Multi-scale for ultra-sharp Retina output
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `toolsy-code-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Capture Error: ", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 3,
        backgroundColor: null,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob
            })
          ]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (copyErr) {
          console.error("Clipboard Copy Error: ", copyErr);
          alert("Clipboard copy failed. Try downloading the image instead.");
        }
      }, "image/png");
    } catch (err) {
      console.error("Capture Error: ", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const selectedTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const selectedGradient = GRADIENTS.find((g) => g.id === gradient) || GRADIENTS[0];
  const selectedShadow = SHADOWS.find((s) => s.id === shadow) || SHADOWS[1];

  return (
    <div className="space-y-8">
      {/* Dynamic theme style injection for html2canvas to read */}
      <style dangerouslySetInnerHTML={{ __html: THEMES.map(t => t.css).join("\n") }} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
        
        {/* Settings Panel */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card/60 p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Sliders className="w-5 h-5 text-accent" />
              Customize Editor
            </h2>

            {/* Language & Theme Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Editor Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {THEMES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Code Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" />
                  Code Block
                </label>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                rows={10}
                className="w-full rounded-md border border-input bg-background p-3 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-y"
              />
            </div>

            {/* Gradient Backgrounds */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Background Gradient
              </label>
              <div className="grid grid-cols-4 gap-2">
                {GRADIENTS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGradient(g.id)}
                    className={`h-10 rounded-md border transition-all text-[10px] font-medium flex items-center justify-center relative overflow-hidden ${
                      gradient === g.id ? "border-accent ring-2 ring-accent/20 scale-95" : "border-border hover:border-accent/50"
                    }`}
                    style={{ background: g.value }}
                    title={g.name}
                  >
                    <span className={`px-1 py-0.5 rounded ${g.id.includes("light") ? "bg-black/10 text-black" : "bg-black/50 text-white"}`}>
                      {g.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Adjustments */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Padding</label>
                <select
                  value={padding}
                  onChange={(e) => setPadding(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="16px">Small (16px)</option>
                  <option value="32px">Medium (32px)</option>
                  <option value="48px">Large (48px)</option>
                  <option value="64px">Extra Large (64px)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Font Size</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="12px">12px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Canvas Shadow</label>
                <select
                  value={shadow}
                  onChange={(e) => setShadow(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {SHADOWS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Watermark Text</label>
                <input
                  type="text"
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value)}
                  placeholder="toolsy.rayonweb.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            {/* macOS Window dots toggle */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-foreground">Window Controls</label>
                <p className="text-xs text-muted-foreground">Show macOS close, minimize, expand dots</p>
              </div>
              <input
                type="checkbox"
                checked={showWindowControls}
                onChange={(e) => setShowWindowControls(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
              />
            </div>

          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-2 flex-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              Live Card Preview
            </label>
            
            {/* The capture target card */}
            <div
              ref={previewRef}
              className="w-full overflow-hidden rounded-2xl flex flex-col items-center justify-center relative transition-all"
              style={{
                background: selectedGradient.value,
                padding: padding,
                minHeight: "320px"
              }}
            >
              {/* Main Code Box */}
              <div
                className={`w-full rounded-xl overflow-hidden text-left flex flex-col theme-${theme}`}
                style={{
                  background: selectedTheme.bg,
                  color: selectedTheme.text,
                  boxShadow: selectedShadow.value,
                }}
              >
                {/* Header Window Bar */}
                {(showWindowControls || language) && (
                  <div className="flex items-center justify-between px-4 py-3 bg-black/10 border-b border-white/5 select-none">
                    {showWindowControls ? (
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                      </div>
                    ) : <div />}
                    <span className="text-[11px] font-semibold opacity-50 tracking-widest uppercase">
                      {language}
                    </span>
                  </div>
                )}

                {/* Code display */}
                <pre
                  className="p-5 font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed m-0"
                  style={{ fontSize: fontSize }}
                >
                  <code
                    className={`language-${language}`}
                    dangerouslySetInnerHTML={{ __html: highlightedHtml || code }}
                  />
                </pre>
              </div>

              {/* Watermark in bottom right corner */}
              {watermark && (
                <div 
                  className={`absolute bottom-2 right-4 text-[10px] font-semibold opacity-60 tracking-wider ${
                    selectedGradient.id === "minimal-light" ? "text-slate-800" : "text-white"
                  }`}
                >
                  {watermark}
                </div>
              )}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 bg-accent hover:bg-accent/90 text-white font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? "Generating PNG..." : "Download High-Res PNG"}
            </Button>
            <Button
              onClick={handleCopyToClipboard}
              disabled={isDownloading}
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-accent/5"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Image to Clipboard
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
