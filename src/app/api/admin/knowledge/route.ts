import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getServerAuthUser, hasStaffSectionAccess } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

const CreateEntrySchema = z.object({
  question: z.string().trim().min(3, "Question must be at least 3 characters").max(1000),
  answer: z.string().trim().min(5, "Answer must be at least 5 characters"),
  language: z.enum(["en", "hi", "hinglish"]).default("en"),
  category: z.string().default("general"),
  published: z.boolean().default(true),
});

const UpdateEntrySchema = z.object({
  id: z.string().min(1, "Entry ID is required"),
  question: z.string().trim().min(3).max(1000).optional(),
  answer: z.string().trim().min(5).optional(),
  language: z.enum(["en", "hi", "hinglish"]).optional(),
  category: z.string().optional(),
  published: z.boolean().optional(),
});

/**
 * GET /api/admin/knowledge
 * Lists all Owner-editable KnowledgeEntry records.
 */
export async function GET() {
  try {
    const auth = await getServerAuthUser();
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "unauthorized", message: "Authentication required." },
        { status: 401 }
      );
    }
    if (!auth.isOwner && !hasStaffSectionAccess(auth, "knowledge", "VIEW")) {
      return NextResponse.json(
        { success: false, error: "forbidden", message: "VIEW access to Chatbot Knowledge Base required." },
        { status: 403 }
      );
    }

    const entries = await prisma.knowledgeEntry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      entries,
      count: entries.length,
    });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge GET Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch knowledge entries" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/knowledge
 * Creates a new KnowledgeEntry record.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "unauthorized", message: "Authentication required." },
        { status: 401 }
      );
    }
    if (!auth.isOwner && !hasStaffSectionAccess(auth, "knowledge", "MANAGE")) {
      return NextResponse.json(
        { success: false, error: "forbidden", message: "MANAGE access to Chatbot Knowledge Base required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = CreateEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "validation_error", message: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const entry = await prisma.knowledgeEntry.create({
      data: parsed.data,
    });

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge POST Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create knowledge entry" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/knowledge
 * Updates an existing KnowledgeEntry record.
 */
export async function PUT(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "unauthorized", message: "Authentication required." },
        { status: 401 }
      );
    }
    if (!auth.isOwner && !hasStaffSectionAccess(auth, "knowledge", "MANAGE")) {
      return NextResponse.json(
        { success: false, error: "forbidden", message: "MANAGE access to Chatbot Knowledge Base required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = UpdateEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "validation_error", message: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const { id, ...data } = parsed.data;

    const entry = await prisma.knowledgeEntry.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge PUT Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update knowledge entry" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/knowledge
 * Deletes a KnowledgeEntry record.
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "unauthorized", message: "Authentication required." },
        { status: 401 }
      );
    }
    if (!auth.isOwner && !hasStaffSectionAccess(auth, "knowledge", "MANAGE")) {
      return NextResponse.json(
        { success: false, error: "forbidden", message: "MANAGE access to Chatbot Knowledge Base required." },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "missing_id", message: "ID query parameter required." },
        { status: 400 }
      );
    }

    await prisma.knowledgeEntry.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Knowledge entry deleted successfully.",
    });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge DELETE Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete knowledge entry" },
      { status: 500 }
    );
  }
}
