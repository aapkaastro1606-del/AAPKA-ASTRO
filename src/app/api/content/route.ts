import { NextResponse } from "next/server";
import { ContentStudioService } from "@/lib/services/contentStudioService";

export const dynamic = "force-dynamic";

/**
 * GET /api/content
 * Public endpoint to fetch live active website content for visitors.
 */
export async function GET() {
  try {
    const data = await ContentStudioService.getContent();

    // Filter only active FAQs and reviews for public visitors
    const publicData = {
      contact: data.contact,
      social: data.social,
      hero: data.hero,
      faqs: data.faqs.filter((f) => f.isActive !== false),
      reviews: (data.reviews || []).filter((r) => r.isActive !== false),
      updatedAt: data.updatedAt,
    };

    return NextResponse.json({
      success: true,
      content: publicData,
    });
  } catch (error: any) {
    console.error("GET /api/content error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load site content" },
      { status: 500 }
    );
  }
}
