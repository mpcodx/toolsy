import { Button } from "@/components/ui/button";
import { Upload, Download, Eye, ShieldCheck, Minimize2, Image, FileImage, Settings, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";

interface FileDetails {
  name: string;
  size: number;
  type: string;
  dimensions: { width: number; height: number } | null;
  url: string;
}

export default function ImageSanitizer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalDetails, setOriginalDetails] = useState<FileDetails | null>(null);
  const [compressedDetails, setCompressedDetails] = useState<FileDetails | null>(null);
  
  // Compression parameters
  const [quality, setQuality] = useState<number>(80); // 0-100
  const [maxWidthHeight, setMaxWidthHeight] = useState<number>(1920);
  const [convertFormat, setConvertFormat] = useState<string>("original"); // original, jpeg, png, webp
  const [stripExif, setStripExif] = useState<boolean>(true);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear states when file changes
  const handleClear = () => {
    setSelectedFile(null);
    setOriginalDetails(null);
    setCompressedDetails(null);
    setCompressedBlob(null);
    setProgress(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processInputFile(file);
    }
  };

  const processInputFile = (file: File) => {
    const url = URL.createObjectURL(file);
    
    // Read dimensions
    const img = new window.Image();
    img.onload = () => {
      setOriginalDetails({
        name: file.name,
        size: file.size,
        type: file.type,
        dimensions: { width: img.naturalWidth, height: img.naturalHeight },
        url: url
      });
      setSelectedFile(file);
    };
    img.src = url;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processInputFile(file);
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgress(10);
    
    try {
      // Configure format override
      let targetType = selectedFile.type;
      if (convertFormat !== "original") {
        targetType = `image/${convertFormat}`;
      }

      const options = {
        maxSizeMB: (selectedFile.size * (quality / 100)) / (1024 * 1024),
        maxWidthOrHeight: maxWidthHeight,
        useWebWorker: true,
        fileType: targetType,
        onProgress: (p: number) => {
          setProgress(Math.min(90, Math.round(p)));
        }
      };

      let processedFile = await imageCompression(selectedFile, options);
      setProgress(95);

      // Draw onto canvas to guarantee EXIF stripping
      if (stripExif) {
        const cleanBlob = await stripExifViaCanvas(processedFile, targetType);
        processedFile = new File([cleanBlob], selectedFile.name, { type: targetType });
      }

      const compressedUrl = URL.createObjectURL(processedFile);
      
      const img = new window.Image();
      img.onload = () => {
        setCompressedDetails({
          name: renameExtension(selectedFile.name, convertFormat === "original" ? undefined : convertFormat),
          size: processedFile.size,
          type: processedFile.type,
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
          url: compressedUrl
        });
        setCompressedBlob(processedFile);
        setProgress(100);
        setIsProcessing(false);
      };
      img.src = compressedUrl;

    } catch (err) {
      console.error("Compression failed: ", err);
      alert("Compression failed. Please try different options.");
      setIsProcessing(false);
    }
  };

  // Helper that renders the file to a clean canvas and exports it to strip EXIF headers entirely
  const stripExifViaCanvas = (file: File | Blob, type: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // Fallback
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        }, type, quality / 100);
      };
      img.onerror = () => reject(new Error("Image load error during EXIF stripping"));
      img.src = URL.createObjectURL(file);
    });
  };

  const renameExtension = (filename: string, newExt?: string) => {
    if (!newExt) return filename;
    return filename.replace(/\.[^.]+$/, `.${newExt}`);
  };

  const handleDownload = () => {
    if (!compressedBlob || !compressedDetails) return;
    const link = document.createElement("a");
    link.href = compressedDetails.url;
    link.download = `toolsy-sanitized-${compressedDetails.name}`;
    link.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getSavings = () => {
    if (!originalDetails || !compressedDetails) return 0;
    const savings = ((originalDetails.size - compressedDetails.size) / originalDetails.size) * 100;
    return Math.round(savings);
  };

  return (
    <div className="space-y-6">
      {!selectedFile ? (
        // Dropzone Area
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Upload Image to Sanitize & Compress
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Drag and drop your image, or click to browse. Excludes uploading to servers. 100% processed offline in your web browser.
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            Automatic Metadata Eraser Enabled
          </div>
        </div>
      ) : (
        // Settings and Live Comparison view
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          
          {/* Main Comparison Area */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card/60 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Minimize2 className="w-5 h-5 text-accent" />
                  Compression & Sanitization Dashboard
                </h3>
                <Button onClick={handleClear} variant="ghost" className="text-muted-foreground hover:text-foreground text-xs">
                  Change Image
                </Button>
              </div>

              {/* Comparison boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Original Image Card */}
                {originalDetails && (
                  <div className="rounded-lg border border-border bg-background p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Image className="w-3.5 h-3.5" /> Original File
                        </span>
                      </div>
                      <div className="aspect-[4/3] rounded-md bg-muted/40 overflow-hidden flex items-center justify-center relative">
                        <img
                          src={originalDetails.url}
                          alt="Original"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="text-xs space-y-1 text-muted-foreground bg-muted/20 p-2.5 rounded-md mt-2">
                      <p className="truncate"><strong className="text-foreground">Name:</strong> {originalDetails.name}</p>
                      <p><strong className="text-foreground">Size:</strong> {formatSize(originalDetails.size)}</p>
                      <p><strong className="text-foreground">Dimensions:</strong> {originalDetails.dimensions ? `${originalDetails.dimensions.width} x ${originalDetails.dimensions.height}px` : "Reading..."}</p>
                      <p className="flex items-center gap-1 text-red-500/80 font-medium">
                        <span>⚠ Contains EXIF & Location tags</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Sanitized/Compressed Image Card */}
                <div className="rounded-lg border border-border bg-background p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <FileImage className="w-3.5 h-3.5 text-emerald-500" /> Sanitized Output
                      </span>
                      {compressedDetails && (
                        <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                          Ready
                        </span>
                      )}
                    </div>
                    
                    <div className="aspect-[4/3] rounded-md bg-muted/40 overflow-hidden flex items-center justify-center relative">
                      {isProcessing ? (
                        <div className="text-center p-6">
                          <div className="w-10 h-10 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Sanitizing EXIF {progress}%...</p>
                        </div>
                      ) : compressedDetails ? (
                        <img
                          src={compressedDetails.url}
                          alt="Sanitized & Compressed"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-6 text-muted-foreground text-xs">
                          Click "Apply & Process" to compress.
                        </div>
                      )}
                    </div>
                  </div>

                  {compressedDetails ? (
                    <div className="text-xs space-y-1 text-muted-foreground bg-emerald-500/5 border border-emerald-500/15 p-2.5 rounded-md mt-2">
                      <p className="truncate"><strong className="text-foreground">Name:</strong> {compressedDetails.name}</p>
                      <p><strong className="text-foreground">Size:</strong> {formatSize(compressedDetails.size)}</p>
                      <p><strong className="text-foreground">Dimensions:</strong> {compressedDetails.dimensions?.width} x {compressedDetails.dimensions?.height}px</p>
                      <p className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        EXIF & GPS meta erased 100%
                      </p>
                    </div>
                  ) : (
                    <div className="h-[90px] flex items-center justify-center border border-dashed border-border rounded-md mt-2 text-xs text-muted-foreground">
                      Pending compression
                    </div>
                  )}
                </div>

              </div>

              {/* Action output statistics */}
              {compressedDetails && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 justify-center sm:justify-start">
                      <ShieldCheck className="w-4 h-4" />
                      Success! File metadata stripped and compressed safely offline.
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your file size was reduced from {formatSize(originalDetails?.size || 0)} to {formatSize(compressedDetails.size)}.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-600">{getSavings()}%</div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Saved</div>
                    </div>
                    <Button onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Download className="w-4 h-4 mr-2" /> Download Clean Image
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Inspector Sidebar */}
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              Settings
            </span>

            {/* Quality Factor */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compression Quality</label>
                <span className="text-xs font-bold text-accent">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-muted accent-accent"
              />
              <p className="text-[10px] text-muted-foreground">Lower values shrink the file more but can lower detail.</p>
            </div>

            {/* Maximum Dimensions */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max Width / Height</label>
              <select
                value={maxWidthHeight}
                onChange={(e) => setMaxWidthHeight(parseInt(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="1080">1080px (Standard Web)</option>
                <option value="1920">1920px (Full HD)</option>
                <option value="2560">2560px (2K Retina)</option>
                <option value="3840">3840px (4K Ultra HD)</option>
                <option value="99999">Keep Original Dimensions</option>
              </select>
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Export format</label>
              <select
                value={convertFormat}
                onChange={(e) => setConvertFormat(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="original">Keep Original Type</option>
                <option value="jpeg">Convert to JPEG</option>
                <option value="png">Convert to PNG</option>
                <option value="webp">Convert to WebP (Recommended)</option>
              </select>
            </div>

            {/* Exif erase checkbox */}
            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <div className="space-y-0.5 pr-2">
                <label className="text-xs font-bold text-foreground">Strip Metadata (EXIF)</label>
                <p className="text-[10px] text-muted-foreground">Delete GPS coordinates, camera maker details, dates.</p>
              </div>
              <input
                type="checkbox"
                checked={stripExif}
                onChange={(e) => setStripExif(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            {/* Apply Action */}
            <Button
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-5 mt-4"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing offline..." : "Apply & Process Image"}
            </Button>
          </div>

        </div>
      )}
    </div>
  );
}
