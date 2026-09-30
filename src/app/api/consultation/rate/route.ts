import { NextRequest, NextResponse } from "next/server";
import { calculateUserConsultationRate } from "@/lib/services/consultationDiscountService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr_client_demo";
    const productId = (searchParams.get("product") as "astro" | "vaastu") || "astro";
    const type = searchParams.get("type") || "voice";

    const calculation = await calculateUserConsultationRate(userId, productId, type);

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
