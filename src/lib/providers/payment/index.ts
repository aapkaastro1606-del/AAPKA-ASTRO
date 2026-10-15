import { PaymentProvider } from "./PaymentProvider";
import { UpiPaymentProvider } from "./UpiPaymentProvider";
import { MockPaymentProvider } from "./MockPaymentProvider";
import { env } from "@/config/env";

export * from "./PaymentProvider";

function createPaymentProvider(): PaymentProvider {
  if (env.PAYMENT_PROVIDER === "upi") {
    return new UpiPaymentProvider();
  }
  return new MockPaymentProvider();
}

export const paymentProvider: PaymentProvider = createPaymentProvider();
