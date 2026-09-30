import { NextRequest, NextResponse } from "next/server";
import { paymentProvider } from "@/lib/providers/payment";
import { calculateUserConsultationRate } from "@/lib/services/consultationDiscountService";
import { env } from "@/config/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      userId = "guest",
      productId,
      clientName,
      phone,
      format = "Voice Call",
      serviceType = "consultation_booking",
    } = body;

    let orderAmount = amount;
    let rateCalculation = null;

    // If a consultation product is specified (astro or vaastu), enforce server-side pricing
    if (productId === "astro" || productId === "vaastu") {
      rateCalculation = await calculateUserConsultationRate(userId, productId, format);
      orderAmount = rateCalculation.effectiveFee;
    } else if (productId === "kundli_pdf" || serviceType === "kundli_pdf_report") {
      orderAmount = 501;
    }

    if (!orderAmount || orderAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid amount in INR is required" },
        { status: 400 }
      );
    }

    const receiptId = `rcpt_${Date.now()}`;
    const order = await paymentProvider.createOrder(orderAmount, receiptId, {
      userId: userId || "guest",
      productId: productId || "astro",
      productName:
        productId === "kundli_pdf" || serviceType === "kundli_pdf_report"
          ? "Kundli Full PDF Report"
          : rateCalculation?.productName || "Astro Consultation",
      amountINR: String(orderAmount),
      clientName: clientName || "",
      phone: phone || "",
      format: format || "Voice Call",
      serviceType,
    });

    return NextResponse.json({
      success: true,
      order,
      rate: rateCalculation,
      keyId: env.RAZORPAY_KEY_ID || "rzp_test_mock_key_id",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
