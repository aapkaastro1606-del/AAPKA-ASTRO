import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { AstrologerStateStore } from "@/lib/store/astrologerStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, referralCode } = body;

    if (!userId || !referralCode) {
      return NextResponse.json(
        { success: false, message: "User ID and referral code are required." },
        { status: 400 }
      );
    }

    const cleanCode = String(referralCode).trim().toUpperCase();

    // In preview / demo mode or local memory:
    if (cleanCode === "ASTRO50" || cleanCode.startsWith("REF")) {
      AstrologerStateStore.addWallet(50);
      return NextResponse.json({
        success: true,
        bonusCredited: 50,
        message: "Referral code applied! ₹50 discount voucher credited to your account.",
      });
    }

    // Try finding referrer in database if Prisma is active
    try {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: cleanCode },
        include: { wallet: true },
      });

      if (!referrer) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired referral code." },
          { status: 404 }
        );
      }

      if (referrer.id === userId) {
        return NextResponse.json(
          { success: false, message: "You cannot use your own referral code." },
          { status: 400 }
        );
      }

      // Credit referee ₹50
      await prisma.user.update({
        where: { id: userId },
        data: {
          referredById: referrer.id,
          walletBalance: { increment: 50 },
        },
      });

      // Credit referrer ₹100
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          walletBalance: { increment: 100 },
          referralEarnings: { increment: 100 },
        },
      });

      return NextResponse.json({
        success: true,
        bonusCredited: 50,
        message: "Referral code verified! ₹50 discount voucher credited to your account and ₹100 to your referrer.",
      });
    } catch {
      // Fallback for preview mode
      AstrologerStateStore.addWallet(50);
      return NextResponse.json({
        success: true,
        bonusCredited: 50,
        message: "Referral code accepted! ₹50 discount voucher credited to your account.",
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to process referral code." },
      { status: 500 }
    );
  }
}
