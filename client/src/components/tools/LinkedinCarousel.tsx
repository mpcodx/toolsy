import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowUp, ArrowDown, Download, Layers, Sliders, Type, Palette, Copy } from "lucide-react";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface Slide {
  id: string;
  title: string;
  body: string;
  bgColor: string;
  bgGradient: string;
  useGradient: boolean;
  textColor: string;
  layout: "center" | "split" | "bullets" | "hero";
}

const PRESET_BACKGROUNDS = [
  { name: "Navy Blue", solid: "#0f172a", gradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", text: "#f8fafc" },
  { name: "Teal Green", solid: "#0d9488", gradient: "linear-gradient(135deg, #0d9488 0%, #115e59 100%)", text: "#f0fdfa" },
  { name: "Crimson Red", solid: "#be123c", gradient: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)", text: "#fff1f2" },
  { name: "Royal Purple", solid: "#6d28d9", gradient: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)", text: "#f5f3ff" },
  { name: "Warm Amber", solid: "#d97706", gradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)", text: "#fef3c7" },
  { name: "Clean Gray", solid: "#374151", gradient: "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)", text: "#f9fafb" },
  { name: "Bright White", solid: "#ffffff", gradient: "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)", text: "#1f2937" },
  { name: "Dark Charcoal", solid: "#121212", gradient: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)", text: "#ffffff" },
];

export default function LinkedinCarousel() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "slide-1",
      title: "HOW TO BUILD A 100% CLIENT-SIDE APP",
      body: "Discover the power of Next.js & React utility engines running fully inside the browser without databases.",
      bgColor: "#0f172a",
      bgGradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      useGradient: true,
      textColor: "#ffffff",
      layout: "hero",
    },
    {
      id: "slide-2",
      title: "Benefit #1: Zero Cost Scaling",
      body: "Because code runs on the user's browser, your hosting costs remain completely flat, whether you have 10 or 1,000,000 users.",
      bgColor: "#0f172a",
      bgGradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      useGradient: true,
      textColor: "#ffffff",
      layout: "center",
    },
    {
      id: "slide-3",
      title: "Benefit #2: Privacy By Default",
      body: "User files never leave their machine. Safe from hacks and fully regulatory-compliant out of the box.",
      bgColor: "#0f172a",
      bgGradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      useGradient: true,
      textColor: "#ffffff",
      layout: "bullets",
    },
  ]);

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [watermark, setWatermark] = useState("@rayonweb");
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [size, setSize] = useState<"square" | "portrait">("square"); // square: 1080x1080, portrait: 1080x1350
  const [isExporting, setIsExporting] = useState(false);

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeSlide = slides[activeSlideIndex] || slides[0];

  const handleUpdateActiveSlide = (fields: Partial<Slide>) => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, ...fields } : s))
    );
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: "Title text here",
      body: "Write supporting points or description text in this section.",
      bgColor: activeSlide.bgColor,
      bgGradient: activeSlide.bgGradient,
      useGradient: activeSlide.useGradient,
      textColor: activeSlide.textColor,
      layout: "center",
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, idx) => idx !== index));
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === slides.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    setSlides(newSlides);
    setActiveSlideIndex(targetIndex);
  };

  const handleDuplicateSlide = (index: number) => {
    const target = slides[index];
    const duplicate: Slide = {
      ...target,
      id: `slide-${Date.now()}`,
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, duplicate);
    setSlides(newSlides);
    setActiveSlideIndex(index + 1);
  };

  const handleApplyColorPreset = (preset: typeof PRESET_BACKGROUNDS[0]) => {
    handleUpdateActiveSlide({
      bgColor: preset.solid,
      bgGradient: preset.gradient,
      textColor: preset.text,
    });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const dimensions = size === "square" ? [1080, 1080] : [1080, 1350];
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: dimensions,
      });

      for (let i = 0; i < slides.length; i++) {
        const slideEl = slideRefs.current[i];
        if (!slideEl) continue;

        // Force slide DOM element to be visible during render if hidden, or use CORS options
        const canvas = await html2canvas(slideEl, {
          scale: 1.5, // 1.5x scale for crispness without huge PDF sizes
          useCORS: true,
          allowTaint: true,
          logging: false,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) {
          pdf.addPage(dimensions, "portrait");
        }
        pdf.addImage(imgData, "JPEG", 0, 0, dimensions[0], dimensions[1]);
      }

      pdf.save("toolsy-linkedin-carousel.pdf");
    } catch (err) {
      console.error("PDF Compilation Error: ", err);
      alert("Error compiling PDF carousel. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const getSlideStyle = (slide: Slide) => ({
    background: slide.useGradient ? slide.bgGradient : slide.bgColor,
    color: slide.textColor,
  });

  return (
    <div className="space-y-8">
      {/* Structural layout selector */}
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-6">
        
        {/* Slide List Sidebar */}
        <div className="rounded-xl border border-border bg-card/60 p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Slides ({slides.length})
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[450px] pr-1">
            {slides.map((s, index) => (
              <div
                key={s.id}
                onClick={() => setActiveSlideIndex(index)}
                className={`group rounded-lg border p-3 cursor-pointer text-left transition-all ${
                  activeSlideIndex === index
                    ? "border-accent bg-accent/10 shadow-sm"
                    : "border-border hover:bg-accent/5 bg-background/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Slide {index + 1}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSlide(index, "up");
                      }}
                      disabled={index === 0}
                      className="p-0.5 hover:text-accent disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSlide(index, "down");
                      }}
                      disabled={index === slides.length - 1}
                      className="p-0.5 hover:text-accent disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs font-semibold truncate text-foreground mb-1">
                  {s.title || "(No Title)"}
                </h4>
                <div className="flex justify-between items-center mt-2 pt-1 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateSlide(index);
                    }}
                    className="text-[10px] text-accent hover:underline flex items-center gap-0.5"
                  >
                    Duplicate
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlide(index);
                      }}
                      className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleAddSlide}
            variant="outline"
            className="w-full border-dashed border-accent hover:bg-accent/5 hover:border-accent"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Slide
          </Button>
        </div>

        {/* Live Presentation Canvas Preview */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-card/40 border border-border p-3 rounded-lg">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Slide {activeSlideIndex + 1} of {slides.length} Preview
            </span>
            <div className="flex items-center gap-3">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                Format:
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value as any)}
                  className="rounded border border-border bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="square">Square (1:1)</option>
                  <option value="portrait">Portrait (4:5)</option>
                </select>
              </label>
            </div>
          </div>

          {/* Wrapper that acts as viewport */}
          <div className="flex items-center justify-center bg-muted/30 border border-border rounded-xl p-6 min-h-[450px]">
            {/* The active slide preview container */}
            <div
              id={`render-active-slide`}
              className="relative shadow-xl overflow-hidden text-left flex flex-col justify-between p-12 transition-all"
              style={{
                width: "400px",
                height: size === "square" ? "400px" : "500px",
                ...getSlideStyle(activeSlide),
              }}
            >
              {/* Top Watermark bar */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider opacity-60">
                  {watermark}
                </span>
                {showPageNumbers && (
                  <span className="text-xs font-semibold opacity-60">
                    {activeSlideIndex + 1} / {slides.length}
                  </span>
                )}
              </div>

              {/* Slide content layouts */}
              <div className="flex-1 flex flex-col justify-center my-6">
                {activeSlide.layout === "hero" && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold uppercase tracking-tight leading-tight" style={{ color: activeSlide.textColor }}>
                      {activeSlide.title}
                    </h2>
                    <div className="w-16 h-1.5 bg-accent rounded" />
                    <p className="text-sm opacity-80 leading-relaxed">
                      {activeSlide.body}
                    </p>
                  </div>
                )}

                {activeSlide.layout === "center" && (
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold uppercase tracking-wide leading-snug">
                      {activeSlide.title}
                    </h3>
                    <p className="text-sm opacity-80 max-w-md mx-auto leading-relaxed">
                      {activeSlide.body}
                    </p>
                  </div>
                )}

                {activeSlide.layout === "split" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-wide">
                        {activeSlide.title}
                      </h3>
                      <div className="w-8 h-1 bg-accent rounded mt-2" />
                    </div>
                    <div>
                      <p className="text-xs opacity-80 leading-relaxed">
                        {activeSlide.body}
                      </p>
                    </div>
                  </div>
                )}

                {activeSlide.layout === "bullets" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold uppercase tracking-wide border-b border-white/10 pb-2">
                      {activeSlide.title}
                    </h3>
                    <ul className="space-y-2 text-sm opacity-85">
                      {activeSlide.body.split("\n").map((bullet, bidx) => (
                        <li key={bidx} className="flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Brand label footer */}
              <div className="text-[10px] font-semibold uppercase tracking-widest opacity-40">
                Created with Toolsy
              </div>
            </div>
          </div>

          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-6 text-base"
          >
            <Download className="w-5 h-5 mr-2" />
            {isExporting ? "Compiling PDF Slides..." : "Compile & Export PDF Carousel"}
          </Button>
        </div>

        {/* Slide Settings Inspector Panel */}
        <div className="rounded-xl border border-border bg-card/60 p-4 space-y-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sliders className="w-4 h-4" />
            Slide settings
          </span>

          {/* Title Editor */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Type className="w-3 h-3" /> Title
            </label>
            <input
              type="text"
              value={activeSlide.title}
              onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Slide main heading..."
            />
          </div>

          {/* Body Editor */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Type className="w-3 h-3" /> Slide Body
            </label>
            <textarea
              value={activeSlide.body}
              onChange={(e) => handleUpdateActiveSlide({ body: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              placeholder="Slide content description (newlines act as bullet points in bullet layout)..."
            />
          </div>

          {/* Layout Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Layout Type</label>
            <select
              value={activeSlide.layout}
              onChange={(e) => handleUpdateActiveSlide({ layout: e.target.value as any })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="hero">Hero / Cover</option>
              <option value="center">Centered Minimal</option>
              <option value="bullets">Bullet Points List</option>
              <option value="split">Split Layout</option>
            </select>
          </div>

          {/* Background Settings */}
          <div className="space-y-4 pt-4 border-t border-border/60">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              Colors & Backgrounds
            </label>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Use Gradient bg</span>
              <input
                type="checkbox"
                checked={activeSlide.useGradient}
                onChange={(e) => handleUpdateActiveSlide({ useGradient: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
              />
            </div>

            {/* Background Presets */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_BACKGROUNDS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyColorPreset(preset)}
                  className="h-8 rounded-md border border-border hover:border-accent/50 relative overflow-hidden flex items-center justify-center"
                  style={{
                    background: activeSlide.useGradient ? preset.gradient : preset.solid,
                  }}
                  title={preset.name}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.text }}
                  />
                </button>
              ))}
            </div>

            {/* Custom pickers */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Solid Bg</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={activeSlide.bgColor}
                    onChange={(e) => handleUpdateActiveSlide({ bgColor: e.target.value })}
                    className="w-6 h-6 p-0 border border-border rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono">{activeSlide.bgColor}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Text color</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={activeSlide.textColor}
                    onChange={(e) => handleUpdateActiveSlide({ textColor: e.target.value })}
                    className="w-6 h-6 p-0 border border-border rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono">{activeSlide.textColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Watermark global inspector */}
          <div className="space-y-4 pt-4 border-t border-border/60">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Watermark / Handle</label>
              <input
                type="text"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                placeholder="@yourhandle"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Show Slide Count</span>
              <input
                type="checkbox"
                checked={showPageNumbers}
                onChange={(e) => setShowPageNumbers(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Hidden compilation array used by jsPDF/html2canvas */}
      <div className="hidden">
        {slides.map((s, index) => (
          <div
            key={`export-${s.id}`}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            className="flex flex-col justify-between p-24"
            style={{
              width: "1080px",
              height: size === "square" ? "1080px" : "1350px",
              ...getSlideStyle(s),
              fontSize: "32px",
              lineHeight: "1.6",
            }}
          >
            {/* Top Watermark bar */}
            <div className="flex items-center justify-between text-2xl font-semibold opacity-60">
              <span>{watermark}</span>
              {showPageNumbers && <span>{index + 1} / {slides.length}</span>}
            </div>

            {/* Slide content layouts */}
            <div className="flex-1 flex flex-col justify-center my-12">
              {s.layout === "hero" && (
                <div className="space-y-8">
                  <h2 className="text-6xl font-bold uppercase tracking-tight leading-tight" style={{ color: s.textColor }}>
                    {s.title}
                  </h2>
                  <div className="w-36 h-3 bg-accent rounded" />
                  <p className="text-3xl opacity-80 leading-relaxed">
                    {s.body}
                  </p>
                </div>
              )}

              {s.layout === "center" && (
                <div className="text-center space-y-8">
                  <h3 className="text-5xl font-bold uppercase tracking-wide leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-3xl opacity-80 max-w-4xl mx-auto leading-relaxed">
                    {s.body}
                  </p>
                </div>
              )}

              {s.layout === "split" && (
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-5xl font-bold uppercase tracking-wide">
                      {s.title}
                    </h3>
                    <div className="w-24 h-2 bg-accent rounded mt-4" />
                  </div>
                  <div>
                    <p className="text-2xl opacity-80 leading-relaxed">
                      {s.body}
                    </p>
                  </div>
                </div>
              )}

              {s.layout === "bullets" && (
                <div className="space-y-8">
                  <h3 className="text-5xl font-bold uppercase tracking-wide border-b border-white/10 pb-4">
                    {s.title}
                  </h3>
                  <ul className="space-y-4 text-3xl opacity-85">
                    {s.body.split("\n").map((bullet, bidx) => (
                      <li key={bidx} className="flex items-start gap-4">
                        <span className="text-accent mt-1">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Brand label footer */}
            <div className="text-xl font-semibold uppercase tracking-widest opacity-40">
              Created with Toolsy (toolsy.rayonweb.com)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
