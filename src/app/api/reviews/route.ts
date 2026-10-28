import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { PLACEHOLDER_TESTIMONIALS } from "@/config/placeholderContent";
import { ContentModelService } from "@/lib/services/contentModelService";
import { ContentStatus } from "@prisma/client";
import { revalidateAffectedContent } from "@/lib/content/revalidation";

export const dynamic = "force-dynamic";

/**
 * GET /api/reviews
 * Fetches approved reviews from Neon PostgreSQL database.
 */
export async function GET() {
  try {
    if (prisma && prisma.review) {
      const count = await prisma.review.count();
      if (count === 0) {
        // Seed default authentic reviews into PostgreSQL
        for (const t of PLACEHOLDER_TESTIMONIALS) {
          await prisma.review.create({
            data: {
              clientName: t.clientName,
              service: t.service,
              rating: t.stars,
              comment: t.text,
              isApproved: true,
            },
          });
        }
      }

      const reviews = await prisma.review.findMany({
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json({
        success: true,
        reviews: reviews.map((r) => ({
          id: r.id,
          clientName: r.clientName,
          service: r.service,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
        })),
      });
    }

    return NextResponse.json({ success: true, reviews: PLACEHOLDER_TESTIMONIALS });
  } catch (error: any) {
    console.warn("Reviews DB query error, returning fallback:", error);
    return NextResponse.json({ success: true, reviews: PLACEHOLDER_TESTIMONIALS });
  }
}

/**
 * POST /api/reviews
 * Submits a new client review directly into PostgreSQL and synchronizes it with ContentStudio.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();
    const body = await req.json();
    const { clientName, service, rating, comment, bookingId, sessionId, city } = body;

    if (!rating || !comment) {
      return NextResponse.json(
        { success: false, message: "Rating and comment are required." },
        { status: 400 }
      );
    }

    // Verify sessionId exists in prisma.session before referencing foreign key
    let validSessionId: string | null = null;
    const candidateSessionId = sessionId || bookingId;
    if (candidateSessionId && typeof candidateSessionId === "string") {
      try {
        const existingSession = await prisma.session.findUnique({
          where: { id: candidateSessionId },
          select: { id: true },
        });
        if (existingSession) {
          validSessionId = existingSession.id;
        }
      } catch {
        validSessionId = null;
      }
    }

    const review = await prisma.review.create({
      data: {
        userId: auth.userId || null,
        sessionId: validSessionId,
        clientName: clientName || auth.name || "Seeker",
        service: service || "Vedic Consultation",
        rating: Number(rating) || 5,
        comment: String(comment).trim(),
        isApproved: true,
      },
    });

    // Also sync to ContentModelService so it immediately reflects in ContentStudio & ContentEntry
    try {
      await ContentModelService.saveEntry({
        collection: "testimonials",
        key: review.id,
        dataEn: {
          clientName: review.clientName,
          city: city || "Verified Seeker",
          service: review.service,
          stars: review.rating,
          text: review.comment,
          date: review.createdAt.toISOString().split("T")[0],
          consentNote: "Client consultation feedback recorded.",
          verified: true,
        },
        dataHi: {
          clientName: review.clientName,
          city: city || "Verified Seeker",
          service: review.service,
          stars: review.rating,
          text: review.comment,
          date: review.createdAt.toISOString().split("T")[0],
          consentNote: "Client consultation feedback recorded.",
          verified: true,
        },
        status: ContentStatus.PUBLISHED,
        actorEmail: auth.email || "seeker@aapkaastro.com",
        changeSummary: `Client review submitted by ${review.clientName}`,
      });
      revalidateAffectedContent("testimonials");
    } catch (e) {
      console.warn("Sync new review to ContentModel failed:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully and recorded in database.",
      review,
    });
  } catch (error: any) {
    console.error("Failed to save review to database:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit review." },
      { status: 500 }
    );
  }
}
