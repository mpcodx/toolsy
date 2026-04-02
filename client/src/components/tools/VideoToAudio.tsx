import { Button } from "@/components/ui/button";
import { Download, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { downloadBlob } from "@/lib/download";
import { extractAudioFromVideo } from "@/lib/video-to-audio";

const SUPPORTED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
]);

function getBaseName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  return withoutExtension || "converted";
}

export default function VideoToAudio() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setSelectedFile = (selectedFile: File | undefined) => {
    if (!selectedFile) {
      return;
    }

    if (
      SUPPORTED_VIDEO_TYPES.has(selectedFile.type) ||
      /\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(selectedFile.name)
    ) {
      setFile(selectedFile);
      return;
    }

    alert("Please select a supported video file.");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setSelectedFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const { blob, extension } = await extractAudioFromVideo(file);
      downloadBlob(blob, `${getBaseName(file.name)}-audio.${extension}`);
      alert("Audio extracted successfully! Download started.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Audio extraction failed.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,.mp4,.webm,.mov,.m4v,.mkv,.avi"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">
          {file ? file.name : "Click to upload or drag and drop"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload a video file and extract its audio locally in your browser
        </p>
      </div>

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

      <div className="bg-card/50 rounded-lg p-4 border border-border">
        <h4 className="font-semibold text-foreground mb-2">What it does</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This tool extracts audio from uploaded video files only. It does not
          download media from YouTube, Instagram, or other third-party URLs.
        </p>
      </div>

      <Button
        onClick={handleConvert}
        disabled={!file || loading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
            Extracting Audio...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Extract Audio
          </>
        )}
      </Button>

      <div className="bg-card/50 rounded-lg p-4 border border-border">
        <h4 className="font-semibold text-foreground mb-2">Features:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>✓ Extract audio from uploaded MP4, WebM, MOV, MKV, and AVI files</li>
          <li>✓ Download a browser-compatible audio file</li>
          <li>✓ Works locally on your device</li>
          <li>✓ No signup required</li>
          <li>✓ No media is uploaded to our server</li>
        </ul>
      </div>
    </div>
  );
}
