import { Button } from "@/components/ui/button";
import {
  base64ToText,
  convertUnit,
  encodeBase64Text,
  fileToBase64,
  formatNumber,
  hashFile,
  hashText,
  listUnits,
  parseColor,
  type UnitCategory,
  contrastRatio,
} from "@/lib/encoding-tools";
import {
  barcodeToCanvas,
  barcodeToSvg,
  generateBarcode,
} from "@/lib/barcode";
import { downloadBlob } from "@/lib/download";
import { generateQrCode, qrMatrixToCanvas, qrMatrixToSvg } from "@/lib/qr-code";
import { Copy, Download, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function downloadTextFile(contents: string, filename: string, type = "text/plain") {
  downloadBlob(new Blob([contents], { type }), filename);
}

function copyText(value: string) {
  return navigator.clipboard.writeText(value);
}

function TextFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const transform = (mode: string) => {
    const lines = input.replace(/\r/g, "").split("\n");
    const words = input.trim().split(/\s+/);

    switch (mode) {
      case "trim":
        return input
          .replace(/\r/g, "")
          .split("\n")
          .map((line) => line.trim())
          .join("\n")
          .trim();
      case "collapse":
        return input.replace(/\s+/g, " ").trim();
      case "upper":
        return input.toUpperCase();
      case "lower":
        return input.toLowerCase();
      case "title":
        return input
          .toLowerCase()
          .replace(/\b\w/g, (character) => character.toUpperCase());
      case "sentence":
        return input
          .toLowerCase()
          .replace(/(^\s*\w|[.!?]\s+\w)/g, (character) => character.toUpperCase());
      case "remove-blank":
        return lines.filter((line) => line.trim().length > 0).join("\n");
      case "sort":
        return [...lines].filter(Boolean).sort((left, right) => left.localeCompare(right)).join("\n");
      case "reverse":
        return [...lines].reverse().join("\n");
      case "number":
        return lines
          .filter((line) => line.trim().length > 0)
          .map((line, index) => `${index + 1}. ${line.trim()}`)
          .join("\n");
      case "slug":
        return input
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      case "camel":
        return words
          .map((word, index) =>
            index === 0
              ? word.toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join("");
      case "pascal":
        return words
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join("");
      default:
        return input;
    }
  };

  const applyTransform = (mode: string) => setOutput(transform(mode));

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Input text
        </label>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste your text here..."
          className="w-full h-40 p-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ["trim", "Trim lines"],
          ["collapse", "Collapse spaces"],
          ["upper", "UPPERCASE"],
          ["lower", "lowercase"],
          ["title", "Title Case"],
          ["sentence", "Sentence case"],
          ["remove-blank", "Remove blanks"],
          ["sort", "Sort lines"],
          ["reverse", "Reverse lines"],
          ["number", "Number lines"],
          ["slug", "Slug"],
          ["camel", "camelCase"],
          ["pascal", "PascalCase"],
        ].map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => applyTransform(mode)}
            className="px-3 py-2 rounded-lg border border-border text-sm text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Result
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="Your formatted text will appear here..."
            className="w-full h-40 p-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none resize-none"
          />
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <h4 className="font-semibold text-foreground mb-2">Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => copyText(output)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadTextFile(output || input, "formatted-text.txt")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/50 p-4 text-sm text-muted-foreground">
            <p>Tip: the buttons apply the transformation immediately to the output box.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort((left, right) => left.localeCompare(right))
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortJsonValue((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }

  return value;
}

function JsonFormatter() {
  const [input, setInput] = useState("{\n  \"hello\": \"world\"\n}");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const processJson = (mode: "pretty" | "minify" | "sort") => {
    try {
      const parsed = JSON.parse(input);
      const result =
        mode === "sort"
          ? JSON.stringify(sortJsonValue(parsed), null, 2)
          : mode === "minify"
            ? JSON.stringify(parsed)
            : JSON.stringify(parsed, null, 2);
      setOutput(result);
      setError("");
    } catch (jsonError) {
      setError(jsonError instanceof Error ? jsonError.message : "Invalid JSON.");
      setOutput("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          JSON input
        </label>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="w-full h-40 p-4 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => processJson("pretty")}>
          Pretty print
        </Button>
        <Button type="button" variant="outline" onClick={() => processJson("minify")}>
          Minify
        </Button>
        <Button type="button" variant="outline" onClick={() => processJson("sort")}>
          Sort keys
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Output
        </label>
        <textarea
          value={output}
          readOnly
          className="w-full h-40 p-4 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => copyText(output)}
          disabled={!output}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy output
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => downloadTextFile(output, "formatted.json", "application/json")}
          disabled={!output}
        >
          <Download className="w-4 h-4 mr-2" />
          Download JSON
        </Button>
      </div>
    </div>
  );
}

function HashGenerator() {
  const [algorithm, setAlgorithm] = useState<"MD5" | "SHA-1" | "SHA-256" | "SHA-512">("SHA-256");
  const [mode, setMode] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const hash =
        mode === "file" && file
          ? await hashFile(algorithm, file)
          : await hashText(algorithm, text);
      setResult(hash);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Hash generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Algorithm
          </label>
          <select
            value={algorithm}
            onChange={(event) =>
              setAlgorithm(event.target.value as "MD5" | "SHA-1" | "SHA-256" | "SHA-512")
            }
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="MD5">MD5</option>
            <option value="SHA-1">SHA-1</option>
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-512">SHA-512</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Source
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "text", label: "Text" },
              { value: "file", label: "File" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value as "text" | "file")}
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
      </div>

      {mode === "text" ? (
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Enter text to hash..."
          className="w-full h-32 p-4 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
        />
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-border bg-card text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-accent-foreground"
          />
          {file ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Selected: {file.name}
            </p>
          ) : null}
        </div>
      )}

      <Button onClick={handleGenerate} disabled={loading || (mode === "file" ? !file : text.length === 0)}>
        {loading ? "Generating..." : "Generate hash"}
      </Button>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">Result</label>
        <div className="rounded-lg border border-border bg-card p-4 font-mono text-sm break-all">
          {result || "Hash will appear here."}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => copyText(result)} disabled={!result}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
}

function ColorConverter() {
  const [input, setInput] = useState("#4f46e5");
  const parsed = parseColor(input);

  const colorValue = parsed ?? { hex: "#000000", r: 0, g: 0, b: 0, h: 0, s: 0, l: 0, alpha: 1 };
  const contrastWithWhite = contrastRatio(
    { r: colorValue.r, g: colorValue.g, b: colorValue.b },
    { r: 255, g: 255, b: 255 }
  );
  const contrastWithBlack = contrastRatio(
    { r: colorValue.r, g: colorValue.g, b: colorValue.b },
    { r: 0, g: 0, b: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Color value
          </label>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="#4f46e5 or rgb(79, 70, 229)"
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Picker
          </label>
          <input
            type="color"
            value={parsed?.hex ?? "#000000"}
            onChange={(event) => setInput(event.target.value)}
            className="h-12 w-20 rounded-lg border border-border bg-card p-1"
          />
        </div>
      </div>

      <div
        className="h-24 rounded-lg border border-border shadow-inner"
        style={{ backgroundColor: parsed?.hex ?? "#000000" }}
      />

      {parsed ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2">
            <h4 className="font-semibold text-foreground">Formats</h4>
            <p className="text-sm text-muted-foreground">HEX: {parsed.hex}</p>
            <p className="text-sm text-muted-foreground">
              RGB: rgb({parsed.r}, {parsed.g}, {parsed.b})
            </p>
            <p className="text-sm text-muted-foreground">
              HSL: hsl({parsed.h}, {parsed.s}%, {parsed.l}%)
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2">
            <h4 className="font-semibold text-foreground">Accessibility</h4>
            <p className="text-sm text-muted-foreground">
              Contrast vs white: {contrastWithWhite}:1
            </p>
            <p className="text-sm text-muted-foreground">
              Contrast vs black: {contrastWithBlack}:1
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Invalid color value.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => copyText(parsed?.hex ?? "")} disabled={!parsed}>
          <Copy className="w-4 h-4 mr-2" />
          Copy HEX
        </Button>
        <Button type="button" variant="outline" onClick={() => copyText(`rgb(${parsed?.r}, ${parsed?.g}, ${parsed?.b})`)} disabled={!parsed}>
          <Copy className="w-4 h-4 mr-2" />
          Copy RGB
        </Button>
      </div>
    </div>
  );
}

function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("km");
  const [value, setValue] = useState("1");

  const units = useMemo(() => listUnits(category), [category]);

  useEffect(() => {
    if (!units.includes(fromUnit)) {
      setFromUnit(units[0]);
    }
    if (!units.includes(toUnit)) {
      setToUnit(units[Math.min(1, units.length - 1)]);
    }
  }, [units, fromUnit, toUnit]);

  const numericValue = Number.parseFloat(value);
  const converted = convertUnit(category, numericValue, fromUnit, toUnit);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Category
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as UnitCategory)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="length">Length</option>
            <option value="weight">Weight</option>
            <option value="temperature">Temperature</option>
            <option value="volume">Volume</option>
            <option value="data">Data</option>
            <option value="speed">Speed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            From
          </label>
          <select
            value={fromUnit}
            onChange={(event) => setFromUnit(event.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            To
          </label>
          <select
            value={toUnit}
            onChange={(event) => setToUnit(event.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Value
          </label>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Result
          </label>
          <div className="p-3 rounded-lg border border-border bg-card text-foreground">
            {Number.isFinite(converted) ? formatNumber(converted) : "Enter a valid number"}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/50 p-4">
        <h4 className="font-semibold text-foreground mb-3">Common conversions</h4>
        <div className="grid gap-2 md:grid-cols-2">
          {units.map((unit) => {
            const valueInUnit = convertUnit(category, numericValue, fromUnit, unit);
            return (
              <div key={unit} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{unit.toUpperCase()}</span>
                <span className="text-foreground">{Number.isFinite(valueInUnit) ? formatNumber(valueInUnit) : "NaN"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Base64EncoderDecoder() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [text, setText] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [result, setResult] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileResult, setFileResult] = useState("");

  const handleTextAction = () => {
    try {
      const output =
        mode === "encode"
          ? encodeBase64Text(text, urlSafe)
          : base64ToText(text, urlSafe);
      setResult(output);
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Base64 conversion failed.");
    }
  };

  const handleFileAction = async () => {
    if (!file) return;
    try {
      setFileResult(await fileToBase64(file, urlSafe));
    } catch (error) {
      setFileResult(error instanceof Error ? error.message : "File conversion failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {[
          ["encode", "Encode text"],
          ["decode", "Decode text"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value as "encode" | "decode")}
            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
              mode === value
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:border-accent/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={urlSafe}
          onChange={(event) => setUrlSafe(event.target.checked)}
          className="h-4 w-4"
        />
        URL-safe Base64
      </label>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Text input
        </label>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 text to decode..."}
          className="w-full h-36 p-4 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleTextAction}>
          {mode === "encode" ? "Encode" : "Decode"}
        </Button>
        <Button type="button" variant="outline" onClick={() => copyText(result)} disabled={!result}>
          <Copy className="w-4 h-4 mr-2" />
          Copy result
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => downloadTextFile(result, mode === "encode" ? "encoded.txt" : "decoded.txt")}
          disabled={!result}
        >
          <Download className="w-4 h-4 mr-2" />
          Download result
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 font-mono text-sm break-all">
        {result || "Result will appear here."}
      </div>

      <div className="rounded-lg border border-border bg-card/50 p-4 space-y-4">
        <h4 className="font-semibold text-foreground">File to Base64</h4>
        <input
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-border bg-card text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-accent-foreground"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleFileAction} disabled={!file}>
            <Upload className="w-4 h-4 mr-2" />
            Encode file
          </Button>
          <Button type="button" variant="outline" onClick={() => copyText(fileResult)} disabled={!fileResult}>
            <Copy className="w-4 h-4 mr-2" />
            Copy file Base64
          </Button>
        </div>
        <textarea
          value={fileResult}
          readOnly
          className="w-full h-32 p-4 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none resize-none"
        />
      </div>
    </div>
  );
}

function QrCodeGenerator() {
  const [text, setText] = useState("https://example.com");
  const [result, setResult] = useState<ReturnType<typeof generateQrCode> | null>(null);
  const [foreground, setForeground] = useState("#111827");
  const [background, setBackground] = useState("#ffffff");
  const [size, setSize] = useState(320);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerate = () => {
    try {
      setResult(generateQrCode(text));
    } catch (error) {
      alert(error instanceof Error ? error.message : "QR generation failed.");
    }
  };

  useEffect(() => {
    if (!result || !canvasRef.current) return;
    qrMatrixToCanvas(canvasRef.current, result.matrix, {
      size,
      foreground,
      background,
      margin: 4,
    });
  }, [result, size, foreground, background]);

  const svgMarkup = result
    ? qrMatrixToSvg(result.matrix, { foreground, background, margin: 4 })
    : "";

  const handleDownloadSvg = () => {
    if (!result) return;
    downloadBlob(new Blob([svgMarkup], { type: "image/svg+xml" }), "qr-code.svg");
  };

  const handleDownloadPng = async () => {
    if (!result || !canvasRef.current) return;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvasRef.current!.toBlob((value) => {
        if (!value) {
          reject(new Error("Unable to export QR code."));
          return;
        }
        resolve(value);
      }, "image/png");
    });

    downloadBlob(blob, "qr-code.png");
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Text or URL
        </label>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="w-full h-28 p-4 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Size: {size}px
          </label>
          <input
            type="range"
            min="160"
            max="640"
            step="16"
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Foreground
          </label>
          <input
            type="color"
            value={foreground}
            onChange={(event) => setForeground(event.target.value)}
            className="h-12 w-full rounded-lg border border-border bg-card p-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Background
          </label>
          <input
            type="color"
            value={background}
            onChange={(event) => setBackground(event.target.value)}
            className="h-12 w-full rounded-lg border border-border bg-card p-1"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleGenerate}>
          Generate QR
        </Button>
        <Button type="button" variant="outline" onClick={handleDownloadSvg} disabled={!result}>
          <Download className="w-4 h-4 mr-2" />
          Download SVG
        </Button>
        <Button type="button" variant="outline" onClick={handleDownloadPng} disabled={!result}>
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>

      {result ? (
        <div className="grid gap-6 md:grid-cols-[auto_1fr] items-start">
          <canvas ref={canvasRef} className="rounded-lg border border-border bg-white" />
          <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2">
            <h4 className="font-semibold text-foreground">QR details</h4>
            <p className="text-sm text-muted-foreground">Version: {result.version}</p>
            <p className="text-sm text-muted-foreground">Modules: {result.size} x {result.size}</p>
            <p className="text-sm text-muted-foreground">Character count: {text.length}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BarcodeGenerator() {
  const [format, setFormat] = useState<"ean13" | "upca">("ean13");
  const [value, setValue] = useState("5901234123457");
  const [result, setResult] = useState<ReturnType<typeof generateBarcode> | null>(null);
  const [width, setWidth] = useState(520);
  const [height, setHeight] = useState(120);
  const [foreground, setForeground] = useState("#111827");
  const [background, setBackground] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerate = () => {
    try {
      setResult(generateBarcode(value, format));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Barcode generation failed.");
    }
  };

  useEffect(() => {
    if (!result || !canvasRef.current) return;
    barcodeToCanvas(canvasRef.current, result, {
      width,
      height,
      foreground,
      background,
      showText: true,
    });
  }, [result, width, height, foreground, background]);

  const svgMarkup = result
    ? barcodeToSvg(result, { height, foreground, background, showText: true })
    : "";

  const handleDownloadSvg = () => {
    if (!result) return;
    downloadBlob(new Blob([svgMarkup], { type: "image/svg+xml" }), "barcode.svg");
  };

  const handleDownloadPng = async () => {
    if (!result || !canvasRef.current) return;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvasRef.current!.toBlob((value) => {
        if (!value) {
          reject(new Error("Unable to export barcode."));
          return;
        }
        resolve(value);
      }, "image/png");
    });

    downloadBlob(blob, "barcode.png");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Format
          </label>
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as "ean13" | "upca")}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="ean13">EAN-13</option>
            <option value="upca">UPC-A</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Value
          </label>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Width: {width}px
          </label>
          <input
            type="range"
            min="360"
            max="820"
            step="10"
            value={width}
            onChange={(event) => setWidth(Number(event.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Height: {height}px
          </label>
          <input
            type="range"
            min="80"
            max="220"
            step="4"
            value={height}
            onChange={(event) => setHeight(Number(event.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Foreground
            </label>
            <input
              type="color"
              value={foreground}
              onChange={(event) => setForeground(event.target.value)}
              className="h-12 w-full rounded-lg border border-border bg-card p-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Background
            </label>
            <input
              type="color"
              value={background}
              onChange={(event) => setBackground(event.target.value)}
              className="h-12 w-full rounded-lg border border-border bg-card p-1"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleGenerate}>
          Generate barcode
        </Button>
        <Button type="button" variant="outline" onClick={handleDownloadSvg} disabled={!result}>
          <Download className="w-4 h-4 mr-2" />
          Download SVG
        </Button>
        <Button type="button" variant="outline" onClick={handleDownloadPng} disabled={!result}>
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>

      {result ? (
        <div className="grid gap-6 md:grid-cols-[auto_1fr] items-start">
          <canvas ref={canvasRef} className="rounded-lg border border-border bg-white" />
          <div className="rounded-lg border border-border bg-card/50 p-4 space-y-2">
            <h4 className="font-semibold text-foreground">Barcode details</h4>
            <p className="text-sm text-muted-foreground">Format: {format.toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">Normalized digits: {result.label}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export {
  Base64EncoderDecoder,
  BarcodeGenerator,
  ColorConverter,
  HashGenerator,
  JsonFormatter,
  QrCodeGenerator,
  TextFormatter,
  UnitConverter,
};
