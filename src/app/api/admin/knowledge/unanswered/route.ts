import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getServerAuthUser, hasStaffSectionAccess } from "@/lib/auth/serverAuth";
import { cleanupExpiredUnansweredQuestions } from "@/lib/assistant/retriever";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/knowledge/unanswered
 * Returns logged unanswered or low-confidence queries for Owner review.
 */
export async function GET(req: NextRequest) {
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

    const url = new URL(req.url);
    const resolvedFilter = url.searchParams.get("resolved") === "true";

    const questions = await prisma.unansweredQuestion.findMany({
      where: {
        resolved: resolvedFilter,
      },
      orderBy: [{ count: "desc" }, { lastAskedAt: "desc" }],
      take: 100,
    });

    const totalUnresolved = await prisma.unansweredQuestion.count({
      where: { resolved: false },
    });

    return NextResponse.json({
      success: true,
      questions,
      totalUnresolved,
    });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge/unanswered GET Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch unanswered questions" },
      { status: 500 }
    );
  }
}

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("resolve"),
    id: z.string().min(1),
  }),
  z.object({
    action: z.literal("convert"),
    id: z.string().min(1),
    answer: z.string().trim().min(5, "Answer must be at least 5 characters"),
    category: z.string().default("general"),
    language: z.enum(["en", "hi", "hinglish"]).default("en"),
  }),
  z.object({
    action: z.literal("cleanup"),
  }),
]);

/**
 * POST /api/admin/knowledge/unanswered
 * Handles resolving, converting to a KnowledgeEntry, or triggering 30-day retention cleanup.
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
    const parsed = ActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "validation_error", message: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    // 1. Mark as Resolved
    if (payload.action === "resolve") {
      const updated = await prisma.unansweredQuestion.update({
        where: { id: payload.id },
        data: { resolved: true },
      });
      return NextResponse.json({ success: true, updated });
    }

    // 2. Convert to KnowledgeEntry & Mark as Resolved
    if (payload.action === "convert") {
      const questionRecord = await prisma.unansweredQuestion.findUnique({
        where: { id: payload.id },
      });

      if (!questionRecord) {
        return NextResponse.json(
          { success: false, error: "not_found", message: "Question record not found." },
          { status: 404 }
        );
      }

      // Create new KnowledgeEntry
      const entry = await prisma.knowledgeEntry.create({
        data: {
          question: questionRecord.question,
          answer: payload.answer,
          language: payload.language,
          category: payload.category,
          published: true,
        },
      });

      // Mark original question as resolved
      await prisma.unansweredQuestion.update({
        where: { id: payload.id },
        data: { resolved: true },
      });

      return NextResponse.json({
        success: true,
        message: "Question successfully converted into published Knowledge Entry.",
        entry,
      });
    }

    // 3. Cleanup questions older than 30 days
    if (payload.action === "cleanup") {
      const purgedCount = await cleanupExpiredUnansweredQuestions();
      return NextResponse.json({
        success: true,
        purgedCount,
        message: `Purged ${purgedCount} queries older than 30 days.`,
      });
    }

    return NextResponse.json({ success: false, error: "invalid_action" }, { status: 400 });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge/unanswered POST Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process unanswered question action" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/knowledge/unanswered
 * Deletes an unanswered question record.
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

    await prisma.unansweredQuestion.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Unanswered question deleted successfully.",
    });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge/unanswered DELETE Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete question" },
      { status: 500 }
    );
  }
}
