import { revalidateTag, revalidatePath } from "next/cache";

export const CONTENT_CACHE_TAGS = {
  ALL_CONTENT: "content:all",
  COLLECTION: (collection: string) => `content:collection:${collection}`,
  ENTRY: (collection: string, key: string) => `content:entry:${collection}:${key}`,
  PRICING: "platform:pricing",
  PAYMENTS: "platform:payments",
  LEGAL: "content:legal",
  MEDIA: "content:media",
} as const;

/**
 * Revalidates cache tags and paths affected by a content, pricing, or legal update.
 * Ensures zero redeploy is needed when content is published or edited.
 */
export function revalidateAffectedContent(collection: string, key?: string): { tags: string[]; paths: string[] } {
  const tags: string[] = [
    CONTENT_CACHE_TAGS.ALL_CONTENT,
    CONTENT_CACHE_TAGS.COLLECTION(collection),
  ];

  if (key) {
    tags.push(CONTENT_CACHE_TAGS.ENTRY(collection, key));
  }

  const paths: string[] = [];

  switch (collection) {
    case "faqs":
      paths.push("/", "/consult");
      break;
    case "contact":
    case "social":
      paths.push("/", "/contact", "/consult");
      break;
    case "hero":
      paths.push("/");
      break;
    case "testimonials":
      paths.push("/", "/about");
      break;
    case "services":
      paths.push("/", "/services", "/consult");
      break;
    case "pricing":
      tags.push(CONTENT_CACHE_TAGS.PRICING);
      paths.push("/consult", "/pricing-policy");
      break;
    case "legal":
    case "terms":
    case "privacy":
    case "refund":
      tags.push(CONTENT_CACHE_TAGS.LEGAL);
      paths.push("/terms", "/privacy-policy", "/refund-policy", "/disclaimer", "/pricing-policy");
      break;
    default:
      paths.push("/");
      break;
  }

  // Trigger Next.js on-demand cache revalidation safely
  for (const tag of tags) {
    try {
      (revalidateTag as any)(tag, "max");
    } catch {
      try {
        (revalidateTag as any)(tag);
      } catch {
        // In non-request context or test runner, Next.js may silently skip
      }
    }
  }

  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch {
      // In non-request context or test runner, Next.js may silently skip
    }
  }

  return { tags, paths };
}
