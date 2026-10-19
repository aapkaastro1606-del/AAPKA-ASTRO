import crypto from "crypto";
import { env } from "@/config/env";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AllowedMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export interface StorageConfigStatus {
  isConfigured: boolean;
  provider: "r2" | "s3" | "mock";
  publicBucket?: string;
  publicDomain?: string;
  missing: string[];
  message?: string;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  headers: Record<string, string>;
  expiresInSeconds: number;
}

export class StorageNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageNotConfiguredError";
  }
}

/**
 * Checks whether Cloudflare R2 Public Storage is properly configured in the current environment.
 * If any credentials or bucket details are missing, uploads must be safely disabled.
 */
export function isPublicStorageConfigured(): StorageConfigStatus {
  const provider = env.STORAGE_PROVIDER;
  const missing: string[] = [];

  // If set to mock, explicitly report not configured for live production uploads
  if (provider === "mock") {
    return {
      isConfigured: false,
      provider: "mock",
      missing: ["R2_PUBLIC_BUCKET", "R2_PUBLIC_DOMAIN", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"],
      message:
        "Cloudflare R2 Public Storage is not configured (STORAGE_PROVIDER is currently 'mock'). Direct image uploads are disabled until Cloudflare R2 is configured in production environment variables.",
    };
  }

  if (!env.R2_PUBLIC_BUCKET && !env.S3_BUCKET) {
    missing.push("R2_PUBLIC_BUCKET");
  }
  if (!env.R2_PUBLIC_DOMAIN && !env.S3_ENDPOINT) {
    missing.push("R2_PUBLIC_DOMAIN");
  }
  if (!env.S3_ACCESS_KEY_ID) {
    missing.push("S3_ACCESS_KEY_ID");
  }
  if (!env.S3_SECRET_ACCESS_KEY) {
    missing.push("S3_SECRET_ACCESS_KEY");
  }

  if (missing.length > 0) {
    return {
      isConfigured: false,
      provider,
      missing,
      message: `Cloudflare R2 Public Storage is not configured. Missing required variables: ${missing.join(", ")}. Direct image uploads are disabled until these are added in Vercel.`,
    };
  }

  return {
    isConfigured: true,
    provider,
    publicBucket: env.R2_PUBLIC_BUCKET || env.S3_BUCKET,
    publicDomain: env.R2_PUBLIC_DOMAIN || env.S3_ENDPOINT,
    missing: [],
  };
}

/**
 * Generates an AWS Signature Version 4 presigned PUT URL for direct browser-to-R2 upload.
 * Validates file size (up to 5 MB), image MIME types (JPG, PNG, WebP), and mandatory alt text.
 */
export async function generatePresignedUploadUrl(options: {
  filename: string;
  mimeType: string;
  fileSize: number;
  altTextEn: string;
  altTextHi?: string;
  collection?: string;
  allowMockFallback?: boolean;
}): Promise<PresignedUploadResult> {
  const mime = options.mimeType.toLowerCase().trim() as AllowedMimeType;

  // 1. Validate MIME type
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mime)) {
    throw new Error(
      `Invalid image format "${options.mimeType}". Only JPG, PNG, and WebP images up to 5 MB are permitted.`
    );
  }

  // 2. Validate file size (up to 5 MB)
  if (options.fileSize > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (options.fileSize / (1024 * 1024)).toFixed(2);
    throw new Error(`Image size (${sizeMb} MB) exceeds maximum allowable limit of 5 MB.`);
  }

  // 3. Require alt text (English required for accessibility and SEO)
  if (!options.altTextEn || !options.altTextEn.trim()) {
    throw new Error("Alt text (English) is required for accessibility and search visibility.");
  }

  // 4. Verify storage configuration
  const status = isPublicStorageConfigured();
  if (!status.isConfigured) {
    // If testing in mock mode with explicit opt-in
    if (options.allowMockFallback) {
      const ext = options.filename.split(".").pop()?.toLowerCase() || (mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg");
      const folder = options.collection ? `${options.collection.toLowerCase().replace(/[^a-z0-9_-]/g, "")}/` : "images/";
      const objectKey = `${folder}mock-${Date.now()}-${crypto.randomUUID()}.${ext}`;
      return {
        uploadUrl: `https://mock-storage.aapkaastro.local/upload/${objectKey}`,
        publicUrl: `https://media.aapkaastro.com/${objectKey}`,
        objectKey,
        headers: { "Content-Type": mime },
        expiresInSeconds: 900,
      };
    }

    throw new StorageNotConfiguredError(
      status.message || "Cloudflare R2 Public Storage is not configured. Direct image uploads are disabled."
    );
  }

  // 5. Generate unique cryptographically random object key
  const bucket = status.publicBucket!;
  const domain = status.publicDomain!.replace(/\/+$/, "");
  const ext = options.filename.split(".").pop()?.toLowerCase() || (mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg");
  const folder = options.collection ? `${options.collection.toLowerCase().replace(/[^a-z0-9_-]/g, "")}/` : "images/";
  const objectKey = `${folder}${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const region = env.S3_REGION || "auto";
  const accessKeyId = env.S3_ACCESS_KEY_ID!;
  const secretAccessKey = env.S3_SECRET_ACCESS_KEY!;
  const expiresInSeconds = 900; // 15 minutes

  // Base endpoint for R2 / S3
  let endpoint = env.S3_ENDPOINT || `https://${bucket}.s3.amazonaws.com`;
  if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
    endpoint = `https://${endpoint}`;
  }

  const endpointUrl = new URL(endpoint);
  const host = endpointUrl.host;
  const canonicalUri = `/${objectKey}`;

  const dateObj = new Date();
  const amzDate = dateObj.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const service = "s3";
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  const queryParams = [
    `X-Amz-Algorithm=${algorithm}`,
    `X-Amz-Credential=${encodeURIComponent(`${accessKeyId}/${credentialScope}`)}`,
    `X-Amz-Date=${amzDate}`,
    `X-Amz-Expires=${expiresInSeconds}`,
    `X-Amz-SignedHeaders=content-type;host`,
  ].join("&");

  // Canonical Request for direct PUT
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    queryParams,
    `content-type:${mime}\nhost:${host}\n`,
    "content-type;host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const canonicalRequestHash = crypto
    .createHash("sha256")
    .update(canonicalRequest, "utf8")
    .digest("hex");

  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHash,
  ].join("\n");

  const kDate = crypto.createHmac("sha256", "AWS4" + secretAccessKey).update(dateStamp).digest();
  const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
  const kService = crypto.createHmac("sha256", kRegion).update(service).digest();
  const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();

  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");

  const uploadUrl = `${endpoint}/${objectKey}?${queryParams}&X-Amz-Signature=${signature}`;
  const publicUrl = `${domain}/${objectKey}`;

  return {
    uploadUrl,
    publicUrl,
    objectKey,
    headers: {
      "Content-Type": mime,
    },
    expiresInSeconds,
  };
}
