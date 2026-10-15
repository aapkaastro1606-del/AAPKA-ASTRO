-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_astrologer_id_fkey";

-- AlterTable
ALTER TABLE "instagram_media" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Horoscope',
ADD COLUMN IF NOT EXISTS "display_order" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "media_type" SET DEFAULT 'REEL';

-- AlterTable
ALTER TABLE "kundli_records" ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "relation" TEXT DEFAULT 'Self',
ADD COLUMN IF NOT EXISTS "timezone" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "client_name" TEXT NOT NULL DEFAULT 'Seeker',
ADD COLUMN IF NOT EXISTS "is_approved" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "service" TEXT NOT NULL DEFAULT 'Vedic Astrology',
ADD COLUMN IF NOT EXISTS "user_id" TEXT,
ALTER COLUMN "session_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "booking_id" TEXT,
ADD COLUMN IF NOT EXISTS "concern" TEXT,
ADD COLUMN IF NOT EXISTS "format" TEXT NOT NULL DEFAULT 'Voice Call',
ADD COLUMN IF NOT EXISTS "meeting_link" TEXT,
ADD COLUMN IF NOT EXISTS "payment_method" TEXT NOT NULL DEFAULT 'UPI_QR',
ADD COLUMN IF NOT EXISTS "payment_screenshot_url" TEXT,
ADD COLUMN IF NOT EXISTS "payment_status" TEXT NOT NULL DEFAULT 'AWAITING_VERIFICATION',
ADD COLUMN IF NOT EXISTS "preferred_slot" TEXT,
ADD COLUMN IF NOT EXISTS "product_type" TEXT NOT NULL DEFAULT 'astro',
ADD COLUMN IF NOT EXISTS "scheduled_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "user_email" TEXT,
ADD COLUMN IF NOT EXISTS "user_name" TEXT,
ADD COLUMN IF NOT EXISTS "user_phone" TEXT,
ALTER COLUMN "astrologer_id" DROP NOT NULL,
ALTER COLUMN "rate_per_min" SET DEFAULT 0.0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "clerk_webhook_events" (
    "id" TEXT NOT NULL,
    "event_id" TEXT,
    "event_type" TEXT NOT NULL,
    "payload" JSONB,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clerk_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton_settings',
    "pricing" JSONB NOT NULL,
    "popups" JSONB,
    "features" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "clerk_webhook_events_event_type_idx" ON "clerk_webhook_events"("event_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "clerk_webhook_events_status_idx" ON "clerk_webhook_events"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "clerk_webhook_events_created_at_idx" ON "clerk_webhook_events"("created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "instagram_media_display_order_idx" ON "instagram_media"("display_order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "kundli_records_phone_idx" ON "kundli_records"("phone");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_booking_id_key" ON "sessions"("booking_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "sessions_booking_id_idx" ON "sessions"("booking_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "sessions_payment_status_idx" ON "sessions"("payment_status");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_astrologer_id_fkey" FOREIGN KEY ("astrologer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
