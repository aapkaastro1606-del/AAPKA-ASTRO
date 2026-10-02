/**
 * Sister Ecosystem Services Configuration
 * Centralized configuration for cross-promotion across Aapka Astro and its verified active sister initiatives.
 *
 * NOTE: Dow Consulting (dowconsulting.in) is deliberately omitted until that site is live.
 */

export interface SisterService {
  id: string;
  name: string;
  fullName: string;
  domain: string;
  url: string;
  badge: string;
  category: string;
  tagline: string;
  description: string;
  ctaText: string;
  targetAudience: string;
  highlights: string[];
}

export const SISTER_SERVICES: Record<"viar", SisterService> = {
  viar: {
    id: "viar",
    name: "Viar.in",
    fullName: "Vihangam Institute of Astrology and Research",
    domain: "viar.in",
    url: "https://viar.in",
    badge: "Sister Institute & Academy",
    category: "Vedic Astrology Education",
    tagline: "Learn Authentic Vedic Astrology Directly from Acharya Niraj Kumar",
    description:
      "For seekers, enthusiasts, and aspiring astrologers who want to learn astrology themselves. Vihangam Institute provides systematic, cohort-based training in classical Parashari Jyotish, astronomical ephemeris calculation, and chart synthesis without superstition.",
    ctaText: "Explore Courses at Viar.in",
    targetAudience: "Students & Aspiring Astrologers",
    highlights: [
      "18 Live Interactive Classes per Cohort (with Recordings)",
      "Authentic Classical Parashari & Jaimini Curriculum",
      "Verifiable Course Completion Certification",
      "Taught Personally by Acharya Niraj Kumar",
    ],
  },
};
