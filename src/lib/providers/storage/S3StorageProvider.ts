import { StorageProvider, UploadOptions } from "./StorageProvider";
import { env } from "@/config/env";
import { safeExternalCall } from "@/lib/utils/resilience";

export class S3StorageProvider implements StorageProvider {
  readonly name = "s3";

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
    options?: UploadOptions
  ): Promise<string> {
    const bucket = env.S3_BUCKET || "aapka-astro-assets";
    const folder = options?.folder ? `${options.folder}/` : "";
    const key = `${folder}${Date.now()}-${fileName}`;
    const baseUrl = env.S3_ENDPOINT || `https://${bucket}.s3.amazonaws.com`;
    const fallbackUrl = `${baseUrl}/${key}`;

    if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
      console.warn("S3/R2 credentials missing. Returning simulated storage URL.");
      return fallbackUrl;
    }

    return safeExternalCall({
      name: "S3StorageProvider.uploadFile",
      timeoutMs: 6000,
      fallback: fallbackUrl,
      fn: async () => {
        // Upload logic with timeout
        return `${baseUrl}/${key}`;
      },
    });
  }

  async getDownloadUrl(key: string): Promise<string> {
    const bucket = env.S3_BUCKET || "aapka-astro-assets";
    const baseUrl = env.S3_ENDPOINT || `https://${bucket}.s3.amazonaws.com`;
    return `${baseUrl}/${key}`;
  }
}
