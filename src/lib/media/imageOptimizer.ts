export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  targetMimeType?: "image/webp" | "image/jpeg";
}

export interface OptimizationResult {
  blob: Blob;
  filename: string;
  mimeType: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  savingsPercent: number;
}

const DEFAULT_MAX_WIDTH = 2048;
const DEFAULT_MAX_HEIGHT = 2048;
const DEFAULT_QUALITY = 0.88;

/**
 * Optimises an image file directly in the browser before upload:
 * 1. Resizes down to web-friendly max resolution (2048px) if oversized.
 * 2. Re-encodes using WebP or high-quality JPEG (quality 0.88).
 * 3. Inherent EXIF stripping (Canvas redraw discards all device, location & camera metadata).
 * 4. Compares output: only keeps optimized blob if it actually saves bytes.
 */
export async function optimizeImageClient(
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  const maxWidth = options.maxWidth || DEFAULT_MAX_WIDTH;
  const maxHeight = options.maxHeight || DEFAULT_MAX_HEIGHT;
  const quality = options.quality || DEFAULT_QUALITY;
  const targetMime = options.targetMimeType || "image/webp";

  const originalSize = file.size;
  const originalName = file.name;

  // SSR or non-browser fallback
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      blob: file,
      filename: originalName,
      mimeType: file.type || "image/jpeg",
      originalSize,
      optimizedSize: originalSize,
      width: 0,
      height: 0,
      savingsPercent: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file or unsupported format"));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // If 2D context fails, fallback to original
          resolve({
            blob: file,
            filename: originalName,
            mimeType: file.type,
            originalSize,
            optimizedSize: originalSize,
            width,
            height,
            savingsPercent: 0,
          });
          return;
        }

        // Draw image onto canvas (discards all camera EXIF metadata)
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP or requested MIME type
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                blob: file,
                filename: originalName,
                mimeType: file.type,
                originalSize,
                optimizedSize: originalSize,
                width,
                height,
                savingsPercent: 0,
              });
              return;
            }

            // Check if optimized version is smaller
            const isSmaller = blob.size < originalSize;
            const finalBlob = isSmaller ? blob : file;
            const finalMime = isSmaller ? targetMime : file.type;
            const finalSize = finalBlob.size;

            // Generate clean optimized filename extension
            const baseName = originalName.replace(/\.[^/.]+$/, "");
            const ext = finalMime === "image/webp" ? "webp" : finalMime === "image/png" ? "png" : "jpg";
            const finalFilename = isSmaller ? `${baseName}.${ext}` : originalName;

            const savingsPercent = Math.max(
              0,
              Math.round(((originalSize - finalSize) / originalSize) * 100)
            );

            resolve({
              blob: finalBlob,
              filename: finalFilename,
              mimeType: finalMime,
              originalSize,
              optimizedSize: finalSize,
              width,
              height,
              savingsPercent,
            });
          },
          targetMime,
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
