import { Button } from "@/components/ui/button";
import { createCenteredCrop, loadImageFromFile, transformImageFile, type CropRect, type ImageTransformFormat } from "@/lib/image-tools";
import { downloadBlob } from "@/lib/download";
import { Download, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ImageSelection = {
  file: File | null;
  preview: string;
  dimensions: { width: number; height: number } | null;
  setFile: (file: File | null) => void;
  clear: () => void;
};

function getBaseName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  return withoutExtension || "converted";
}

function useImageSelection(): ImageSelection {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview("");
      setDimensions(null);
      return;
    }

    let cancelled = false;
    const objectUrl = URL.createObjectURL(file);

    void (async () => {
      try {
        const image = await loadImageFromFile(file);
        if (cancelled) return;
        setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      } catch {
        if (!cancelled) {
          setDimensions(null);
        }
      }
    })();

    setPreview(objectUrl);

    return () => {
      cancelled = true;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return {
    file,
    preview,
    dimensions,
    setFile,
    clear: () => setFile(null),
  };
}

function ImageUploadCard({
  selection,
  accept = "image/jpeg,image/png,image/webp",
  title = "Click to upload or drag and drop",
  hint = "JPG, PNG, or WebP images are supported",
}: {
  selection: ImageSelection;
  accept?: string;
  title?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        selection.setFile(event.dataTransfer.files?.[0] ?? null);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(event) => {
          selection.setFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
        className="hidden"
      />
      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-semibold text-foreground mb-2">
        {selection.file ? selection.file.name : title}
      </h3>
      <p className="text-sm text-muted-foreground">{hint}</p>
      {selection.file ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            selection.clear();
          }}
          className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
          Remove file
        </button>
      ) : null}
    </div>
  );
}

function formatOutputName(baseName: string, format: ImageTransformFormat) {
  if (format === "image/jpeg") return `${baseName}.jpg`;
  if (format === "image/png") return `${baseName}.png`;
  return `${baseName}.webp`;
}

export function ImageResizer() {
  const selection = useImageSelection();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepAspect, setKeepAspect] = useState(true);
  const [format, setFormat] = useState<ImageTransformFormat>("image/png");
  const [quality, setQuality] = useState(92);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selection.dimensions) return;
    setWidth(selection.dimensions.width);
    setHeight(selection.dimensions.height);
  }, [selection.dimensions?.width, selection.dimensions?.height]);

  const handleResize = async () => {
    if (!selection.file || width <= 0 || height <= 0) return;

    setLoading(true);
    try {
      const blob = await transformImageFile(selection.file, {
        format,
        quality: format === "image/png" ? undefined : quality / 100,
        width,
        height,
      });

      downloadBlob(
        blob,
        formatOutputName(getBaseName(selection.file.name), format)
      );
      alert("Image resized successfully. Download started.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Resize failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ImageUploadCard selection={selection} hint="Resize a single image to custom dimensions." />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Width (px)
          </label>
          <input
            type="number"
            min="1"
            value={width}
            onChange={(event) => {
              const nextWidth = Number(event.target.value);
              setWidth(nextWidth);
              if (keepAspect && selection.dimensions?.width && selection.dimensions?.height) {
                setHeight(Math.round((nextWidth / selection.dimensions.width) * selection.dimensions.height));
              }
            }}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Height (px)
          </label>
          <input
            type="number"
            min="1"
            value={height}
            onChange={(event) => {
              const nextHeight = Number(event.target.value);
              setHeight(nextHeight);
              if (keepAspect && selection.dimensions?.width && selection.dimensions?.height) {
                setWidth(Math.round((nextHeight / selection.dimensions.height) * selection.dimensions.width));
              }
            }}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={keepAspect}
          onChange={(event) => setKeepAspect(event.target.checked)}
          className="h-4 w-4"
        />
        Keep aspect ratio
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Output format
          </label>
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as ImageTransformFormat)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Quality: {quality}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <Button
        onClick={handleResize}
        disabled={!selection.file || width <= 0 || height <= 0 || loading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
            Resizing...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Resize image
          </>
        )}
      </Button>
    </div>
  );
}

export function ImageCompressor() {
  const selection = useImageSelection();
  const [format, setFormat] = useState<ImageTransformFormat>("image/jpeg");
  const [quality, setQuality] = useState(80);
  const [loading, setLoading] = useState(false);

  const handleCompress = async () => {
    if (!selection.file) return;

    setLoading(true);
    try {
      const blob = await transformImageFile(selection.file, {
        format,
        quality: quality / 100,
      });

      downloadBlob(
        blob,
        formatOutputName(getBaseName(selection.file.name), format)
      );
      alert("Image compressed successfully. Download started.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Compression failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ImageUploadCard selection={selection} hint="Compress a single image with a quality slider." />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Output format
          </label>
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as ImageTransformFormat)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="image/jpeg">JPG</option>
            <option value="image/webp">WebP</option>
            <option value="image/png">PNG</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Quality: {quality}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <Button
        onClick={handleCompress}
        disabled={!selection.file || loading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
            Compressing...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Compress image
          </>
        )}
      </Button>
    </div>
  );
}

export function ImageConverter() {
  const selection = useImageSelection();
  const [format, setFormat] = useState<ImageTransformFormat>("image/png");
  const [quality, setQuality] = useState(90);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!selection.file) return;

    setLoading(true);
    try {
      const blob = await transformImageFile(selection.file, {
        format,
        quality: format === "image/png" ? undefined : quality / 100,
      });

      downloadBlob(
        blob,
        formatOutputName(getBaseName(selection.file.name), format)
      );
      alert("Image converted successfully. Download started.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ImageUploadCard selection={selection} hint="Convert between PNG, JPG, and WebP." />

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Output format
        </label>
        <select
          value={format}
          onChange={(event) => setFormat(event.target.value as ImageTransformFormat)}
          className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPG</option>
          <option value="image/webp">WebP</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Quality: {quality}%
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(event) => setQuality(Number(event.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <Button
        onClick={handleConvert}
        disabled={!selection.file || loading}
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
            Convert image
          </>
        )}
      </Button>
    </div>
  );
}

export function ImageCropper() {
  const selection = useImageSelection();
  const [crop, setCrop] = useState<CropRect>({ x: 10, y: 10, width: 80, height: 80 });
  const [format, setFormat] = useState<ImageTransformFormat>("image/png");
  const [quality, setQuality] = useState(92);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selection.dimensions) return;
    setCrop(createCenteredCrop(selection.dimensions.width, selection.dimensions.height, 1, 80));
  }, [selection.dimensions?.width, selection.dimensions?.height]);

  const applyPreset = (aspect: number) => {
    if (!selection.dimensions) return;
    setCrop(
      createCenteredCrop(
        selection.dimensions.width,
        selection.dimensions.height,
        aspect,
        80
      )
    );
  };

  const handleCrop = async () => {
    if (!selection.file) return;

    setLoading(true);
    try {
      const blob = await transformImageFile(selection.file, {
        format,
        quality: format === "image/png" ? undefined : quality / 100,
        crop,
      });

      downloadBlob(
        blob,
        formatOutputName(getBaseName(selection.file.name), format)
      );
      alert("Image cropped successfully. Download started.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Crop failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ImageUploadCard selection={selection} hint="Choose a crop area and export the result." />

      {selection.preview ? (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg border border-border bg-card/50">
            <img src={selection.preview} alt="Crop preview" className="w-full max-h-96 object-contain" />
            <div
              className="absolute border-2 border-accent bg-accent/20"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
              }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                X: {crop.x.toFixed(1)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={crop.x}
                onChange={(event) => setCrop((previous) => ({ ...previous, x: Number(event.target.value) }))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Y: {crop.y.toFixed(1)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={crop.y}
                onChange={(event) => setCrop((previous) => ({ ...previous, y: Number(event.target.value) }))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Width: {crop.width.toFixed(1)}%
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={crop.width}
                onChange={(event) => setCrop((previous) => ({ ...previous, width: Number(event.target.value) }))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Height: {crop.height.toFixed(1)}%
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={crop.height}
                onChange={(event) => setCrop((previous) => ({ ...previous, height: Number(event.target.value) }))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["1:1", 1],
              ["4:3", 4 / 3],
              ["16:9", 16 / 9],
              ["3:4", 3 / 4],
              ["9:16", 9 / 16],
            ].map(([label, aspect]) => (
              <button
                key={String(label)}
                type="button"
                onClick={() => applyPreset(aspect as number)}
                className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:border-accent hover:text-accent transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Output format
          </label>
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as ImageTransformFormat)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Quality: {quality}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <Button
        onClick={handleCrop}
        disabled={!selection.file || loading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
            Cropping...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Crop image
          </>
        )}
      </Button>
    </div>
  );
}
