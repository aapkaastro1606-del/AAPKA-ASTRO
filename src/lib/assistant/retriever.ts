import { prisma } from "@/lib/db/prisma";
import {
  STRUCTURED_SITE_KNOWLEDGE,
  KnowledgeSection,
} from "./knowledge/structuredContent";
import { detectLanguage } from "./queryEngine";

export interface RetrievedContext {
  sections: { title: string; content: string; source: "database" | "site_doc" }[];
  isConfident: boolean;
  confidenceScore: number;
}

/**
 * Mask PII (emails and phone numbers) to protect user privacy.
 */
export function maskPii(text: string): string {
  if (!text) return "";

  // 1. Mask Email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  let sanitized = text.replace(emailRegex, "[MASKED_EMAIL]");

  // 2. Mask Phone numbers (Indian mobiles +91/0/bare 10-digits, space/dash formatted, and international numbers)
  const phoneRegex = /(?:(?:\+?91|0)[\s-]?)?[6-9]\d{2,4}[\s-]?\d{2,4}[\s-]?\d{2,4}\b|\b\d{3}[-.\s]??\d{3}[-.\s]??\d{4}\b|\b[6-9]\d{9}\b/g;
  sanitized = sanitized.replace(phoneRegex, "[MASKED_PHONE]");

  // 3. Truncate to 500 characters
  return sanitized.trim().slice(0, 500);
}

/**
 * Extracts normalized query tokens for keyword relevance matching.
 */
function extractTokens(query: string): string[] {
  const stopWords = new Set([
    "the", "is", "at", "which", "on", "a", "an", "and", "or", "to", "in", "of", "for", "with",
    "kya", "hai", "ka", "ki", "ke", "ko", "se", "me", "mein", "par", "bhi", "aur", "ya"
  ]);

  return query
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !stopWords.has(t));
}

/**
 * Retrieves the most relevant knowledge sections (top 1-3) to keep prompt context small.
 * Evaluates both Owner-editable KnowledgeEntry (database) and structured site content.
 */
export async function retrieveRelevantKnowledge(
  query: string
): Promise<RetrievedContext> {
  const tokens = extractTokens(query);
  const matchedSections: {
    title: string;
    content: string;
    score: number;
    source: "database" | "site_doc";
  }[] = [];

  // 1. Search Owner-Editable Database Knowledge Entries (if DB connected)
  try {
    if (prisma && prisma.knowledgeEntry) {
      const dbEntries = await prisma.knowledgeEntry.findMany({
        where: { published: true },
        take: 50,
      });

      for (const entry of dbEntries) {
        let score = 0;
        const entryTokens = extractTokens(`${entry.question} ${entry.answer}`);

        for (const token of tokens) {
          if (entry.question.toLowerCase().includes(token)) score += 5;
          if (entry.answer.toLowerCase().includes(token)) score += 2;
          if (entryTokens.includes(token)) score += 1;
        }

        if (score > 2) {
          matchedSections.push({
            title: entry.question,
            content: entry.answer,
            score,
            source: "database",
          });
        }
      }
    }
  } catch (err) {
    // Graceful fallback to static site docs if DB query encounters transient issue
    console.error("[Retriever DB Search Error]", err);
  }

  // 2. Search Static Structured Site Knowledge
  for (const doc of STRUCTURED_SITE_KNOWLEDGE) {
    let score = 0;
    const docText = `${doc.title} ${doc.content}`.toLowerCase();

    for (const token of tokens) {
      if (doc.keywords.some((kw) => kw.toLowerCase().includes(token))) score += 4;
      if (doc.title.toLowerCase().includes(token)) score += 3;
      if (docText.includes(token)) score += 1;
    }

    if (score > 1) {
      matchedSections.push({
        title: doc.title,
        content: doc.content,
        score,
        source: "site_doc",
      });
    }
  }

  // Sort descending by relevance score
  matchedSections.sort((a, b) => b.score - a.score);

  // Take top 3 sections maximum to keep context minimal
  const topSections = matchedSections.slice(0, 3);
  const highestScore = topSections[0]?.score || 0;
  const isConfident = highestScore >= 3;

  return {
    sections: topSections.map((s) => ({
      title: s.title,
      content: s.content,
      source: s.source,
    })),
    isConfident,
    confidenceScore: highestScore,
  };
}

/**
 * Logs an unanswered or low-confidence question into the UnansweredQuestion table.
 * - Text is truncated.
 * - Emails and phone numbers are strictly masked.
 * - Deduplicated by incrementing count on repeat questions.
 */
export async function logUnansweredQuestion(
  rawQuestion: string,
  language?: string
): Promise<void> {
  try {
    if (!prisma || !prisma.unansweredQuestion) return;

    const sanitizedQuestion = maskPii(rawQuestion);
    if (!sanitizedQuestion || sanitizedQuestion.length < 3) return;

    const detectedLang = language || detectLanguage(rawQuestion);

    // Look for an existing identical or similar masked question asked recently (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const existing = await prisma.unansweredQuestion.findFirst({
      where: {
        question: sanitizedQuestion,
        createdAt: { gte: thirtyDaysAgo },
        resolved: false,
      },
    });

    if (existing) {
      await prisma.unansweredQuestion.update({
        where: { id: existing.id },
        data: {
          count: existing.count + 1,
          lastAskedAt: new Date(),
        },
      });
    } else {
      await prisma.unansweredQuestion.create({
        data: {
          question: sanitizedQuestion,
          language: detectedLang,
          count: 1,
          lastAskedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("[UnansweredQuestion Logger Error]", error);
  }
}

/**
 * Deletes unanswered questions older than 30 days (retention policy).
 */
export async function cleanupExpiredUnansweredQuestions(): Promise<number> {
  try {
    if (!prisma || !prisma.unansweredQuestion) return 0;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const deleted = await prisma.unansweredQuestion.deleteMany({
      where: {
        createdAt: { lt: cutoff },
      },
    });

    return deleted.count;
  } catch (error) {
    console.error("[UnansweredQuestion Cleanup Error]", error);
    return 0;
  }
}
