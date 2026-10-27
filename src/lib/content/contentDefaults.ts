import {
  PLACEHOLDER_CONTACT_INFO,
  PLACEHOLDER_SOCIAL_LINKS,
  PLACEHOLDER_ASTROLOGER,
  PLACEHOLDER_TESTIMONIALS,
  OFFICIAL_GALLERY_IMAGES,
  CORE_SERVICES,
} from "@/config/placeholderContent";
import { TRANSLATIONS } from "@/lib/i18n/translations";

export interface DefaultEntryDefinition {
  key: string;
  slug?: string;
  sortOrder: number;
  dataEn: Record<string, any>;
  dataHi: Record<string, any>;
  metadata?: Record<string, any>;
}

export const DEFAULT_CONTENT_COLLECTIONS: Record<string, DefaultEntryDefinition[]> = {
  faqs: [
    {
      key: "faq-1",
      slug: "consultation-booking-process",
      sortOrder: 1,
      dataEn: {
        question: "How does the consultation booking and connection process work?",
        answer: `Consultations with Acharya Niraj Kumar follow a simple, transparent, real-world flow: you book and pay the flat consultation fee online → you immediately receive your confirmation on screen and via email containing your official booking reference and direct WhatsApp contact details (+91 93112 15564) → Acharya Niraj Kumar or his sanctum desk coordinates the exact time and connects with you via WhatsApp call or Google Meet, as you prefer or as arranged. Because Acharya Ji consults personally without third-party interns, every session is a genuine 1-on-1 private reading without requiring any complex in-app software or call plugins.`,
        category: "booking",
      },
      dataHi: {
        question: "परामर्श बुकिंग और संपर्क की प्रक्रिया कैसे काम करती है?",
        answer: `आचार्य नीरज कुमार जी के साथ परामर्श एक सरल, पारदर्शी प्रक्रिया पर आधारित है: आप ऑनलाइन निर्धारित परामर्श शुल्क का भुगतान करते हैं → आपको तुरंत स्क्रीन पर और ईमेल के माध्यम से संदर्भ संख्या एवं सीधा व्हाट्सएप संपर्क (+91 93112 15564) प्राप्त होता है → आचार्य जी या उनका कार्यालय समय निर्धारित कर व्हाट्सएप कॉल या गूगल मीट के माध्यम से सीधे आपसे जुड़ते हैं। आचार्य जी स्वयं परामर्श देते हैं, इसलिए प्रत्येक सत्र 1-ऑन-1 व्यक्तिगत और गोपनीय होता है।`,
        category: "booking",
      },
    },
    {
      key: "faq-2",
      slug: "acharya-offline-in-session",
      sortOrder: 2,
      dataEn: {
        question: "What happens if Acharya Ji is offline or currently in a consultation when I book?",
        answer: `Acharya Ji's real-time desk presence (Online, In Session, or Offline) is shown on the consultation page as an honest indicator of how quickly he can connect. Even if he is currently in a session or offline for sacred rituals, you can complete your booking and immediately receive your confirmation with WhatsApp contact details. You can tap the one-touch WhatsApp link to coordinate the next available window, or his sanctum desk will contact your registered phone number to confirm the exact consultation time.`,
        category: "booking",
      },
      dataHi: {
        question: "यदि बुकिंग के समय आचार्य जी व्यस्त या ऑफ़लाइन हों तो क्या होगा?",
        answer: `वेबसाइट पर आचार्य जी की वास्तविक स्थिति (उपलब्ध, व्यस्त, या ऑफ़लाइन) दिखाई जाती है। यदि वे किसी सत्र में व्यस्त भी हों, तो भी आप बुकिंग कर सकते हैं। इसके बाद उनका कार्यालय आपके पंजीकृत नंबर पर संपर्क करके परामर्श का निश्चित समय तय करेगा।`,
        category: "booking",
      },
    },
    {
      key: "faq-3",
      slug: "pricing-and-payment-details",
      sortOrder: 3,
      dataEn: {
        question: "How does consultation booking and fee payment work?",
        answer: "Consultations are offered on a transparent flat-fee, pay-per-booking model. For your first Astro consultation, you receive a special promotional flat fee of ₹1,051/- (Regular ₹2,100 — 50% discount). Vaastu Consultations are flat ₹15,000/- (Regular ₹25,000). You simply select your consultation type, provide your intake details, and complete payment directly via UPI to 9310709233m@pnb. Upon verification, your booking is confirmed with a direct meeting link and WhatsApp coordination. There are zero surprise per-minute debits or hidden wallet charges.",
        category: "pricing",
      },
      dataHi: {
        question: "परामर्श शुल्क और बुकिंग का भुगतान कैसे होता है?",
        answer: "परामर्श पारदर्शी फ्लैट-फी मॉडल पर आधारित है। प्रथम ज्योतिष परामर्श पर फ्लैट ₹1,051/- (सामान्य ₹2,100 — 50% छूट) है। वास्तु परामर्श फ्लैट ₹15,000/- है। आप सीधे UPI से 9310709233m@pnb पर भुगतान कर सकते हैं। इसमें कोई प्रति-मिनट या छिपा हुआ शुल्क नहीं है।",
        category: "pricing",
      },
    },
    {
      key: "faq-4",
      slug: "kundli-calculator-accuracy",
      sortOrder: 4,
      dataEn: {
        question: "How accurate is the free Janam Kundli calculator on this website?",
        answer: "Our calculator is built on the rigorous Swiss Ephemeris astronomical model and Lahiri (Chitra Paksha) Ayanamsa — the gold standard recognized by Indian Vedic universities. It calculates planetary longitudes, Bhavas, Navamsha, and Vimshottari Mahadasha down to exact degrees and minutes.",
        category: "tools",
      },
      dataHi: {
        question: "इस वेबसाइट पर निःशुल्क जन्म कुण्डली कैलकुलेटर कितना सटीक है?",
        answer: "हमारा कैलकुलेटर स्विस एफेमेरिस (Swiss Ephemeris) और लाहिरी (चित्रा पक्ष) अयनांश के सटीक गणितीय मॉडल पर आधारित है, जो भारतीय वैदिक विश्वविद्यालयों द्वारा प्रमाणित है। यह ग्रहों के स्पष्ट अंश, भाव, नवांश और विंशोत्तरी महादशा की सटीक गणना करता है।",
        category: "tools",
      },
    },
    {
      key: "faq-5",
      slug: "gemstone-authenticity-guarantee",
      sortOrder: 5,
      dataEn: {
        question: "Are the recommended gemstones genuine and certified?",
        answer: "Yes. Every gemstone recommended and shipped by Aapka Astro is 100% natural, unheated, and untreated. Each piece is accompanied by an individual identification certificate from government-recognized gemological testing laboratories (like IGI/GTL) and energized with proper Vedic Prana Pratishtha.",
        category: "gemstones",
      },
      dataHi: {
        question: "क्या अनुशंसित रत्न 100% असली और प्रमाणित हैं?",
        answer: "हाँ, आपका एस्ट्रो द्वारा सुझाया गया प्रत्येक रत्न 100% प्राकृतिक, बिना किसी ताप या रासायनिक उपचार के होता है। प्रत्येक रत्न के साथ सरकारी मान्यता प्राप्त प्रयोगशाला (जैसे IGI/GTL) का प्रमाण पत्र और वैदिक प्राण-प्रतिष्ठा शामिल होती है।",
        category: "gemstones",
      },
    },
    {
      key: "faq-6",
      slug: "vastu-without-demolition",
      sortOrder: 6,
      dataEn: {
        question: "Can I consult about Vastu without demolishing my current house structure?",
        answer: "Absolutely. Acharya Niraj Kumar specializes in non-demolition Devta Vastu remedies. By utilizing elemental balancing (Pancha Tattva), directional metal tapes, consecrated Vedic yantras, and specific natural remedies, directional defects are balanced effectively without structural damage.",
        category: "vastu",
      },
      dataHi: {
        question: "क्या बिना किसी तोड़-फोड़ के वास्तु दोषों का निवारण संभव है?",
        answer: "बिल्कुल। आचार्य नीरज कुमार जी बिना तोड़-फोड़ वाले देवता वास्तु निवारण में विशेषज्ञ हैं। पंचतत्व संतुलन, दिशात्मक धातु पट्टियों और वैदिक यंत्रों द्वारा ऊर्जा को संतुलित किया जाता है।",
        category: "vastu",
      },
    },
  ],

  contact: [
    {
      key: "primary",
      slug: "primary-sanctum-contact",
      sortOrder: 1,
      dataEn: {
        phone: PLACEHOLDER_CONTACT_INFO.phone,
        phoneRaw: PLACEHOLDER_CONTACT_INFO.phoneRaw,
        whatsapp: PLACEHOLDER_CONTACT_INFO.whatsapp,
        whatsappLink: PLACEHOLDER_CONTACT_INFO.whatsappLink,
        email: PLACEHOLDER_CONTACT_INFO.email,
        sanctumCity: PLACEHOLDER_CONTACT_INFO.sanctumCity,
        address: PLACEHOLDER_CONTACT_INFO.address,
        operatingHours: PLACEHOLDER_CONTACT_INFO.operatingHours,
      },
      dataHi: {
        phone: PLACEHOLDER_CONTACT_INFO.phone,
        phoneRaw: PLACEHOLDER_CONTACT_INFO.phoneRaw,
        whatsapp: PLACEHOLDER_CONTACT_INFO.whatsapp,
        whatsappLink: PLACEHOLDER_CONTACT_INFO.whatsappLink,
        email: PLACEHOLDER_CONTACT_INFO.email,
        sanctumCity: "नोएडा, गौतम बुद्ध नगर - उत्तर प्रदेश 201301",
        address: "यूनिट नंबर A-1212 D, टॉवर A, स्पेक्ट्रम@मेट्रो फेज़ 1, सेक्टर 75, नोएडा, गौतम बुद्ध नगर - उत्तर प्रदेश 201301",
        operatingHours: "सोमवार – रविवार: प्रातः 7:00 बजे से रात्रि 11:00 बजे IST",
      },
    },
  ],

  social: [
    {
      key: "primary",
      slug: "social-media-channels",
      sortOrder: 1,
      dataEn: {
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
      dataHi: {
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
    },
  ],

  hero: [
    {
      key: "home-hero",
      slug: "home-hero-banner",
      sortOrder: 1,
      dataEn: {
        badgeText: "20+ Years Mastery • Certified Jyotish Acharya",
        headline: PLACEHOLDER_ASTROLOGER.tagline || "Where Spiritual Science Meets Corporate Insight",
        subheadline: "Deep traditional learning and rare corporate leadership experience across 15,000+ chart analyses and non-demolition Devta Vaastu.",
        experienceYears: "20+",
        consultationsCount: "15,000+ Consultations",
        ctaConsult: TRANSLATIONS.en.hero_cta_consult,
        ctaKundli: TRANSLATIONS.en.hero_cta_kundli,
        announcementText: "",
        announcementLink: "",
        announcementEnabled: false,
      },
      dataHi: {
        badgeText: "20+ वर्षों का अनुभव • प्रमाणित ज्योतिष आचार्य",
        headline: "जहाँ आध्यात्मिक विज्ञान और आधुनिक जीवन का संगम होता है",
        subheadline: "15,000+ कुण्डली विश्लेषण, गैर-विध्वंसक देवता वास्तु और रिलायंस रिटेल के पूर्व उपाध्यक्ष द्वारा प्रामाणिक वैदिक मार्गदर्शन।",
        experienceYears: "20+",
        consultationsCount: "15,000+ परामर्श",
        ctaConsult: TRANSLATIONS.hi.hero_cta_consult,
        ctaKundli: TRANSLATIONS.hi.hero_cta_kundli,
        announcementText: "",
        announcementLink: "",
        announcementEnabled: false,
      },
    },
  ],

  testimonials: PLACEHOLDER_TESTIMONIALS.map((t, idx) => ({
    key: `testimonial-${idx + 1}`,
    slug: `review-${t.clientName.toLowerCase().replace(/\s+/g, "-")}`,
    sortOrder: idx + 1,
    dataEn: {
      clientName: t.clientName,
      city: t.city,
      service: t.service,
      stars: t.stars,
      text: t.text,
      date: "2026-03-15",
      consentNote: "Explicit client consent received on file for public display.",
      verified: t.verified ?? true,
    },
    dataHi: {
      clientName: t.clientName,
      city: t.city,
      service: t.service,
      stars: t.stars,
      text: t.text,
      date: "2026-03-15",
      consentNote: "Explicit client consent received on file for public display.",
      verified: t.verified ?? true,
    },
  })),

  services: CORE_SERVICES.map((s, idx) => ({
    key: `service-${s.id}`,
    slug: s.id,
    sortOrder: idx + 1,
    dataEn: {
      title: s.title,
      description: s.description,
      highlights: s.highlights,
      href: s.href,
      image: "",
      order: idx + 1,
      visible: true,
    },
    dataHi: {
      title: s.hindi || s.title,
      description: s.description,
      highlights: s.highlights,
      href: s.href,
      image: "",
      order: idx + 1,
      visible: true,
    },
  })),

  heroCarousel: [
    {
      key: "slide-1",
      sortOrder: 1,
      dataEn: {
        imageUrl: "/images/Acharya_Niraj_Kumar.jpg",
        caption: "Acharya Niraj Kumar conducting sanctum consultation",
        order: 1,
        visible: true,
      },
      dataHi: {
        imageUrl: "/images/Acharya_Niraj_Kumar.jpg",
        caption: "आचार्य नीरज कुमार परामर्श कक्ष में",
        order: 1,
        visible: true,
      },
    },
  ],

  trustMetrics: [
    {
      key: "metric-1",
      sortOrder: 1,
      dataEn: {
        label: "Years Vedic Mastery",
        value: "20+",
        warningAcknowledged: true,
      },
      dataHi: {
        label: "वैदिक अनुभव (वर्ष)",
        value: "20+",
        warningAcknowledged: true,
      },
    },
    {
      key: "metric-2",
      sortOrder: 2,
      dataEn: {
        label: "Completed Consultations",
        value: "15,000+",
        warningAcknowledged: true,
      },
      dataHi: {
        label: "परामर्श सत्र",
        value: "15,000+",
        warningAcknowledged: true,
      },
    },
  ],

  aboutSections: [
    {
      key: "about-intro",
      sortOrder: 1,
      dataEn: {
        title: "At the Intersection of Ancient Wisdom and Modern Life",
        body: "Aapka Astro brings authentic classical Parashari Jyotish and Devta Vastu to modern seekers without fear-mongering.",
      },
      dataHi: {
        title: "प्राचीन ज्ञान और आधुनिक जीवन का संगम",
        body: "आपका एस्ट्रो बिना किसी भय के प्रामाणिक पराशरी ज्योतिष और देवता वास्तु मार्गदर्शन प्रदान करता है।",
      },
    },
  ],

  credentials: [
    {
      key: "cred-1",
      sortOrder: 1,
      dataEn: {
        title: "Jyotish Acharya",
        issuer: "Bhartiya Vidya Bhawan, New Delhi",
        year: "2006",
        certificateImage: "/images/Acharya_Niraj_Kumar.jpg",
      },
      dataHi: {
        title: "ज्योतिष आचार्य",
        issuer: "भारतीय विद्या भवन, नई दिल्ली",
        year: "2006",
        certificateImage: "/images/Acharya_Niraj_Kumar.jpg",
      },
    },
  ],

  gallery: OFFICIAL_GALLERY_IMAGES.map((img, idx) => ({
    key: `gallery-${idx + 1}`,
    sortOrder: idx + 1,
    dataEn: {
      imageUrl: img.src,
      caption: img.alt,
    },
    dataHi: {
      imageUrl: img.src,
      caption: img.alt,
    },
  })),

  popups: [
    {
      key: "welcome-popup",
      sortOrder: 1,
      dataEn: {
        type: "welcome",
        headline: "Special First Consultation Blessing: Flat 50% Off",
        text: "Direct 1-on-1 private reading with Acharya Niraj Kumar at introductory flat fee of ₹1,051/-.",
        image: "/images/Acharya_Niraj_Kumar.jpg",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        enabled: true,
      },
      dataHi: {
        type: "welcome",
        headline: "प्रथम परामर्श पर विशेष 50% छूट",
        text: "आचार्य नीरज कुमार जी के साथ सीधा व्यक्तिगत परामर्श केवल ₹1,051/- में।",
        image: "/images/Acharya_Niraj_Kumar.jpg",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        enabled: true,
      },
    },
    {
      key: "festival-popup",
      sortOrder: 2,
      dataEn: {
        type: "festival",
        headline: "Festive Blessing: Free Consecrated Rudraksh",
        text: "Every consultation booked during this festive window includes an energized, certified Rudraksh.",
        image: "/images/Acharya_Niraj_Kumar.jpg",
        startDate: "2026-03-01",
        endDate: "2026-04-30",
        enabled: true,
      },
      dataHi: {
        type: "festival",
        headline: "पवित्र उत्सव विशेष: निःशुल्क अभिमंत्रित रुद्राक्ष",
        text: "उत्सव अवधि के दौरान बुक किए गए परामर्श के साथ अभिमंत्रित रुद्राक्ष निःशुल्क प्राप्त करें।",
        image: "/images/Acharya_Niraj_Kumar.jpg",
        startDate: "2026-03-01",
        endDate: "2026-04-30",
        enabled: true,
      },
    },
  ],

  legal: [
    {
      key: "terms",
      slug: "terms",
      sortOrder: 1,
      dataEn: {
        slug: "terms",
        title: "Terms of Service & Consultation Agreement",
        content: "Official Terms and Conditions governing use of Aapka Astro, live consultations, and digital astrological tools.",
        pendingLawyerReview: true,
        lastUpdated: "March 2026",
      },
      dataHi: {
        slug: "terms",
        title: "सेवा की शर्तें एवं परामर्श अनुबंध",
        content: "आपका एस्ट्रो के उपयोग, परामर्श एवं ज्योतिषीय उपकरणों को नियंत्रित करने वाली आधिकारिक शर्तें।",
        pendingLawyerReview: true,
        lastUpdated: "मार्च 2026",
      },
    },
    {
      key: "privacy-policy",
      slug: "privacy-policy",
      sortOrder: 2,
      dataEn: {
        slug: "privacy-policy",
        title: "Privacy Policy",
        content: "Your birth details and consultations are 100% confidential and never shared with third parties.",
        pendingLawyerReview: true,
        lastUpdated: "March 2026",
      },
      dataHi: {
        slug: "privacy-policy",
        title: "गोपनीयता नीति",
        content: "आपकी जन्म कुण्डली विवरण और परामर्श 100% गोपनीय रहते हैं।",
        pendingLawyerReview: true,
        lastUpdated: "मार्च 2026",
      },
    },
    {
      key: "refund-policy",
      slug: "refund-policy",
      sortOrder: 3,
      dataEn: {
        slug: "refund-policy",
        title: "Cancellation & Refund Policy",
        content: "Terms governing payment verification, cancellations, and refunds across consultations.",
        pendingLawyerReview: true,
        lastUpdated: "March 2026",
      },
      dataHi: {
        slug: "refund-policy",
        title: "वापसी एवं रद्दीकरण नीति",
        content: "परामर्श भुगतान, रद्दीकरण एवं धनवापसी से संबंधित नियम।",
        pendingLawyerReview: true,
        lastUpdated: "मार्च 2026",
      },
    },
    {
      key: "disclaimer",
      slug: "disclaimer",
      sortOrder: 4,
      dataEn: {
        slug: "disclaimer",
        title: "Astrological Disclaimer",
        content: "Astrological advisory is spiritual guidance and not a substitute for professional legal or medical advice.",
        pendingLawyerReview: true,
        lastUpdated: "March 2026",
      },
      dataHi: {
        slug: "disclaimer",
        title: "ज्योतिषीय अस्वीकरण",
        content: "ज्योतिषीय परामर्श आध्यात्मिक मार्गदर्शन है और कानूनी या चिकित्सीय सलाह का विकल्प नहीं है।",
        pendingLawyerReview: true,
        lastUpdated: "मार्च 2026",
      },
    },
    {
      key: "pricing-policy",
      slug: "pricing-policy",
      sortOrder: 5,
      dataEn: {
        slug: "pricing-policy",
        title: "Transparent Pricing Policy",
        content: "Transparent flat-fee pay-per-booking model with zero hidden charges or per-minute debits.",
        pendingLawyerReview: true,
        lastUpdated: "March 2026",
      },
      dataHi: {
        slug: "pricing-policy",
        title: "पारदर्शी मूल्य नीति",
        content: "पारदर्शी फ्लैट शुल्क मॉडल जिसमें कोई छिपा हुआ शुल्क या प्रति-मिनट कटौती नहीं होती।",
        pendingLawyerReview: true,
        lastUpdated: "मार्च 2026",
      },
    },
  ],
};


export interface MediaAssetDefinition {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  fileSize: number | null;
  altTextEn: string | null;
  altTextHi: string | null;
  collection: string | null;
  uploadedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const INITIAL_MEDIA_ASSETS: MediaAssetDefinition[] = [
  {
    id: "fallback-media-acharya",
    url: "/images/Acharya_Niraj_Kumar.jpg",
    filename: "Acharya_Niraj_Kumar.jpg",
    mimeType: "image/jpeg",
    fileSize: 450000,
    altTextEn: "Acharya Niraj Kumar - Founder & Jyotish Acharya",
    altTextHi: "आचार्य नीरज कुमार - संस्थापक एवं ज्योतिष आचार्य",
    collection: "astrologer",
    uploadedBy: "system",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  ...OFFICIAL_GALLERY_IMAGES.map((img, idx) => ({
    id: `fallback-media-gallery-${idx + 1}`,
    url: img.src,
    filename: img.src.split("/").pop() || "image.jpg",
    mimeType: img.src.endsWith(".png") ? "image/png" : "image/jpeg",
    fileSize: 320000,
    altTextEn: img.alt,
    altTextHi: img.alt,
    collection: "gallery",
    uploadedBy: "system",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  })),
];

/**
 * Returns default entries for a collection in memory.
 */
export function getDefaultCollection(collection: string): DefaultEntryDefinition[] {
  return DEFAULT_CONTENT_COLLECTIONS[collection] || [];
}

/**
 * Returns a specific default entry in memory.
 */
export function getDefaultEntry(collection: string, key: string): DefaultEntryDefinition | null {
  const coll = DEFAULT_CONTENT_COLLECTIONS[collection];
  if (!coll) return null;
  return coll.find((item) => item.key === key || item.slug === key) || null;
}
