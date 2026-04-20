import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadBlob } from "@/lib/download";
import {
  captureVideoFrames,
  captureVideoThumbnail,
  isSupportedVideoFile,
  loadVideoMetadata,
  recordVideoClip,
} from "@/lib/video-tools";
import { downloadToolBlob } from "@/lib/tool-api";
import { Download, Film, Image, Scissors, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function getBaseName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  return withoutExtension || "video";
}

function VideoUploadCard({
  file,
  onFile,
  onClear,
  title,
  hint,
}: {
  file: File | null;
  onFile: (file: File | undefined) => void;
  onClear?: () => void;
  title: string;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onFile(event.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,.mp4,.webm,.mov,.m4v,.mkv,.avi"
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

function VideoMetaCard({
  duration,
  loading,
}: {
  duration: number | null;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-border bg-card/70 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">
          Duration
        </p>
        <p className="text-lg font-semibold text-foreground">
          {loading ? "Reading..." : duration != null ? `${duration.toFixed(1)} s` : "Upload a file"}
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card/70 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">
          Output
        </p>
        <p className="text-lg font-semibold text-foreground">Local browser processing</p>
      </div>
    </div>
  );
}

export function VideoThumbnailMaker() {
  const [file, setFile] = useState<File | null>(null);
  const [timestamp, setTimestamp] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setDuration(null);
      setTimestamp(0);
      return;
    }

    let cancelled = false;
    setMetadataLoading(true);

    void loadVideoMetadata(file)
      .then((metadata) => {
        if (cancelled) return;
        setDuration(metadata.duration);
        setTimestamp((current) =>
          current > metadata.duration ? Math.max(0, metadata.duration - 0.05) : current
        );
      })
      .catch((error) => {
        if (!cancelled) {
          alert(error instanceof Error ? error.message : "Could not read the video.");
          setFile(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMetadataLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleThumbnail = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const { blob, time } = await captureVideoThumbnail(file, timestamp);
      const objectUrl = URL.createObjectURL(blob);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(objectUrl);
      setTimestamp(time);
      downloadBlob(blob, `${getBaseName(file.name)}-thumbnail.png`);
      alert("Thumbnail created successfully. Download started.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Thumbnail creation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 rounded-2xl border border-border bg-gradient-to-br from-accent/10 via-card to-card p-6">
        <div className="rounded-2xl bg-accent/15 p-3 text-accent">
          <Image className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-foreground">Thumbnail Maker</h3>
          <p className="text-sm text-muted-foreground">
            Capture a single frame from your uploaded video and export it as a thumbnail.
          </p>
        </div>
      </div>

      <VideoUploadCard
        file={file}
        onFile={(selectedFile) => {
          if (!selectedFile) return;
          if (!isSupportedVideoFile(selectedFile)) {
            alert("Please select a supported video file.");
            return;
          }
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
          setFile(selectedFile);
        }}
        onClear={() => {
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
          setFile(null);
          setDuration(null);
        }}
        title="Click to upload or drag and drop"
        hint="Upload a local video file to create a thumbnail"
      />

      <VideoMetaCard duration={duration} loading={metadataLoading} />

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Capture time (seconds)</label>
          <Input
            type="number"
            min={0}
            step="0.1"
            max={duration ?? undefined}
            value={timestamp}
            onChange={(event) => setTimestamp(Number(event.currentTarget.value) || 0)}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">
            Choose where the thumbnail should be captured. `0` grabs the first frame.
          </p>
        </div>

        <Button
          onClick={handleThumbnail}
          disabled={!file || loading}
          className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generate Thumbnail
            </>
          )}
        </Button>
      </div>

      {previewUrl ? (
        <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-foreground">Preview</h4>
              <p className="text-sm text-muted-foreground">
                Frame captured at {timestamp.toFixed(1)} seconds
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Ready to use
            </span>
          </div>
          <img
            src={previewUrl}
            alt="Generated thumbnail preview"
            className="w-full rounded-xl border border-border object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}

export function VideoToFrames() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(60);
  const [intervalSeconds, setIntervalSeconds] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setDuration(null);
      setStartTime(0);
      setEndTime(60);
      setIntervalSeconds(1);
      return;
    }

    let cancelled = false;
    setMetadataLoading(true);

    void loadVideoMetadata(file)
      .then((metadata) => {
        if (cancelled) return;
        setDuration(metadata.duration);
        setStartTime(0);
        setEndTime(Math.min(metadata.duration, 60));
      })
      .catch((error) => {
        if (!cancelled) {
          alert(error instanceof Error ? error.message : "Could not read the video.");
          setFile(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMetadataLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  const handleExportFrames = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const result = await captureVideoFrames(file, {
        startTime,
        endTime,
        intervalSeconds,
        maxFrames: 120,
        mimeType: "image/png",
      });

      const formData = new FormData();
      result.frames.forEach((frame) => {
        const exportedFile = new File([frame.blob], frame.filename, {
          type: frame.blob.type || "image/png",
        });
        formData.append("files", exportedFile);
        formData.append("paths", frame.filename);
      });

      await downloadToolBlob("/api/convert/zip-create", formData, `${getBaseName(file.name)}-frames.zip`);
      alert(`Exported ${result.frames.length} frame(s) as a ZIP archive.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Frame export failed.");
    } finally {
      setLoading(false);
    }
  };

  const estimatedFrames =
    file && endTime >= startTime
      ? Math.max(1, Math.floor((endTime - startTime) / Math.max(intervalSeconds, 0.1)) + 1)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 rounded-2xl border border-border bg-gradient-to-br from-sky-500/10 via-card to-card p-6">
        <div className="rounded-2xl bg-sky-500/15 p-3 text-sky-500">
          <Film className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-foreground">Video to Frames</h3>
          <p className="text-sm text-muted-foreground">
            Turn a local video into a ZIP archive of PNG frames for quick previews or content extraction.
          </p>
        </div>
      </div>

      <VideoUploadCard
        file={file}
        onFile={(selectedFile) => {
          if (!selectedFile) return;
          if (!isSupportedVideoFile(selectedFile)) {
            alert("Please select a supported video file.");
            return;
          }
          setFile(selectedFile);
        }}
        onClear={() => {
          setFile(null);
          setDuration(null);
        }}
        title="Click to upload or drag and drop"
        hint="Export frames from uploaded videos into a ZIP archive"
      />

      <VideoMetaCard duration={duration} loading={metadataLoading} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Start time</label>
          <Input
            type="number"
            min={0}
            step="0.1"
            max={duration ?? undefined}
            value={startTime}
            onChange={(event) => setStartTime(Number(event.currentTarget.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">End time</label>
          <Input
            type="number"
            min={0}
            step="0.1"
            max={duration ?? undefined}
            value={endTime}
            onChange={(event) => setEndTime(Number(event.currentTarget.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Interval (seconds)</label>
          <Input
            type="number"
            min={0.1}
            step="0.1"
            value={intervalSeconds}
            onChange={(event) => setIntervalSeconds(Number(event.currentTarget.value) || 1)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/70 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Estimated frames</p>
          <p className="text-sm text-muted-foreground">
            {estimatedFrames} PNG file{estimatedFrames === 1 ? "" : "s"} in the ZIP archive
          </p>
        </div>
        <Button
          onClick={handleExportFrames}
          disabled={!file || loading}
          className="bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Frames as ZIP
            </>
          )}
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card/70 p-4">
        <p className="text-sm text-muted-foreground">
          Great for screenshot sheets, content review, storyboards, and converting a 1-minute video into
          a ZIP of images from 0 seconds to 60 seconds.
        </p>
      </div>
    </div>
  );
}

export function VideoClipper() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(15);
  const [loading, setLoading] = useState(false);
  const trustBadges = ["Free", "Secure", "No Signup", "No Watermark"];

  useEffect(() => {
    if (!file) {
      setDuration(null);
      setStartTime(0);
      setEndTime(15);
      return;
    }

    let cancelled = false;
    setMetadataLoading(true);

    void loadVideoMetadata(file)
      .then((metadata) => {
        if (cancelled) return;
        setDuration(metadata.duration);
        setStartTime(0);
        setEndTime(Math.min(metadata.duration, 15));
      })
      .catch((error) => {
        if (!cancelled) {
          alert(error instanceof Error ? error.message : "Could not read the video.");
          setFile(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMetadataLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  const handleClip = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const { blob, extension, startTime: clipStart, endTime: clipEnd } = await recordVideoClip(file, {
        startTime,
        endTime,
      });

      downloadBlob(blob, `${getBaseName(file.name)}-${clipStart.toFixed(1)}s-to-${clipEnd.toFixed(1)}s.${extension}`);
      alert("Video clip created successfully. Download started.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Video clipping failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 rounded-2xl border border-border bg-gradient-to-br from-emerald-500/10 via-card to-card p-6">
        <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-500">
          <Scissors className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-foreground">Video Clip Cutter</h3>
          <p className="text-sm text-muted-foreground">
            Trim a local video into a shorter, fast, watermark-free WebM clip using start and end times.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {trustBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <VideoUploadCard
        file={file}
        onFile={(selectedFile) => {
          if (!selectedFile) return;
          if (!isSupportedVideoFile(selectedFile)) {
            alert("Please select a supported video file.");
            return;
          }
          setFile(selectedFile);
        }}
        onClear={() => {
          setFile(null);
          setDuration(null);
        }}
        title="Click to upload or drag and drop"
        hint="Trim your own video files into a shorter, watermark-free clip"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Duration</p>
          <p className="text-lg font-semibold text-foreground">
            {metadataLoading ? "Reading..." : duration != null ? `${duration.toFixed(1)} s` : "Upload a file"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Output</p>
          <p className="text-lg font-semibold text-foreground">Watermark-free WebM clip</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Start time</label>
          <Input
            type="number"
            min={0}
            step="0.1"
            max={duration ?? undefined}
            value={startTime}
            onChange={(event) => setStartTime(Number(event.currentTarget.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">End time</label>
          <Input
            type="number"
            min={0}
            step="0.1"
            max={duration ?? undefined}
            value={endTime}
            onChange={(event) => setEndTime(Number(event.currentTarget.value) || 0)}
          />
        </div>
      </div>

      <Button
        onClick={handleClip}
        disabled={!file || loading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
            Trimming...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Trim & Download
          </>
        )}
      </Button>

      <div className="rounded-2xl border border-border bg-card/70 p-4">
        <p className="text-sm text-muted-foreground">
          Useful for short previews, social-ready edits, and clips from videos you own or have rights to
          use. Processing stays in your browser, the export is watermark-free, and platform-specific
          downloader support is not included.
        </p>
      </div>
    </div>
  );
}
