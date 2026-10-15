import { NextResponse } from "next/server";
import { BlogStore } from "@/lib/store/blogStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/blog
 * Public route to fetch published blog posts directly from PostgreSQL (Neon).
 */
export async function GET() {
  try {
    const posts = await BlogStore.getPublishedPostsAsync();
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load blog posts" },
      { status: 500 }
    );
  }
}
