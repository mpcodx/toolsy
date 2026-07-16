import { Button } from "@/components/ui/button";
import { Upload, Download, Palette, Settings, Layout, Code, FileCode, Check, Copy } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";

interface SvgColorMap {
  original: string;
  current: string;
}

const SAMPLE_SVGS = [
  {
    id: "rocket",
    name: "Spaceship Rocket",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Rocket Body -->
  <path d="M50 15 C35 35 35 65 35 75 L65 75 C65 65 65 35 50 15 Z" fill="#3b82f6" />
  <!-- Rocket Nose Cone -->
  <path d="M50 15 C44 26 42 36 40 45 L60 45 C58 36 56 26 50 15 Z" fill="#ef4444" />
  <!-- Rocket Window -->
  <circle cx="50" cy="55" r="8" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
  <circle cx="50" cy="55" r="4" fill="#06b6d4" />
  <!-- Wings / Fins -->
  <path d="M35 60 L20 75 L35 75 Z" fill="#1e3a8a" />
  <path d="M65 60 L80 75 L65 75 Z" fill="#1e3a8a" />
  <!-- Thrust Flame -->
  <path d="M42 75 L50 90 L58 75 Z" fill="#f59e0b" />
  <path d="M46 75 L50 83 L54 75 Z" fill="#ef4444" />
</svg>`
  },
  {
    id: "sparkles",
    name: "Magic Sparkles",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 10 L54 36 L80 40 L54 44 L50 70 L46 44 L20 40 L46 36 Z" fill="#eab308" />
  <path d="M25 65 L27 75 L37 77 L27 79 L25 89 L23 79 L13 77 L23 75 Z" fill="#a855f7" />
  <path d="M75 20 L76.5 28 L85 29.5 L76.5 31 L75 39.5 L73.5 31 L65 29.5 L73.5 28 Z" fill="#06b6d4" />
</svg>`
  },
  {
    id: "shield",
    name: "Cyber Security Shield",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 10 C65 10 80 15 80 15 C80 15 80 45 80 60 C80 75 65 85 50 90 C35 85 20 75 20 60 C20 45 20 15 20 15 C20 15 35 10 50 10 Z" fill="#1e293b" />
  <path d="M50 16 C62 16 74 20 74 20 C74 20 74 46 74 58 C74 70 62 79 50 83.5 C38 79 26 70 26 58 C26 46 26 20 26 20 C26 20 38 16 50 16 Z" fill="#10b981" />
  <path d="M50 25 L70 35 L70 58 C70 67 62 74 50 78 C38 74 30 67 30 58 L30 35 Z" fill="#047857" />
  <path d="M50 35 L62 42 L58 53 L47 50 L47 62 L53 62 L50 67 L50 67" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
</svg>`
  }
];

const BG_GRADIENTS = [
  { id: "clean-dark", name: "Slate Grid", value: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
  { id: "neon", name: "Neon Glow", value: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)" },
  { id: "soft-sunset", name: "Sunset", value: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)" },
  { id: "transparent", name: "Checkerboard (Transparent)", value: "transparent" },
];

export default function SvgCustomizer() {
  const [svgCode, setSvgCode] = useState<string>(SAMPLE_SVGS[0].code);
  const [colors, setColors] = useState<SvgColorMap[]>([]);
  const [width, setWidth] = useState<number>(300);
  const [height, setHeight] = useState<number>(300);
  const [strokeWidthFactor, setStrokeWidthFactor] = useState<number>(1);
  const [bgType, setBgType] = useState<string>("clean-dark");
  const [showCardWrapper, setShowCardWrapper] = useState<boolean>(false);
  const [cardPadding, setCardPadding] = useState<string>("48px");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Parse colors from the SVG code whenever SVG code is loaded
  useEffect(() => {
    parseSvgColors(svgCode);
  }, [svgCode]);

  const parseSvgColors = (code: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, "image/svg+xml");
      const errorNode = doc.querySelector("parsererror");
      if (errorNode) return;

      const foundColors = new Set<string>();
      const traverse = (el: Element) => {
        const fill = el.getAttribute("fill");
        const stroke = el.getAttribute("stroke");
        
        if (fill && fill !== "none" && fill.startsWith("#")) {
          foundColors.add(fill.toLowerCase());
        }
        if (stroke && stroke !== "none" && stroke.startsWith("#")) {
          foundColors.add(stroke.toLowerCase());
        }

        // Search style attribute
        const style = el.getAttribute("style");
        if (style) {
          const fillMatches = style.match(/fill:\s*(#[a-fA-F0-9]{3,8})/);
          if (fillMatches?.[1]) foundColors.add(fillMatches[1].toLowerCase());
          
          const strokeMatches = style.match(/stroke:\s*(#[a-fA-F0-9]{3,8})/);
          if (strokeMatches?.[1]) foundColors.add(strokeMatches[1].toLowerCase());
        }

        for (let i = 0; i < el.children.length; i++) {
          traverse(el.children[i]);
        }
      };

      const svgEl = doc.querySelector("svg");
      if (svgEl) {
        traverse(svgEl);
      }

      setColors(
        Array.from(foundColors).map((c) => ({
          original: c,
          current: c,
        }))
      );
    } catch (e) {
      console.error("Color parsing error:", e);
    }
  };

  const handleColorChange = (index: number, newColor: string) => {
    setColors((prev) =>
      prev.map((c, idx) => (idx === index ? { ...c, current: newColor } : c))
    );
  };

  // Compile modified SVG DOM to string
  const getModifiedSvgCode = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svgCode;

      // Apply dimensions
      svgEl.setAttribute("width", `${width}px`);
      svgEl.setAttribute("height", `${height}px`);

      // Recursively replace colors and adjust strokes
      const processElement = (el: Element) => {
        // Adjust colors
        const fill = el.getAttribute("fill");
        const stroke = el.getAttribute("stroke");

        if (fill) {
          const map = colors.find((c) => c.original === fill.toLowerCase());
          if (map) el.setAttribute("fill", map.current);
        }
        if (stroke) {
          const map = colors.find((c) => c.original === stroke.toLowerCase());
          if (map) el.setAttribute("stroke", map.current);
        }

        // Adjust style attribute if it has colors
        const style = el.getAttribute("style");
        if (style) {
          let newStyle = style;
          colors.forEach((map) => {
            const regexFill = new RegExp(`fill:\\s*${map.original}`, "gi");
            const regexStroke = new RegExp(`stroke:\\s*${map.original}`, "gi");
            newStyle = newStyle.replace(regexFill, `fill:${map.current}`).replace(regexStroke, `stroke:${map.current}`);
          });
          el.setAttribute("style", newStyle);
        }

        // Adjust stroke widths
        const strokeWidth = el.getAttribute("stroke-width");
        if (strokeWidth && !isNaN(parseFloat(strokeWidth))) {
          const adjusted = parseFloat(strokeWidth) * strokeWidthFactor;
          el.setAttribute("stroke-width", adjusted.toString());
        }

        for (let i = 0; i < el.children.length; i++) {
          processElement(el.children[i]);
        }
      };

      processElement(svgEl);

      const serializer = new XMLSerializer();
      return serializer.serializeToString(doc);
    } catch (e) {
      console.error("Modifying SVG error:", e);
      return svgCode;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text.includes("<svg")) {
          setSvgCode(text);
        } else {
          alert("File is not a valid SVG.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportSvg = () => {
    const code = getModifiedSvgCode();
    const blob = new Blob([code], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "toolsy-custom.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPngCard = async () => {
    const target = showCardWrapper ? cardRef.current : previewRef.current;
    if (!target) return;

    try {
      const canvas = await html2canvas(target, {
        useCORS: true,
        allowTaint: true,
        scale: 2.5,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `toolsy-svg-card-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG export error:", err);
      alert("Failed to export PNG. Try exporting SVG instead.");
    }
  };

  const handleCopyCode = async () => {
    const code = getModifiedSvgCode();
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      alert("Failed to copy code to clipboard.");
    }
  };

  const currentGradient = BG_GRADIENTS.find((g) => g.id === bgType) || BG_GRADIENTS[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        
        {/* Visual Workspace */}
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-card/40 border border-border px-4 py-3 rounded-lg">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Canvas Editor Workspace
            </span>
            <div className="flex gap-2">
              <Button
                onClick={() => uploadInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="text-xs border-border"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload custom SVG
              </Button>
              <input
                type="file"
                ref={uploadInputRef}
                onChange={handleFileUpload}
                accept=".svg"
                className="hidden"
              />
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex items-center justify-center bg-muted/20 border border-border rounded-xl p-8 min-h-[400px]">
            {/* The element we capture */}
            <div
              ref={cardRef}
              className={`rounded-xl flex items-center justify-center relative overflow-hidden transition-all ${
                showCardWrapper ? "shadow-2xl" : ""
              }`}
              style={{
                background: showCardWrapper ? currentGradient.value : "transparent",
                padding: showCardWrapper ? cardPadding : "0px",
                backgroundImage:
                  !showCardWrapper && bgType === "transparent"
                    ? "radial-gradient(#e2e8f0 10%, transparent 10%), radial-gradient(#e2e8f0 10%, transparent 10%)"
                    : undefined,
                backgroundPosition: !showCardWrapper && bgType === "transparent" ? "0 0, 10px 10px" : undefined,
                backgroundSize: !showCardWrapper && bgType === "transparent" ? "20px 20px" : undefined,
                backgroundColor: !showCardWrapper && bgType === "transparent" ? "#f8fafc" : undefined,
              }}
            >
              {/* Dynamic SVG Container */}
              <div
                ref={previewRef}
                className="flex items-center justify-center p-4"
                dangerouslySetInnerHTML={{ __html: getModifiedSvgCode() }}
              />
            </div>
          </div>

          {/* Bottom quick actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleExportSvg}
              className="flex-1 bg-accent hover:bg-accent/90 text-white font-semibold"
            >
              <Download className="w-4 h-4 mr-2" /> Download clean SVG
            </Button>
            <Button
              onClick={handleExportPngCard}
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-accent/5"
            >
              <Layout className="w-4 h-4 mr-2" /> Export PNG Mockup
            </Button>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className="border-border text-foreground hover:bg-accent/5"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-green-500" /> Copied!
                </>
              ) : (
                <>
                  <Code className="w-4 h-4 mr-1.5" /> Copy SVG Code
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Adjustments Panel */}
        <div className="space-y-6">
          
          {/* Preset Samples */}
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              Test Sample Vectors
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_SVGS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => setSvgCode(sample.code)}
                  className={`text-[10px] font-semibold border rounded-lg p-2 hover:border-accent hover:bg-accent/5 transition-all text-center ${
                    svgCode === sample.code ? "border-accent bg-accent/10" : "border-border"
                  }`}
                >
                  {sample.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Color pickers */}
          {colors.length > 0 && (
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Palette className="w-4 h-4" />
                Customize Vector Colors
              </span>
              <div className="space-y-3">
                {colors.map((c, index) => (
                  <div key={c.original} className="flex items-center justify-between gap-4">
                    <span className="text-xs font-mono truncate text-muted-foreground flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-sm border border-black/10" style={{ backgroundColor: c.original }} />
                      {c.original}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={c.current}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="w-7 h-7 p-0 border border-border rounded cursor-pointer"
                      />
                      <span className="text-xs font-mono">{c.current}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dimensions Inspector */}
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              Dimensions & Borders
            </span>

            {/* Custom Sizes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase font-semibold">Width (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Math.max(10, parseInt(e.target.value) || 100))}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm text-foreground focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase font-semibold">Height (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Math.max(10, parseInt(e.target.value) || 100))}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Stroke scaling */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stroke multiplier</label>
                <span className="text-xs font-bold text-accent">{strokeWidthFactor}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                value={strokeWidthFactor}
                onChange={(e) => setStrokeWidthFactor(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-muted accent-accent"
              />
            </div>
          </div>

          {/* Card Presentation Mockup options */}
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layout className="w-4 h-4" />
              Mockup Card Presenter
            </span>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Mockup Card Mode</span>
              <input
                type="checkbox"
                checked={showCardWrapper}
                onChange={(e) => setShowCardWrapper(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
              />
            </div>

            {showCardWrapper && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card Gradient bg</label>
                  <select
                    value={bgType}
                    onChange={(e) => setBgType(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  >
                    {BG_GRADIENTS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card Padding</label>
                  <select
                    value={cardPadding}
                    onChange={(e) => setCardPadding(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  >
                    <option value="24px">24px</option>
                    <option value="48px">48px (Balanced)</option>
                    <option value="64px">64px</option>
                    <option value="96px">96px</option>
                  </select>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
