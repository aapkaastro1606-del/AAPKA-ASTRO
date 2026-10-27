import { PaymentOrder, PaymentProvider, VerifyPaymentParams } from "./PaymentProvider";
import { env } from "@/config/env";

export class UpiPaymentProvider implements PaymentProvider {
  readonly name = "upi";

  async createOrder(
    amountINR: number,
    receiptId: string,
    notes?: Record<string, string>
  ): Promise<PaymentOrder> {
    const amountPaise = Math.round(amountINR * 100);
    const orderId = `upi_ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      id: orderId,
      amount: amountPaise,
      currency: "INR",
      receipt: receiptId,
      status: "created",
      notes: {
        ...(notes || {}),
        upiId: env.NEXT_PUBLIC_UPI_ID || "9310709233m@pnb",
        upiName: env.NEXT_PUBLIC_UPI_NAME || "AAPKA ASTRO",
      },
    };
  }

  async verifyPaymentSignature(params: VerifyPaymentParams): Promise<boolean> {
    return Boolean(params.orderId && params.paymentId);
  }
}
