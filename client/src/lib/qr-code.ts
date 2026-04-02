type QrMatrix = boolean[][];

export type QrCodeResult = {
  version: number;
  size: number;
  matrix: QrMatrix;
};

export type QrRenderOptions = {
  margin?: number;
  foreground?: string;
  background?: string;
};

const ERROR_CORRECTION_LEVEL_L = 1;
const BYTE_CAPACITIES: Record<number, number> = {
  1: 17,
  2: 32,
  3: 53,
  4: 78,
  5: 106,
};

const DATA_CODEWORDS: Record<number, number> = {
  1: 19,
  2: 34,
  3: 55,
  4: 80,
  5: 108,
};

const ECC_CODEWORDS: Record<number, number> = {
  1: 7,
  2: 10,
  3: 15,
  4: 20,
  5: 26,
};

const ALIGNMENT_POSITIONS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
};

const GF_EXP = new Array<number>(512);
const GF_LOG = new Array<number>(256);

let value = 1;
for (let index = 0; index < 255; index += 1) {
  GF_EXP[index] = value;
  GF_LOG[value] = index;
  value <<= 1;
  if (value & 0x100) {
    value ^= 0x11d;
  }
}

for (let index = 255; index < 512; index += 1) {
  GF_EXP[index] = GF_EXP[index - 255];
}

function gfMul(left: number, right: number) {
  if (left === 0 || right === 0) {
    return 0;
  }

  return GF_EXP[GF_LOG[left] + GF_LOG[right]];
}

function buildGeneratorPolynomial(ecCount: number) {
  let polynomial = [1];

  for (let degree = 0; degree < ecCount; degree += 1) {
    const next = new Array<number>(polynomial.length + 1).fill(0);

    for (let left = 0; left < polynomial.length; left += 1) {
      next[left] ^= gfMul(polynomial[left], 1);
      next[left + 1] ^= gfMul(polynomial[left], GF_EXP[degree]);
    }

    polynomial = next;
  }

  return polynomial;
}

function calculateErrorCorrection(dataCodewords: number[], ecCount: number) {
  const generator = buildGeneratorPolynomial(ecCount);
  const ecc = new Array<number>(ecCount).fill(0);

  for (const codeword of dataCodewords) {
    const factor = codeword ^ ecc[0];

    for (let index = 0; index < ecCount - 1; index += 1) {
      ecc[index] = ecc[index + 1] ^ gfMul(generator[index + 1], factor);
    }

    ecc[ecCount - 1] = gfMul(generator[ecCount], factor);
  }

  return ecc;
}

function bytesToBits(bytes: number[]) {
  const bits: boolean[] = [];

  for (const byte of bytes) {
    for (let bit = 7; bit >= 0; bit -= 1) {
      bits.push(((byte >> bit) & 1) === 1);
    }
  }

  return bits;
}

function appendBits(target: boolean[], valueToAppend: number, bitCount: number) {
  for (let bit = bitCount - 1; bit >= 0; bit -= 1) {
    target.push(((valueToAppend >> bit) & 1) === 1);
  }
}

function bitLength(valueToMeasure: number) {
  let bits = 0;
  let current = valueToMeasure;

  while (current > 0) {
    bits += 1;
    current >>= 1;
  }

  return bits;
}

function calculateBchCode(valueToEncode: number, generator: number) {
  let remaining = valueToEncode;
  const generatorBits = bitLength(generator);

  while (bitLength(remaining) >= generatorBits) {
    remaining ^= generator << (bitLength(remaining) - generatorBits);
  }

  return remaining;
}

function makeMatrix(size: number) {
  return Array.from({ length: size }, () => new Array<boolean | null>(size).fill(null));
}

function setModule(
  modules: Array<Array<boolean | null>>,
  reserved: Array<Array<boolean>>,
  row: number,
  col: number,
  valueToSet: boolean
) {
  modules[row][col] = valueToSet;
  reserved[row][col] = true;
}

function placeFinderPattern(
  modules: Array<Array<boolean | null>>,
  reserved: Array<Array<boolean>>,
  top: number,
  left: number
) {
  const pattern = [
    [true, true, true, true, true, true, true],
    [true, false, false, false, false, false, true],
    [true, false, true, true, true, false, true],
    [true, false, true, true, true, false, true],
    [true, false, true, true, true, false, true],
    [true, false, false, false, false, false, true],
    [true, true, true, true, true, true, true],
  ];

  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      setModule(modules, reserved, top + row, left + col, pattern[row][col]);
    }
  }

  for (let offset = -1; offset <= 7; offset += 1) {
    if (top - 1 >= 0 && left + offset >= 0 && left + offset < modules.length) {
      setModule(modules, reserved, top - 1, left + offset, false);
    }
    if (top + 7 < modules.length && left + offset >= 0 && left + offset < modules.length) {
      setModule(modules, reserved, top + 7, left + offset, false);
    }
    if (left - 1 >= 0 && top + offset >= 0 && top + offset < modules.length) {
      setModule(modules, reserved, top + offset, left - 1, false);
    }
    if (left + 7 < modules.length && top + offset >= 0 && top + offset < modules.length) {
      setModule(modules, reserved, top + offset, left + 7, false);
    }
  }
}

function placeAlignmentPattern(
  modules: Array<Array<boolean | null>>,
  reserved: Array<Array<boolean>>,
  centerRow: number,
  centerCol: number
) {
  const top = centerRow - 2;
  const left = centerCol - 2;

  if (top < 0 || left < 0 || top + 4 >= modules.length || left + 4 >= modules.length) {
    return;
  }

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      if (reserved[top + row][left + col]) {
        return;
      }
    }
  }

  const pattern = [
    [true, true, true, true, true],
    [true, false, false, false, true],
    [true, false, true, false, true],
    [true, false, false, false, true],
    [true, true, true, true, true],
  ];

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      setModule(modules, reserved, top + row, left + col, pattern[row][col]);
    }
  }
}

function placeFunctionPatterns(version: number) {
  const size = 17 + version * 4;
  const modules = makeMatrix(size);
  const reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));

  placeFinderPattern(modules, reserved, 0, 0);
  placeFinderPattern(modules, reserved, 0, size - 7);
  placeFinderPattern(modules, reserved, size - 7, 0);

  for (let index = 8; index < size - 8; index += 1) {
    const valueToSet = index % 2 === 0;
    setModule(modules, reserved, 6, index, valueToSet);
    setModule(modules, reserved, index, 6, valueToSet);
  }

  const positions = ALIGNMENT_POSITIONS[version];
  for (const row of positions) {
    for (const col of positions) {
      placeAlignmentPattern(modules, reserved, row, col);
    }
  }

  setModule(modules, reserved, size - 8, 8, true);

  const formatTopLeft = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ];

  const formatMirror = [
    [8, size - 1],
    [8, size - 2],
    [8, size - 3],
    [8, size - 4],
    [8, size - 5],
    [8, size - 6],
    [8, size - 7],
    [8, size - 8],
    [size - 7, 8],
    [size - 6, 8],
    [size - 5, 8],
    [size - 4, 8],
    [size - 3, 8],
    [size - 2, 8],
    [size - 1, 8],
  ];

  for (const [row, col] of [...formatTopLeft, ...formatMirror]) {
    reserved[row][col] = true;
  }

  return { modules, reserved, size };
}

function maskApplies(mask: number, row: number, col: number) {
  switch (mask) {
    case 0:
      return (row + col) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return col % 3 === 0;
    case 3:
      return (row + col) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5:
      return ((row * col) % 2 + (row * col) % 3) === 0;
    case 6:
      return (((row * col) % 2 + (row * col) % 3) % 2) === 0;
    case 7:
      return (((row + col) % 2 + (row * col) % 3) % 2) === 0;
    default:
      return false;
  }
}

function placeDataBits(
  modules: Array<Array<boolean | null>>,
  reserved: Array<Array<boolean>>,
  dataBits: boolean[],
  maskPattern: number
) {
  const size = modules.length;
  let bitIndex = 0;
  let direction = -1;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) {
      col -= 1;
    }

    for (let row = direction === -1 ? size - 1 : 0; direction === -1 ? row >= 0 : row < size; row += direction) {
      for (let offset = 0; offset < 2; offset += 1) {
        const currentCol = col - offset;
        if (reserved[row][currentCol]) {
          continue;
        }

        const bit = bitIndex < dataBits.length ? dataBits[bitIndex] : false;
        modules[row][currentCol] = maskApplies(maskPattern, row, currentCol) ? !bit : bit;
        bitIndex += 1;
      }
    }

    direction *= -1;
  }
}

function encodeFormatBits(maskPattern: number) {
  const data = ((ERROR_CORRECTION_LEVEL_L << 3) | maskPattern) & 0x1f;
  const bch = calculateBchCode(data << 10, 0x537);
  return ((data << 10) | bch) ^ 0x5412;
}

function placeFormatBits(
  modules: Array<Array<boolean | null>>,
  reserved: Array<Array<boolean>>,
  maskPattern: number
) {
  const size = modules.length;
  const bits = encodeFormatBits(maskPattern);
  const topLeftPositions = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ];

  const mirrorPositions = [
    [8, size - 1],
    [8, size - 2],
    [8, size - 3],
    [8, size - 4],
    [8, size - 5],
    [8, size - 6],
    [8, size - 7],
    [8, size - 8],
    [size - 7, 8],
    [size - 6, 8],
    [size - 5, 8],
    [size - 4, 8],
    [size - 3, 8],
    [size - 2, 8],
    [size - 1, 8],
  ];

  topLeftPositions.forEach(([row, col], index) => {
    const bit = ((bits >> (14 - index)) & 1) === 1;
    modules[row][col] = bit;
    reserved[row][col] = true;
  });

  mirrorPositions.forEach(([row, col], index) => {
    const bit = ((bits >> (14 - index)) & 1) === 1;
    modules[row][col] = bit;
    reserved[row][col] = true;
  });
}

function penaltyScore(modules: Array<Array<boolean | null>>) {
  const size = modules.length;
  let penalty = 0;

  for (let row = 0; row < size; row += 1) {
    let runColor = modules[row][0];
    let runLength = 1;

    for (let col = 1; col < size; col += 1) {
      const current = modules[row][col];
      if (current === runColor) {
        runLength += 1;
        continue;
      }

      if (runLength >= 5) {
        penalty += 3 + (runLength - 5);
      }

      runColor = current;
      runLength = 1;
    }

    if (runLength >= 5) {
      penalty += 3 + (runLength - 5);
    }
  }

  for (let col = 0; col < size; col += 1) {
    let runColor = modules[0][col];
    let runLength = 1;

    for (let row = 1; row < size; row += 1) {
      const current = modules[row][col];
      if (current === runColor) {
        runLength += 1;
        continue;
      }

      if (runLength >= 5) {
        penalty += 3 + (runLength - 5);
      }

      runColor = current;
      runLength = 1;
    }

    if (runLength >= 5) {
      penalty += 3 + (runLength - 5);
    }
  }

  for (let row = 0; row < size - 1; row += 1) {
    for (let col = 0; col < size - 1; col += 1) {
      const current = modules[row][col];
      if (
        current === modules[row][col + 1] &&
        current === modules[row + 1][col] &&
        current === modules[row + 1][col + 1]
      ) {
        penalty += 3;
      }
    }
  }

  const patternA = [true, false, true, true, true, false, true, false, false, false, false];
  const patternB = [false, false, false, false, true, false, true, true, true, false, true];

  const matchesPattern = (sequence: Array<boolean | null>, start: number, pattern: boolean[]) => {
    for (let index = 0; index < pattern.length; index += 1) {
      if (sequence[start + index] !== pattern[index]) {
        return false;
      }
    }

    return true;
  };

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col <= size - 11; col += 1) {
      if (matchesPattern(modules[row], col, patternA) || matchesPattern(modules[row], col, patternB)) {
        penalty += 40;
      }
    }
  }

  for (let col = 0; col < size; col += 1) {
    const column = modules.map((row) => row[col]);
    for (let row = 0; row <= size - 11; row += 1) {
      if (matchesPattern(column, row, patternA) || matchesPattern(column, row, patternB)) {
        penalty += 40;
      }
    }
  }

  let darkCount = 0;
  for (const row of modules) {
    for (const cell of row) {
      if (cell) {
        darkCount += 1;
      }
    }
  }

  const percent = (darkCount * 100) / (size * size);
  penalty += Math.floor(Math.abs(percent - 50) / 5) * 10;

  return penalty;
}

function finalizeMatrix(modules: Array<Array<boolean | null>>) {
  return modules.map((row) => row.map((cell) => Boolean(cell)));
}

function buildMatrix(version: number, dataBits: boolean[]) {
  const { modules, reserved, size } = placeFunctionPatterns(version);
  let bestMatrix: QrMatrix | null = null;
  let bestPenalty = Number.POSITIVE_INFINITY;

  for (let maskPattern = 0; maskPattern < 8; maskPattern += 1) {
    const candidateModules = modules.map((row) => row.slice());
    const candidateReserved = reserved.map((row) => row.slice());

    placeDataBits(candidateModules, candidateReserved, dataBits, maskPattern);
    placeFormatBits(candidateModules, candidateReserved, maskPattern);

    const candidatePenalty = penaltyScore(candidateModules);
    if (candidatePenalty < bestPenalty) {
      bestPenalty = candidatePenalty;
      bestMatrix = finalizeMatrix(candidateModules);
    }
  }

  if (!bestMatrix) {
    throw new Error("Failed to generate the QR code.");
  }

  return {
    size,
    matrix: bestMatrix,
  };
}

function selectVersion(byteLength: number) {
  for (let version = 1 as const; version <= 5; version += 1) {
    if (byteLength <= BYTE_CAPACITIES[version]) {
      return version;
    }
  }

  throw new Error("The text is too long for this QR generator. Try shortening it to under 106 bytes.");
}

export function generateQrCode(text: string): QrCodeResult {
  const encoder = new TextEncoder();
  const bytes = Array.from(encoder.encode(text));
  const version = selectVersion(bytes.length);
  const dataCodewords = DATA_CODEWORDS[version];
  const ecCodewords = ECC_CODEWORDS[version];

  const dataBits: boolean[] = [];
  appendBits(dataBits, 0b0100, 4);
  appendBits(dataBits, bytes.length, 8);
  for (const byte of bytes) {
    appendBits(dataBits, byte, 8);
  }

  const totalDataBits = dataCodewords * 8;
  const remaining = Math.max(0, totalDataBits - dataBits.length);
  const terminatorBits = Math.min(4, remaining);
  for (let index = 0; index < terminatorBits; index += 1) {
    dataBits.push(false);
  }

  while (dataBits.length % 8 !== 0) {
    dataBits.push(false);
  }

  const dataBytes: number[] = [];
  for (let index = 0; index < dataBits.length; index += 8) {
    let byte = 0;
    for (let bit = 0; bit < 8; bit += 1) {
      byte = (byte << 1) | (dataBits[index + bit] ? 1 : 0);
    }
    dataBytes.push(byte);
  }

  let padByte = 0xec;
  while (dataBytes.length < dataCodewords) {
    dataBytes.push(padByte);
    padByte = padByte === 0xec ? 0x11 : 0xec;
  }

  const eccBytes = calculateErrorCorrection(dataBytes, ecCodewords);
  const bits = bytesToBits([...dataBytes, ...eccBytes]);
  const { size, matrix } = buildMatrix(version, bits);

  return { version, size, matrix };
}

export function qrMatrixToSvg(
  matrix: QrMatrix,
  options: QrRenderOptions = {}
) {
  const margin = options.margin ?? 4;
  const foreground = options.foreground ?? "#111827";
  const background = options.background ?? "#ffffff";
  const size = matrix.length + margin * 2;
  const modules = matrix
    .map((row, rowIndex) =>
      row
        .map((cell, colIndex) =>
          cell ? `<rect x="${colIndex + margin}" y="${rowIndex + margin}" width="1" height="1" fill="${foreground}"/>` : ""
        )
        .join("")
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="${background}"/>
  ${modules}
</svg>`;
}

export function qrMatrixToCanvas(
  canvas: HTMLCanvasElement,
  matrix: QrMatrix,
  options: QrRenderOptions & { size: number }
) {
  const margin = options.margin ?? 4;
  const foreground = options.foreground ?? "#111827";
  const background = options.background ?? "#ffffff";
  const moduleCount = matrix.length + margin * 2;
  const moduleSize = Math.floor(options.size / moduleCount);
  const actualSize = moduleCount * moduleSize;

  canvas.width = actualSize;
  canvas.height = actualSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  context.fillStyle = background;
  context.fillRect(0, 0, actualSize, actualSize);
  context.fillStyle = foreground;

  for (let row = 0; row < matrix.length; row += 1) {
    for (let col = 0; col < matrix[row].length; col += 1) {
      if (!matrix[row][col]) {
        continue;
      }

      context.fillRect(
        (col + margin) * moduleSize,
        (row + margin) * moduleSize,
        moduleSize,
        moduleSize
      );
    }
  }

  return canvas;
}
