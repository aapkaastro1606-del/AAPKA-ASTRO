/**
 * ============================================================================
 * AAPKA ASTRO — AUTHORITATIVE AI ASSISTANT GROUNDED KNOWLEDGE BASE
 * ============================================================================
 * Source of Truth for all assistant responses. Contains official pricing,
 * credentials, services, policies, and contact information.
 * Rule: A confident wrong answer is worse than "I don't know".
 */

export interface ServiceDetail {
  id: string;
  name: string;
  hindiName: string;
  standardPrice: number;
  promoPrice: number;
  discountNote: string;
  currency: string;
  duration?: string;
  formats: string[];
  description: string;
  deliverables: string[];
  bookingUrl: string;
}

export const ASSISTANT_KNOWLEDGE = {
  brand: {
    name: "Aapka Astro",
    tagline: "Where Spiritual Science Meets Corporate Insight",
    founder: "Acharya Niraj Kumar",
    lineage: "Baidyanath Dham, Deoghar • Late Guru Shri B. B. Tiwari • Bhartiya Vidya Bhawan (K.N. Rao Institute)",
    websiteUrl: "https://www.aapkaastro.com",
    establishedExperience: "20+ Years Mastery • 15,000+ Chart Consultations",
  },

  acharya: {
    name: "Acharya Niraj Kumar",
    title: "Senior Jyotish Acharya & Vastu Specialist",
    summary:
      "Acharya Niraj Kumar has over two decades of traditional Vedic practice and senior corporate leadership. Born and raised in Baidyanath Dham (Deoghar), he trained under Late Guru Shri B. B. Tiwari. He holds a Jyotish Acharya from Bharatiya Vidya Bhawan (K.N. Rao Institute), M.A. in Jyotish from IGNOU (2024), Nadi Parveen from ICAS, and certifications from Dr. Pawan Sinha's institute and DivyVastu. He has also served as Vice President and Business Head at Reliance Retail and Metro Cash & Carry, combining deep Vedic astrology with logical, real-world strategic decision making.",
    qualifications: [
      "Jyotish Acharya — Bharatiya Vidya Bhawan (Institute of Astrology, New Delhi)",
      "M.A. in Jyotish (IGNOU, 2024)",
      "Nadi Parveen — Indian Council of Astrological Sciences (ICAS)",
      "Jyotish Prabhakar — IRIW under Dr. Pawan Sinha",
      "Jyotish Visharad & Jyotish Mani — Bharat Jyotish Vidyapith",
      "Logical Vastu™ Expert — DivyVastu (ISO 9001:2015 certified)",
      "B.Sc. (Hons.) in Physics & PGDBM in International Business",
      "XLRI Leadership Development Certification",
    ],
    experienceConsultations: "15,000+ birth charts analyzed over 20+ years",
  },

  pricingAndServices: {
    astro: {
      id: "astro",
      name: "Vedic Astro Consultation",
      hindiName: "वैदिक ज्योतिष परामर्श (1-on-1)",
      standardPrice: 2100,
      promoPrice: 1051,
      discountNote: "50% Off First Consultation (Flat ₹1,051/- with code FIRST1051, Regular ₹2,100)",
      currency: "₹",
      formats: ["Voice Call", "Video Call", "Live Chat"],
      description: "Direct 1-on-1 comprehensive personal Vedic Jyotish consultation with Acharya Niraj Kumar via WhatsApp Call or Google Meet.",
      deliverables: [
        "Full Janam Kundli, D9 Navamsha, and D10 Dashamsha analysis",
        "Career, business, marriage, relationship, finance, and health guidance",
        "Vimshottari Dasha timeline & transit analysis (Sade Sati, Rahu/Ketu transits)",
        "Non-destructive Vedic remedies, stotras, and personalized lifestyle adjustments",
      ],
      bookingUrl: "/consult?product=astro&offer=FIRST1051",
    } as ServiceDetail,

    vaastu: {
      id: "vaastu",
      name: "Devta Vaastu Consultation",
      hindiName: "वैदिक एवं देवता वास्तु परामर्श",
      standardPrice: 25000,
      promoPrice: 15000,
      discountNote: "Flat ₹10,000 Off Standing Offer (Now ₹15,000/- for all seekers, Regular ₹25,000)",
      currency: "₹",
      formats: ["Video Call (Floorplan Review)", "Voice Call", "Digital Audit Report"],
      description: "In-depth spatial and architectural evaluation of your residence, commercial office, or factory layout using classical 16-zone Devta Vaastu sans demolition.",
      deliverables: [
        "16-zone directional micro-energy mapping",
        "Entrance, master bedroom, kitchen, puja room, and workspace layout audit",
        "Elemental balance (Pancha Tattva: Earth, Water, Fire, Air, Space)",
        "Zero-demolition elemental remedies (pyramids, metallic tapes, color corrections)",
      ],
      bookingUrl: "/consult?product=vaastu",
    } as ServiceDetail,

    kundliPdf: {
      id: "kundli_pdf",
      name: "Kundli Full PDF Report",
      hindiName: "विस्तृत जन्म कुंडली PDF रिपोर्ट",
      standardPrice: 501,
      promoPrice: 501,
      discountNote: "Flat ₹501/- One-Time Printable Report",
      currency: "₹",
      formats: ["Instant Downloadable PDF"],
      description: "High-resolution downloadable, printable Vedic Horoscope Dossier.",
      deliverables: [
        "High-res D1 Lagna and D9 Navamsha charts",
        "Planetary longitudes, degrees, avasthas, and dignity matrix",
        "4-tier Vimshottari Dasha timeline",
        "Dosha diagnosis (Manglik, Sade Sati, Kaal Sarp, Pitra Dosha)",
      ],
      bookingUrl: "/kundli-generator",
    } as ServiceDetail,

    gemstones: {
      id: "gemstones",
      name: "Certified Vedic Gemstones",
      hindiName: "प्रमाणित प्राकृतिक रत्न (प्राण-प्रतिष्ठित)",
      standardPrice: 0, // Varies by carat and gem
      promoPrice: 0,
      discountNote: "Price varies by natural gemstone carat weight and lab certification",
      currency: "₹",
      formats: ["Govt. Lab Certified Gemstones delivered with Pran Pratishtha"],
      description: "100% natural, unheated, untreated gemstones prescribed based on birth chart planetary dignities and consecrated with authentic Vedic stotras.",
      deliverables: [
        "Govt. recognized laboratory authenticity certificate",
        "Individualized Vedic consecration (Prana Pratishtha) under auspicious Muhurat",
        "Specific wearing instructions, metal selection, and finger guidance",
      ],
      bookingUrl: "/gemstones",
    } as ServiceDetail,
  },

  freeTools: [
    { name: "Free Janam Kundli Generator", path: "/kundli-generator", hindi: "मुफ़्त जन्म कुंडली" },
    { name: "Kundli Milan / Horoscope Matching", path: "/kundli-matching", hindi: "कुंडली मिलान (36 गुण)" },
    { name: "Daily Hindu Panchang (Aaj Ka Panchang)", path: "/panchang", hindi: "आज का पंचांग" },
    { name: "Tomorrow Panchang (Kal Ka Panchang)", path: "/panchang/tomorrow", hindi: "कल का पंचांग" },
    { name: "Daily Rashifal / Horoscope", path: "/horoscope", hindi: "दैनिक राशिफल (12 राशियां)" },
    { name: "Moon Sign (Chandra Rashi) Calculator", path: "/moon-sign-calculator", hindi: "चंद्र राशि कैलकुलेटर" },
    { name: "Sun Sign Calculator", path: "/sun-sign-calculator", hindi: "सूर्य राशि कैलकुलेटर" },
    { name: "Numerology & Ank Jyotish Calculator", path: "/numerology-calculator", hindi: "अंक ज्योतिष कैलकुलेटर" },
    { name: "Love Compatibility Calculator", path: "/love-calculator", hindi: "प्रेम अनुकूलता कैलकुलेटर" },
    { name: "12 Zodiac Signs Encyclopedia", path: "/zodiac-signs", hindi: "12 राशियों का संपूर्ण परिचय" },
    { name: "Hindu Festivals & Vrat Calendar 2026", path: "/festivals", hindi: "2026 हिन्दू व्रत एवं त्यौहार" },
  ],

  paymentAndBilling: {
    model: "Direct Pay-Per-Booking (No Wallets, No Top-Ups, Zero Commission)",
    method: "Direct UPI Bank Transfer",
    upiId: "9311215564@okbizaxis",
    payeeName: "Aapka Astro",
    acceptedApps: ["Google Pay (GPay)", "PhonePe", "Paytm", "BHIM", "Any Banking UPI App", "Instant Dynamic QR Code"],
    walletPolicy: "Aapka Astro does NOT use a wallet coin, balance, or top-up system. You only pay transparently per booking.",
    freeConsultationPolicy: "We do NOT offer free 1-on-1 consultations. Our first consultation is offered at a 50% discount for ₹1,051 (regular ₹2,100). All our online Kundli, Panchang, and calculator tools are 100% free.",
  },

  refundAndCancellation: {
    missedAppointment: "If Acharya Niraj Kumar is unable to attend the scheduled session, 100% of the consultation fee is refunded to your original bank account within 2-3 business days.",
    rescheduling: "Free rescheduling is available with at least 2 hours prior notice via WhatsApp.",
    cancellationWindow: "Cancellations requested 2 hours prior to the slot are refunded in full. No refunds once a session has concluded.",
  },

  contact: {
    whatsapp: "+91 93112 15564",
    whatsappRaw: "919311215564",
    whatsappLink: "https://wa.me/919311215564",
    phone: "+91 931-121-5564",
    phoneRaw: "+919311215564",
    email: "aapkaastro1606@gmail.com",
    hours: "Monday – Sunday: 7:00 AM – 11:00 PM IST",
    address: "Unit No. A-1212 D, Tower A, Spectrum@Metro Phase 1, Sector 75, Noida, G.B. Nagar - U.P. 201301",
    instagram: "@aapkaastrologer (https://www.instagram.com/aapkaastrologer/)",
    youtube: "@aapkaastro7900 (https://www.youtube.com/@aapkaastro7900)",
  },
};
