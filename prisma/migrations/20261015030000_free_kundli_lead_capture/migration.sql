-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."kundli_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "gender" TEXT NOT NULL DEFAULT 'male',
    "dob" TIMESTAMP(3) NOT NULL,
    "time_of_birth" TEXT NOT NULL,
    "place_of_birth" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" DOUBLE PRECISION,
    "source_page" TEXT NOT NULL DEFAULT '/kundli-generator',
    "user_id" TEXT,
    "consent_given" BOOLEAN NOT NULL DEFAULT true,
    "consent_text" TEXT NOT NULL,
    "consent_version" TEXT NOT NULL DEFAULT 'v1.0',
    "consent_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kundli_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX IF NOT EXISTS "kundli_leads_phone_idx" ON "public"."kundli_leads"("phone");
CREATE INDEX IF NOT EXISTS "kundli_leads_email_idx" ON "public"."kundli_leads"("email");
CREATE INDEX IF NOT EXISTS "kundli_leads_user_id_idx" ON "public"."kundli_leads"("user_id");
CREATE INDEX IF NOT EXISTS "kundli_leads_consent_timestamp_idx" ON "public"."kundli_leads"("consent_timestamp");
CREATE INDEX IF NOT EXISTS "kundli_leads_created_at_idx" ON "public"."kundli_leads"("created_at");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'kundli_leads_user_id_fkey'
    ) THEN
        ALTER TABLE "public"."kundli_leads" ADD CONSTRAINT "kundli_leads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
