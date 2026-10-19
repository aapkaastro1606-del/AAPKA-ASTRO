-- AlterTable: Add email_status and email_error to sessions
ALTER TABLE "public"."sessions" ADD COLUMN IF NOT EXISTS "email_status" TEXT;
ALTER TABLE "public"."sessions" ADD COLUMN IF NOT EXISTS "email_error" TEXT;

-- CreateTable for GeocodeCache
CREATE TABLE IF NOT EXISTS "public"."geocode_cache" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'nominatim',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "geocode_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "geocode_cache_query_key" ON "public"."geocode_cache"("query");
CREATE INDEX IF NOT EXISTS "geocode_cache_query_idx" ON "public"."geocode_cache"("query");
