import { NextResponse } from "next/server";
import { BlogStore } from "@/lib/store/blogStore";
import { safeExternalCall } from "@/lib/utils/resilience";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * GET /api/blog
 * Public route to fetch published blog posts directly from PostgreSQL (Neon).
 * Falls back to static articles if database is unavailable.
 */
export async function GET() {
  try {
    const posts = await safeExternalCall({
      name: "BlogStore.getPublishedPostsAsync",
      timeoutMs: 6000,
      fallback: () => BlogStore.getPublishedPosts(),
      fn: () => BlogStore.getPublishedPostsAsync(),
    });
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error("[Blog API Graceful Degradation] Fallback to static articles:", error);
    return NextResponse.json({
      success: true,
      isFallback: true,
      posts: BlogStore.getPublishedPosts(),
    });
  }
}
