import { NextRequest, NextResponse } from "next/server";
import { ContentModelService } from "@/lib/services/contentModelService";
import { DEFAULT_CONTENT_STUDIO } from "@/lib/services/contentStudioService";

export const dynamic = "force-dynamic";

/**
 * GET /api/content
 * Public endpoint to fetch live active website content for visitors in English or Hindi.
 * Guaranteed never to crash or return empty: falls back to built-in code defaults.
 */
export async function GET(req?: NextRequest) {
  try {
    const lang = (req?.nextUrl?.searchParams?.get("lang") === "hi" ? "hi" : "en") as "en" | "hi";

    const [faqEntries, contactEntry, socialEntry, heroEntry, testimonialEntries, serviceEntries] =
      await Promise.all([
        ContentModelService.getPublishedCollection("faqs", lang).catch(() => []),
        ContentModelService.getPublishedEntry("contact", "primary", lang).catch(() => null),
        ContentModelService.getPublishedEntry("social", "primary", lang).catch(() => null),
        ContentModelService.getPublishedEntry("hero", "home-hero", lang).catch(() => null),
        ContentModelService.getPublishedCollection("testimonials", lang).catch(() => []),
        ContentModelService.getPublishedCollection("services", lang).catch(() => []),
      ]);

    const faqs = (faqEntries.length > 0 ? faqEntries : []).map((f) => ({
      id: f.key,
      q: f.data.question || f.dataEn.question || "",
      a: f.data.answer || f.dataEn.answer || "",
      category: f.data.category || f.dataEn.category || "general",
      isActive: true,
      sortOrder: f.sortOrder,
    }));

    const contact = contactEntry?.data || DEFAULT_CONTENT_STUDIO.contact;
    const social = socialEntry?.data || DEFAULT_CONTENT_STUDIO.social;
    const hero = heroEntry?.data || DEFAULT_CONTENT_STUDIO.hero;

    const reviews = (testimonialEntries.length > 0 ? testimonialEntries : []).map((t) => ({
      id: t.key,
      clientName: t.data.clientName || t.dataEn.clientName || "",
      city: t.data.city || t.dataEn.city || "",
      service: t.data.service || t.dataEn.service || "",
      stars: t.data.stars || t.dataEn.stars || 5,
      text: t.data.text || t.dataEn.text || "",
      verified: t.data.verified ?? true,
      isActive: true,
    }));

    const services = serviceEntries.map((s) => ({
      id: s.key,
      title: s.data.title || s.dataEn.title,
      description: s.data.description || s.dataEn.description,
      highlights: s.data.highlights || s.dataEn.highlights || [],
      href: s.data.href || s.dataEn.href || "/consult",
    }));

    return NextResponse.json({
      success: true,
      lang,
      content: {
        contact,
        social,
        hero,
        faqs,
        reviews,
        services,
        updatedAt: heroEntry?.updatedAt || contactEntry?.updatedAt || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("GET /api/content error:", error);
    // Even in catastrophic error scenarios, return built-in defaults instead of failing
    return NextResponse.json({
      success: true,
      lang: "en",
      content: {
        ...DEFAULT_CONTENT_STUDIO,
        faqs: DEFAULT_CONTENT_STUDIO.faqs,
        reviews: DEFAULT_CONTENT_STUDIO.reviews,
        services: [],
        updatedAt: new Date().toISOString(),
      },
      fallback: true,
    });
  }
}
