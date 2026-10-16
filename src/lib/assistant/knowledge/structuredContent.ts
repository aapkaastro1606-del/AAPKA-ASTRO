/**
 * ============================================================================
 * AAPKA ASTRO — STRUCTURED GROUNDED CONTENT KNOWLEDGE BASE
 * ============================================================================
 * Structured content extracted directly from verified site pages, policies,
 * and service records.
 * Rules:
 * 1. Single source of truth for static site facts.
 * 2. Prices are NOT hardcoded here; they are injected dynamically from
 *    PlatformSettingsService at request time.
 * 3. Never invent facts, credentials, dates, discounts, or policies.
 */

export interface KnowledgeSection {
  id: string;
  category: "services" | "about" | "faq" | "legal" | "tools" | "contact";
  title: string;
  keywords: string[];
  content: string;
}

export const STRUCTURED_SITE_KNOWLEDGE: KnowledgeSection[] = [
  // --------------------------------------------------------------------------
  // 1. SERVICES
  // --------------------------------------------------------------------------
  {
    id: "service-astro-consultation",
    category: "services",
    title: "Vedic Astro Consultation (1-on-1)",
    keywords: [
      "astro", "astrology", "consultation", "jyotish", "1-on-1", "acharya", "niraj", "kumar",
      "birth chart", "janam kundli", "d9", "navamsha", "d10", "dashamsha", "remedies",
      "career", "marriage", "finance", "health", "call", "video", "chat", "whatsapp", "meet"
    ],
    content: `Vedic Astro Consultation is a comprehensive 1-on-1 personal session directly with Acharya Niraj Kumar.
Formats available: Voice Call, Video Call, or Live Chat via WhatsApp Call or Google Meet.
Deliverables:
- Deep examination of D1 Janam Kundli, D9 Navamsha, and D10 Dashamsha divisional charts.
- Vimshottari Dasha timeline calculation, planetary transits (Gochar), and Sade Sati analysis.
- Specific guidance on career growth, business strategy, marriage timing & marital harmony, finances, and personal wellness.
- Practical, non-destructive Vedic remedies: personalized Vedic stotras, mantra japa, and behavioral lifestyle adjustments.
- How to book: Select service on /consult, choose an available date and time slot, pay via direct UPI, and receive session confirmation.`
  },
  {
    id: "service-vaastu-consultation",
    category: "services",
    title: "Devta Vaastu Consultation (Zero Demolition)",
    keywords: [
      "vaastu", "vastu", "devta", "energy", "zones", "16 zones", "demolition", "zero demolition",
      "home", "office", "factory", "architectural", "floorplan", "pancha tattva", "remedies"
    ],
    content: `Devta Vaastu Consultation is an architectural and spatial energy evaluation of residential homes, corporate offices, or factories using authentic 16-zone Devta Vaastu principles without any structural demolition.
Deliverables:
- 16-zone directional energy mapping based on the building's exact cardinal orientation.
- Strategic audit of main entrance, kitchen (Agni zone), master bedroom, puja room, and executive workspace.
- Balancing of the Pancha Tattva (Five Elements: Earth, Water, Fire, Air, Space).
- Zero-demolition remedial treatments: metallic tapes, pyramid energy balancers, directional colors, and elemental corrections.`
  },
  {
    id: "service-kundli-pdf",
    category: "services",
    title: "Full Janam Kundli PDF Dossier",
    keywords: [
      "kundli pdf", "report", "download", "dossier", "printable", "charts", "dasha", "dosha"
    ],
    content: `The Full Janam Kundli PDF Report is a comprehensive, high-resolution astrological dossier available for instant digital download.
Deliverables:
- Clear D1 Lagna and D9 Navamsha charts calculated with high precision.
- Complete planetary matrix: longitudes, nakshatras, padas, avasthas, and dignity scores.
- Detailed 4-tier Vimshottari Dasha calculation (Mahadasha, Antardasha, Pratyantardasha).
- Diagnostic analysis of major planetary yogas and doshas (Manglik, Kaal Sarp, Sade Sati, Pitra Dosha).`
  },
  {
    id: "service-gemstones",
    category: "services",
    title: "Certified Natural Vedic Gemstones",
    keywords: [
      "gemstone", "gemstones", "ratna", "pukhraj", "manik", "neelam", "panna", "moti",
      "certified", "natural", "prana pratishtha", "lab certificate"
    ],
    content: `Certified Vedic Gemstones provided by Aapka Astro are 100% natural, unheated, and untreated gemstones, each accompanied by an authenticity certificate from a recognized gemological laboratory.
Key features:
- Prescribed strictly according to individual birth chart yogakaraka planets and auspicious houses.
- Individualized Vedic consecration (Prana Pratishtha) performed under favorable planetary hora/muhurat before dispatch.
- Detailed wearing guidelines regarding ideal metal (gold/silver/panchdhatu), finger placement, and consecration mantras.`
  },

  // --------------------------------------------------------------------------
  // 2. ABOUT ACHARYA NIRAJ KUMAR
  // --------------------------------------------------------------------------
  {
    id: "about-acharya-niraj-kumar",
    category: "about",
    title: "Acharya Niraj Kumar Credentials & Lineage",
    keywords: [
      "acharya", "niraj", "kumar", "credentials", "qualifications", "lineage", "guru",
      "tiwari", "baidyanath dham", "deoghar", "bhartiya vidya bhawan", "kn rao", "ignou",
      "icas", "corporate", "reliance", "metro", "vice president"
    ],
    content: `Acharya Niraj Kumar is the founder and principal consultant of Aapka Astro with over 20 years of classical Vedic mastery and more than 15,000 personal chart consultations.
Lineage & Mentorship:
- Native of the holy spiritual seat of Baidyanath Dham (Deoghar).
- Traditional discipleship under Late Guru Shri B. B. Tiwari.
Academic & Astrological Credentials:
- Jyotish Acharya from Bharatiya Vidya Bhawan (Institute of Astrology, New Delhi - K.N. Rao Institute).
- Master of Arts (M.A.) in Jyotish from IGNOU (2024).
- Nadi Parveen from the Indian Council of Astrological Sciences (ICAS).
- Certified Logical Vastu™ Expert from DivyVastu (ISO 9001:2015 certified).
- B.Sc. (Hons.) in Physics and PGDBM in International Business.
Executive Leadership Experience:
- Former Vice President & Business Head at Reliance Retail and Metro Cash & Carry.
- Uniquely bridges traditional spiritual wisdom with analytical corporate strategy.`
  },

  // --------------------------------------------------------------------------
  // 3. FAQ & HOW TO BOOK
  // --------------------------------------------------------------------------
  {
    id: "faq-booking-process",
    category: "faq",
    title: "How to Book a Consultation & Platform Format",
    keywords: [
      "book", "booking", "process", "how to book", "step", "appointment", "schedule",
      "whatsapp call", "google meet", "platform"
    ],
    content: `How to book an appointment on Aapka Astro:
1. Visit the booking page at /consult.
2. Select your consultation type (Vedic Astro Consultation or Devta Vaastu).
3. Pick your preferred date and time slot.
4. Enter your birth details (Date, Exact Time, Place of Birth) on the secure booking form.
5. Complete payment via direct UPI to 9311215564@okbizaxis.
6. Share your payment reference/screenshot on WhatsApp (+91 93112 15564).
7. Receive your session link (WhatsApp Call or Google Meet) and join at the scheduled time.`
  },
  {
    id: "faq-payment-wallet-policy",
    category: "faq",
    title: "Payment Method & Zero-Wallet Policy",
    keywords: [
      "payment", "upi", "pay", "google pay", "gpay", "phonepe", "paytm", "bhim",
      "wallet", "recharge", "coin", "tokens", "coins", "balance"
    ],
    content: `Aapka Astro operates exclusively on a direct Pay-Per-Booking model:
- Payment is made via direct UPI to 9311215564@okbizaxis (Payee: Aapka Astro).
- We support all UPI apps: Google Pay, PhonePe, Paytm, BHIM, and bank UPI apps.
- Zero Wallet Coins / Recharges: Aapka Astro DOES NOT use a wallet coin system, minute balances, or forced wallet recharges. You only pay transparently for the service you book.`
  },
  {
    id: "faq-free-online-tools",
    category: "tools",
    title: "Free Astrological Calculators & Tools",
    keywords: [
      "free", "calculator", "calculators", "tools", "kundli generator", "kundli matching",
      "milan", "36 guna", "panchang", "horoscope", "rashifal", "zodiac"
    ],
    content: `Aapka Astro provides a suite of 100% free online Vedic tools:
- Free Janam Kundli Generator (/kundli-generator): Instant planetary positions and chart wheel.
- Kundli Milan / 36 Guna Matching (/kundli-matching): Marriage compatibility scoring.
- Daily Hindu Panchang (/panchang) & Tomorrow's Panchang (/panchang/tomorrow): Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, and Shubh Muhurat.
- Daily Rashifal / Horoscope (/horoscope): Daily Vedic forecasts for all 12 moon signs.
- Free Calculators: Moon Sign (/moon-sign-calculator), Sun Sign (/sun-sign-calculator), Numerology (/numerology-calculator), Love Compatibility (/love-calculator), and 12 Zodiac Signs Guide (/zodiac-signs).`
  },

  // --------------------------------------------------------------------------
  // 4. POLICIES & REFUNDS
  // --------------------------------------------------------------------------
  {
    id: "legal-refund-cancellation",
    category: "legal",
    title: "Refund, Cancellation & Rescheduling Policy",
    keywords: [
      "refund", "cancellation", "cancel", "reschedule", "rescheduling", "policy", "money back",
      "missed", "guarantee"
    ],
    content: `Aapka Astro's official Refund and Cancellation Policy:
- Missed by Astrologer: If Acharya Niraj Kumar is unable to attend the scheduled consultation, a 100% full refund is credited back to your original bank account within 2-3 business days.
- Free Rescheduling: You may reschedule your session for free with at least 2 hours prior notice via WhatsApp (+91 93112 15564).
- Prior Cancellation: Cancellations requested at least 2 hours prior to the slot are eligible for a full refund.
- Concluded Sessions: Once a 1-on-1 consultation has concluded, no refunds are issued as professional time has been rendered.`
  },
  {
    id: "legal-privacy-confidentiality",
    category: "legal",
    title: "Confidentiality & Privacy Policy",
    keywords: [
      "privacy", "confidential", "confidentiality", "data", "birth details", "safe", "security"
    ],
    content: `All birth details, astrological charts, consultation transcripts, and personal queries are held in strict 100% confidence.
Aapka Astro never sells, rents, or shares your personal information or birth coordinates with third-party advertisers or external platforms.`
  },

  // --------------------------------------------------------------------------
  // 5. CONTACT & SANCTUM
  // --------------------------------------------------------------------------
  {
    id: "contact-information",
    category: "contact",
    title: "Contact Information, Office Address & Operating Hours",
    keywords: [
      "contact", "phone", "whatsapp", "email", "address", "location", "hours", "office", "timing"
    ],
    content: `Official Contact Details:
- WhatsApp / Phone: +91 93112 15564 (Direct link: https://wa.me/919311215564)
- Email: aapkaastro1606@gmail.com
- Office Sanctum: Unit No. A-1212 D, Tower A, Spectrum@Metro Phase 1, Sector 75, Noida, Gautam Buddha Nagar, U.P. 201301.
- Consultation Operating Hours: Monday to Sunday: 7:00 AM – 11:00 PM IST.`
  }
];
