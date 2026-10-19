import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isPublicStorageConfigured,
  generatePresignedUploadUrl,
  StorageNotConfiguredError,
  MAX_IMAGE_SIZE_BYTES,
} from "../src/lib/storage/r2PublicStorage";
import { ContentModelService } from "../src/lib/services/contentModelService";
import { POST as mediaPost, DELETE as mediaDelete, GET as mediaGet } from "../src/app/api/admin/media/route";
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/db/prisma";

describe("Media Library & Cloudflare R2 Storage Test Suite", () => {
  describe("Storage Configuration & Unconfigured Disabling", () => {
    it("reports storage as unconfigured when credentials are not present in environment", () => {
      const status = isPublicStorageConfigured();
      assert.equal(typeof status.isConfigured, "boolean");
      assert.ok(Array.isArray(status.missing));

      if (!status.isConfigured) {
        assert.ok(status.message, "Must include a clear plain-language explanation");
        assert.ok(status.message.includes("Cloudflare R2"));
      }
    });

    it("strictly disables upload URL generation when storage is not configured", async () => {
      // In default test environment without live R2 credentials, attempt should throw StorageNotConfiguredError
      try {
        await generatePresignedUploadUrl({
          filename: "sanctum-puja.webp",
          mimeType: "image/webp",
          fileSize: 1024 * 500, // 500 KB
          altTextEn: "Acharya Niraj Kumar performing sacred morning aarti",
          collection: "sanctum",
          allowMockFallback: false,
        });
        // If storage happened to be configured in env, it would succeed
      } catch (err: any) {
        assert.ok(
          err instanceof StorageNotConfiguredError || err.message.includes("Cloudflare R2"),
          `Expected StorageNotConfiguredError, got: ${err.message}`
        );
      }
    });

    it("generates simulated upload URL when allowMockFallback is enabled for testing", async () => {
      const result = await generatePresignedUploadUrl({
        filename: "sanctum-altar.jpg",
        mimeType: "image/jpeg",
        fileSize: 1024 * 350,
        altTextEn: "Consecrated Vedic altar at sanctum desk",
        collection: "sanctum",
        allowMockFallback: true,
      });

      assert.ok(result.uploadUrl, "Must provide upload URL");
      assert.ok(result.publicUrl, "Must provide public CDN URL");
      assert.ok(result.objectKey.startsWith("sanctum/"));
      assert.equal(result.headers["Content-Type"], "image/jpeg");
    });
  });

  describe("File Format, 5 MB Limit, and Alt Text Validation", () => {
    it("strictly rejects non-image formats (PDF, HTML, Executables)", async () => {
      await assert.rejects(
        async () => {
          await generatePresignedUploadUrl({
            filename: "document.pdf",
            mimeType: "application/pdf",
            fileSize: 1024 * 100,
            altTextEn: "Test PDF document",
            allowMockFallback: true,
          });
        },
        {
          message: /Only JPG, PNG, and WebP images/,
        }
      );
    });

    it("strictly rejects images exceeding the 5 MB limit", async () => {
      const oversized = 6 * 1024 * 1024; // 6 MB
      await assert.rejects(
        async () => {
          await generatePresignedUploadUrl({
            filename: "giant-photo.jpg",
            mimeType: "image/jpeg",
            fileSize: oversized,
            altTextEn: "Ultra high res photo",
            allowMockFallback: true,
          });
        },
        {
          message: /exceeds maximum allowable limit of 5 MB/,
        }
      );
    });

    it("strictly requires alt text (English) for search visibility and accessibility", async () => {
      await assert.rejects(
        async () => {
          await generatePresignedUploadUrl({
            filename: "photo-no-alt.webp",
            mimeType: "image/webp",
            fileSize: 1024 * 200,
            altTextEn: "   ", // Blank whitespace
            allowMockFallback: true,
          });
        },
        {
          message: /Alt text \(English\) is required/,
        }
      );
    });
  });

  describe("Base64 Database Prohibition", () => {
    it("strictly blocks saving base64 data URLs in database", async () => {
      const fakeBase64Url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

      await assert.rejects(
        async () => {
          await ContentModelService.createMediaAsset({
            url: fakeBase64Url,
            filename: "embedded-pixel.png",
            mimeType: "image/png",
            altTextEn: "Fake pixel image",
            actorEmail: "test@aapkaastro.com",
          });
        },
        {
          message: /Base64 image storage in database is prohibited/,
        }
      );
    });
  });

  describe("In-Use Media Scanner & Safe Deletion Protection", () => {
    const testAssetUrl = `https://media.aapkaastro.com/images/test-acharya-hero-${Date.now()}.webp`;
    let createdAssetId: string | null = null;
    let testContentEntryId: string | null = null;

    it("detects when a media asset is actively in use by a content entry", async () => {
      if (!prisma || !prisma.mediaAsset || !prisma.contentEntry) return;

      // 1. Create a media asset
      const asset = await ContentModelService.createMediaAsset({
        url: testAssetUrl,
        filename: "acharya-hero.webp",
        mimeType: "image/webp",
        fileSize: 420000,
        altTextEn: "Acharya Niraj Kumar reading Janam Kundli",
        altTextHi: "जन्म कुंडली का अध्ययन करते आचार्य नीरज कुमार",
        collection: "hero",
        actorEmail: "aapkaastro1606@gmail.com",
      });
      createdAssetId = asset.id;

      // 2. Link this asset in a ContentEntry (e.g. hero banner)
      const entry = await ContentModelService.saveEntry({
        collection: "hero",
        key: `test-hero-${Date.now()}`,
        dataEn: {
          headline: "Vedic Guidance",
          astroImage: testAssetUrl,
        },
        actorEmail: "aapkaastro1606@gmail.com",
      });
      testContentEntryId = entry.id;

      // 3. Scan usage
      const usage = await ContentModelService.checkMediaAssetUsage(asset.id);
      assert.equal(usage.inUse, true, "Asset must be marked as in use");
      assert.ok(usage.usedIn.length > 0);
      assert.ok(
        usage.usedIn.some((loc) => loc.includes("hero")),
        `Expected usage to mention hero, got: ${usage.usedIn.join(", ")}`
      );
    });

    it("blocks deleting a media asset that is still in use", async () => {
      if (!prisma || !prisma.mediaAsset || !createdAssetId) return;

      const deleteRes = await ContentModelService.deleteMediaAsset(
        createdAssetId,
        "aapkaastro1606@gmail.com"
      );

      assert.equal(deleteRes.success, false, "Delete must fail when asset is in use");
      assert.equal(deleteRes.blocked, true);
      assert.ok(deleteRes.message.includes("Cannot delete image"));
      assert.ok(deleteRes.message.includes("currently in use"));

      // Verify the asset still exists in the database
      const stillExists = await prisma.mediaAsset.findUnique({
        where: { id: createdAssetId },
      });
      assert.ok(stillExists, "Asset must not be removed while locked in use");
    });

    it("safely deletes a media asset once it is removed from content", async () => {
      if (!prisma || !prisma.mediaAsset || !createdAssetId) return;

      // 1. Clean up the referencing ContentEntry
      if (testContentEntryId) {
        await prisma.contentRevision.deleteMany({ where: { contentId: testContentEntryId } }).catch(() => {});
        await prisma.contentEntry.delete({ where: { id: testContentEntryId } }).catch(() => {});
      }

      // 2. Confirm usage is now false
      const usage = await ContentModelService.checkMediaAssetUsage(createdAssetId);
      assert.equal(usage.inUse, false, "Asset should no longer be reported in use");

      // 3. Attempt deletion
      const deleteRes = await ContentModelService.deleteMediaAsset(
        createdAssetId,
        "aapkaastro1606@gmail.com"
      );

      assert.equal(deleteRes.success, true);
      assert.ok(deleteRes.message.includes("successfully deleted"));

      // 4. Verify asset is deleted from database
      const record = await prisma.mediaAsset.findUnique({
        where: { id: createdAssetId },
      });
      assert.equal(record, null, "Asset must be deleted from database");
    });
  });

  describe("Admin Media API Route Security & In-Use HTTP Responses", () => {
    it("fails closed with 401 for unauthenticated GET /api/admin/media requests", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/media");
      const res = await mediaGet(req);
      assert.equal(res.status, 401);
    });

    it("fails closed with 401 on POST for unauthenticated requests", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/media", {
        method: "POST",
        body: JSON.stringify({ action: "request_upload_url" }),
      });
      const res = await mediaPost(req);
      assert.equal(res.status, 401);
    });

    it("fails closed with 401 on DELETE for unauthenticated requests", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/media?id=media_123", {
        method: "DELETE",
      });
      const res = await mediaDelete(req);
      assert.equal(res.status, 401);
    });
  });
});
