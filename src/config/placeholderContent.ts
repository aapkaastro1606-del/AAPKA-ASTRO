/**
 * ============================================================================
 * PRODUCTION BUSINESS DATA & CONTENT CONFIGURATION
 * ============================================================================
 * Official data migrated and synchronized from https://aapkaastro.com/
 * Features Acharya Niraj Kumar, authentic credentials, certificates,
 * contact details, services, pricing, and visual assets.
 */

export const PLACEHOLDER_ASTROLOGER = {
  rawName: "Niraj Kumar",
  displayName: "Acharya Niraj Kumar",
  experienceYears: "20+",
  experienceText: "20+ Years Mastery • Certified Jyotish Acharya",
  followersCount: "15,000+ Consultations",
  tagline: "Where Spiritual Science Meets Corporate Insight",
  bio: "Aapka Astro is led by Acharya Niraj Kumar, a practitioner who brings together deep traditional learning and rare real-world experience. Raised in the spiritually rich ecosystem of Baidyanath Dham, Deoghar, his journey into astrology and Vastu began early, shaped by both curiosity and disciplined guidance. Over the last two decades, he has studied, practiced, and refined his approach across more than 15,000 chart analyses and numerous Vastu consultations. Trained under Late Guru Shri B. B. Tiwari, he holds a Jyotish Acharya from Bhartiya Vidya Bhawan (K.N. Rao Institute), M.A. in Jyotish (IGNOU, 2024), Nadi Parveen (ICAS), Jyotish Prabhakar under Dr. Pawan Sinha, and Jyotish Visharad & Jyotish Mani (Bharat Jyotish Vidyapith). With over two decades in senior corporate leadership roles including Vice President and Business Head at Reliance Retail, Metro Cash & Carry, and NIF Food, he translates Vedic wisdom and Vastu from theory into actionable life strategy.",
  avatarUrl: "/images/Acharya_Niraj_Kumar.jpg",
  lineage: "Baidyanath Dham, Deoghar • Late Guru Shri B. B. Tiwari • Bhartiya Vidya Bhawan",
  academicQualifications: [
    "B.Sc. (Hons.) in Physics",
    "PGDBM in International Business & Marketing",
    "XLRI Leadership Development & Change Management certification",
  ],
  jyotishCertifications: [
    "Trained under Late Guru Shri B. B. Tiwari",
    "Advanced Vastu certifications from Divya Vastu and Vaastu Just For You",
    "M.A. in Jyotish (IGNOU, 2024)",
    "Jyotish Acharya from Bhartiya Vidya Bhawan (K.N. Rao Institute)",
    "Nadi Parveen (ICAS)",
    "Jyotish Prabhakar (IRIW under Dr. Pawan Sinha)",
    "Jyotish Visharad & Jyotish Mani (Bharat Jyotish Vidyapith)",
  ],
};

// Official Gallery Images & Certificates backed by verified client documents
export const OFFICIAL_GALLERY_IMAGES = [
  {
    src: "/gallery/with_spiritual_guide.jpg",
    alt: "With Spiritual Guide",
    caption: "With his spiritual guide in a traditional ashram setting",
    category: "Heritage",
  },
  {
    src: "/gallery/felicitation_pashupati_award.jpg",
    alt: "Felicitation Plaque Presentation",
    caption: "Felicitation ceremony and plaque presentation with dignitaries",
    category: "Awards",
  },
  {
    src: "/gallery/dignitary_greeting.jpg",
    alt: "Felicitation & Greeting",
    caption: "Receiving floral greeting and felicitation from a dignitary",
    category: "Recognition",
  },
  {
    src: "/gallery/best_astrologer_award.jpg",
    alt: "Best Astrologer Recognition",
    caption: "Best Astrologer recognition certificate presented at a public astrology conclave",
    category: "Awards",
  },
  {
    src: "/gallery/Jyotish_Acharya_Certificate.png",
    alt: "Jyotish Acharya Certificate",
    caption: "Jyotish Acharya — Institute of Astrology, Bharatiya Vidya Bhawan, New Delhi (Roll No. OH21011)",
    category: "Credentials",
  },
  {
    src: "/gallery/Vastu_Expert_Certificate.png",
    alt: "Logical Vastu Expert Certificate",
    caption: "Logical Vastu™ Expert — DivyVastu (Alchemy Vastu Pvt. Ltd., ISO 9001:2015 certified)",
    category: "Credentials",
  },
];

// Two Flat-Fee Pay-Per-Booking Consultation Products (mirroring Viar one-time checkout pattern)
export interface ConsultationProductConfig {
  id: "astro" | "vaastu";
  name: string;
  tagline: string;
  badge: string;
  standardPrice: number;
  promoPrice: number;
  firstTimeOnly: boolean;
  currency: string;
  description: string;
  deliverables: string[];
  formats: string[];
}

export const CONSULTATION_PRODUCTS: Record<"astro" | "vaastu", ConsultationProductConfig> = {
  astro: {
    id: "astro",
    name: "Astro Consultation",
    tagline: "Comprehensive 1-on-1 Personal Vedic Jyotish Consultation",
    badge: "50% Off First Consultation",
    standardPrice: 2100,
    promoPrice: 1051,
    firstTimeOnly: true, // Gated per user ID server-side, one-time only
    currency: "₹",
    description: "Detailed birth chart examination, planetary transits, dasha analysis, and customized Vedic remedies with Acharya Abhishek Bhardwaj.",
    deliverables: [
      "Full Janam Kundli & D10/D9 chart analysis",
      "Career, business, marriage, and health predictions",
      "Dasha timeline & current Sade Sati/Rahu impacts",
      "Non-destructive remedial guidance & mantras",
    ],
    formats: ["Voice Call", "Video Call", "Live Chat"],
  },
  vaastu: {
    id: "vaastu",
    name: "Vaastu Consultation",
    tagline: "Authentic Devta Vaastu Architectural & Spatial Energy Alignment",
    badge: "Standing Offer: Flat ₹10,000 Off",
    standardPrice: 25000,
    promoPrice: 15000,
    firstTimeOnly: false, // Standing price for everyone, NOT gated by first-time check
    currency: "₹",
    description: "In-depth spatial and architectural evaluation of your residence, commercial office, or industrial site according to classical Devta Vaastu sans demolition.",
    deliverables: [
      "16-zone directional energy mapping",
      "Entrance, kitchen, bedroom, and workspace layout analysis",
      "Elemental balancing (Earth, Water, Fire, Air, Space)",
      "Zero-demolition remedial treatments & energy stabilizers",
    ],
    formats: ["Video Call (Floorplan Review)", "Voice Call", "Digital Report Consultation"],
  },
};

// Flat-Fee Pay-Per-Booking Consultation Configuration (Source of Truth: Confirmed Promotional Creative)
export interface FlatConsultationPricing {
  standardFee: number;
  firstConsultationFee: number;
  currency: string;
  discountAmount: number;
  discountPercentage: number;
  includedTopics: string[];
  formats: Array<"Voice Call" | "Video Call" | "Live Chat">;
}

export const FLAT_CONSULTATION_PRICING: FlatConsultationPricing = {
  standardFee: 2100,
  firstConsultationFee: 1051,
  currency: "₹",
  discountAmount: 1049,
  discountPercentage: 50,
  includedTopics: [
    "Career Insights & Professional Direction",
    "Financial Growth & Prosperity Roadmaps",
    "Relationship Harmony & Marriage Compatibility",
    "Health & Well-being Astrological Diagnostics",
    "Non-Destructive Vedic & Vastu Remedies",
  ],
  formats: ["Voice Call", "Video Call", "Live Chat"],
};

export const FIRST_CONSULTATION_OFFER = {
  standardFee: 2100,
  promotionalFee: 1051,
  discountPercentage: 50,
  code: "FIRST1051",
  promoCode: "FIRST1051",
  description: "Astro Consultation: Flat ₹1,051/- for first consultation (Regular ₹2,100)",
};

// Kundli Full PDF Report Product (₹501 One-Time Download)
export const KUNDLI_PDF_PRODUCT = {
  id: "kundli_pdf",
  name: "Kundli Full PDF Report",
  price: 501,
  currency: "₹",
  tagline: "Downloadable, formatted printable Vedic Horoscope Dossier",
  deliverables: [
    "High-resolution D1 Lagna & D9 Navamsha charts formatted for clean printing",
    "Planetary longitudes, avasthas, degrees & dignity matrix (exalted/debilitated)",
    "4-tier Vimshottari Dasha timeline (Mahadasha to Sookshmadasha)",
    "Classical dosha diagnosis (Manglik, Shani Sade Sati, Kaal Sarp, Pitra Dosha)",
    "Personalized gemstone, favorable color, number, and Vedic lifestyle remedies",
  ],
};

// Legacy compatibility shim for transitioned components
export interface PricingTier {
  type: "chat" | "voice" | "video";
  label: string;
  ratePerMinute: number;
  flatFee: number;
  standardFee: number;
  currency: string;
  discountPercentage: number;
  effectiveFirstTimeRate: number;
  unit: string;
}

export const ADMIN_CONFIGURABLE_PRICING: Record<"chat" | "voice" | "video", PricingTier> = {
  chat: {
    type: "chat",
    label: "Live Chat Consultation",
    ratePerMinute: 15,
    flatFee: 1051,
    standardFee: 2100,
    currency: "₹",
    discountPercentage: 50,
    effectiveFirstTimeRate: 1051, // Flat ₹1,051 first-time promotional fee
    unit: "session",
  },
  voice: {
    type: "voice",
    label: "Voice Call Consultation",
    ratePerMinute: 20,
    flatFee: 1051,
    standardFee: 2100,
    currency: "₹",
    discountPercentage: 50,
    effectiveFirstTimeRate: 1051, // Flat ₹1,051 first-time promotional fee
    unit: "session",
  },
  video: {
    type: "video",
    label: "Video Call Consultation",
    ratePerMinute: 25,
    flatFee: 1051,
    standardFee: 2100,
    currency: "₹",
    discountPercentage: 50,
    effectiveFirstTimeRate: 1051, // Flat ₹1,051 first-time promotional fee
    unit: "session",
  },
};

// Core services
export const CORE_SERVICES = [
  {
    id: "kundli",
    title: "Kundli & Horoscope Reading",
    hindi: "जन्म कुण्डली एवं फलित ज्योतिष",
    description: "Deep insights into your life path, career, and relationships based on your birth chart with ancient mathematical calculations.",
    highlights: [
      "Lagna & planetary degrees calculation",
      "Vimshottari Dasha timing & life roadmap",
      "Manglik, Sade Sati & Kaal Sarp analysis",
    ],
    href: "/kundli",
  },
  {
    id: "vastu",
    title: "Vastu Consultancy",
    hindi: "वैदिक वास्तु परामर्श (देवता व ऊर्जा वास्तु)",
    description: "Precision Devta Vastu, Energy Vastu, and AstroVastu using non-destructive, non-demolition scientific remedies.",
    highlights: [
      "Micro-zoning & 45 Devta energy flow alignment",
      "Zero-demolition elemental metallic & pyramid corrections",
      "Residential, corporate headquarters & industrial audits",
    ],
    href: "/vastu",
  },
  {
    id: "gemstone",
    title: "Gemstone Recommendation",
    hindi: "रत्न परामर्श एवं प्राण-प्रतिष्ठा",
    description: "Find the authentic gemstone to balance your planetary energies, strengthen beneficial planets, and bring harmony.",
    highlights: [
      "Govt.-certified 100% natural unheated stones",
      "Individualized Vedic consecration (Prana Pratishtha)",
      "Wearing rules, metal choice & muhurat timing",
    ],
    href: "/gemstones",
  },
  {
    id: "live-consultation",
    title: "Live 1-on-1 Consultation",
    hindi: "सीधा व्यक्तिगत परामर्श",
    description: "Real-time chat, voice, or video sessions covering Kundli, Vastu, and Gemstones directly with Acharya Niraj Kumar.",
    highlights: [
      "Direct 1-on-1 private encrypted connection",
      "Audio, video, or real-time text chat",
      "Second-by-second billing with 50% off first session",
    ],
    href: "/consult",
  },
];

// Verified Client Testimonials from https://aapkaastro.com/
export const PLACEHOLDER_TESTIMONIALS = [
  {
    id: "test-1",
    clientName: "Priya Sharma",
    city: "Entrepreneur, New Delhi",
    service: "Kundli & Vastu Suggestions",
    stars: 5,
    text: "I was going through a very tough phase in my career and personal life. The Kundli reading and Vastu suggestions from Aapka Astro were incredibly accurate. Within a few months of following their remedies, I saw a massive positive shift. Highly recommended!",
    verified: true,
  },
  {
    id: "test-2",
    clientName: "Vikramaditya Singhal",
    city: "Managing Director, Gurgaon",
    service: "Commercial Vastu Consultancy",
    stars: 5,
    text: "What makes Niraj Kumar uniquely effective is his logical, scientific approach to Vastu. He understood our layout bottlenecks immediately and applied micro-zone corrections without breaking a single wall. Productivity and flow improved remarkably.",
    verified: true,
  },
  {
    id: "test-3",
    clientName: "Ananya Deshmukh",
    city: "Senior Architect, Mumbai",
    service: "AstroVastu & Residential Audit",
    stars: 5,
    text: "Niraj Kumar's expertise in Logical Vastu and Astro Vastu goes far beyond conventional directional advice. Grounded in pure calculation and space balancing, zero superstition. Truly insightful guidance.",
    verified: true,
  },
  {
    id: "test-4",
    clientName: "Siddharth Malhotra",
    city: "Tech Founder, Bengaluru",
    service: "Career Guidance & Dasha Analysis",
    stars: 5,
    text: "Had a 45-minute live consultation regarding career expansion and investment timing. The planetary Dasha roadmap Acharya Ji predicted materialized precisely. Transparent, calm, and reassuring.",
    verified: true,
  },
  {
    id: "test-5",
    clientName: "Sunita Agarwal",
    city: "Jaipur, Rajasthan",
    service: "Kundli Reading & Gemstones",
    stars: 5,
    text: "The 50% first-session discount made it effortless to connect. The natural Yellow Sapphire prescribed with consecration brought immense mental peace and clarity to our family.",
    verified: true,
  },
];

// Official Contact & Sanctum Information from https://aapkaastro.com/
export const PLACEHOLDER_CONTACT_INFO = {
  email: "ask@aapkaastro.com",
  phone: "+91 931-121-5564",
  phoneRaw: "+919311215564",
  whatsapp: "+91 93112 15564",
  whatsappLink: "https://wa.me/919311215564",
  sanctumCity: "Unit No. A-1212 D, Tower A, Spectrum@Metro Phase 1, Sector 75, Noida, G.B. Nagar - U.P. 201301",
  address: "Unit No. A-1212 D, Tower A, Spectrum@Metro Phase 1, Sector 75, Noida, G.B. Nagar - U.P. 201301",
  operatingHours: "Monday – Sunday: 7:00 AM – 11:00 PM IST",
};

// Official Social Media Handles from https://aapkaastro.com/
export const PLACEHOLDER_SOCIAL_LINKS = {
  instagram: {
    name: "Instagram",
    url: "https://www.instagram.com/aapkaastrologer/",
    handle: "@aapkaastrologer",
  },
  youtube: {
    name: "YouTube",
    url: "https://www.youtube.com/@aapkaastro7900",
    embedUrl: "https://www.youtube.com/embed/hibDdoH5kbQ?si=1fp_acyv9bs01pLm",
    handle: "@aapkaastro7900",
  },
  facebook: {
    name: "Facebook",
    url: "https://www.facebook.com/aapkaastro",
    handle: "@aapkaastro",
  },
};

