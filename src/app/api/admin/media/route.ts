import { NextRequest, NextResponse } from "next/server";
import { hasStaffSectionAccess, resolveRequestAuth } from "@/lib/auth/serverAuth";
import { ContentModelService } from "@/lib/services/contentModelService";
import {
  isPublicStorageConfigured,
  generatePresignedUploadUrl,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
} from "@/lib/storage/r2PublicStorage";
import { checkAdminRateLimit, parseAndValidateJsonBody } from "@/lib/admin/rateLimitAndValidation";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/media
 * Fetches all media assets, their in-use status across the site, and storage configuration.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateLimit = checkAdminRateLimit(ip, 120, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  const auth = await resolveRequestAuth(req);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  if (!auth.isOwner && !hasStaffSectionAccess(auth, "content", "VIEW")) {
    return NextResponse.json(
      { success: false, message: "Forbidden: VIEW access required for Media Library." },
      { status: 403 }
    );
  }

  try {
    const collection = req.nextUrl.searchParams.get("collection") || undefined;
    const storageConfig = isPublicStorageConfigured();
    const rawAssets = await ContentModelService.getMediaAssets(collection);

    // Enrich each asset with usage scan
    const assets = await Promise.all(
      rawAssets.map(async (asset) => {
        const usage = await ContentModelService.checkMediaAssetUsage(asset.id);
        return {
          ...asset,
          inUse: usage.inUse,
          usedIn: usage.usedIn,
        };
      })
    );

    return NextResponse.json({
      success: true,
      storageConfig,
      assets,
    });
  } catch (err: any) {
    console.error("GET /api/admin/media error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load media assets", error: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/media
 * Handles presigned URL generation and media asset registration.
 */
export async function POST(req: NextRequest) {
  const auth = await resolveRequestAuth(req);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  if (!auth.isOwner && !hasStaffSectionAccess(auth, "content", "MANAGE")) {
    return NextResponse.json(
      { success: false, message: "Forbidden: MANAGE access required to upload media." },
      { status: 403 }
    );
  }

  try {
    const parsed = await parseAndValidateJsonBody<any>(req, { maxBodyBytes: 2 * 1024 * 1024, maxRequests: 60 });
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error }, { status: parsed.status });
    }
    const body = parsed.data;
    const actorEmail = auth.email || "staff@aapkaastro.com";

    // 1. Request Presigned Upload URL for Direct Browser-to-R2 Upload
    if (body.action === "request_upload_url") {
      const storageConfig = isPublicStorageConfigured();

      if (!storageConfig.isConfigured && !body.allowMock) {
        return NextResponse.json(
          {
            success: false,
            isConfigured: false,
            message:
              storageConfig.message ||
              "Cloudflare R2 Public Storage is not configured. Direct uploads are disabled.",
            missing: storageConfig.missing,
          },
          { status: 400 }
        );
      }

      if (!body.filename) {
        return NextResponse.json(
          { success: false, message: "Missing required filename." },
          { status: 400 }
        );
      }

      if (!body.altTextEn || !body.altTextEn.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Alt text (English) is required for accessibility and search visibility.",
          },
          { status: 400 }
        );
      }

      if (body.fileSize && body.fileSize > MAX_IMAGE_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            message: `Image size exceeds the maximum allowable limit of 5 MB.`,
          },
          { status: 400 }
        );
      }

      const presigned = await generatePresignedUploadUrl({
        filename: body.filename,
        mimeType: body.mimeType || "image/jpeg",
        fileSize: body.fileSize || 1024,
        altTextEn: body.altTextEn,
        altTextHi: body.altTextHi,
        collection: body.collection || "general",
        allowMockFallback: Boolean(body.allowMock),
      });

      return NextResponse.json({
        success: true,
        ...presigned,
      });
    }

    // 2. Confirm Upload & Register MediaAsset in Database
    if (body.action === "confirm_upload") {
      const { url, filename, mimeType, fileSize, altTextEn, altTextHi, collection } = body;

      if (!url || typeof url !== "string") {
        return NextResponse.json(
          { success: false, message: "Missing valid media URL." },
          { status: 400 }
        );
      }

      // Strictly prohibit Base64 data URLs in database
      if (url.startsWith("data:") || url.includes(";base64,")) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Base64 image storage in database is prohibited. Images must be stored in Cloudflare R2.",
          },
          { status: 400 }
        );
      }

      // Require alt text
      if (!altTextEn || !altTextEn.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Alt text (English) is required for accessibility and search visibility.",
          },
          { status: 400 }
        );
      }

      const asset = await ContentModelService.createMediaAsset({
        url,
        filename: filename || url.split("/").pop() || "image.jpg",
        mimeType: mimeType || "image/jpeg",
        fileSize: fileSize || null,
        altTextEn,
        altTextHi,
        collection: collection || "general",
        actorEmail,
      });

      return NextResponse.json({
        success: true,
        message: "Image registered in Media Library.",
        asset,
      });
    }

    return NextResponse.json(
      { success: false, message: `Unknown media action "${body.action}".` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("POST /api/admin/media error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to process media request" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/admin/media
 * Deletes a media asset, blocking deletion if the image is currently in use on the site.
 */
export async function DELETE(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateLimit = checkAdminRateLimit(ip, 60, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  const auth = await resolveRequestAuth(req);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  if (!auth.isOwner && !hasStaffSectionAccess(auth, "content", "MANAGE")) {
    return NextResponse.json(
      { success: false, message: "Forbidden: MANAGE access required to delete media." },
      { status: 403 }
    );
  }

  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing required media asset ID." },
        { status: 400 }
      );
    }

    const actorEmail = auth.email || "staff@aapkaastro.com";
    const result = await ContentModelService.deleteMediaAsset(id, actorEmail);

    if (result.blocked) {
      return NextResponse.json(
        {
          success: false,
          blocked: true,
          message: result.message,
          usedIn: result.usedIn,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/media error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete media asset" },
      { status: 400 }
    );
  }
}
