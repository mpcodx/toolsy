import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadFromUrl } from "@/lib/download";
import { Copy, Download, ExternalLink, Link2, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";

function normalizeDirectMp4Url(rawValue: string) {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmed);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return null;
    }

    if (!parsedUrl.pathname.toLowerCase().endsWith(".mp4")) {
      return null;
    }

    return parsedUrl;
  } catch {
    return null;
  }
}

function deriveFilenameFromUrl(url: URL) {
  const lastSegment = url.pathname.split("/").filter(Boolean).pop() || "video.mp4";

  try {
    const decodedSegment = decodeURIComponent(lastSegment);

    if (decodedSegment.toLowerCase().endsWith(".mp4")) {
      return decodedSegment;
    }

    const baseName = decodedSegment.replace(/\.[^.]+$/, "") || "video";
    return `${baseName}.mp4`;
  } catch {
    return lastSegment.toLowerCase().endsWith(".mp4") ? lastSegment : "video.mp4";
  }
}

function normalizeFilename(value: string) {
  const cleaned = value.trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_");

  if (!cleaned) {
    return "";
  }

  return cleaned.toLowerCase().endsWith(".mp4") ? cleaned : `${cleaned}.mp4`;
}

export default function DirectMp4Downloader() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [customFilename, setCustomFilename] = useState("");
  const [loading, setLoading] = useState(false);

  const parsedUrl = useMemo(() => normalizeDirectMp4Url(sourceUrl), [sourceUrl]);
  const suggestedFilename = useMemo(
    () => (parsedUrl ? deriveFilenameFromUrl(parsedUrl) : "video.mp4"),
    [parsedUrl]
  );
  const resolvedFilename = useMemo(() => {
    const customValue = normalizeFilename(customFilename);
    return customValue || suggestedFilename;
  }, [customFilename, suggestedFilename]);

  const handleDownload = () => {
    if (!parsedUrl) {
      alert("Please paste a direct .mp4 file URL.");
      return;
    }

    setLoading(true);
    try {
      downloadFromUrl(parsedUrl.toString(), resolvedFilename);
      alert(
        "Download started. If your browser opens the file instead, use the browser download control."
      );
    } catch {
      alert("The browser could not start the download. Try opening the direct file link instead.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!parsedUrl) {
      alert("Please paste a direct .mp4 file URL.");
      return;
    }

    window.open(parsedUrl.toString(), "_blank", "noopener,noreferrer");
  };

  const handleCopy = async () => {
    if (!parsedUrl) {
      alert("Please paste a direct .mp4 file URL.");
      return;
    }

    try {
      await navigator.clipboard.writeText(parsedUrl.toString());
      alert("Copied direct MP4 link to clipboard.");
    } catch {
      alert("Copy failed. Please copy the direct MP4 link manually.");
    }
  };

  const detectedHost = parsedUrl?.hostname.replace(/^www\./i, "") || "Waiting for a direct link";
  const isValid = Boolean(parsedUrl);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-gradient-to-br from-cyan-500/10 via-card to-card p-6 md:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-600">
            <Link2 className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Direct MP4 Downloader</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Paste a public direct MP4 file URL and download it with a clean browser link. This tool
              does not proxy pages or bypass platform restrictions.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700">
            Direct file URL only
          </span>
          <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            No uploads
          </span>
          <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            Browser download link
          </span>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Direct MP4 URL</label>
          <Input
            type="url"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.currentTarget.value)}
            placeholder="https://example.com/video.mp4"
            className="h-12 rounded-2xl"
          />
          <p className="text-xs text-muted-foreground">
            Paste a direct .mp4 file link. Platform pages, playlists, and embedded players are not
            supported.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Custom filename</label>
          <Input
            value={customFilename}
            onChange={(event) => setCustomFilename(event.currentTarget.value)}
            placeholder={suggestedFilename}
            className="h-12 rounded-2xl"
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to use <span className="font-medium text-foreground">{suggestedFilename}</span>.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Detected host</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{detectedHost}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Output filename</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{resolvedFilename}</p>
        </div>
      </div>

      {sourceUrl.trim() && !isValid ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-muted-foreground">
            Enter a direct public <span className="font-medium text-foreground">.mp4</span> file URL.
            This tool is intentionally limited to file links, not social media pages.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleDownload}
          disabled={!isValid || loading}
          className="h-12 bg-accent px-6 text-base font-medium text-accent-foreground hover:bg-accent/90"
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
              Starting download...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download MP4
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleOpen}
          disabled={!isValid}
          className="h-12 px-6 text-base"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open file
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleCopy}
          disabled={!isValid}
          className="h-12 px-6 text-base"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy link
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card/70 p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          This tool is meant for direct public MP4 files that you are already allowed to download.
          If a host blocks cross-origin downloading, use the open-file option and save it through your
          browser.
        </p>
      </div>
    </div>
  );
}
