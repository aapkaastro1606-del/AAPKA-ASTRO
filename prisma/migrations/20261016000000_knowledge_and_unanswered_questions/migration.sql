-- CreateTable for KnowledgeEntry
CREATE TABLE IF NOT EXISTS "public"."knowledge_entries" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "category" TEXT NOT NULL DEFAULT 'general',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable for UnansweredQuestion
CREATE TABLE IF NOT EXISTS "public"."unanswered_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "count" INTEGER NOT NULL DEFAULT 1,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "last_asked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unanswered_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX IF NOT EXISTS "knowledge_entries_published_language_idx" ON "public"."knowledge_entries"("published", "language");
CREATE INDEX IF NOT EXISTS "knowledge_entries_category_idx" ON "public"."knowledge_entries"("category");

CREATE INDEX IF NOT EXISTS "unanswered_questions_resolved_idx" ON "public"."unanswered_questions"("resolved");
CREATE INDEX IF NOT EXISTS "unanswered_questions_last_asked_at_idx" ON "public"."unanswered_questions"("last_asked_at");
CREATE INDEX IF NOT EXISTS "unanswered_questions_created_at_idx" ON "public"."unanswered_questions"("created_at");
