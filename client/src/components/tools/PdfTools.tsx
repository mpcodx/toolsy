import { Button } from "@/components/ui/button";
import { downloadToolBlob } from "@/lib/tool-api";
import { Download, GripVertical, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

function getBaseName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  return withoutExtension || "converted";
}

function PdfUploadCard({
  file,
  onFile,
  onClear,
  accept = ".pdf,application/pdf",
  multiple = false,
  title = "Click to upload or drag and drop",
  hint = "PDF files up to 100MB are supported",
}: {
  file: File | null;
  onFile: (file: File | undefined) => void;
  onClear?: () => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  hint?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onFile(event.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
        className="hidden"
      />
      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-semibold text-foreground mb-2">
        {file ? file.name : title}
      </h3>
      <p className="text-sm text-muted-foreground">{hint}</p>
      {file && onClear ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClear();
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

function PdfFileList({
  files,
  onMove,
  onRemove,
}: {
  files: File[];
  onMove: (index: number, direction: "up" | "down") => void;
  onRemove: (index: number) => void;
}) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">Files ({files.length})</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border border-border hover:border-accent/50 transition-colors"
          >
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onMove(index, "up")}
                disabled={index === 0}
                className="p-1 hover:bg-secondary rounded disabled:opacity-50"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={() => onMove(index, "down")}
                disabled={index === files.length - 1}
                className="p-1 hover:bg-secondary rounded disabled:opacity-50"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate text-sm">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState("screen");
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("preset", preset);
      await downloadToolBlob(
        "/api/convert/pdf-compress",
        formData,
        `${getBaseName(file.name)}-compressed.pdf`
      );
      alert("PDF compressed successfully. Download started.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Compression failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PdfUploadCard
        file={file}
        onFile={setFile}
        onClear={() => setFile(null)}
        hint="Choose a PDF to compress locally in your browser."
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Compression preset
        </label>
        <select
          value={preset}
          onChange={(event) => setPreset(event.target.value)}
          className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="screen">Screen - smallest size</option>
          <option value="ebook">E-book</option>
          <option value="printer">Printer</option>
          <option value="prepress">Prepress - highest quality</option>
        </select>
      </div>

      <Button
        onClick={handleConvert}
        disabled={!file || loading}
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
            Compress PDF
          </>
        )}
      </Button>
    </div>
  );
}

export function PdfMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (selectedFiles: FileList | File[] | undefined) => {
    const nextFiles = Array.from(selectedFiles ?? []).filter(
      (file) =>
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    );

    if (nextFiles.length === 0) {
      return;
    }

    setFiles((previous) => [...previous, ...nextFiles]);
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    setFiles((previous) => {
      const next = [...previous];
      if (direction === "up" && index > 0) {
        [next[index], next[index - 1]] = [next[index - 1], next[index]];
      }
      if (direction === "down" && index < next.length - 1) {
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
      }
      return next;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) return;

    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      await downloadToolBlob("/api/convert/pdf-merge", formData, "merged.pdf");
      alert("PDF files merged successfully. Download started.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Merge failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
          className="hidden"
        />
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">
          Click to upload or drag and drop
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload two or more PDF files to merge them
        </p>
      </div>

      <PdfFileList
        files={files}
        onMove={moveFile}
        onRemove={(index) => setFiles((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}
      />

      <Button
        onClick={handleMerge}
        disabled={files.length < 2 || loading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
            Merging...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Merge PDFs
          </>
        )}
      </Button>
    </div>
  );
}

export function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("all");
  const [mode, setMode] = useState<"zip" | "pdf">("zip");
  const [loading, setLoading] = useState(false);

  const handleSplit = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pages", pages);
      formData.append("mode", mode);

      const filename =
        mode === "pdf"
          ? `${getBaseName(file.name)}-split.pdf`
          : `${getBaseName(file.name)}-split.zip`;

      await downloadToolBlob("/api/convert/pdf-split", formData, filename);
      alert("PDF split successfully. Download started.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Split failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PdfUploadCard
        file={file}
        onFile={setFile}
        onClear={() => setFile(null)}
        title="Click to upload or drag and drop"
        hint="Select a PDF to split into individual pages or page ranges."
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Page ranges
        </label>
        <input
          value={pages}
          onChange={(event) => setPages(event.target.value)}
          placeholder="all or 1-3,5,8-10"
          className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Use `all` or comma-separated ranges like `1-3,5`.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Output type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "zip", label: "ZIP of pages" },
            { value: "pdf", label: "Single PDF" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value as "zip" | "pdf")}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                mode === option.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSplit}
        disabled={!file || loading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
            Splitting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Split PDF
          </>
        )}
      </Button>
    </div>
  );
}

export function PdfWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [position, setPosition] = useState("center");
  const [opacity, setOpacity] = useState(35);
  const [size, setSize] = useState(42);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleWatermark = async () => {
    if (!file || (!watermarkText.trim() && !watermarkImage)) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("text", watermarkText);
      formData.append("position", position);
      formData.append("opacity", String(opacity));
      formData.append("size", String(size));
      formData.append("rotation", String(rotation));
      if (watermarkImage) {
        formData.append("image", watermarkImage);
      }

      await downloadToolBlob(
        "/api/convert/pdf-watermark",
        formData,
        `${getBaseName(file.name)}-watermarked.pdf`
      );
      alert("Watermark applied successfully. Download started.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Watermarking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PdfUploadCard
        file={file}
        onFile={setFile}
        onClear={() => setFile(null)}
        title="Click to upload or drag and drop"
        hint="Upload a PDF and add a text or image watermark."
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Watermark text
        </label>
        <input
          value={watermarkText}
          onChange={(event) => setWatermarkText(event.target.value)}
          placeholder="CONFIDENTIAL"
          className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Position
          </label>
          <select
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="center">Center</option>
            <option value="top-left">Top left</option>
            <option value="top-right">Top right</option>
            <option value="bottom-left">Bottom left</option>
            <option value="bottom-right">Bottom right</option>
            <option value="diagonal">Diagonal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Image watermark
          </label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              setWatermarkImage(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
            className="w-full rounded-lg border border-border bg-card text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-accent-foreground"
          />
          {watermarkImage ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {watermarkImage.name}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Opacity: {opacity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(event) => setOpacity(Number(event.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Size: {size}px
        </label>
        <input
          type="range"
          min="12"
          max="180"
          value={size}
          onChange={(event) => setSize(Number(event.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Rotation: {rotation}°
        </label>
        <input
          type="range"
          min="-90"
          max="90"
          value={rotation}
          onChange={(event) => setRotation(Number(event.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <Button
        onClick={handleWatermark}
        disabled={!file || loading || (!watermarkText.trim() && !watermarkImage)}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
            Applying watermark...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Apply Watermark
          </>
        )}
      </Button>
    </div>
  );
}

function OfficeToPdfTool({
  title,
  description,
  accept,
  endpoint,
}: {
  title: string;
  description: string;
  accept: string;
  endpoint: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await downloadToolBlob(endpoint, formData, `${getBaseName(file.name)}.pdf`);
      alert(`${title} converted successfully. Download started.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PdfUploadCard
        file={file}
        onFile={(selected) => {
          if (!selected) {
            setFile(null);
            return;
          }
          setFile(selected);
        }}
        onClear={() => setFile(null)}
        accept={accept}
        title={`Upload ${title}`}
        hint={description}
      />

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
            Convert to PDF
          </>
        )}
      </Button>
    </div>
  );
}

export function WordToPdf() {
  return (
    <OfficeToPdfTool
      title="Word document"
      description="Supports DOC and DOCX files."
      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      endpoint="/api/convert/word-to-pdf"
    />
  );
}

export function ExcelToPdf() {
  return (
    <OfficeToPdfTool
      title="Excel spreadsheet"
      description="Supports XLS and XLSX files."
      accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      endpoint="/api/convert/excel-to-pdf"
    />
  );
}

export function PptToPdf() {
  return (
    <OfficeToPdfTool
      title="PowerPoint presentation"
      description="Supports PPT and PPTX files."
      accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
      endpoint="/api/convert/ppt-to-pdf"
    />
  );
}

export function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await downloadToolBlob(
        "/api/convert/pdf-to-word",
        formData,
        `${getBaseName(file.name)}.docx`
      );
      alert("PDF converted to Word successfully. Download started.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PdfUploadCard
        file={file}
        onFile={setFile}
        onClear={() => setFile(null)}
        hint="Upload a PDF to extract its text into a DOCX file."
      />

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
            Convert to Word
          </>
        )}
      </Button>
    </div>
  );
}

