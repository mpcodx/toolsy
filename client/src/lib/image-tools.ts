export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ImageTransformFormat = "image/png" | "image/jpeg" | "image/webp";

export type ImageTransformOptions = {
  format: ImageTransformFormat;
  quality?: number;
  width?: number;
  height?: number;
  crop?: CropRect;
  background?: string;
};

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result ?? ""));
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read "${file.name}".`));
    };

    reader.readAsDataURL(file);
  });
}

export function readFileAsArrayBuffer(file: File) {
  return file.arrayBuffer();
}

export function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.decoding = "async";
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to load "${file.name}" as an image.`));
    };
    image.src = objectUrl;
  });
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: ImageTransformFormat,
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

function getCropPixels(image: HTMLImageElement, crop: CropRect) {
  return {
    x: Math.max(0, Math.round((crop.x / 100) * image.naturalWidth)),
    y: Math.max(0, Math.round((crop.y / 100) * image.naturalHeight)),
    width: Math.max(1, Math.round((crop.width / 100) * image.naturalWidth)),
    height: Math.max(1, Math.round((crop.height / 100) * image.naturalHeight)),
  };
}

export function createCenteredCrop(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number,
  coverage = 80
) {
  const maxWidth = imageWidth * (coverage / 100);
  const maxHeight = imageHeight * (coverage / 100);
  let cropWidth = maxWidth;
  let cropHeight = cropWidth / aspectRatio;

  if (cropHeight > maxHeight) {
    cropHeight = maxHeight;
    cropWidth = cropHeight * aspectRatio;
  }

  return {
    x: Math.max(0, (imageWidth - cropWidth) / 2 / imageWidth * 100),
    y: Math.max(0, (imageHeight - cropHeight) / 2 / imageHeight * 100),
    width: Math.max(1, (cropWidth / imageWidth) * 100),
    height: Math.max(1, (cropHeight / imageHeight) * 100),
  };
}

export async function transformImageFile(
  file: File,
  options: ImageTransformOptions
) {
  const image = await loadImageFromFile(file);
  const crop = options.crop ? getCropPixels(image, options.crop) : null;
  const targetWidth = Math.max(
    1,
    Math.round(options.width ?? crop?.width ?? image.naturalWidth)
  );
  const targetHeight = Math.max(
    1,
    Math.round(options.height ?? crop?.height ?? image.naturalHeight)
  );
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  if (options.background || options.format !== "image/png") {
    context.fillStyle = options.background || "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (crop) {
    context.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );
  } else {
    context.drawImage(image, 0, 0, targetWidth, targetHeight);
  }

  return canvasToBlob(canvas, options.format, options.quality);
}

