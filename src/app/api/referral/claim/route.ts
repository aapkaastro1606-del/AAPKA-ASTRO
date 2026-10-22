import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerAuthUser } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();
    const body = await req.json();
    const { userId: bodyUserId, referralCode } = body;

    const candidateUserId = auth.isAuthenticated ? (auth.dbUserId || auth.userId) : bodyUserId;

    if (!candidateUserId || !referralCode) {
      return NextResponse.json(
        { success: false, message: "Authentication and referral code are required." },
        { status: 400 }
      );
    }

    const cleanCode = String(referralCode).trim().toUpperCase();

    // Resolve referee user from database (never use Clerk id as foreign key directly)
    const referee = await prisma.user.findFirst({
      where: {
        OR: [{ id: candidateUserId }, { clerkId: candidateUserId }],
      },
    });

    if (!referee) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    // Check if referee already has a referrer
    if (referee.referredById) {
      return NextResponse.json(
        { success: false, message: "A referral code has already been applied to your account." },
        { status: 400 }
      );
    }

    // Find referrer in database
    const referrer = await prisma.user.findUnique({
      where: { referralCode: cleanCode },
    });

    if (!referrer) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired referral code." },
        { status: 404 }
      );
    }

    if (referrer.id === referee.id) {
      return NextResponse.json(
        { success: false, message: "You cannot use your own referral code." },
        { status: 400 }
      );
    }

    // Credit referee ₹50 and referrer ₹100 inside an atomic transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: referee.id },
        data: {
          referredById: referrer.id,
          walletBalance: { increment: 50 },
        },
      }),
      prisma.user.update({
        where: { id: referrer.id },
        data: {
          walletBalance: { increment: 100 },
          referralEarnings: { increment: 100 },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      bonusCredited: 50,
      message: "Referral code verified! ₹50 discount voucher credited to your account and ₹100 to your referrer.",
    });
  } catch (err: any) {
    console.error("[API /api/referral/claim Error]", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to process referral code." },
      { status: 500 }
    );
  }
}
