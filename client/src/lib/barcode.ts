type BarcodeFormat = "ean13" | "upca";

const LEFT_PATTERNS = [
  "0001101",
  "0011001",
  "0010011",
  "0111101",
  "0100011",
  "0110001",
  "0101111",
  "0111011",
  "0110111",
  "0001011",
];

const PARITY_PATTERNS = [
  "LLLLLL",
  "LLGLGG",
  "LLGGLG",
  "LLGGGL",
  "LGLLGG",
  "LGGLLG",
  "LGGGLL",
  "LGLGLG",
  "LGLGGL",
  "LGGLGL",
];

function reversePattern(pattern: string) {
  return pattern.split("").reverse().join("");
}

function invertPattern(pattern: string) {
  return pattern
    .split("")
    .map((character) => (character === "1" ? "0" : "1"))
    .join("");
}

function leftPattern(digit: number) {
  return LEFT_PATTERNS[digit];
}

function rightPattern(digit: number) {
  return invertPattern(LEFT_PATTERNS[digit]);
}

function gPattern(digit: number) {
  return invertPattern(reversePattern(LEFT_PATTERNS[digit]));
}

function computeCheckDigit(digits12: string) {
  let sum = 0;
  for (let index = 0; index < digits12.length; index += 1) {
    const digit = Number.parseInt(digits12[index], 10);
    const weight = index % 2 === 0 ? 1 : 3;
    sum += digit * weight;
  }

  return (10 - (sum % 10)) % 10;
}

function normalizeDigits(input: string, format: BarcodeFormat) {
  const digits = input.replace(/\D+/g, "");

  if (format === "upca") {
    if (digits.length === 11) {
      const checkDigit = computeCheckDigit(digits);
      return { digits: `0${digits}${checkDigit}`, label: `${digits}${checkDigit}` };
    }

    if (digits.length === 12) {
      const data = digits.slice(0, 11);
      const checkDigit = computeCheckDigit(data);
      if (checkDigit !== Number.parseInt(digits[11], 10)) {
        return null;
      }

      return { digits: `0${digits}`, label: digits };
    }

    return null;
  }

  if (digits.length === 12) {
    const checkDigit = computeCheckDigit(digits);
    return { digits: `${digits}${checkDigit}`, label: `${digits}${checkDigit}` };
  }

  if (digits.length === 13) {
    const data = digits.slice(0, 12);
    const checkDigit = computeCheckDigit(data);
    if (checkDigit !== Number.parseInt(digits[12], 10)) {
      return null;
    }

    return { digits, label: digits };
  }

  return null;
}

export function generateBarcode(
  input: string,
  format: BarcodeFormat = "ean13"
) {
  const normalized = normalizeDigits(input, format);
  if (!normalized) {
    throw new Error(
      format === "upca"
        ? "UPC-A requires 11 or 12 digits."
        : "EAN-13 requires 12 or 13 digits."
    );
  }

  const digits = normalized.digits;
  const dataDigits = digits.slice(0, 12);
  const firstDigit = Number.parseInt(dataDigits[0], 10);
  const parity = PARITY_PATTERNS[firstDigit];
  const encoded: string[] = [];

  encoded.push("101");

  for (let index = 1; index <= 6; index += 1) {
    const digit = Number.parseInt(dataDigits[index], 10);
    const pattern = parity[index - 1] === "L" ? leftPattern(digit) : gPattern(digit);
    encoded.push(pattern);
  }

  encoded.push("01010");

  for (let index = 7; index <= 12; index += 1) {
    const digit = Number.parseInt(digits[index], 10);
    encoded.push(rightPattern(digit));
  }

  encoded.push("101");

  return {
    digits,
    label: normalized.label,
    modules: encoded.join(""),
  };
}

export type BarcodeRenderOptions = {
  height?: number;
  foreground?: string;
  background?: string;
  showText?: boolean;
};

export function barcodeToSvg(
  barcode: ReturnType<typeof generateBarcode>,
  options: BarcodeRenderOptions = {}
) {
  const height = options.height ?? 96;
  const foreground = options.foreground ?? "#111827";
  const background = options.background ?? "#ffffff";
  const quietZone = 11;
  const labelHeight = options.showText === false ? 0 : 24;
  const modules = barcode.modules;
  const width = modules.length + quietZone * 2;
  const bars = modules
    .split("")
    .map((module, index) =>
      module === "1"
        ? `<rect x="${index + quietZone}" y="0" width="1" height="${height}" fill="${foreground}"/>`
        : ""
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height + labelHeight}" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="${background}"/>
  ${bars}
  ${
    options.showText === false
      ? ""
      : `<text x="${width / 2}" y="${height + 18}" text-anchor="middle" font-family="monospace" font-size="12" fill="${foreground}">${barcode.label}</text>`
  }
</svg>`;
}

export function barcodeToCanvas(
  canvas: HTMLCanvasElement,
  barcode: ReturnType<typeof generateBarcode>,
  options: BarcodeRenderOptions & { width: number }
) {
  const foreground = options.foreground ?? "#111827";
  const background = options.background ?? "#ffffff";
  const quietZone = 11;
  const labelHeight = options.showText === false ? 0 : 24;
  const modules = barcode.modules;
  const moduleCount = modules.length + quietZone * 2;
  const barHeight = Math.max(1, (options.height ?? 120) - labelHeight);
  const moduleWidth = Math.max(1, Math.floor(options.width / moduleCount));
  const actualWidth = moduleWidth * moduleCount;
  const actualHeight = barHeight + labelHeight;

  canvas.width = actualWidth;
  canvas.height = actualHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  context.fillStyle = background;
  context.fillRect(0, 0, actualWidth, actualHeight);

  context.fillStyle = foreground;
  modules.split("").forEach((module, index) => {
    if (module === "1") {
      context.fillRect((index + quietZone) * moduleWidth, 0, moduleWidth, barHeight);
    }
  });

  if (options.showText !== false) {
    context.fillStyle = foreground;
    context.font = "14px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(barcode.label, actualWidth / 2, barHeight + 12);
  }

  return canvas;
}
