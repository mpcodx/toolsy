import { Button } from "@/components/ui/button";
import { base64ToBlob } from "@/lib/encoding-tools";
import { downloadBlob } from "@/lib/download";
import { downloadToolBlob, fetchToolJson } from "@/lib/tool-api";
import { Download, GripVertical, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

function getBaseName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  return withoutExtension || "archive";
}

function ArchiveFileList({
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

function UploadCard({
  file,
  onFile,
  onClear,
  accept,
  title,
  hint,
  multiple = false,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  onClear?: () => void;
  accept: string;
  title: string;
  hint: string;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
      onClick={() => inputRef.current?.click()}
      onDragOver={event => event.preventDefault()}
      onDrop={event => {
        event.preventDefault();
        onFile(event.dataTransfer.files?.[0] ?? null);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={event => {
          onFile(event.target.files?.[0] ?? null);
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
          onClick={event => {
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

export function ZipCreator() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (selectedFiles: FileList | File[] | null | undefined) => {
    const nextFiles = Array.from(selectedFiles ?? []);
    if (nextFiles.length === 0) return;
    setFiles(previous => [...previous, ...nextFiles]);
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    setFiles(previous => {
      const next = [...previous];
      if (direction === "up" && index > 0) {
        [next[index], next[index - 1]] = [next[index - 1], next[index]];
      } else if (direction === "down" && index < next.length - 1) {
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
      }
      return next;
    });
  };

  const handleCreate = async () => {
    if (files.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("files", file);
        const relativePath =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
          file.name;
        formData.append("paths", relativePath);
      });

      await downloadToolBlob(
        "/api/convert/zip-create",
        formData,
        "archive.zip"
      );
      alert("ZIP archive created successfully. Download started.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "ZIP creation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
        onClick={() => inputRef.current?.click()}
        onDragOver={event => event.preventDefault()}
        onDrop={event => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={event => {
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
          Add files and create a ZIP archive locally in your browser
        </p>
      </div>

      <ArchiveFileList
        files={files}
        onMove={moveFile}
        onRemove={index =>
          setFiles(previous =>
            previous.filter((_, fileIndex) => fileIndex !== index)
          )
        }
      />

      <Button
        onClick={handleCreate}
        disabled={files.length === 0 || loading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
            Creating ZIP...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Create ZIP
          </>
        )}
      </Button>
    </div>
  );
}

export function ZipExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<
    Array<{
      path: string;
      name: string;
      size: number;
      mimeType: string;
      contentBase64: string;
    }>
  >([]);

  const handleExtract = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const payload = await fetchToolJson<{
        files: Array<{
          path: string;
          name: string;
          size: number;
          mimeType: string;
          contentBase64: string;
        }>;
      }>("/api/convert/zip-extract", formData);

      setFiles(payload.files);
      alert(`Extracted ${payload.files.length} file(s).`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "ZIP extraction failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (entry: {
    path: string;
    name: string;
    size: number;
    mimeType: string;
    contentBase64: string;
  }) => {
    const blob = base64ToBlob(entry.contentBase64, entry.mimeType);
    downloadBlob(blob, entry.path || entry.name);
  };

  return (
    <div className="space-y-6">
      <UploadCard
        file={file}
        onFile={setFile}
        onClear={() => {
          setFile(null);
          setFiles([]);
        }}
        accept=".zip,application/zip"
        title="Click to upload or drag and drop"
        hint="Upload a ZIP file and extract its contents locally in your browser"
      />

      <Button
        onClick={handleExtract}
        disabled={!file || loading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
            Extracting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Extract ZIP
          </>
        )}
      </Button>

      {files.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">
            Extracted files ({files.length})
          </h3>
          <div className="space-y-2 max-h-[28rem] overflow-y-auto">
            {files.map(entry => (
              <div
                key={entry.path}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {entry.path}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(entry.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(entry)}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
