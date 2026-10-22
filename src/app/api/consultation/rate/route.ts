import { NextRequest, NextResponse } from "next/server";
import { calculateUserConsultationRate } from "@/lib/services/consultationDiscountService";
import { getServerAuthUser } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();
    const { searchParams } = new URL(req.url);
    const candidateUserId = searchParams.get("userId");
    const candidateEmail = searchParams.get("email");
    const userId = auth.isAuthenticated ? (auth.dbUserId || auth.userId || "guest") : (candidateUserId || "guest");
    const email = (auth.isAuthenticated && auth.email) ? auth.email : (candidateEmail || undefined);
    const productId = (searchParams.get("product") as "astro" | "vaastu") || "astro";
    const type = searchParams.get("type") || "voice";

    const calculation = await calculateUserConsultationRate(userId, productId, type, email);

    return NextResponse.json({
      success: true,
      calculation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to calculate consultation rate" },
      { status: 500 }
    );
  }
}
