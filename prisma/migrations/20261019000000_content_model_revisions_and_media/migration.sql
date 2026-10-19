-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "public"."ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: content_entries
CREATE TABLE IF NOT EXISTS "public"."content_entries" (
    "id" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "slug" TEXT,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "schema_version" TEXT NOT NULL DEFAULT '1.0',
    "data_en" JSONB NOT NULL DEFAULT '{}',
    "data_hi" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB DEFAULT '{}',
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable: content_revisions
CREATE TABLE IF NOT EXISTS "public"."content_revisions" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" "public"."ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "data_en" JSONB NOT NULL,
    "data_hi" JSONB NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "revision_number" INTEGER NOT NULL DEFAULT 1,
    "change_summary" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: media_assets
CREATE TABLE IF NOT EXISTS "public"."media_assets" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL DEFAULT 'image/jpeg',
    "file_size" INTEGER,
    "alt_text_en" TEXT,
    "alt_text_hi" TEXT,
    "collection" TEXT,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "public"."content_revisions"
    ADD CONSTRAINT "content_revisions_content_id_fkey"
    FOREIGN KEY ("content_id") REFERENCES "public"."content_entries"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "content_entries_collection_key_key" ON "public"."content_entries"("collection", "key");
CREATE INDEX IF NOT EXISTS "content_entries_collection_status_sort_order_idx" ON "public"."content_entries"("collection", "status", "sort_order");
CREATE INDEX IF NOT EXISTS "content_entries_status_idx" ON "public"."content_entries"("status");

CREATE INDEX IF NOT EXISTS "content_revisions_content_id_revision_number_idx" ON "public"."content_revisions"("content_id", "revision_number");
CREATE INDEX IF NOT EXISTS "content_revisions_collection_key_idx" ON "public"."content_revisions"("collection", "key");

CREATE INDEX IF NOT EXISTS "media_assets_collection_idx" ON "public"."media_assets"("collection");
CREATE INDEX IF NOT EXISTS "media_assets_url_idx" ON "public"."media_assets"("url");
