import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest, hasStaffSectionAccess } from "@/lib/auth/serverAuth";
import { ContentStudioService, ContentStudioData } from "@/lib/services/contentStudioService";
import { ContentModelService } from "@/lib/services/contentModelService";
import { seedContentModel } from "@/lib/content/contentSeeder";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/content
 * Authenticated endpoint to fetch Content Studio data, revisions, and media assets.
 */
export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  if (!auth.isOwner && !hasStaffSectionAccess(auth, "content", "VIEW")) {
    return NextResponse.json(
      { success: false, message: "Forbidden: VIEW access required for Content Studio." },
      { status: 403 }
    );
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action");

    // Action: Fetch Revision History
    if (action === "revisions") {
      const collection = searchParams.get("collection") || undefined;
      const key = searchParams.get("key") || undefined;
      const contentId = searchParams.get("contentId") || undefined;

      const revisions = await ContentModelService.getRevisions({ contentId, collection, key });
      return NextResponse.json({ success: true, revisions });
    }

    // Action: Fetch Media Assets
    if (action === "media") {
      const collection = searchParams.get("collection") || undefined;
      const media = await ContentModelService.getMediaAssets(collection);
      return NextResponse.json({ success: true, media });
    }

    // Default Action: Fetch Studio Content
    const content = await ContentStudioService.getContent();
    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    console.error("GET /api/admin/content error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load content." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/content
 * Authenticated endpoint to modify site content, FAQs, contact details, hero texts,
 * restore revisions, or manage media assets.
 */
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  if (!auth.isOwner && !hasStaffSectionAccess(auth, "content", "MANAGE")) {
    return NextResponse.json(
      { success: false, message: "Forbidden: MANAGE access required to edit site content." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const actorEmail = auth.email || "staff@aapkaastro.com";

    // Sub-action: Restore Revision Snapshot
    if (body.action === "restore_revision" && body.revisionId) {
      const restored = await ContentModelService.restoreRevision(body.revisionId, actorEmail);
      const updatedStudio = await ContentStudioService.getContent();
      return NextResponse.json({
        success: true,
        message: `Successfully restored content from revision #${body.revisionId}.`,
        restored,
        content: updatedStudio,
      });
    }

    // Sub-action: Add Media Asset
    if (body.action === "add_media" && body.asset) {
      const newAsset = await ContentModelService.createMediaAsset({
        url: body.asset.url,
        filename: body.asset.filename,
        mimeType: body.asset.mimeType,
        fileSize: body.asset.fileSize,
        altTextEn: body.asset.altTextEn,
        altTextHi: body.asset.altTextHi,
        collection: body.asset.collection,
        actorEmail,
      });
      return NextResponse.json({
        success: true,
        message: "Media asset registered successfully.",
        asset: newAsset,
      });
    }

    // Sub-action: Seed Default Content (Owner only)
    if (body.action === "seed_defaults") {
      if (!auth.isOwner) {
        return NextResponse.json(
          { success: false, message: "Only Owner can execute full content re-seeding." },
          { status: 403 }
        );
      }
      const seedResult = await seedContentModel({ overwrite: true });
      const updatedStudio = await ContentStudioService.getContent();
      return NextResponse.json({
        success: true,
        message: seedResult.message,
        content: updatedStudio,
      });
    }

    // Sub-action: Add FAQ
    if (body.action === "add_faq" && body.faq) {
      if (!body.faq.q?.trim() || !body.faq.a?.trim()) {
        return NextResponse.json(
          { success: false, message: "Question and answer are both required." },
          { status: 400 }
        );
      }
      const updated = await ContentStudioService.addFaq(
        {
          q: body.faq.q.trim(),
          a: body.faq.a.trim(),
          category: body.faq.category || "general",
          isActive: body.faq.isActive !== false,
        },
        actorEmail
      );
      return NextResponse.json({
        success: true,
        message: "FAQ added successfully.",
        content: updated,
      });
    }

    // Sub-action: Update FAQ
    if (body.action === "update_faq" && body.id) {
      const updated = await ContentStudioService.updateFaq(
        body.id,
        body.patch || {},
        actorEmail
      );
      return NextResponse.json({
        success: true,
        message: "FAQ updated successfully.",
        content: updated,
      });
    }

    // Sub-action: Delete FAQ
    if (body.action === "delete_faq" && body.id) {
      const updated = await ContentStudioService.deleteFaq(body.id, actorEmail);
      return NextResponse.json({
        success: true,
        message: "FAQ deleted successfully.",
        content: updated,
      });
    }

    // Sub-action: Toggle FAQ
    if (body.action === "toggle_faq" && body.id) {
      const updated = await ContentStudioService.toggleFaqActive(body.id, actorEmail);
      return NextResponse.json({
        success: true,
        message: "FAQ visibility toggled successfully.",
        content: updated,
      });
    }

    // Default: General Content Update (Contact, Social, Hero, or Full FAQs/Reviews)
    const updates = (body.updates || body) as Partial<ContentStudioData>;
    const updated = await ContentStudioService.updateContent(updates, actorEmail);

    return NextResponse.json({
      success: true,
      message: "Site content updated successfully. Changes are now live.",
      content: updated,
    });
  } catch (error: any) {
    console.error("POST /api/admin/content error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update site content." },
      { status: 500 }
    );
  }
}
