import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { Download, Play, Square, Volume2 } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Text to Speech Converter Tool
 * Converts text to natural-sounding audio
 */

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "it-IT", name: "Italian" },
    { code: "ja-JP", name: "Japanese" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
  ];

  const handlePlay = () => {
    if (!text.trim()) {
      alert("Please enter some text");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = speed;
    utterance.pitch = pitch;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleDownload = async () => {
    if (!text.trim()) {
      alert("Please enter some text");
      return;
    }

    setLoading(true);
    try {
      const transcript = [
        "Text to Speech Transcript",
        `Language: ${language}`,
        `Speed: ${speed.toFixed(1)}x`,
        `Pitch: ${pitch.toFixed(1)}`,
        "",
        text,
      ].join("\n");

      downloadBlob(
        new Blob([transcript], { type: "text/plain;charset=utf-8" }),
        "speech-transcript.txt"
      );

      alert("Transcript downloaded. Use Preview to hear the speech in your browser.");
    } catch (error) {
      alert("Failed to download transcript. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Enter Text to Convert
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full h-32 p-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
        />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{charCount} characters</span>
          <span>{wordCount} words</span>
        </div>
      </div>

      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Language & Voice
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Speed Control */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Speed: {speed.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Pitch Control */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Pitch: {pitch.toFixed(1)}
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={pitch}
          onChange={(e) => setPitch(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handlePlay}
          className={`${
            isPlaying
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-accent hover:bg-accent/90"
          } text-accent-foreground py-3 font-medium`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Preview
            </>
          )}
        </Button>

        <Button
          onClick={handleDownload}
          disabled={!text.trim() || loading}
          className="bg-accent hover:bg-accent/90 text-accent-foreground py-3 font-medium"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Transcript
            </>
          )}
        </Button>
      </div>

      {/* Info Section */}
      <div className="bg-card/50 rounded-lg p-4 border border-border">
        <h4 className="font-semibold text-foreground mb-2">Features:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>✓ Multiple languages and voices</li>
          <li>✓ Adjustable speed and pitch</li>
          <li>✓ Real-time preview playback</li>
          <li>✓ Download a text transcript of the speech</li>
          <li>✓ No character limit for preview playback</li>
        </ul>
      </div>
    </div>
  );
}
