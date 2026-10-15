export interface PaymentOrder {
  id: string; // Order ID or UPI reference id
  amount: number; // In Paise (e.g. 105100 for ₹1,051)
  currency: string;
  receipt: string;
  status: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentProvider {
  readonly name: string;
  createOrder(
    amountINR: number,
    receiptId: string,
    notes?: Record<string, string>
  ): Promise<PaymentOrder>;
  verifyPaymentSignature(params: VerifyPaymentParams): Promise<boolean>;
}
