import { prisma } from "@/lib/db/prisma";
import {
  PLACEHOLDER_CONTACT_INFO,
  PLACEHOLDER_SOCIAL_LINKS,
  PLACEHOLDER_ASTROLOGER,
  PLACEHOLDER_TESTIMONIALS,
} from "@/config/placeholderContent";
import { AuditLogService } from "@/lib/services/auditLogService";
import { ContentModelService } from "@/lib/services/contentModelService";
import { ContentStatus } from "@prisma/client";

export interface FaqItem {
  id: string;
  q: string;
  a: string;
  category?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ContactInfoConfig {
  phone: string;
  phoneRaw: string;
  whatsapp: string;
  whatsappLink: string;
  email: string;
  sanctumCity: string;
  address: string;
  operatingHours: string;
}

export interface SocialLinksConfig {
  instagram: { name: string; url: string; handle: string; enabled: boolean };
  youtube: { name: string; url: string; embedUrl?: string; handle: string; enabled: boolean };
  facebook: { name: string; url: string; handle: string; enabled: boolean };
}

export interface HeroBannerConfig {
  badgeText: string;
  headline: string;
  subheadline: string;
  experienceYears: string;
  consultationsCount: string;
  announcementText?: string;
  announcementLink?: string;
  announcementEnabled: boolean;
}

export interface ReviewItem {
  id: string;
  clientName: string;
  city: string;
  service: string;
  stars: number;
  text: string;
  verified: boolean;
  isActive: boolean;
}

export interface ContentStudioData {
  contact: ContactInfoConfig;
  social: SocialLinksConfig;
  hero: HeroBannerConfig;
  faqs: FaqItem[];
  reviews?: ReviewItem[];
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    q: "How does the consultation booking and connection process work?",
    a: `Consultations with Acharya Niraj Kumar follow a simple, transparent, real-world flow: you book and pay the flat consultation fee online → you immediately receive your confirmation on screen and via email containing your official booking reference and direct WhatsApp contact details (+91 93112 15564) → Acharya Niraj Kumar or his sanctum desk coordinates the exact time and connects with you via WhatsApp call or Google Meet, as you prefer or as arranged. Because Acharya Ji consults personally without third-party interns, every session is a genuine 1-on-1 private reading without requiring any complex in-app software or call plugins.`,
    category: "booking",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "faq-2",
    q: "What happens if Acharya Ji is offline or currently in a consultation when I book?",
    a: `Acharya Ji's real-time desk presence (Online, In Session, or Offline) is shown on the consultation page as an honest indicator of how quickly he can connect. Even if he is currently in a session or offline for sacred rituals, you can complete your booking and immediately receive your confirmation with WhatsApp contact details. You can tap the one-touch WhatsApp link to coordinate the next available window, or his sanctum desk will contact your registered phone number to confirm the exact consultation time.`,
    category: "booking",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "faq-3",
    q: "How does consultation booking and fee payment work?",
    a: "Consultations are offered on a transparent flat-fee, pay-per-booking model. For your first Astro consultation, you receive a special promotional flat fee of ₹1,051/- (Regular ₹2,100 — 50% discount). Vaastu Consultations are flat ₹15,000/- (Regular ₹25,000). You simply select your consultation type, provide your intake details, and complete payment directly via UPI to 9311215564@okbizaxis. Upon verification, your booking is confirmed with a direct meeting link and WhatsApp coordination. There are zero surprise per-minute debits or hidden wallet charges.",
    category: "pricing",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "faq-4",
    q: "How accurate is the free Janam Kundli calculator on this website?",
    a: "Our calculator is built on the rigorous Swiss Ephemeris astronomical model and Lahiri (Chitra Paksha) Ayanamsa — the gold standard recognized by Indian Vedic universities. It calculates planetary longitudes, Bhavas, Navamsha, and Vimshottari Mahadasha down to exact degrees and minutes.",
    category: "tools",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "faq-5",
    q: "Are the recommended gemstones genuine and certified?",
    a: "Yes. Every gemstone recommended and shipped by Aapka Astro is 100% natural, unheated, and untreated. Each piece is accompanied by an individual identification certificate from government-recognized gemological testing laboratories (like IGI/GTL) and energized with proper Vedic Prana Pratishtha.",
    category: "gemstones",
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "faq-6",
    q: "Can I consult about Vastu without demolishing my current house structure?",
    a: `Absolutely. Acharya Niraj Kumar specializes in non-demolition Devta Vastu remedies. By utilizing elemental balancing (Pancha Tattva), directional metal tapes, consecrated Vedic yantras, and specific natural remedies, directional defects are balanced effectively without structural damage.`,
    category: "vastu",
    isActive: true,
    sortOrder: 6,
  },
];

export const DEFAULT_CONTENT_STUDIO: ContentStudioData = {
  contact: {
    phone: PLACEHOLDER_CONTACT_INFO.phone,
    phoneRaw: PLACEHOLDER_CONTACT_INFO.phoneRaw,
    whatsapp: PLACEHOLDER_CONTACT_INFO.whatsapp,
    whatsappLink: PLACEHOLDER_CONTACT_INFO.whatsappLink,
    email: PLACEHOLDER_CONTACT_INFO.email,
    sanctumCity: PLACEHOLDER_CONTACT_INFO.sanctumCity,
    address: PLACEHOLDER_CONTACT_INFO.address,
    operatingHours: PLACEHOLDER_CONTACT_INFO.operatingHours,
  },
  social: {
    instagram: {
      name: PLACEHOLDER_SOCIAL_LINKS.instagram.name,
      url: PLACEHOLDER_SOCIAL_LINKS.instagram.url,
      handle: PLACEHOLDER_SOCIAL_LINKS.instagram.handle,
      enabled: true,
    },
    youtube: {
      name: PLACEHOLDER_SOCIAL_LINKS.youtube.name,
      url: PLACEHOLDER_SOCIAL_LINKS.youtube.url,
      embedUrl: PLACEHOLDER_SOCIAL_LINKS.youtube.embedUrl,
      handle: PLACEHOLDER_SOCIAL_LINKS.youtube.handle,
      enabled: true,
    },
    facebook: {
      name: PLACEHOLDER_SOCIAL_LINKS.facebook.name,
      url: PLACEHOLDER_SOCIAL_LINKS.facebook.url,
      handle: PLACEHOLDER_SOCIAL_LINKS.facebook.handle,
      enabled: true,
    },
  },
  hero: {
    badgeText: "20+ Years Mastery • Certified Jyotish Acharya",
    headline: PLACEHOLDER_ASTROLOGER.tagline || "Where Spiritual Science Meets Corporate Insight",
    subheadline: "Deep traditional learning and rare corporate leadership experience. Over two decades of rigorous Vedic practice across 15,000+ chart analyses and non-demolition Devta Vaastu.",
    experienceYears: "20+",
    consultationsCount: "15,000+ Consultations",
    announcementText: "",
    announcementLink: "",
    announcementEnabled: false,
  },
  faqs: DEFAULT_FAQS,
  reviews: PLACEHOLDER_TESTIMONIALS.map((t, idx) => ({
    id: `rev-default-${idx + 1}`,
    clientName: t.clientName,
    city: t.city,
    service: t.service,
    stars: t.stars,
    text: t.text,
    verified: t.verified ?? true,
    isActive: true,
  })),
};

const SINGLETON_ID = "singleton_settings";

export class ContentStudioService {
  /**
   * Fetches full Content Studio data from PostgreSQL.
   * Prioritizes typed ContentEntry tables with fallback to platformSettings and built-in code defaults.
   */
  static async getContent(): Promise<ContentStudioData> {
    try {
      // 1. Attempt to read from typed ContentEntry collections
      if (prisma && prisma.contentEntry) {
        const [faqEntries, contactEntry, socialEntry, heroEntry, testimonialEntries] = await Promise.all([
          ContentModelService.getAllEntries("faqs").catch(() => []),
          ContentModelService.getPublishedEntry("contact", "primary").catch(() => null),
          ContentModelService.getPublishedEntry("social", "primary").catch(() => null),
          ContentModelService.getPublishedEntry("hero", "home-hero").catch(() => null),
          ContentModelService.getAllEntries("testimonials").catch(() => []),
        ]);

        if (faqEntries.length > 0 || contactEntry || socialEntry || heroEntry) {
          const faqs: FaqItem[] = faqEntries.length > 0
            ? faqEntries.map((f) => ({
                id: f.key,
                q: f.data.question || f.dataEn.question || "",
                a: f.data.answer || f.dataEn.answer || "",
                category: f.data.category || f.dataEn.category || "general",
                isActive: f.status === ContentStatus.PUBLISHED,
                sortOrder: f.sortOrder,
              }))
            : DEFAULT_FAQS;

          const contact: ContactInfoConfig = contactEntry
            ? {
                ...DEFAULT_CONTENT_STUDIO.contact,
                ...(contactEntry.data as any),
              }
            : DEFAULT_CONTENT_STUDIO.contact;

          const social: SocialLinksConfig = socialEntry
            ? {
                ...DEFAULT_CONTENT_STUDIO.social,
                ...(socialEntry.data as any),
              }
            : DEFAULT_CONTENT_STUDIO.social;

          const hero: HeroBannerConfig = heroEntry
            ? {
                ...DEFAULT_CONTENT_STUDIO.hero,
                ...(heroEntry.data as any),
              }
            : DEFAULT_CONTENT_STUDIO.hero;

          const reviews: ReviewItem[] = testimonialEntries.length > 0
            ? testimonialEntries.map((t) => ({
                id: t.key,
                clientName: t.data.clientName || t.dataEn.clientName || "",
                city: t.data.city || t.dataEn.city || "",
                service: t.data.service || t.dataEn.service || "",
                stars: t.data.stars || t.dataEn.stars || 5,
                text: t.data.text || t.dataEn.text || "",
                verified: t.data.verified ?? true,
                isActive: t.status === ContentStatus.PUBLISHED,
              }))
            : DEFAULT_CONTENT_STUDIO.reviews!;

          return {
            contact,
            social,
            hero,
            faqs,
            reviews,
            updatedAt: contactEntry?.updatedAt || heroEntry?.updatedAt || new Date().toISOString(),
            updatedBy: contactEntry?.updatedBy || heroEntry?.updatedBy || "system",
          };
        }
      }

      // 2. Fallback to platformSetting
      if (prisma && prisma.platformSetting) {
        const record = await prisma.platformSetting.findUnique({
          where: { id: SINGLETON_ID },
        });

        if (record && record.features) {
          const featuresObj = record.features as Record<string, any>;
          const studio = featuresObj.contentStudio as Partial<ContentStudioData> | undefined;

          if (studio) {
            return {
              contact: {
                ...DEFAULT_CONTENT_STUDIO.contact,
                ...(studio.contact || {}),
              },
              social: {
                ...DEFAULT_CONTENT_STUDIO.social,
                ...(studio.social || {}),
              },
              hero: {
                ...DEFAULT_CONTENT_STUDIO.hero,
                ...(studio.hero || {}),
              },
              faqs: Array.isArray(studio.faqs) && studio.faqs.length > 0 ? studio.faqs : DEFAULT_FAQS,
              reviews: Array.isArray(studio.reviews) && studio.reviews.length > 0 ? studio.reviews : DEFAULT_CONTENT_STUDIO.reviews,
              updatedAt: studio.updatedAt,
              updatedBy: studio.updatedBy,
            };
          }
        }
      }

      return { ...DEFAULT_CONTENT_STUDIO };
    } catch (err) {
      console.error("ContentStudioService.getContent error:", err);
      return { ...DEFAULT_CONTENT_STUDIO };
    }
  }

  /**
   * Updates Content Studio data in PostgreSQL (both ContentEntry and platformSettings),
   * creates ContentRevision snapshots, and records audit logs.
   */
  static async updateContent(
    updates: Partial<ContentStudioData>,
    actorEmail: string
  ): Promise<ContentStudioData> {
    const current = await this.getContent();

    const merged: ContentStudioData = {
      contact: {
        ...current.contact,
        ...(updates.contact || {}),
      },
      social: {
        ...current.social,
        ...(updates.social || {}),
      },
      hero: {
        ...current.hero,
        ...(updates.hero || {}),
      },
      faqs: updates.faqs ? updates.faqs : current.faqs,
      reviews: updates.reviews ? updates.reviews : current.reviews,
      updatedAt: new Date().toISOString(),
      updatedBy: actorEmail,
    };

    // 1. Sync to typed ContentEntry & ContentRevision tables
    try {
      if (prisma && prisma.contentEntry) {
        if (updates.contact) {
          await ContentModelService.saveEntry({
            collection: "contact",
            key: "primary",
            dataEn: merged.contact,
            dataHi: merged.contact,
            actorEmail,
            changeSummary: `Updated contact info by ${actorEmail}`,
          }).catch((e) => console.error("Sync contact to ContentModel failed:", e));
        }

        if (updates.social) {
          await ContentModelService.saveEntry({
            collection: "social",
            key: "primary",
            dataEn: merged.social,
            dataHi: merged.social,
            actorEmail,
            changeSummary: `Updated social channels by ${actorEmail}`,
          }).catch((e) => console.error("Sync social to ContentModel failed:", e));
        }

        if (updates.hero) {
          await ContentModelService.saveEntry({
            collection: "hero",
            key: "home-hero",
            dataEn: merged.hero,
            dataHi: merged.hero,
            actorEmail,
            changeSummary: `Updated hero banner by ${actorEmail}`,
          }).catch((e) => console.error("Sync hero to ContentModel failed:", e));
        }

        if (updates.faqs) {
          const activeKeys = new Set(updates.faqs.map((f) => f.id));
          const existingFaqs = await prisma.contentEntry.findMany({
            where: { collection: "faqs" },
            select: { id: true, key: true },
          });

          for (const ef of existingFaqs) {
            if (!activeKeys.has(ef.key)) {
              await prisma.contentRevision.deleteMany({ where: { contentId: ef.id } }).catch(() => {});
              await prisma.contentEntry.delete({ where: { id: ef.id } }).catch(() => {});
            }
          }

          for (let i = 0; i < merged.faqs.length; i++) {
            const f = merged.faqs[i];
            await ContentModelService.saveEntry({
              collection: "faqs",
              key: f.id,
              dataEn: { question: f.q, answer: f.a, category: f.category || "general" },
              status: f.isActive !== false ? ContentStatus.PUBLISHED : ContentStatus.HIDDEN,
              sortOrder: f.sortOrder || i + 1,
              actorEmail,
              changeSummary: `Synced FAQ ${f.id} by ${actorEmail}`,
            }).catch((e) => console.error(`Sync FAQ ${f.id} to ContentModel failed:`, e));
          }
        }

        if (updates.reviews) {
          for (let i = 0; i < merged.reviews!.length; i++) {
            const r = merged.reviews![i];
            await ContentModelService.saveEntry({
              collection: "testimonials",
              key: r.id,
              dataEn: {
                clientName: r.clientName,
                city: r.city,
                service: r.service,
                stars: r.stars,
                text: r.text,
                verified: r.verified,
              },
              dataHi: {
                clientName: r.clientName,
                city: r.city,
                service: r.service,
                stars: r.stars,
                text: r.text,
                verified: r.verified,
              },
              status: r.isActive !== false ? ContentStatus.PUBLISHED : ContentStatus.HIDDEN,
              sortOrder: i + 1,
              actorEmail,
              changeSummary: `Synced review ${r.id} by ${actorEmail}`,
            }).catch((e) => console.error(`Sync review ${r.id} to ContentModel failed:`, e));
          }
        }
      }
    } catch (modelErr) {
      console.warn("ContentModelService sync warning:", modelErr);
    }

    // 2. Also keep platformSetting updated for redundancy
    if (prisma && prisma.platformSetting) {
      let record = await prisma.platformSetting.findUnique({
        where: { id: SINGLETON_ID },
      });

      const existingFeatures = (record?.features as Record<string, any>) || {};
      const newFeatures = {
        ...existingFeatures,
        contentStudio: merged,
      };

      if (!record) {
        await prisma.platformSetting.create({
          data: {
            id: SINGLETON_ID,
            pricing: {} as any,
            features: newFeatures as any,
          },
        });
      } else {
        await prisma.platformSetting.update({
          where: { id: SINGLETON_ID },
          data: {
            features: newFeatures as any,
          },
        });
      }

      // Record AuditLog
      await AuditLogService.log({
        action: "CONTENT_STUDIO_UPDATED",
        actorEmail,
        targetId: SINGLETON_ID,
        targetType: "PlatformSetting",
        notes: `Updated site content sections: ${Object.keys(updates).join(", ")}`,
      });
    }

    return merged;
  }

  /**
   * Adds a new FAQ item.
   */
  static async addFaq(
    faq: Omit<FaqItem, "id" | "sortOrder">,
    actorEmail: string
  ): Promise<ContentStudioData> {
    const current = await this.getContent();
    const newId = `faq-${Date.now()}`;
    const newFaq: FaqItem = {
      ...faq,
      id: newId,
      sortOrder: (current.faqs.length || 0) + 1,
    };

    return this.updateContent(
      {
        faqs: [newFaq, ...current.faqs],
      },
      actorEmail
    );
  }

  /**
   * Edits an existing FAQ item.
   */
  static async updateFaq(
    id: string,
    patch: Partial<FaqItem>,
    actorEmail: string
  ): Promise<ContentStudioData> {
    const current = await this.getContent();
    const updatedFaqs = current.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f));
    return this.updateContent({ faqs: updatedFaqs }, actorEmail);
  }

  /**
   * Deletes an FAQ item.
   */
  static async deleteFaq(id: string, actorEmail: string): Promise<ContentStudioData> {
    const current = await this.getContent();
    const updatedFaqs = current.faqs.filter((f) => f.id !== id);

    // Also update ContentModel entry status to HIDDEN or delete
    try {
      if (prisma && prisma.contentEntry) {
        await prisma.contentEntry.delete({
          where: { collection_key: { collection: "faqs", key: id } },
        }).catch(async () => {
          // If delete fails due to cascade or non-existence, ignore or set hidden
        });
      }
    } catch {
      // Ignored
    }

    return this.updateContent({ faqs: updatedFaqs }, actorEmail);
  }

  /**
   * Toggles an FAQ item's active status.
   */
  static async toggleFaqActive(id: string, actorEmail: string): Promise<ContentStudioData> {
    const current = await this.getContent();
    const updatedFaqs = current.faqs.map((f) =>
      f.id === id ? { ...f, isActive: !f.isActive } : f
    );
    return this.updateContent({ faqs: updatedFaqs }, actorEmail);
  }
}
