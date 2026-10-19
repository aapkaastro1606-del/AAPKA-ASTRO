import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest, hasStaffSectionAccess } from "@/lib/auth/serverAuth";
import { ContentStudioService, ContentStudioData } from "@/lib/services/contentStudioService";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/content
 * Authenticated endpoint to fetch all Content Studio data (including hidden/inactive items).
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
 * Authenticated endpoint to modify site content, FAQs, contact details, hero texts, and testimonials.
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
