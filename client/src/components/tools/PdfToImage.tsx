import { Button } from "@/components/ui/button";
import { Download, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { downloadBlob } from "@/lib/download";

/**
 * PDF to Image Converter Tool
 * Converts PDF pages to JPG, PNG, or WebP format
 */

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"jpg" | "png" | "webp">("jpg");
  const [quality, setQuality] = useState(85);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File | undefined) => {
    if (!selectedFile) {
      return;
    }

    if (selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setFile(selectedFile);
      return;
    }

    alert("Please select a valid PDF file");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);
      formData.append("quality", String(quality));

      const response = await fetch("/api/convert/pdf-to-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let message = `Conversion failed with status ${response.status}.`;

        if (contentType.includes("application/json")) {
          const payload = (await response.json()) as { error?: string; message?: string };
          message = payload.error || payload.message || message;
        } else {
          const text = await response.text();
          if (text.trim()) {
            message = text.trim();
          }
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      downloadBlob(blob, `${file.name.replace(/\.pdf$/i, "") || "converted"}-${format}-images.zip`);
      alert("Conversion complete! Download started.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Conversion failed. Please try again.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">
          {file ? file.name : "Click to upload or drag and drop"}
        </h3>
        <p className="text-sm text-muted-foreground">
          PDF files up to 100MB are supported
        </p>
      </div>

      {/* Selected File Info */}
      {file && (
        <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border">
          <div>
            <p className="font-medium text-foreground">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Output Format
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(["jpg", "png", "webp"] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                format === fmt
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/50"
              }`}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Each page is exported as a separate image inside a ZIP file.
        </p>
      </div>

      {/* Quality Slider */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Quality: {quality}%
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Higher quality means larger ZIP size for JPG and WebP output
        </p>
      </div>

      {/* Convert Button */}
      <Button
        onClick={handleConvert}
        disabled={!file || loading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
            Converting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Convert to {format.toUpperCase()} ZIP
          </>
        )}
      </Button>

      {/* Info Section */}
      <div className="bg-card/50 rounded-lg p-4 border border-border">
        <h4 className="font-semibold text-foreground mb-2">Features:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>✓ Export every PDF page as an image</li>
          <li>✓ Choose JPG, PNG, or WebP output</li>
          <li>✓ Adjust compression quality for JPG and WebP</li>
          <li>✓ Download all pages in one ZIP file</li>
          <li>✓ Files stay local to this conversion session</li>
        </ul>
      </div>
    </div>
  );
}
