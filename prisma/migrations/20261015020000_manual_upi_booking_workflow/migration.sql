-- AlterTable
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "booking_status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
ADD COLUMN IF NOT EXISTS "utr" TEXT,
ADD COLUMN IF NOT EXISTS "locked_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "is_first_time_astro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT,
ADD COLUMN IF NOT EXISTS "refunded_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "refund_notes" TEXT,
ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "approved_by" TEXT,
ADD COLUMN IF NOT EXISTS "bank_credit_confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "preferred_day" TEXT,
ADD COLUMN IF NOT EXISTS "preferred_time_window" TEXT,
ADD COLUMN IF NOT EXISTS "scheduled_slot" TEXT,
ADD COLUMN IF NOT EXISTS "intake_details" JSONB,
ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "platform_settings" ADD COLUMN IF NOT EXISTS "payment_settings" JSONB;

-- CreateTable
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_email" TEXT,
    "target_id" TEXT,
    "target_type" TEXT,
    "previous_state" JSONB,
    "new_state" JSONB,
    "notes" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "sessions_booking_status_idx" ON "sessions"("booking_status");
CREATE INDEX IF NOT EXISTS "sessions_utr_idx" ON "sessions"("utr");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_actor_email_idx" ON "audit_logs"("actor_email");
CREATE INDEX IF NOT EXISTS "audit_logs_target_id_idx" ON "audit_logs"("target_id");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");
