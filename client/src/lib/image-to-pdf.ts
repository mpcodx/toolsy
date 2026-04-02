type PdfPage = {
  imageWidth: number;
  imageHeight: number;
  pageWidth: number;
  pageHeight: number;
  jpegBytes: Uint8Array;
};

const textEncoder = new TextEncoder();
const pdfHeader = Uint8Array.from([
  0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xff, 0xff, 0xff,
  0xff, 0x0a,
]);

// A practical default that keeps exported pages readable without making them huge.
const PAGE_SCALE = 72 / 96;
const DEFAULT_JPEG_QUALITY = 0.92;

function encodeText(value: string) {
  return textEncoder.encode(value);
}

function concatBytes(parts: Array<Uint8Array | string>) {
  const buffers = parts.map((part) =>
    typeof part === "string" ? encodeText(part) : part
  );
  const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const buffer of buffers) {
    merged.set(buffer, offset);
    offset += buffer.length;
  }

  return merged;
}

function scaleToPdfPoints(pixels: number) {
  return Math.max(1, Math.round(pixels * PAGE_SCALE));
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.decoding = "async";
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Unable to read image file "${file.name}".`));
    };
    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("The browser could not encode the image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

async function convertFileToPage(
  file: File,
  quality: number
): Promise<PdfPage> {
  const image = await loadImage(file);
  const imageWidth = image.naturalWidth;
  const imageHeight = image.naturalHeight;

  if (imageWidth === 0 || imageHeight === 0) {
    throw new Error(`"${file.name}" does not look like a valid image.`);
  }

  const canvas = document.createElement("canvas");
  canvas.width = imageWidth;
  canvas.height = imageHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  // Flatten transparent pixels onto white so the generated PDF looks clean.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  const jpegBlob = await canvasToBlob(canvas, "image/jpeg", quality);
  const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

  return {
    imageWidth,
    imageHeight,
    pageWidth: scaleToPdfPoints(imageWidth),
    pageHeight: scaleToPdfPoints(imageHeight),
    jpegBytes,
  };
}

function buildPdfBytes(pages: PdfPage[]) {
  const objectCount = pages.length * 3 + 2;
  const objects: Array<{ id: number; body: Uint8Array }> = [];

  pages.forEach((page, index) => {
    const imageId = 3 + index * 3;
    const contentId = imageId + 1;
    const pageId = imageId + 2;
    const imageName = `Im${index + 1}`;
    const contentStream = encodeText(
      `q\n${page.pageWidth} 0 0 ${page.pageHeight} 0 0 cm\n/${imageName} Do\nQ\n`
    );

    objects.push({
      id: imageId,
      body: concatBytes([
        `<< /Type /XObject /Subtype /Image /Width ${page.imageWidth} /Height ${page.imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpegBytes.length} >>\nstream\n`,
        page.jpegBytes,
        "\nendstream",
      ]),
    });

    objects.push({
      id: contentId,
      body: concatBytes([
        `<< /Length ${contentStream.length} >>\nstream\n`,
        contentStream,
        "endstream",
      ]),
    });

    objects.push({
      id: pageId,
      body: encodeText(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.pageWidth} ${page.pageHeight}] /Resources << /ProcSet [/PDF /ImageC] /XObject << /${imageName} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`
      ),
    });
  });

  const pagesObjectId = 2;
  const catalogObjectId = 1;
  const pageRefs = pages
    .map((_, index) => `${3 + index * 3 + 2} 0 R`)
    .join(" ");

  objects.push({
    id: pagesObjectId,
    body: encodeText(
      `<< /Type /Pages /Count ${pages.length} /Kids [${pageRefs}] >>`
    ),
  });

  objects.push({
    id: catalogObjectId,
    body: encodeText("<< /Type /Catalog /Pages 2 0 R >>"),
  });

  objects.sort((left, right) => left.id - right.id);

  const chunks: Uint8Array[] = [pdfHeader];
  const offsets = new Map<number, number>();
  let offset = pdfHeader.length;

  for (const object of objects) {
    offsets.set(object.id, offset);
    const serializedObject = concatBytes([
      `${object.id} 0 obj\n`,
      object.body,
      "\nendobj\n",
    ]);
    chunks.push(serializedObject);
    offset += serializedObject.length;
  }

  const xrefOffset = offset;
  const xrefLines = [`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`];

  for (let objectId = 1; objectId <= objectCount; objectId += 1) {
    const objectOffset = offsets.get(objectId);
    if (objectOffset === undefined) {
      throw new Error("Failed to assemble the PDF document.");
    }
    xrefLines.push(`${objectOffset.toString().padStart(10, "0")} 00000 n \n`);
  }

  xrefLines.push(
    `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );
  chunks.push(encodeText(xrefLines.join("")));

  return concatBytes(chunks);
}

export async function createPdfFromImages(
  files: File[],
  quality = DEFAULT_JPEG_QUALITY
) {
  if (files.length === 0) {
    throw new Error("Please add at least one image.");
  }

  const pages: PdfPage[] = [];

  for (const file of files) {
    pages.push(await convertFileToPage(file, quality));
  }

  return new Blob([buildPdfBytes(pages)], { type: "application/pdf" });
}
