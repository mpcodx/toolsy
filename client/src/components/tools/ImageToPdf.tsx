import { Button } from "@/components/ui/button";
import { Download, GripVertical, Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { downloadBlob } from "@/lib/download";
import { createPdfFromImages } from "@/lib/image-to-pdf";

/**
 * Image to PDF Converter Tool
 * Combines multiple images into a single PDF document
 */

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export default function ImageToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(String(reader.result ?? ""));
      };
      reader.onerror = () => {
        reject(new Error(`Failed to read "${file.name}".`));
      };
      reader.readAsDataURL(file);
    });

  const appendImages = async (files: File[]) => {
    try {
      const imageFiles = files.filter((file) => SUPPORTED_IMAGE_TYPES.has(file.type));

      if (files.length > 0 && imageFiles.length === 0) {
        alert("Please select JPG, PNG, or WebP images");
        return;
      }

      if (imageFiles.length === 0) {
        return;
      }

      const previews = await Promise.all(
        imageFiles.map((file) => readFileAsDataUrl(file))
      );

      setImages((prev) => [
        ...prev,
        ...imageFiles.map((file, index) => ({
          id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
          file,
          preview: previews[index],
        })),
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load selected images.";
      alert(message);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    void appendImages(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    void appendImages(Array.from(e.dataTransfer.files || []));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    if (direction === "up" && index > 0) {
      [newImages[index], newImages[index - 1]] = [
        newImages[index - 1],
        newImages[index],
      ];
    } else if (direction === "down" && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [
        newImages[index + 1],
        newImages[index],
      ];
    }
    setImages(newImages);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    setLoading(true);
    try {
      const pdfBlob = await createPdfFromImages(
        images.map((image) => image.file)
      );
      downloadBlob(pdfBlob, "converted.pdf");
      alert("PDF created successfully! Download started.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Conversion failed.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">
          Click to upload or drag and drop
        </h3>
        <p className="text-sm text-muted-foreground">
          JPG, PNG, or WebP images up to 50MB each
        </p>
      </div>

      {/* Image List */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">
            Images ({images.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border border-border hover:border-accent/50 transition-colors"
              >
                {/* Drag Handle */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveImage(index, "up")}
                    disabled={index === 0}
                    className="p-1 hover:bg-secondary rounded disabled:opacity-50"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => moveImage(index, "down")}
                    disabled={index === images.length - 1}
                    className="p-1 hover:bg-secondary rounded disabled:opacity-50"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Preview */}
                <img
                  src={img.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-12 h-12 object-cover rounded"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate text-sm">
                    {img.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(img.file.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeImage(img.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add More Button */}
      {images.length > 0 && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 px-4 rounded-lg border border-dashed border-border hover:border-accent text-muted-foreground hover:text-accent transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add More Images
        </button>
      )}

      {/* Convert Button */}
      <Button
        onClick={handleConvert}
        disabled={images.length === 0 || loading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
            Creating PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Create PDF ({images.length} image{images.length !== 1 ? "s" : ""})
          </>
        )}
      </Button>

      {/* Info Section */}
      <div className="bg-card/50 rounded-lg p-4 border border-border">
        <h4 className="font-semibold text-foreground mb-2">Features:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>✓ Combine multiple images into one PDF</li>
          <li>✓ Reorder images with the up and down controls</li>
          <li>✓ Support for JPG, PNG, and WebP</li>
          <li>✓ Keeps each image's aspect ratio intact</li>
          <li>✓ Instant download, no registration needed</li>
        </ul>
      </div>
    </div>
  );
}
