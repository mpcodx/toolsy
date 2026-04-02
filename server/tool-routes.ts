import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { tmpdir } from "node:os";

type RunCommandOptions = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
};

type FileDownloadOptions = {
  contentType: string;
  downloadName: string;
  cleanup?: () => Promise<void>;
};

const DOCX_CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
`;

const DOCX_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
`;

const DOCX_DOCUMENT_XML_PREFIX = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
`;

const DOCX_DOCUMENT_XML_SUFFIX = `
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
`;

const DOCX_FONT_PATH = "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf";

class ToolRouteError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ToolRouteError";
  }
}

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

async function runCommand(
  command: string,
  args: string[],
  options: RunCommandOptions = {}
) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
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

function sanitizeRelativePath(input: string) {
  const normalized = input.replace(/\\/g, "/");
  const segments = normalized
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment && segment !== "." && segment !== "..")
    .map((segment) => segment.replace(/[^a-z0-9._-]+/gi, "_"));

  return segments.length > 0 ? segments.join("/") : "file";
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function xmlParagraph(text: string) {
  if (!text) {
    return "<w:p/>";
  }

  return `<w:p><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function xmlPageBreak() {
  return "<w:p><w:r><w:br w:type=\"page\"/></w:r></w:p>";
}

function getErrorMessage(error: unknown) {
  if (error instanceof ToolRouteError) {
    return { statusCode: error.statusCode, message: error.message };
  }

  if (error instanceof Error) {
    return { statusCode: 500, message: error.message || "Conversion failed." };
  }

  return { statusCode: 500, message: "Conversion failed." };
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

async function cleanupTempDir(tempDir: string | null) {
  if (!tempDir) {
    return;
  }

  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
}

function createCleanup(tempDir: string) {
  let cleaned = false;

  return async () => {
    if (cleaned) {
      return;
    }

    cleaned = true;
    await cleanupTempDir(tempDir);
  };
}

async function createTempDir(prefix: string) {
  return mkdtemp(path.join(tmpdir(), prefix));
}

function getSingleFile(formData: FormData, keys: string[]) {
  for (const key of keys) {
    const value = formData.get(key);
    if (value instanceof File) {
      return value;
    }
  }

  return null;
}

function getMultiFiles(formData: FormData, keys: string[]) {
  for (const key of keys) {
    const files = formData
      .getAll(key)
      .filter((value): value is File => value instanceof File);

    if (files.length > 0) {
      return files;
    }
  }

  return [];
}

async function writeUploadedFile(
  directory: string,
  file: File,
  nameOverride?: string
) {
  const filename = sanitizeBaseName(nameOverride ?? file.name);
  const filePath = path.join(directory, filename);
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  return filePath;
}

async function zipDirectoryEntries(
  directory: string,
  outputPath: string,
  entries?: string[]
) {
  const contents = entries ?? (await readdir(directory));
  const filtered = contents.filter((entry) => entry !== "." && entry !== "..");

  if (filtered.length === 0) {
    throw new ToolRouteError(400, "There are no files to archive.");
  }

  await runCommand("zip", ["-qr", outputPath, ...filtered], { cwd: directory });
}

function streamFileResponse(
  res: ServerResponse,
  filePath: string,
  options: FileDownloadOptions
) {
  const stream = createReadStream(filePath);
  const escapedName = options.downloadName.replace(/"/g, '\\"');

  res.statusCode = 200;
  res.setHeader("Content-Type", options.contentType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${escapedName}"`
  );

  const cleanup = options.cleanup ?? (async () => {});

  const finalize = () => {
    void cleanup();
  };

  res.once("finish", finalize);
  res.once("close", finalize);

  stream.once("error", (error) => {
    finalize();

    if (!res.headersSent) {
      sendJsonError(res, 500, "Failed to stream the converted file.");
      return;
    }

    res.destroy(error as Error);
  });

  stream.pipe(res);
}

function parsePageSelection(value: FormDataEntryValue | null, totalPages: number) {
  if (!value) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const raw = String(value).trim().toLowerCase();
  if (!raw || raw === "all") {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>();

  for (const token of raw.split(/[,\s]+/).filter(Boolean)) {
    const match = token.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) {
      continue;
    }

    const start = Math.min(totalPages, Math.max(1, Number.parseInt(match[1], 10)));
    const end = Math.min(
      totalPages,
      Math.max(1, Number.parseInt(match[2] ?? match[1], 10))
    );
    const [from, to] = start <= end ? [start, end] : [end, start];

    for (let page = from; page <= to; page += 1) {
      pages.add(page);
    }
  }

  return pages.size > 0
    ? Array.from(pages).sort((left, right) => left - right)
    : Array.from({ length: totalPages }, (_, index) => index + 1);
}

function parseCompressionPreset(value: FormDataEntryValue | null) {
  const preset = String(value ?? "screen").toLowerCase();
  if (["screen", "ebook", "printer", "prepress"].includes(preset)) {
    return preset;
  }

  return "screen";
}

function parsePosition(value: FormDataEntryValue | null) {
  const position = String(value ?? "center").toLowerCase();
  if (
    [
      "center",
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "diagonal",
    ].includes(position)
  ) {
    return position;
  }

  return "center";
}

function parseOpacity(value: FormDataEntryValue | null) {
  const parsed = Number.parseInt(String(value ?? "35"), 10);
  if (Number.isNaN(parsed)) {
    return 35;
  }

  return Math.min(100, Math.max(0, parsed));
}

function parseSize(value: FormDataEntryValue | null) {
  const parsed = Number.parseInt(String(value ?? "42"), 10);
  if (Number.isNaN(parsed)) {
    return 42;
  }

  return Math.min(180, Math.max(12, parsed));
}

function parseRotation(value: FormDataEntryValue | null, position: string) {
  const parsed = Number.parseInt(String(value ?? "0"), 10);
  if (Number.isNaN(parsed)) {
    return position === "diagonal" ? -30 : 0;
  }

  return position === "diagonal" ? parsed - 30 : parsed;
}

async function readPdfPageCount(filePath: string) {
  const { stdout } = await runCommand("pdfinfo", [filePath]);
  const match = stdout.match(/^Pages:\s+(\d+)/m);

  if (!match) {
    throw new ToolRouteError(500, "Unable to determine the PDF page count.");
  }

  return Number.parseInt(match[1], 10);
}

async function convertOfficeToPdf(
  file: File,
  outputFileName: string
) {
  const tempDir = await createTempDir("tools-office-");
  const cleanup = createCleanup(tempDir);
  const inputPath = path.join(
    tempDir,
    `${sanitizeBaseName(file.name)}${path.extname(file.name) || ""}`
  );

  await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

  await runCommand(
    "libreoffice",
    [
      "--headless",
      "--nologo",
      "--nolockcheck",
      "--nodefault",
      "--convert-to",
      "pdf",
      "--outdir",
      tempDir,
      inputPath,
    ],
    {
      cwd: tempDir,
      env: { ...process.env, HOME: tempDir },
    }
  );

  const outputPath = path.join(tempDir, `${sanitizeBaseName(file.name)}.pdf`);
  const exists = await stat(outputPath).then(
    () => true,
    () => false
  );

  if (!exists) {
    await cleanup();
    throw new ToolRouteError(500, "LibreOffice did not produce a PDF file.");
  }

  return { tempDir, cleanup, outputPath, downloadName: outputFileName };
}

export async function handlePdfCompressRequest(
  req: IncomingMessage,
  res: ServerResponse
) {
  let tempDir: string | null = null;

  try {
    const formData = await toFetchRequest(req).formData();
    const file = getSingleFile(formData, ["file", "pdf"]);

    if (!(file instanceof File)) {
      throw new ToolRouteError(400, "Please upload a PDF file.");
    }

    const preset = parseCompressionPreset(formData.get("preset"));
    tempDir = await createTempDir("tools-pdf-compress-");
    const cleanup = createCleanup(tempDir);
    const inputPath = path.join(tempDir, "input.pdf");
    const outputPath = path.join(tempDir, "compressed.pdf");

    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    await runCommand("gs", [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      `-dPDFSETTINGS=/${preset}`,
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      "-dDetectDuplicateImages=true",
      "-dCompressFonts=true",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ]);

    streamFileResponse(res, outputPath, {
      contentType: "application/pdf",
      downloadName: `${sanitizeBaseName(file.name)}-compressed.pdf`,
      cleanup,
    });
  } catch (error) {
    await cleanupTempDir(tempDir);
    const { statusCode, message } = getErrorMessage(error);
    sendJsonError(res, statusCode, message);
  }
}

export async function handlePdfMergeRequest(
  req: IncomingMessage,
  res: ServerResponse
) {
  let tempDir: string | null = null;

  try {
    const formData = await toFetchRequest(req).formData();
    const files = getMultiFiles(formData, ["files", "file"]);

    if (files.length < 2) {
      throw new ToolRouteError(400, "Please upload at least two PDF files.");
    }

    tempDir = await createTempDir("tools-pdf-merge-");
    const cleanup = createCleanup(tempDir);
    const inputs: string[] = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const inputPath = path.join(
        tempDir,
        `${String(index + 1).padStart(3, "0")}-${sanitizeBaseName(file.name)}.pdf`
      );
      await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));
      inputs.push(inputPath);
    }

    const outputPath = path.join(tempDir, "merged.pdf");
    await runCommand("pdfunite", [...inputs, outputPath]);

    streamFileResponse(res, outputPath, {
      contentType: "application/pdf",
      downloadName: "merged.pdf",
      cleanup,
    });
  } catch (error) {
    await cleanupTempDir(tempDir);
    const { statusCode, message } = getErrorMessage(error);
    sendJsonError(res, statusCode, message);
  }
}

export async function handlePdfSplitRequest(
  req: IncomingMessage,
  res: ServerResponse
) {
  let tempDir: string | null = null;

  try {
    const formData = await toFetchRequest(req).formData();
    const file = getSingleFile(formData, ["file", "pdf"]);

    if (!(file instanceof File)) {
      throw new ToolRouteError(400, "Please upload a PDF file.");
    }

    const mode = String(formData.get("mode") ?? "zip").toLowerCase();
    tempDir = await createTempDir("tools-pdf-split-");
    const cleanup = createCleanup(tempDir);
    const inputPath = path.join(tempDir, "input.pdf");
    const pagesDir = path.join(tempDir, "pages");
    await mkdir(pagesDir);
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    const totalPages = await readPdfPageCount(inputPath);
    const selectedPages = parsePageSelection(formData.get("pages"), totalPages);
    const pagePattern = path.join(pagesDir, "page-%03d.pdf");

    await runCommand("pdfseparate", [inputPath, pagePattern]);

    const selectedFiles = selectedPages.map((page) =>
      path.join(pagesDir, `page-${String(page).padStart(3, "0")}.pdf`)
    );

    for (const filePath of selectedFiles) {
      const exists = await stat(filePath).then(
        () => true,
        () => false
      );

      if (!exists) {
        throw new ToolRouteError(500, "One or more selected pages could not be found.");
      }
    }

    if (mode === "pdf") {
      const outputPath = path.join(tempDir, "split.pdf");
      await runCommand("pdfunite", [...selectedFiles, outputPath]);
      streamFileResponse(res, outputPath, {
        contentType: "application/pdf",
        downloadName: `${sanitizeBaseName(file.name)}-split.pdf`,
        cleanup,
      });
      return;
    }

    const archiveDir = path.join(tempDir, "archive");
    await mkdir(archiveDir);

    for (let index = 0; index < selectedFiles.length; index += 1) {
      const source = selectedFiles[index];
      const target = path.join(
        archiveDir,
        `page-${String(selectedPages[index]).padStart(3, "0")}.pdf`
      );
      await copyFile(source, target);
    }

    const zipPath = path.join(tempDir, "pages.zip");
    await zipDirectoryEntries(archiveDir, zipPath);

    streamFileResponse(res, zipPath, {
      contentType: "application/zip",
      downloadName: `${sanitizeBaseName(file.name)}-split.zip`,
      cleanup,
    });
  } catch (error) {
    await cleanupTempDir(tempDir);
    const { statusCode, message } = getErrorMessage(error);
    sendJsonError(res, statusCode, message);
  }
}

export async function handlePdfWatermarkRequest(
  req: IncomingMessage,
  res: ServerResponse
) {
  let tempDir: string | null = null;

  try {
    const formData = await toFetchRequest(req).formData();
    const file = getSingleFile(formData, ["file", "pdf"]);
    const watermarkImage = getSingleFile(formData, ["image", "watermark"]);
    const watermarkText = String(formData.get("text") ?? formData.get("watermark") ?? "").trim();
    const position = parsePosition(formData.get("position"));
    const opacity = parseOpacity(formData.get("opacity"));
    const size = parseSize(formData.get("size"));
    const rotation = parseRotation(formData.get("rotation"), position);

    if (!(file instanceof File)) {
      throw new ToolRouteError(400, "Please upload a PDF file.");
    }

    if (!watermarkText && !(watermarkImage instanceof File)) {
      throw new ToolRouteError(400, "Please provide a watermark text or image.");
    }

    tempDir = await createTempDir("tools-pdf-watermark-");
    const cleanup = createCleanup(tempDir);
    const inputPath = path.join(tempDir, "input.pdf");
    const renderDir = path.join(tempDir, "rendered");
    const outputPath = path.join(tempDir, "watermarked.pdf");
    await mkdir(renderDir);
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    let imagePath = "";
    if (watermarkImage instanceof File) {
      imagePath = path.join(
        tempDir,
        `${sanitizeBaseName(watermarkImage.name)}${path.extname(watermarkImage.name)}`
      );
      await writeFile(imagePath, Buffer.from(await watermarkImage.arrayBuffer()));
    }

    await runCommand("pdftoppm", [
      "-r",
      "144",
      "-png",
      inputPath,
      path.join(renderDir, "page"),
    ]);

    const pythonScript = `
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

render_dir = Path(sys.argv[1])
output_pdf = Path(sys.argv[2])
watermark_text = sys.argv[3]
watermark_image = sys.argv[4]
opacity = max(0, min(100, int(sys.argv[5])))
position = sys.argv[6]
font_size = max(12, int(sys.argv[7]))
rotation = float(sys.argv[8])
font_path = sys.argv[9]

def page_index(path):
    return int(path.stem.split("-")[-1])

def text_position(image_size, text_size, placement):
    width, height = image_size
    text_width, text_height = text_size
    margin = max(24, int(min(width, height) * 0.06))

    if placement == "top-left":
        return margin, margin
    if placement == "top-right":
        return width - text_width - margin, margin
    if placement == "bottom-left":
        return margin, height - text_height - margin
    if placement == "bottom-right":
        return width - text_width - margin, height - text_height - margin
    return (width - text_width) / 2, (height - text_height) / 2

def image_position(image_size, watermark_size, placement):
    width, height = image_size
    wm_width, wm_height = watermark_size
    margin = max(24, int(min(width, height) * 0.06))

    if placement == "top-left":
        return margin, margin
    if placement == "top-right":
        return width - wm_width - margin, margin
    if placement == "bottom-left":
        return margin, height - wm_height - margin
    if placement == "bottom-right":
        return width - wm_width - margin, height - wm_height - margin
    return (width - wm_width) / 2, (height - wm_height) / 2

page_files = sorted(render_dir.glob("page-*.png"), key=page_index)
if not page_files:
    raise SystemExit("No pages were rendered from the PDF.")

processed = []

for source in page_files:
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGBA")
        layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer)

        if watermark_text:
            try:
                font = ImageFont.truetype(font_path, font_size)
            except Exception:
                font = ImageFont.load_default()

            bbox = draw.textbbox((0, 0), watermark_text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

            text_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
            text_draw = ImageDraw.Draw(text_layer)
            x, y = text_position(image.size, (text_width, text_height), position)
            alpha = int(255 * (opacity / 100.0))
            text_draw.text((x, y), watermark_text, font=font, fill=(0, 0, 0, alpha))

            if position == "diagonal":
                text_layer = text_layer.rotate(rotation, resample=Image.Resampling.BICUBIC)
            elif rotation:
                text_layer = text_layer.rotate(rotation, resample=Image.Resampling.BICUBIC)

            layer = Image.alpha_composite(layer, text_layer)

        if watermark_image:
            with Image.open(watermark_image) as watermark:
                watermark = ImageOps.exif_transpose(watermark).convert("RGBA")
                scale = min(
                    (image.width * 0.38) / watermark.width,
                    (image.height * 0.38) / watermark.height,
                    1.0,
                )
                if scale < 1.0:
                    target_size = (
                        max(1, int(watermark.width * scale)),
                        max(1, int(watermark.height * scale)),
                    )
                    watermark = watermark.resize(target_size, Image.Resampling.LANCZOS)

                alpha = watermark.getchannel("A")
                alpha = alpha.point(lambda value: int(value * (opacity / 100.0)))
                watermark.putalpha(alpha)
                x, y = image_position(image.size, watermark.size, position)
                layer.alpha_composite(watermark, (int(x), int(y)))

        composed = Image.alpha_composite(image, layer).convert("RGB")
        processed.append(composed)

if not processed:
    raise SystemExit("No watermarked pages were generated.")

processed[0].save(
    output_pdf,
    "PDF",
    save_all=True,
    append_images=processed[1:],
    resolution=144.0,
)
`;

    await runCommand("python3", [
      "-c",
      pythonScript,
      renderDir,
      outputPath,
      watermarkText,
      imagePath,
      String(opacity),
      position,
      String(size),
      String(rotation),
      DOCX_FONT_PATH,
    ]);

    streamFileResponse(res, outputPath, {
      contentType: "application/pdf",
      downloadName: `${sanitizeBaseName(file.name)}-watermarked.pdf`,
      cleanup,
    });
  } catch (error) {
    await cleanupTempDir(tempDir);
    const { statusCode, message } = getErrorMessage(error);
    sendJsonError(res, statusCode, message);
  }
}

export async function handleWordToPdfRequest(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const formData = await toFetchRequest(req).formData();
    const file = getSingleFile(formData, ["file", "document"]);

    if (!(file instanceof File)) {
      throw new ToolRouteError(400, "Please upload a Word document.");
    }

    const { cleanup, outputPath, downloadName } = await convertOfficeToPdf(
      file,
      `${sanitizeBaseName(file.name)}.pdf`
    );

    streamFileResponse(res, outputPath, {
      contentType: "application/pdf",
      downloadName,
      cleanup,
    });
  } catch (error) {
    const { statusCode, message } = getErrorMessage(error);
    sendJsonError(res, statusCode, message);
  }
}

export async function handleExcelToPdfRequest(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const formData = await toFetchRequest(req).formData();
    const file = getSingleFile(formData, ["file", "spreadsheet"]);

    if (!(file instanceof File)) {
      throw new ToolRouteError(400, "Please upload an Excel spreadsheet.");
    }

    const { cleanup, outputPath, downloadName } = await convertOfficeToPdf(
      file,
      `${sanitizeBaseName(file.name)}.pdf`
    );

    streamFileResponse(res, outputPath, {
      contentType: "application/pdf",
      downloadName,
      cleanup,
    });
  } catch (error) {
    const { statusCode, message } = getErrorMessage(error);
    sendJsonError(res, statusCode, message);
  }
}

export async function handlePptToPdfRequest(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const formData = await toFetchRequest(req).formData();
    const file = getSingleFile(formData, ["file", "presentation"]);

    if (!(file instanceof File)) {
      throw new ToolRouteError(400, "Please upload a PowerPoint presentation.");
    }

    const { cleanup, outputPath, downloadName } = await convertOfficeToPdf(
      file,
      `${sanitizeBaseName(file.name)}.pdf`
    );

    streamFileResponse(res, outputPath, {
      contentType: "application/pdf",
      downloadName,
      cleanup,
    });
  } catch (error) {
    const { statusCode, message } = getErrorMessage(error);
    sendJsonError(res, statusCode, message);
  }
}

export async function handlePdfToWordRequest(
  req: IncomingMessage,
  res: ServerResponse
) {
  let tempDir: string | null = null;

  try {
    const formData = await toFetchRequest(req).formData();
    const file = getSingleFile(formData, ["file", "pdf"]);

    if (!(file instanceof File)) {
      throw new ToolRouteError(400, "Please upload a PDF file.");
    }

    tempDir = await createTempDir("tools-pdf-to-word-");
    const cleanup = createCleanup(tempDir);
    const inputPath = path.join(tempDir, "input.pdf");
    const textPath = path.join(tempDir, "output.txt");
    const packageDir = path.join(tempDir, "docx");
    await mkdir(packageDir);

    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    await runCommand("pdftotext", ["-layout", inputPath, textPath]);

    const extractedText = await readFile(textPath, "utf8");
    const pages = extractedText.replace(/\r/g, "").split("\f");
    const paragraphs: string[] = [];

    pages.forEach((pageText, pageIndex) => {
      const lines = pageText.split("\n");
      for (const line of lines) {
        if (line.trim().length === 0) {
          paragraphs.push("<w:p/>");
          continue;
        }

        paragraphs.push(xmlParagraph(line));
      }

      if (pageIndex < pages.length - 1) {
        paragraphs.push(xmlPageBreak());
      }
    });

    const documentXml = `${DOCX_DOCUMENT_XML_PREFIX}
${paragraphs.join("\n")}
${DOCX_DOCUMENT_XML_SUFFIX}`;

    await mkdir(path.join(packageDir, "_rels"), { recursive: true });
    await mkdir(path.join(packageDir, "word"), { recursive: true });

    await writeFile(path.join(packageDir, "[Content_Types].xml"), DOCX_CONTENT_TYPES);
    await writeFile(path.join(packageDir, "_rels", ".rels"), DOCX_RELS);
    await writeFile(path.join(packageDir, "word", "document.xml"), documentXml);

    const outputPath = path.join(tempDir, "converted.docx");
    const entries = (await readdir(packageDir)).sort();
    await zipDirectoryEntries(packageDir, outputPath, entries);

    streamFileResponse(res, outputPath, {
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      downloadName: `${sanitizeBaseName(file.name)}.docx`,
      cleanup,
    });
  } catch (error) {
    await cleanupTempDir(tempDir);
    const { statusCode, message } = getErrorMessage(error);
    sendJsonError(res, statusCode, message);
  }
}

export async function handleZipCreateRequest(
  req: IncomingMessage,
  res: ServerResponse
) {
  let tempDir: string | null = null;

  try {
    const formData = await toFetchRequest(req).formData();
    const files = getMultiFiles(formData, ["files", "file"]);
    const paths = formData.getAll("paths").map((value) => String(value));

    if (files.length === 0) {
      throw new ToolRouteError(400, "Please add at least one file.");
    }

    tempDir = await createTempDir("tools-zip-create-");
    const cleanup = createCleanup(tempDir);
    const bundleDir = path.join(tempDir, "bundle");
    await mkdir(bundleDir);

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const relativePath = sanitizeRelativePath(
        paths[index] || file.name || `file-${index + 1}`
      );
      const outputPath = path.join(bundleDir, relativePath);
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, Buffer.from(await file.arrayBuffer()));
    }

    const outputPath = path.join(tempDir, "archive.zip");
    const entries = (await readdir(bundleDir)).sort();
    await zipDirectoryEntries(bundleDir, outputPath, entries);

    streamFileResponse(res, outputPath, {
      contentType: "application/zip",
      downloadName: "archive.zip",
      cleanup,
    });
  } catch (error) {
    await cleanupTempDir(tempDir);
    const { statusCode, message } = getErrorMessage(error);
    sendJsonError(res, statusCode, message);
  }
}

export async function handleZipExtractRequest(
  req: IncomingMessage,
  res: ServerResponse
) {
  let tempDir: string | null = null;

  try {
    const formData = await toFetchRequest(req).formData();
    const file = getSingleFile(formData, ["file", "archive"]);

    if (!(file instanceof File)) {
      throw new ToolRouteError(400, "Please upload a ZIP file.");
    }

    tempDir = await createTempDir("tools-zip-extract-");
    const cleanup = createCleanup(tempDir);
    const inputPath = path.join(tempDir, "archive.zip");
    await writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    const pythonScript = `
import base64
import json
import mimetypes
import sys
import zipfile
from pathlib import Path

archive_path = Path(sys.argv[1])
max_bytes = int(sys.argv[2])
files = []
total = 0

with zipfile.ZipFile(archive_path) as archive:
    for info in archive.infolist():
        if info.is_dir():
            continue

        data = archive.read(info.filename)
        total += len(data)
        if total > max_bytes:
            raise SystemExit("Archive contents are too large to extract in the browser.")

        files.append({
            "path": info.filename,
            "name": Path(info.filename).name,
            "size": len(data),
            "mimeType": mimetypes.guess_type(info.filename)[0] or "application/octet-stream",
            "contentBase64": base64.b64encode(data).decode("ascii"),
        })

print(json.dumps({"files": files}, ensure_ascii=False))
`;

    const { stdout } = await runCommand("python3", [
      "-c",
      pythonScript,
      inputPath,
      String(25 * 1024 * 1024),
    ]);

    const payload = JSON.parse(stdout) as {
      files: Array<{
        path: string;
        name: string;
        size: number;
        mimeType: string;
        contentBase64: string;
      }>;
    };

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
    await cleanup();
  } catch (error) {
    await cleanupTempDir(tempDir);
    const { statusCode, message } = getErrorMessage(error);
    sendJsonError(res, statusCode, message);
  }
}
