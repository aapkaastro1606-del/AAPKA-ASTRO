import { z } from "zod";

export const FaqContentSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  answer: z.string().min(1, "Answer cannot be empty"),
  category: z.string().default("general"),
});

export const ContactContentSchema = z.object({
  phone: z.string().default("+91 931-121-5564"),
  phoneRaw: z.string().default("+919311215564"),
  whatsapp: z.string().default("+91 93112 15564"),
  whatsappLink: z.string().default("https://wa.me/919311215564"),
  email: z.string().email().default("contact@aapkaastro.com"),
  sanctumCity: z.string().default("Noida, G.B. Nagar - U.P. 201301"),
  address: z.string().default("Unit No. A-1212 D, Tower A, Spectrum@Metro Phase 1, Sector 75, Noida, G.B. Nagar - U.P. 201301"),
  operatingHours: z.string().default("Monday – Sunday: 7:00 AM – 11:00 PM IST"),
  footerTagline: z.string().default("Where Spiritual Science Meets Corporate Insight"),
});

export const SocialPlatformSchema = z.object({
  name: z.string(),
  url: z.string(),
  handle: z.string(),
  enabled: z.boolean().default(true),
  embedUrl: z.string().optional(),
});

export const SocialContentSchema = z.object({
  instagram: SocialPlatformSchema,
  youtube: SocialPlatformSchema,
  facebook: SocialPlatformSchema,
  linkedin: SocialPlatformSchema.optional(),
});

export const HeroContentSchema = z.object({
  badgeText: z.string().default("20+ Years Mastery • Certified Jyotish Acharya"),
  headline: z.string().default("Where Spiritual Science Meets Corporate Insight"),
  subheadline: z.string().default("Deep traditional learning and rare corporate leadership experience across 15,000+ chart analyses."),
  experienceYears: z.string().default("20+"),
  consultationsCount: z.string().default("15,000+ Consultations"),
  ctaConsult: z.string().default("Consult Acharya Ji Live"),
  ctaKundli: z.string().default("Free Janam Kundli"),
  announcementText: z.string().optional().default(""),
  announcementLink: z.string().optional().default(""),
  announcementEnabled: z.boolean().optional().default(false),
});

export const TestimonialContentSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  city: z.string().default("India"),
  service: z.string().default("Vedic Consultation"),
  stars: z.number().int().min(1).max(5).default(5),
  text: z.string().min(1, "Review text cannot be empty"),
  date: z.string().optional(),
  consentNote: z.string().min(1, "A verified seeker consent note is required before publication"),
  verified: z.boolean().default(true),
});

export const ServiceContentSchema = z.object({
  title: z.string().min(1, "Service title is required"),
  description: z.string().min(1, "Description is required"),
  highlights: z.array(z.string()).default([]),
  href: z.string().default("/consult"),
  image: z.string().optional(),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const HeroCarouselItemSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  caption: z.string().default(""),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const TrustMetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.string().min(1, "Metric value is required"),
  warningAcknowledged: z.boolean().default(true),
});

export const AboutSectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  body: z.string().min(1, "Section body is required"),
});

export const CredentialItemSchema = z.object({
  title: z.string().min(1, "Credential title is required"),
  issuer: z.string().min(1, "Issuer is required"),
  year: z.string().default(""),
  certificateImage: z.string().optional().default(""),
});

export const PhotoGalleryItemSchema = z.object({
  imageUrl: z.string().min(1, "Gallery image URL is required"),
  caption: z.string().default(""),
});

export const PopupConfigSchema = z.object({
  type: z.enum(["welcome", "festival"]),
  headline: z.string().min(1, "Headline is required"),
  text: z.string().default(""),
  image: z.string().optional().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  enabled: z.boolean().default(true),
});

export const LegalPageSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  title: z.string().min(1, "Page title is required"),
  content: z.string().min(1, "Legal text content is required"),
  pendingLawyerReview: z.boolean().default(true),
  lastUpdated: z.string().default(""),
});

export const GenericContentSchema = z.record(z.string(), z.any());

export const COLLECTION_SCHEMAS: Record<string, z.ZodType<any>> = {
  faqs: FaqContentSchema,
  contact: ContactContentSchema,
  social: SocialContentSchema,
  hero: HeroContentSchema,
  testimonials: TestimonialContentSchema,
  services: ServiceContentSchema,
  heroCarousel: HeroCarouselItemSchema,
  trustMetrics: TrustMetricSchema,
  aboutSections: AboutSectionSchema,
  credentials: CredentialItemSchema,
  gallery: PhotoGalleryItemSchema,
  popups: PopupConfigSchema,
  legal: LegalPageSchema,
};

/**
 * Validates data payload for a collection against its designated schema.
 */
export function validateCollectionData(collection: string, data: any): { valid: boolean; data?: any; error?: string } {
  const schema = COLLECTION_SCHEMAS[collection] || GenericContentSchema;
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    };
  }
  return { valid: true, data: result.data };
}

