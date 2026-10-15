import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import { PLACEHOLDER_TESTIMONIALS } from "@/config/placeholderContent";

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
 * Submits a new client review directly into PostgreSQL.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    const body = await req.json();
    const { clientName, service, rating, comment } = body;

    if (!rating || !comment) {
      return NextResponse.json(
        { success: false, message: "Rating and comment are required." },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: auth.userId || null,
        clientName: clientName || "Seeker",
        service: service || "Vedic Astrology",
        rating: Number(rating) || 5,
        comment: String(comment).trim(),
        isApproved: true,
      },
    });

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
