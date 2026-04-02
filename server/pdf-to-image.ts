import { createReadStream } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { tmpdir } from "node:os";

type PdfToImageFormat = "jpg" | "png" | "webp";

class ConversionError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ConversionError";
  }
}

const pythonScript = `
import io
import sys
import zipfile
from pathlib import Path

from PIL import Image, ImageOps

render_dir = Path(sys.argv[1])
output_zip = Path(sys.argv[2])
output_format = sys.argv[3].lower()
quality = max(1, min(100, int(sys.argv[4])))

def flatten_to_rgb(image):
    image = ImageOps.exif_transpose(image)
    if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
        rgba = image.convert("RGBA")
        background = Image.new("RGB", rgba.size, "white")
        background.paste(rgba, mask=rgba.getchannel("A"))
        return background
    return image.convert("RGB")

def page_index(path):
    return int(path.stem.split("-")[-1])

page_files = sorted(render_dir.glob("page-*.png"), key=page_index)

if not page_files:
    raise SystemExit("No pages were rendered from the PDF.")

if output_format == "jpeg":
    output_format = "jpg"

if output_format not in ("jpg", "png", "webp"):
    raise SystemExit("Unsupported format: " + output_format)

extension = output_format
image_format = "JPEG" if output_format == "jpg" else output_format.upper()

with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    for index, source in enumerate(page_files, start=1):
        with Image.open(source) as image:
            image = ImageOps.exif_transpose(image)
            buffer = io.BytesIO()

            if image_format == "JPEG":
                flatten_to_rgb(image).save(buffer, format=image_format, quality=quality, optimize=True)
            elif image_format == "WEBP":
                image.save(buffer, format=image_format, quality=quality, method=6)
            else:
                image.save(buffer, format=image_format, optimize=True)

            archive.writestr(
                "page-" + str(index).zfill(3) + "." + extension,
                buffer.getvalue(),
            )
`;

function toFetchRequest(req: IncomingMessage) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const requestInit = {
    method: req.method ?? "POST",
    headers: req.headers as HeadersInit,
    body: req as unknown as BodyInit,
    duplex: "half" as const,
  } as RequestInit & { duplex: "half" };

  return new Request(url, requestInit);
}

async function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} exited with code ${code ?? "unknown"}${
            stderr.trim() ? `: ${stderr.trim()}` : ""
          }`
        )
      );
    });
  });
}

function sanitizeBaseName(fileName: string) {
  const baseName = path.basename(fileName, path.extname(fileName));
  const cleaned = baseName.replace(/[^a-z0-9._-]+/gi, "_").replace(/^_+|_+$/g, "");
  return cleaned || "converted";
}

function parseFormat(value: FormDataEntryValue | null): PdfToImageFormat {
  const normalized = String(value ?? "jpg").toLowerCase();

  if (normalized === "jpeg") {
    return "jpg";
  }

  if (normalized === "jpg" || normalized === "png" || normalized === "webp") {
    return normalized;
  }

  throw new ConversionError(400, "Format must be jpg, png, or webp.");
}

function parseQuality(value: FormDataEntryValue | null) {
  const parsed = Number.parseInt(String(value ?? "85"), 10);

  if (Number.isNaN(parsed)) {
    return 85;
  }

  return Math.min(100, Math.max(1, parsed));
}

function sendJsonError(res: ServerResponse, statusCode: number, message: string) {
  if (res.headersSent) {
    res.destroy();
    return;
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: message }));
}

function getErrorMessage(error: unknown) {
  if (error instanceof ConversionError) {
    return { statusCode: error.statusCode, message: error.message };
  }

  if (error instanceof Error) {
    return { statusCode: 500, message: error.message || "Conversion failed." };
  }

  return { statusCode: 500, message: "Conversion failed." };
}

async function cleanupTempDir(tempDir: string | null) {
  if (!tempDir) {
    return;
  }

  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
}

export async function handlePdfToImageRequest(
  req: IncomingMessage,
  res: ServerResponse
) {
  let tempDir: string | null = null;
  let cleanupScheduled = false;

  const cleanup = async () => {
    if (cleanupScheduled) {
      return;
    }

    cleanupScheduled = true;
    await cleanupTempDir(tempDir);
  };

  try {
    const formData = await toFetchRequest(req).formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ConversionError(400, "Please upload a PDF file.");
    }

    const format = parseFormat(formData.get("format"));
    const quality = parseQuality(formData.get("quality"));
    const safeBaseName = sanitizeBaseName(file.name);

    tempDir = await mkdtemp(path.join(tmpdir(), "tools-pdf-to-image-"));
    const inputPath = path.join(tempDir, "input.pdf");
    const renderDir = path.join(tempDir, "rendered");
    const zipPath = path.join(tempDir, "converted.zip");

    await mkdir(renderDir);
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    await runCommand("pdftoppm", [
      "-r",
      "144",
      "-png",
      inputPath,
      path.join(renderDir, "page"),
    ]);

    await runCommand("python3", [
      "-c",
      pythonScript,
      renderDir,
      zipPath,
      format,
      String(quality),
    ]);

    const downloadName = `${safeBaseName}-${format}-images.zip`;
    const stream = createReadStream(zipPath);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${downloadName}"`
    );

    res.once("finish", () => {
      void cleanup();
    });
    res.once("close", () => {
      void cleanup();
    });

    stream.once("error", (error) => {
      console.error("PDF to image stream error:", error);
      void cleanup();

      if (res.headersSent) {
        res.destroy(error as Error);
        return;
      }

      sendJsonError(res, 500, "Failed to stream the converted file.");
    });

    stream.pipe(res);
  } catch (error) {
    await cleanup();
    const { statusCode, message } = getErrorMessage(error);
    sendJsonError(res, statusCode, message);
  }
}
