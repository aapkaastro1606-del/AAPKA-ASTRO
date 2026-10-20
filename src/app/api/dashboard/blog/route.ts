import { NextRequest, NextResponse } from "next/server";
import { hasStaffSectionAccess, resolveRequestAuth } from "@/lib/auth/serverAuth";
import { BlogStore, BlogPost } from "@/lib/store/blogStore";

/**
 * GET /api/dashboard/blog
 * Returns all blog posts. Requires VIEW access on "blog".
 */
export async function GET(req: NextRequest) {
  const auth = await resolveRequestAuth(req);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  if (!hasStaffSectionAccess(auth, "blog", "VIEW")) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: VIEW access required for Vedic Journal & Blog.",
      },
      { status: 403 }
    );
  }

  try {
    const posts = await BlogStore.getAllPostsAsync();
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load blog posts." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/blog
 * Creates or updates a blog article. Requires MANAGE access on "blog".
 */
export async function POST(req: NextRequest) {
  const auth = await resolveRequestAuth(req);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  if (!hasStaffSectionAccess(auth, "blog", "MANAGE")) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: MANAGE access required to author, edit, or publish blog articles.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "Title and content are required fields." },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const postToSave: BlogPost = {
      id: body.id || `blog-${Date.now()}`,
      title,
      slug,
      excerpt: body.excerpt || title,
      content,
      category: body.category || "Vedic Astrology",
      author: body.author || "Acharya Sharma",
      authorAvatar:
        body.authorAvatar ||
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      coverImage:
        body.coverImage ||
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      publishedAt: body.publishedAt || new Date().toISOString().split("T")[0],
      readTime: body.readTime || "5 min read",
      tags: body.tags || ["Vedic"],
      status: body.status || "published",
      views: body.views || 0,
    };

    await BlogStore.savePostAsync(postToSave);

    return NextResponse.json({
      success: true,
      message: "Article saved successfully.",
      post: postToSave,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save blog post." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dashboard/blog
 * Deletes a blog article by ID. Requires MANAGE access on "blog".
 */
export async function DELETE(req: NextRequest) {
  const auth = await resolveRequestAuth(req);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Authentication required." },
      { status: 401 }
    );
  }

  if (!hasStaffSectionAccess(auth, "blog", "MANAGE")) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden: MANAGE access required to delete blog articles.",
      },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // query param was not provided and body empty
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Post ID is required for deletion." },
        { status: 400 }
      );
    }

    await BlogStore.deletePostAsync(id);

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete blog post." },
      { status: 500 }
    );
  }
}
