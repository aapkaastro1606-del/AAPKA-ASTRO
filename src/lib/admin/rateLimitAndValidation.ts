import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  maxRequests?: number;
  windowMs?: number;
  maxBodyBytes?: number;
}

const DEFAULT_MAX_REQUESTS = 60; // 60 requests per minute
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB

const ipRequestMap = new Map<string, { count: number; expiresAt: number }>();

/**
 * Checks in-memory sliding rate limit per IP address.
 */
export function checkAdminRateLimit(
  ip: string,
  maxRequests = DEFAULT_MAX_REQUESTS,
  windowMs = DEFAULT_WINDOW_MS
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);

  // Periodic garbage collection of expired keys
  if (ipRequestMap.size > 5000) {
    for (const [key, val] of ipRequestMap.entries()) {
      if (val.expiresAt <= now) ipRequestMap.delete(key);
    }
  }

  if (!entry || entry.expiresAt <= now) {
    ipRequestMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetMs: windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetMs: Math.max(0, entry.expiresAt - now) };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count, resetMs: Math.max(0, entry.expiresAt - now) };
}

/**
 * Validates request payload size against a hard byte ceiling to prevent DOS attacks.
 */
export async function parseAndValidateJsonBody<T = any>(
  req: NextRequest,
  config: RateLimitConfig = {}
): Promise<
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string; status: number }
> {
  const maxBytes = config.maxBodyBytes || DEFAULT_MAX_BODY_BYTES;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // Rate limit check
  const rateLimit = checkAdminRateLimit(
    ip,
    config.maxRequests || DEFAULT_MAX_REQUESTS,
    config.windowMs || DEFAULT_WINDOW_MS
  );

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Too many administrative requests from your IP. Please wait ${Math.ceil(
        rateLimit.resetMs / 1000
      )}s before retrying.`,
      status: 429,
    };
  }

  // Header content-length check
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > maxBytes) {
    return {
      success: false,
      error: `Payload size (${(contentLength / 1024).toFixed(0)} KB) exceeds allowable limit of ${(
        maxBytes / 1024
      ).toFixed(0)} KB.`,
      status: 413,
    };
  }

  try {
    const rawText = await req.text();
    if (Buffer.byteLength(rawText, "utf8") > maxBytes) {
      return {
        success: false,
        error: `Payload size exceeds maximum allowable limit of ${(maxBytes / 1024).toFixed(0)} KB.`,
        status: 413,
      };
    }

    if (!rawText.trim()) {
      return { success: true, data: {} as T };
    }

    const json = JSON.parse(rawText) as T;
    return { success: true, data: json };
  } catch (err: any) {
    return {
      success: false,
      error: `Malformed JSON payload: ${err.message}`,
      status: 400,
    };
  }
}
