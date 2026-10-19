import crypto from "crypto";
import { StorageProvider, UploadOptions } from "./StorageProvider";
import { stripExifData } from "@/lib/utils/imageExifStripper";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class MockStorageProvider implements StorageProvider {
  readonly name = "mock";
  private storedFiles: Set<string> = new Set();

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    options?: UploadOptions
  ): Promise<string> {
    const mime = contentType.toLowerCase().trim();

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mime)) {
      throw new Error(
        `Invalid image format "${contentType}". Only JPEG, PNG, and WebP images are permitted.`
      );
    }

    if (fileBuffer.length > MAX_IMAGE_SIZE_BYTES) {
      throw new Error(
        `Image size (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowable limit of 5 MB.`
      );
    }

    // Strip EXIF metadata
    stripExifData(fileBuffer, mime);

    const folder = options?.folder ? `${options.folder.replace(/^\/+|\/+$/g, "")}/` : "";
    const ext = fileName.split(".").pop()?.toLowerCase() || (mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg");
    const key = `${folder}${crypto.randomUUID()}.${ext}`;

    this.storedFiles.add(key);
    return key;
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const cleanKey = key.replace(/^\/+/, "");
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const signature = crypto
      .createHmac("sha256", "mock-secret-key")
      .update(`${cleanKey}:${expiresAt}`)
      .digest("hex");

    return `https://storage.aapkaastro.com/mock/${cleanKey}?expires=${expiresAt}&sig=${signature}`;
  }

  async getDownloadUrl(key: string): Promise<string> {
    return this.getSignedDownloadUrl(key, 900);
  }

  async deleteFile(key: string): Promise<boolean> {
    const cleanKey = key.replace(/^\/+/, "");
    this.storedFiles.delete(cleanKey);
    return true;
  }
}
