-- AlterTable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'razorpay_order_id') THEN
    ALTER TABLE "wallet_transactions" RENAME COLUMN "razorpay_order_id" TO "order_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallet_transactions' AND column_name = 'razorpay_payment_id') THEN
    ALTER TABLE "wallet_transactions" RENAME COLUMN "razorpay_payment_id" TO "payment_id";
  END IF;
END $$;

ALTER TABLE "wallet_transactions" ALTER COLUMN "provider" SET DEFAULT 'upi';
