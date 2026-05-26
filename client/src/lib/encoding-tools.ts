const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

function stringToBytes(value: string) {
  return textEncoder.encode(value);
}

function bytesToString(value: Uint8Array) {
  return textDecoder.decode(value);
}

function toUint8Array(input: string | ArrayBuffer | Uint8Array) {
  if (typeof input === "string") {
    return stringToBytes(input);
  }

  if (input instanceof Uint8Array) {
    return input;
  }

  return new Uint8Array(input);
}

function rotateLeft(value: number, bits: number) {
  return (value << bits) | (value >>> (32 - bits));
}

function addUnsigned(left: number, right: number) {
  const lsw = (left & 0xffff) + (right & 0xffff);
  const msw = (left >>> 16) + (right >>> 16) + (lsw >>> 16);
  return (msw << 16) | (lsw & 0xffff);
}

function md5Step(
  func: (x: number, y: number, z: number) => number,
  a: number,
  b: number,
  c: number,
  d: number,
  x: number,
  s: number,
  t: number
) {
  return addUnsigned(
    rotateLeft(
      addUnsigned(addUnsigned(a, func(b, c, d)), addUnsigned(x, t)),
      s
    ),
    b
  );
}

function md5F(x: number, y: number, z: number) {
  return (x & y) | (~x & z);
}

function md5G(x: number, y: number, z: number) {
  return (x & z) | (y & ~z);
}

function md5H(x: number, y: number, z: number) {
  return x ^ y ^ z;
}

function md5I(x: number, y: number, z: number) {
  return y ^ (x | ~z);
}

function md5ToWords(bytes: Uint8Array) {
  const words = new Array<number>(((bytes.length + 8) >> 2) + 1).fill(0);

  for (let index = 0; index < bytes.length; index += 1) {
    words[index >> 2] |= bytes[index] << ((index % 4) * 8);
  }

  words[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
  words[(((bytes.length + 8) >> 6) << 4) + 14] = bytes.length * 8;
  return words;
}

function md5HexBytes(bytes: Uint8Array) {
  const words = md5ToWords(bytes);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let index = 0; index < words.length; index += 16) {
    const aa = a;
    const bb = b;
    const cc = c;
    const dd = d;

    a = md5Step(md5F, a, b, c, d, words[index + 0], 7, 0xd76aa478);
    d = md5Step(md5F, d, a, b, c, words[index + 1], 12, 0xe8c7b756);
    c = md5Step(md5F, c, d, a, b, words[index + 2], 17, 0x242070db);
    b = md5Step(md5F, b, c, d, a, words[index + 3], 22, 0xc1bdceee);
    a = md5Step(md5F, a, b, c, d, words[index + 4], 7, 0xf57c0faf);
    d = md5Step(md5F, d, a, b, c, words[index + 5], 12, 0x4787c62a);
    c = md5Step(md5F, c, d, a, b, words[index + 6], 17, 0xa8304613);
    b = md5Step(md5F, b, c, d, a, words[index + 7], 22, 0xfd469501);
    a = md5Step(md5F, a, b, c, d, words[index + 8], 7, 0x698098d8);
    d = md5Step(md5F, d, a, b, c, words[index + 9], 12, 0x8b44f7af);
    c = md5Step(md5F, c, d, a, b, words[index + 10], 17, 0xffff5bb1);
    b = md5Step(md5F, b, c, d, a, words[index + 11], 22, 0x895cd7be);
    a = md5Step(md5F, a, b, c, d, words[index + 12], 7, 0x6b901122);
    d = md5Step(md5F, d, a, b, c, words[index + 13], 12, 0xfd987193);
    c = md5Step(md5F, c, d, a, b, words[index + 14], 17, 0xa679438e);
    b = md5Step(md5F, b, c, d, a, words[index + 15], 22, 0x49b40821);

    a = md5Step(md5G, a, b, c, d, words[index + 1], 5, 0xf61e2562);
    d = md5Step(md5G, d, a, b, c, words[index + 6], 9, 0xc040b340);
    c = md5Step(md5G, c, d, a, b, words[index + 11], 14, 0x265e5a51);
    b = md5Step(md5G, b, c, d, a, words[index + 0], 20, 0xe9b6c7aa);
    a = md5Step(md5G, a, b, c, d, words[index + 5], 5, 0xd62f105d);
    d = md5Step(md5G, d, a, b, c, words[index + 10], 9, 0x02441453);
    c = md5Step(md5G, c, d, a, b, words[index + 15], 14, 0xd8a1e681);
    b = md5Step(md5G, b, c, d, a, words[index + 4], 20, 0xe7d3fbc8);
    a = md5Step(md5G, a, b, c, d, words[index + 9], 5, 0x21e1cde6);
    d = md5Step(md5G, d, a, b, c, words[index + 14], 9, 0xc33707d6);
    c = md5Step(md5G, c, d, a, b, words[index + 3], 14, 0xf4d50d87);
    b = md5Step(md5G, b, c, d, a, words[index + 8], 20, 0x455a14ed);
    a = md5Step(md5G, a, b, c, d, words[index + 13], 5, 0xa9e3e905);
    d = md5Step(md5G, d, a, b, c, words[index + 2], 9, 0xfcefa3f8);
    c = md5Step(md5G, c, d, a, b, words[index + 7], 14, 0x676f02d9);
    b = md5Step(md5G, b, c, d, a, words[index + 12], 20, 0x8d2a4c8a);

    a = md5Step(md5H, a, b, c, d, words[index + 5], 4, 0xfffa3942);
    d = md5Step(md5H, d, a, b, c, words[index + 8], 11, 0x8771f681);
    c = md5Step(md5H, c, d, a, b, words[index + 11], 16, 0x6d9d6122);
    b = md5Step(md5H, b, c, d, a, words[index + 14], 23, 0xfde5380c);
    a = md5Step(md5H, a, b, c, d, words[index + 1], 4, 0xa4beea44);
    d = md5Step(md5H, d, a, b, c, words[index + 4], 11, 0x4bdecfa9);
    c = md5Step(md5H, c, d, a, b, words[index + 7], 16, 0xf6bb4b60);
    b = md5Step(md5H, b, c, d, a, words[index + 10], 23, 0xbebfbc70);
    a = md5Step(md5H, a, b, c, d, words[index + 13], 4, 0x289b7ec6);
    d = md5Step(md5H, d, a, b, c, words[index + 0], 11, 0xeaa127fa);
    c = md5Step(md5H, c, d, a, b, words[index + 3], 16, 0xd4ef3085);
    b = md5Step(md5H, b, c, d, a, words[index + 6], 23, 0x04881d05);
    a = md5Step(md5H, a, b, c, d, words[index + 9], 4, 0xd9d4d039);
    d = md5Step(md5H, d, a, b, c, words[index + 12], 11, 0xe6db99e5);
    c = md5Step(md5H, c, d, a, b, words[index + 15], 16, 0x1fa27cf8);
    b = md5Step(md5H, b, c, d, a, words[index + 2], 23, 0xc4ac5665);

    a = md5Step(md5I, a, b, c, d, words[index + 0], 6, 0xf4292244);
    d = md5Step(md5I, d, a, b, c, words[index + 7], 10, 0x432aff97);
    c = md5Step(md5I, c, d, a, b, words[index + 14], 15, 0xab9423a7);
    b = md5Step(md5I, b, c, d, a, words[index + 5], 21, 0xfc93a039);
    a = md5Step(md5I, a, b, c, d, words[index + 12], 6, 0x655b59c3);
    d = md5Step(md5I, d, a, b, c, words[index + 3], 10, 0x8f0ccc92);
    c = md5Step(md5I, c, d, a, b, words[index + 10], 15, 0xffeff47d);
    b = md5Step(md5I, b, c, d, a, words[index + 1], 21, 0x85845dd1);
    a = md5Step(md5I, a, b, c, d, words[index + 8], 6, 0x6fa87e4f);
    d = md5Step(md5I, d, a, b, c, words[index + 15], 10, 0xfe2ce6e0);
    c = md5Step(md5I, c, d, a, b, words[index + 6], 15, 0xa3014314);
    b = md5Step(md5I, b, c, d, a, words[index + 13], 21, 0x4e0811a1);
    a = md5Step(md5I, a, b, c, d, words[index + 4], 6, 0xf7537e82);
    d = md5Step(md5I, d, a, b, c, words[index + 11], 10, 0xbd3af235);
    c = md5Step(md5I, c, d, a, b, words[index + 2], 15, 0x2ad7d2bb);
    b = md5Step(md5I, b, c, d, a, words[index + 9], 21, 0xeb86d391);

    a = addUnsigned(a, aa);
    b = addUnsigned(b, bb);
    c = addUnsigned(c, cc);
    d = addUnsigned(d, dd);
  }

  return [a, b, c, d]
    .flatMap(value => {
      const hex = value.toString(16).padStart(8, "0");
      return [
        hex.slice(0, 2),
        hex.slice(2, 4),
        hex.slice(4, 6),
        hex.slice(6, 8),
      ];
    })
    .join("");
}

export async function digestHex(
  algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-512",
  input: string | ArrayBuffer | Uint8Array
) {
  const bytes = toUint8Array(input);

  if (algorithm === "MD5") {
    return md5HexBytes(bytes);
  }

  const digest = await crypto.subtle.digest(algorithm, bytes);
  return bytesToHex(new Uint8Array(digest));
}

export function hashText(
  algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-512",
  text: string
) {
  return digestHex(algorithm, text);
}

export async function hashFile(
  algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-512",
  file: File
) {
  return digestHex(algorithm, await file.arrayBuffer());
}

export type ParsedColor = {
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  alpha: number;
};

function clamp(value: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

export function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map(value => clamp(Math.round(value)).toString(16).padStart(2, "0")).join("")}`;
}

export function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const maxValue = Math.max(red, green, blue);
  const minValue = Math.min(red, green, blue);
  const delta = maxValue - minValue;
  let hue = 0;
  const lightness = (maxValue + minValue) / 2;
  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  if (delta !== 0) {
    if (maxValue === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (maxValue === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }

    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }
  }

  return {
    h: Math.round(hue),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

export function hslToRgb(h: number, s: number, l: number) {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const segment = (h / 60) % 6;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const match = lightness - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (segment >= 0 && segment < 1) {
    red = chroma;
    green = x;
  } else if (segment < 2) {
    red = x;
    green = chroma;
  } else if (segment < 3) {
    green = chroma;
    blue = x;
  } else if (segment < 4) {
    green = x;
    blue = chroma;
  } else if (segment < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255),
  };
}

export function parseColor(input: string): ParsedColor | null {
  const value = input.trim();
  if (!value) {
    return null;
  }

  const hexMatch = value.match(/^#?([0-9a-f]{3,4}|[0-9a-f]{6,8})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const expanded =
      hex.length === 3 || hex.length === 4
        ? hex
            .split("")
            .map(character => character + character)
            .join("")
        : hex;

    const red = Number.parseInt(expanded.slice(0, 2), 16);
    const green = Number.parseInt(expanded.slice(2, 4), 16);
    const blue = Number.parseInt(expanded.slice(4, 6), 16);
    const alpha =
      expanded.length === 8
        ? Number.parseInt(expanded.slice(6, 8), 16) / 255
        : 1;
    const { h, s, l } = rgbToHsl(red, green, blue);

    return {
      hex: rgbToHex(red, green, blue),
      r: red,
      g: green,
      b: blue,
      h,
      s,
      l,
      alpha,
    };
  }

  const rgbMatch = value.match(
    /^rgba?\(\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)(?:\s*,\s*([0-9.]+))?\s*\)$/i
  );
  if (rgbMatch) {
    const parseChannel = (channel: string) =>
      channel.includes("%")
        ? Math.round((Number.parseFloat(channel) / 100) * 255)
        : Math.round(Number.parseFloat(channel));

    const red = clamp(parseChannel(rgbMatch[1]));
    const green = clamp(parseChannel(rgbMatch[2]));
    const blue = clamp(parseChannel(rgbMatch[3]));
    const alpha = rgbMatch[4]
      ? Math.min(1, Math.max(0, Number.parseFloat(rgbMatch[4])))
      : 1;
    const { h, s, l } = rgbToHsl(red, green, blue);

    return {
      hex: rgbToHex(red, green, blue),
      r: red,
      g: green,
      b: blue,
      h,
      s,
      l,
      alpha,
    };
  }

  const hslMatch = value.match(
    /^hsla?\(\s*([0-9.]+)\s*,\s*([0-9.]+)%\s*,\s*([0-9.]+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i
  );
  if (hslMatch) {
    const hue = ((Number.parseFloat(hslMatch[1]) % 360) + 360) % 360;
    const saturation = Math.min(
      100,
      Math.max(0, Number.parseFloat(hslMatch[2]))
    );
    const lightness = Math.min(
      100,
      Math.max(0, Number.parseFloat(hslMatch[3]))
    );
    const alpha = hslMatch[4]
      ? Math.min(1, Math.max(0, Number.parseFloat(hslMatch[4])))
      : 1;
    const { r, g, b } = hslToRgb(hue, saturation, lightness);

    return {
      hex: rgbToHex(r, g, b),
      r,
      g,
      b,
      h: Math.round(hue),
      s: Math.round(saturation),
      l: Math.round(lightness),
      alpha,
    };
  }

  return null;
}

export function relativeLuminance(r: number, g: number, b: number) {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(
  foreground: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number }
) {
  const bright = Math.max(
    relativeLuminance(foreground.r, foreground.g, foreground.b),
    relativeLuminance(background.r, background.g, background.b)
  );
  const dark = Math.min(
    relativeLuminance(foreground.r, foreground.g, foreground.b),
    relativeLuminance(background.r, background.g, background.b)
  );

  return Number(((bright + 0.05) / (dark + 0.05)).toFixed(2));
}

export type UnitCategory =
  | "length"
  | "weight"
  | "temperature"
  | "volume"
  | "data"
  | "speed";

const UNIT_FACTORS: Record<
  Exclude<UnitCategory, "temperature">,
  Record<string, number>
> = {
  length: {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.344,
  },
  weight: {
    mg: 0.000001,
    g: 0.001,
    kg: 1,
    oz: 0.028349523125,
    lb: 0.45359237,
    ton: 1000,
  },
  volume: {
    ml: 0.001,
    l: 1,
    tsp: 0.00492892159375,
    tbsp: 0.01478676478125,
    floz: 0.0295735295625,
    cup: 0.24,
    pint: 0.473176473,
    quart: 0.946352946,
    gallon: 3.785411784,
  },
  data: {
    b: 1,
    kb: 1000,
    mb: 1000 ** 2,
    gb: 1000 ** 3,
    tb: 1000 ** 4,
    kib: 1024,
    mib: 1024 ** 2,
    gib: 1024 ** 3,
    tib: 1024 ** 4,
  },
  speed: {
    "m/s": 1,
    "km/h": 1000 / 3600,
    mph: 1609.344 / 3600,
    knot: 1852 / 3600,
  },
};

export function listUnits(category: UnitCategory) {
  if (category === "temperature") {
    return ["c", "f", "k"];
  }

  return Object.keys(UNIT_FACTORS[category]).sort();
}

export function convertUnit(
  category: UnitCategory,
  value: number,
  from: string,
  to: string
) {
  if (!Number.isFinite(value)) {
    return Number.NaN;
  }

  if (category === "temperature") {
    const normalize = from.toLowerCase();
    const denormalize = to.toLowerCase();
    let celsius = value;

    if (normalize === "f") {
      celsius = ((value - 32) * 5) / 9;
    } else if (normalize === "k") {
      celsius = value - 273.15;
    }

    if (denormalize === "f") {
      return (celsius * 9) / 5 + 32;
    }

    if (denormalize === "k") {
      return celsius + 273.15;
    }

    return celsius;
  }

  const factors = UNIT_FACTORS[category];
  const fromFactor = factors[from.toLowerCase()];
  const toFactor = factors[to.toLowerCase()];

  if (!fromFactor || !toFactor) {
    return Number.NaN;
  }

  return (value * fromFactor) / toFactor;
}

export function formatNumber(value: number, precision = 6) {
  if (!Number.isFinite(value)) {
    return "NaN";
  }

  const rounded = Number(value.toFixed(precision));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function encodeBase64Text(value: string, urlSafe = false) {
  const bytes = stringToBytes(value);
  const encoded = btoa(String.fromCharCode(...Array.from(bytes)));
  return urlSafe
    ? encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
    : encoded;
}

export function decodeBase64Text(value: string, urlSafe = false) {
  const normalized = urlSafe
    ? value
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(value.length / 4) * 4, "=")
    : value;

  const bytes = Uint8Array.from(atob(normalized), character =>
    character.charCodeAt(0)
  );
  return bytesToString(bytes);
}

export function fileToBase64(file: File, urlSafe = false) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result ?? "");
      const base64 = result.split(",")[1] || "";
      resolve(
        urlSafe
          ? base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
          : base64
      );
    };

    reader.onerror = () => reject(new Error(`Failed to read "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(
  base64: string,
  mimeType = "application/octet-stream",
  urlSafe = false
) {
  const normalized = urlSafe
    ? base64
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(base64.length / 4) * 4, "=")
    : base64;

  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}

export function base64ToText(base64: string, urlSafe = false) {
  return decodeBase64Text(base64, urlSafe);
}
