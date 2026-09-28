/**
 * ============================================================================
 * VEDIC DAILY HOROSCOPE ENGINE (CHANDRA RASHI / MOON SIGN GOCHARA)
 * ============================================================================
 * Calculates daily planetary transit influences (Chandra Gochar + 9 Graha Gochar),
 * retrograde (Vakri) and combustion (Asta) states, Vedha (obstruction) checks,
 * explicit domain scores (Love, Career, Health, Finance, Family), favorable
 * time windows, Vedic remedies (Upay), mantras, and traceable "Why this reading?"
 * astronomical facts in both English and curated Vedic Hindi (Devanagari).
 */

import {
  getJulianDay,
  getLahiriAyanamsa,
  getSunLongitude,
  getMoonLongitude,
  getRahuLongitude,
  getPlanetMotionDetails,
} from "./ephemeris";
import { computeRealtimePanchang } from "./realtimePanchang";
import {
  GOCHARA_PLANET_RULES,
  NAISARGIKA_MAITRI,
  DOMAIN_SCORING_SPEC,
  CHANDRA_HOUSE_PHRASE_BANK,
  type GocharaVerdict,
  type PlanetHouseRule,
} from "./gocharaRules";

export interface ZodiacSignInfo {
  id: string; // "aries", "taurus", etc.
  index: number; // 0..11 (Mesha = 0 .. Meena = 11)
  englishName: string;
  sanskritName: string;
  hindiName: string;
  symbol: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  elementHindi: string;
  rulingPlanet: string;
  rulingPlanetKey: "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn";
  rulingPlanetHindi: string;
  dateRange: string;
  icon: string;
}

export const ZODIAC_SIGNS: ZodiacSignInfo[] = [
  {
    id: "aries",
    index: 0,
    englishName: "Aries",
    sanskritName: "Mesha",
    hindiName: "मेष",
    symbol: "♈",
    element: "Fire",
    elementHindi: "अग्नि तत्व",
    rulingPlanet: "Mars (Mangal)",
    rulingPlanetKey: "Mars",
    rulingPlanetHindi: "मंगल",
    dateRange: "Chandra Rashi: Mesha (Aswini, Bharani, Krittika 1)",
    icon: "🔥",
  },
  {
    id: "taurus",
    index: 1,
    englishName: "Taurus",
    sanskritName: "Vrishabha",
    hindiName: "वृषभ",
    symbol: "♉",
    element: "Earth",
    elementHindi: "पृथ्वी तत्व",
    rulingPlanet: "Venus (Shukra)",
    rulingPlanetKey: "Venus",
    rulingPlanetHindi: "शुक्र",
    dateRange: "Chandra Rashi: Vrishabha (Krittika 2-4, Rohini, Mrigashira 1-2)",
    icon: "🐂",
  },
  {
    id: "gemini",
    index: 2,
    englishName: "Gemini",
    sanskritName: "Mithuna",
    hindiName: "मिथुन",
    symbol: "♊",
    element: "Air",
    elementHindi: "वायु तत्व",
    rulingPlanet: "Mercury (Budh)",
    rulingPlanetKey: "Mercury",
    rulingPlanetHindi: "बुध",
    dateRange: "Chandra Rashi: Mithuna (Mrigashira 3-4, Ardra, Punarvasu 1-3)",
    icon: "🌿",
  },
  {
    id: "cancer",
    index: 3,
    englishName: "Cancer",
    sanskritName: "Karka",
    hindiName: "कर्क",
    symbol: "♋",
    element: "Water",
    elementHindi: "जल तत्व",
    rulingPlanet: "Moon (Chandra)",
    rulingPlanetKey: "Moon",
    rulingPlanetHindi: "चन्द्र",
    dateRange: "Chandra Rashi: Karka (Punarvasu 4, Pushya, Ashlesha)",
    icon: "🌊",
  },
  {
    id: "leo",
    index: 4,
    englishName: "Leo",
    sanskritName: "Simha",
    hindiName: "सिंह",
    symbol: "♌",
    element: "Fire",
    elementHindi: "अग्नि तत्व",
    rulingPlanet: "Sun (Surya)",
    rulingPlanetKey: "Sun",
    rulingPlanetHindi: "सूर्य",
    dateRange: "Chandra Rashi: Simha (Magha, Purva Phalguni, Uttara Phalguni 1)",
    icon: "🦁",
  },
  {
    id: "virgo",
    index: 5,
    englishName: "Virgo",
    sanskritName: "Kanya",
    hindiName: "कन्या",
    symbol: "♍",
    element: "Earth",
    elementHindi: "पृथ्वी तत्व",
    rulingPlanet: "Mercury (Budh)",
    rulingPlanetKey: "Mercury",
    rulingPlanetHindi: "बुध",
    dateRange: "Chandra Rashi: Kanya (Uttara Phalguni 2-4, Hasta, Chitra 1-2)",
    icon: "🌾",
  },
  {
    id: "libra",
    index: 6,
    englishName: "Libra",
    sanskritName: "Tula",
    hindiName: "तुला",
    symbol: "♎",
    element: "Air",
    elementHindi: "वायु तत्व",
    rulingPlanet: "Venus (Shukra)",
    rulingPlanetKey: "Venus",
    rulingPlanetHindi: "शुक्र",
    dateRange: "Chandra Rashi: Tula (Chitra 3-4, Swati, Vishakha 1-3)",
    icon: "⚖️",
  },
  {
    id: "scorpio",
    index: 7,
    englishName: "Scorpio",
    sanskritName: "Vrishchika",
    hindiName: "वृश्चिक",
    symbol: "♏",
    element: "Water",
    elementHindi: "जल तत्व",
    rulingPlanet: "Mars (Mangal)",
    rulingPlanetKey: "Mars",
    rulingPlanetHindi: "मंगल",
    dateRange: "Chandra Rashi: Vrishchika (Vishakha 4, Anuradha, Jyeshtha)",
    icon: "🦂",
  },
  {
    id: "sagittarius",
    index: 8,
    englishName: "Sagittarius",
    sanskritName: "Dhanu",
    hindiName: "धनु",
    symbol: "♐",
    element: "Fire",
    elementHindi: "अग्नि तत्व",
    rulingPlanet: "Jupiter (Brihaspati / Guru)",
    rulingPlanetKey: "Jupiter",
    rulingPlanetHindi: "गुरु",
    dateRange: "Chandra Rashi: Dhanu (Mula, Purva Ashadha, Uttara Ashadha 1)",
    icon: "🏹",
  },
  {
    id: "capricorn",
    index: 9,
    englishName: "Capricorn",
    sanskritName: "Makara",
    hindiName: "मकर",
    symbol: "♑",
    element: "Earth",
    elementHindi: "पृथ्वी तत्व",
    rulingPlanet: "Saturn (Shani)",
    rulingPlanetKey: "Saturn",
    rulingPlanetHindi: "शनि",
    dateRange: "Chandra Rashi: Makara (Uttara Ashadha 2-4, Shravana, Dhanishta 1-2)",
    icon: "⛰️",
  },
  {
    id: "aquarius",
    index: 10,
    englishName: "Aquarius",
    sanskritName: "Kumbha",
    hindiName: "कुम्भ",
    symbol: "♒",
    element: "Air",
    elementHindi: "वायु तत्व",
    rulingPlanet: "Saturn (Shani)",
    rulingPlanetKey: "Saturn",
    rulingPlanetHindi: "शनि",
    dateRange: "Chandra Rashi: Kumbha (Dhanishta 3-4, Shatabhisha, Purva Bhadrapada 1-3)",
    icon: "🏺",
  },
  {
    id: "pisces",
    index: 11,
    englishName: "Pisces",
    sanskritName: "Meena",
    hindiName: "मीन",
    symbol: "♓",
    element: "Water",
    elementHindi: "जल तत्व",
    rulingPlanet: "Jupiter (Brihaspati / Guru)",
    rulingPlanetKey: "Jupiter",
    rulingPlanetHindi: "गुरु",
    dateRange: "Chandra Rashi: Meena (Purva Bhadrapada 4, Uttara Bhadrapada, Revati)",
    icon: "🌊",
  },
];

export interface HoroscopeDomain {
  score: number;
  description: string;
  descriptionHindi: string;
  factorsEn?: string[];
  factorsHi?: string[];
}

export interface PlanetTransitDetail {
  planet: PlanetHouseRule["planet"];
  planetHi: string;
  signIndex: number;
  signEn: string;
  signHi: string;
  degreeInSign: number;
  houseFromMoon: number; // 1..12
  isRetrograde: boolean;
  isCombust: boolean;
  hasVedha: boolean;
  vedhaByPlanet?: string;
  vedhaByPlanetHi?: string;
  verdict: GocharaVerdict;
  classicalSource: string;
  summaryEn: string;
  summaryHi: string;
}

export interface HoroscopeComputedFacts {
  ayanamsaDeg: string;
  moonRashiEn: string;
  moonRashiHi: string;
  transitingMoonRashiEn: string;
  transitingMoonRashiHi: string;
  moonHouseFromRashi: number;
  moonHouseNameEn: string;
  moonHouseNameHi: string;
  moonHouseVerdict: GocharaVerdict;
  nakshatraEn: string;
  nakshatraHi: string;
  nakshatraPada: number;
  nakshatraLordEn: string;
  nakshatraLordHi: string;
  tithiEn: string;
  tithiHi: string;
  pakshaEn: string;
  pakshaHi: string;
  yogaEn: string;
  yogaHi: string;
  varaEn: string;
  varaHi: string;
  varaLordEn: string;
  varaLordHi: string;
  planetTransits: PlanetTransitDetail[];
  factsEn: string[];
  factsHi: string[];
}

export interface DailyHoroscope {
  sign: ZodiacSignInfo;
  date: string; // YYYY-MM-DD
  formattedDate: string;
  formattedDateHindi: string;
  overallScore: number; // 1 to 5 stars
  summary: string;
  summaryHindi: string;
  love: HoroscopeDomain;
  career: HoroscopeDomain;
  health: HoroscopeDomain;
  finance: HoroscopeDomain;
  family: HoroscopeDomain;
  luckyColor: string;
  luckyColorHindi: string;
  luckyNumber: number;
  auspiciousTime: string;
  auspiciousTimeHindi: string;
  remedy: string;
  remedyHindi: string;
  mantra: string;
  mantraHindi: string;
  planetaryTransit: string;
  planetaryTransitHindi: string;
  computedFacts: HoroscopeComputedFacts;
}

/**
 * Deterministic 32-bit FNV-1a hash for seeded phrase composition.
 */
function seededIndex(seed: string, modulo: number): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % modulo;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

const PLANET_COLOURS_AND_MANTRAS: Record<
  PlanetHouseRule["planet"],
  {
    colorEn: string;
    colorHi: string;
    baseNumber: number;
    mantraEn: string;
    mantraHi: string;
    remedyEn: string;
    remedyHi: string;
  }
> = {
  Sun: {
    colorEn: "Saffron Gold & Ruby Copper (केसरिया एवं ताम्र वर्ण)",
    colorHi: "केसरिया एवं ताम्र वर्ण",
    baseNumber: 1,
    mantraEn: "Om Hram Hreem Hroum Sah Suryaya Namah (108 times at sunrise)",
    mantraHi: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः (सूर्योदय के समय १०८ बार जप)",
    remedyEn: "Offer Arghya (water in a copper vessel with red sandalwood or kumkum) to the rising Sun and show respect to your father and elders.",
    remedyHi: "तांबे के पात्र में जल व लाल चंदन मिलाकर उगते सूर्य को अर्घ्य दें तथा पिता व वरिष्ठजनों का चरण-स्पर्श कर आशीर्वाद लें।",
  },
  Moon: {
    colorEn: "Pearl White & Silver Cream (मोती श्वेत एवं रजत वर्ण)",
    colorHi: "मोती श्वेत एवं रजत वर्ण",
    baseNumber: 2,
    mantraEn: "Om Shram Shreem Shroum Sah Chandraya Namah (108 times)",
    mantraHi: "ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः (१०८ बार जप)",
    remedyEn: "Offer raw milk and pure water to Lord Shiva (Abhishekam) and keep a small silver square or white handkerchief with you.",
    remedyHi: "भगवान शिव का कच्चे दूध व शुद्ध जल से अभिषेक करें तथा माता का आशीर्वाद लेकर दिन का शुभारंभ करें।",
  },
  Mars: {
    colorEn: "Coral Red & Vermilion (मूंगा लाल एवं सिंदूरी)",
    colorHi: "मूंगा लाल एवं सिंदूरी",
    baseNumber: 9,
    mantraEn: "Om Kram Kreem Kroum Sah Bhaumaya Namah (108 times)",
    mantraHi: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः (१०८ बार जप)",
    remedyEn: "Recite the Hanuman Chalisa with devotion and offer sweet boondi or jaggery-gram (Gud-Chana) at a Hanuman temple.",
    remedyHi: "श्रद्धापूर्वक श्री हनुमान चालीसा का पाठ करें तथा गुड़-चने या मीठी बूंदी का प्रसाद वितरित करें।",
  },
  Mercury: {
    colorEn: "Emerald Green & Mint Leaf (पन्ना हरा एवं धानी रंग)",
    colorHi: "पन्ना हरा एवं धानी रंग",
    baseNumber: 5,
    mantraEn: "Om Bram Breem Broum Sah Budhaya Namah (108 times)",
    mantraHi: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः (१०८ बार जप)",
    remedyEn: "Offer Durva grass to Lord Ganesha and feed soaked green gram (Moong) or green fodder to cows.",
    remedyHi: "भगवान श्री गणेश को दूर्वा अर्पित करें तथा गौमाता को हरा चारा अथवा भीगी हुई हरी मूंग खिलाएं।",
  },
  Jupiter: {
    colorEn: "Turmeric Yellow & Pitambari Gold (पीताम्बरी पीला एवं स्वर्ण वर्ण)",
    colorHi: "पीताम्बरी पीला एवं स्वर्ण वर्ण",
    baseNumber: 3,
    mantraEn: "Om Gram Greem Groum Sah Gurave Namah (108 times)",
    mantraHi: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः (१०८ बार जप)",
    remedyEn: "Apply a Kesar (saffron) or Haldi (turmeric) tilak on your forehead and donate yellow chana dal or study books to a temple or needy student.",
    remedyHi: "मस्तक पर केसर या हल्दी का तिलक लगाएं तथा चने की दाल अथवा शिक्षा सामग्री का दान करें।",
  },
  Venus: {
    colorEn: "Opal White & Pastel Rose (स्फटिक श्वेत एवं गुलाबी आभा)",
    colorHi: "स्फटिक श्वेत एवं गुलाबी आभा",
    baseNumber: 6,
    mantraEn: "Om Dram Dreem Droum Sah Shukraya Namah (108 times)",
    mantraHi: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः (१०८ बार जप)",
    remedyEn: "Offer white fragrant flowers and kheer/mishri to Goddess Mahalakshmi, and maintain neat attire and polite speech.",
    remedyHi: "माँ महालक्ष्मी को सुगंधित श्वेत पुष्प व मिश्री अर्पित करें तथा स्वच्छ वस्त्र धारण कर मधुर वाणी का प्रयोग करें।",
  },
  Saturn: {
    colorEn: "Deep Indigo & Sapphire Blue (नीलमणि नीला एवं जामुनी)",
    colorHi: "नीलमणि नीला एवं जामुनी",
    baseNumber: 8,
    mantraEn: "Om Pram Preem Proum Sah Shanaischaraya Namah (108 times)",
    mantraHi: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः (१०८ बार जप)",
    remedyEn: "Light a sesame/mustard oil lamp beneath a Peepal tree in the evening and assist daily-wage workers or the elderly with humility.",
    remedyHi: "संध्याकाल में पीपल वृक्ष के नीचे तिल के तेल का दीपक जलाएं तथा श्रमिकों व जरूरतमंद जनों की सेवा-सहायता करें।",
  },
  Rahu: {
    colorEn: "Smoky Slate & Peacock Blue (मयूर नीला एवं स्लेटी)",
    colorHi: "मयूर नीला एवं स्लेटी",
    baseNumber: 4,
    mantraEn: "Om Bhram Bhreem Bhroum Sah Rahave Namah (108 times)",
    mantraHi: "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः (१०८ बार जप)",
    remedyEn: "Offer seven types of grains (Satnaja) to birds in the morning and meditate on Goddess Durga to keep the mind grounded.",
    remedyHi: "प्रातःकाल पक्षियों को सतनाजा (सात प्रकार के अनाज) डालें तथा माँ दुर्गा का स्मरण कर मन को एकाग्र रखें।",
  },
  Ketu: {
    colorEn: "Warm Ochre & Sandalwood Beige (चंदन एवं गेरुआ वर्ण)",
    colorHi: "चंदन एवं गेरुआ वर्ण",
    baseNumber: 7,
    mantraEn: "Om Stram Streem Stroum Sah Ketave Namah (108 times)",
    mantraHi: "ॐ स्रां स्रीं स्रौं सः केतवे नमः (१०८ बार जप)",
    remedyEn: "Feed roti with a drop of ghee to stray dogs and recite the Ganesha Atharvashirsha for clear spiritual discrimination.",
    remedyHi: "भगवान श्री गणेश की आराधना करें तथा श्वान (कुत्ते) को रोटी खिलाएं।",
  },
};

function resolveTargetDate(dateOffsetOrDateStr: number | string | Date = 0): {
  civilDateStr: string;
  dateObj: Date;
} {
  if (typeof dateOffsetOrDateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateOffsetOrDateStr)) {
    const [y, m, d] = dateOffsetOrDateStr.split("-").map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 6, 30, 0)); // 12:00 PM IST
    return { civilDateStr: dateOffsetOrDateStr, dateObj };
  }
  if (dateOffsetOrDateStr instanceof Date) {
    const iso = dateOffsetOrDateStr.toISOString().split("T")[0];
    const [y, m, d] = iso.split("-").map(Number);
    return { civilDateStr: iso, dateObj: new Date(Date.UTC(y, m - 1, d, 6, 30, 0)) };
  }
  const offset = typeof dateOffsetOrDateStr === "number" ? dateOffsetOrDateStr : 0;
  // Compute current civil date in IST (Asia/Kolkata)
  const nowIstParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = Number(nowIstParts.find((p) => p.type === "year")?.value ?? 2026);
  const m = Number(nowIstParts.find((p) => p.type === "month")?.value ?? 1);
  const d = Number(nowIstParts.find((p) => p.type === "day")?.value ?? 1);
  const baseUtc = new Date(Date.UTC(y, m - 1, d + offset, 6, 30, 0));
  const civilDateStr = baseUtc.toISOString().split("T")[0];
  return { civilDateStr, dateObj: baseUtc };
}

function angularSeparationDeg(lon1: number, lon2: number): number {
  const diff = Math.abs(((lon1 - lon2 + 540) % 360) - 180);
  return diff;
}

/**
 * Computes all 9 sidereal planetary positions at sunrise/noon IST for the given civil date.
 */
function computeDailySkyState(civilDateStr: string, dateObj: Date) {
  const panchang = computeRealtimePanchang("delhi", civilDateStr);
  const [y, m, d] = civilDateStr.split("-").map(Number);
  const jd = getJulianDay(y, m, d, 6.5); // 12:00 PM IST (06:30 UTC)
  const ayanamsa = getLahiriAyanamsa(jd);
  const toSidereal = (tropDeg: number) => ((tropDeg - ayanamsa) % 360 + 360) % 360;

  const sunLon = toSidereal(getSunLongitude(jd));
  const moonLon = toSidereal(getMoonLongitude(jd));
  const rahuLon = toSidereal(getRahuLongitude(jd));
  const ketuLon = (rahuLon + 180) % 360;

  const mars = getPlanetMotionDetails("mars", jd);
  const mercury = getPlanetMotionDetails("mercury", jd);
  const jupiter = getPlanetMotionDetails("jupiter", jd);
  const venus = getPlanetMotionDetails("venus", jd);
  const saturn = getPlanetMotionDetails("saturn", jd);

  const rawPlanets: Array<{
    planet: PlanetHouseRule["planet"];
    lon: number;
    isRetrograde: boolean;
  }> = [
    { planet: "Sun", lon: sunLon, isRetrograde: false },
    { planet: "Moon", lon: moonLon, isRetrograde: false },
    { planet: "Mars", lon: toSidereal(mars.longitude), isRetrograde: mars.isRetrograde },
    { planet: "Mercury", lon: toSidereal(mercury.longitude), isRetrograde: mercury.isRetrograde },
    { planet: "Jupiter", lon: toSidereal(jupiter.longitude), isRetrograde: jupiter.isRetrograde },
    { planet: "Venus", lon: toSidereal(venus.longitude), isRetrograde: venus.isRetrograde },
    { planet: "Saturn", lon: toSidereal(saturn.longitude), isRetrograde: saturn.isRetrograde },
    { planet: "Rahu", lon: rahuLon, isRetrograde: true }, // Mean nodes always move retrograde
    { planet: "Ketu", lon: ketuLon, isRetrograde: true },
  ];

  return {
    civilDateStr,
    panchang,
    ayanamsa,
    sunLon,
    moonLon,
    rawPlanets,
  };
}

export class DailyHoroscopeService {
  static getAllSigns(): ZodiacSignInfo[] {
    return ZODIAC_SIGNS;
  }

  static getSignById(id: string): ZodiacSignInfo | undefined {
    return ZODIAC_SIGNS.find((s) => s.id.toLowerCase() === id.toLowerCase());
  }

  static getHoroscope(
    signId: string,
    dateOffsetOrDateStr: number | string | Date = 0
  ): DailyHoroscope | null {
    const sign = this.getSignById(signId);
    if (!sign) return null;

    const { civilDateStr, dateObj } = resolveTargetDate(dateOffsetOrDateStr);
    const cacheKey = `horoscope:v2:${sign.id}:${civilDateStr}`;
    const existing = horoscopeMemoryCache.get(cacheKey);
    if (existing && Date.now() - existing.createdAtMs < HOROSCOPE_CACHE_TTL_MS) {
      horoscopeCacheHits++;
      return existing.value;
    }
    horoscopeCacheMisses++;

    const sky = computeDailySkyState(civilDateStr, dateObj);
    const { panchang } = sky;

    const formattedDate = dateObj.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const formattedDateHindi = dateObj.toLocaleDateString("hi-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // 1. Evaluate all 9 Graha transits relative to this Chandra Rashi (sign.index)
    const houseToPlanetsMap = new Map<number, PlanetHouseRule["planet"][]>();
    const rawEvaluated = sky.rawPlanets.map((p) => {
      const signIndex = Math.floor(p.lon / 30) % 12;
      const degreeInSign = Number((p.lon % 30).toFixed(2));
      const houseFromMoon = ((signIndex - sign.index + 12) % 12) + 1;
      const list = houseToPlanetsMap.get(houseFromMoon) ?? [];
      list.push(p.planet);
      houseToPlanetsMap.set(houseFromMoon, list);

      const rule = GOCHARA_PLANET_RULES[p.planet];
      let isCombust = false;
      if (p.planet !== "Sun" && p.planet !== "Rahu" && p.planet !== "Ketu") {
        const sep = angularSeparationDeg(p.lon, sky.sunLon);
        const orb = p.isRetrograde ? rule.combustionOrbRetroDeg : rule.combustionOrbDirectDeg;
        if (orb && sep <= orb) {
          isCombust = true;
        }
      }

      return {
        ...p,
        signIndex,
        degreeInSign,
        houseFromMoon,
        isCombust,
        rule,
      };
    });

    const planetTransits: PlanetTransitDetail[] = rawEvaluated.map((item) => {
      const { planet, signIndex, degreeInSign, houseFromMoon, isRetrograde, isCombust, rule } = item;
      const targetSign = ZODIAC_SIGNS[signIndex];

      let baseVerdict: GocharaVerdict = "Unfavourable";
      if (rule.favourableHouses.includes(houseFromMoon)) {
        baseVerdict = "Favourable";
      } else if (rule.mixedHouses.includes(houseFromMoon)) {
        baseVerdict = "Mixed";
      }

      // Check Vedha (obstruction) when a planet is in a favourable house
      let hasVedha = false;
      let vedhaByPlanet: string | undefined;
      let vedhaByPlanetHi: string | undefined;

      if (baseVerdict === "Favourable" && rule.vedhaMap[houseFromMoon]) {
        const vedhaHouse = rule.vedhaMap[houseFromMoon];
        const obstructingPlanets = (houseToPlanetsMap.get(vedhaHouse) ?? []).filter((op) => {
          if (op === planet) return false;
          // Classical Sun-Saturn and Moon-Mercury exceptions where Vedha does not apply
          if (
            (planet === "Sun" && op === "Saturn") ||
            (planet === "Saturn" && op === "Sun") ||
            (planet === "Moon" && op === "Mercury") ||
            (planet === "Mercury" && op === "Moon")
          ) {
            return false;
          }
          return true;
        });

        if (obstructingPlanets.length > 0) {
          hasVedha = true;
          vedhaByPlanet = obstructingPlanets[0];
          vedhaByPlanetHi = GOCHARA_PLANET_RULES[obstructingPlanets[0]].planetHindi;
          baseVerdict = "Mixed"; // Vedha tempers a Favourable transit into Mixed
        }
      }

      // If combust (Asta) and Favourable, temper to Mixed
      const finalVerdict: GocharaVerdict =
        isCombust && baseVerdict === "Favourable" ? "Mixed" : baseVerdict;

      const stateTagEn = [
        isRetrograde && planet !== "Rahu" && planet !== "Ketu" ? "Retrograde (Vakri)" : "",
        isCombust ? "Combust (Asta)" : "",
        hasVedha ? `Vedha from ${vedhaByPlanet}` : "",
      ]
        .filter(Boolean)
        .join(", ");

      const stateTagHi = [
        isRetrograde && planet !== "Rahu" && planet !== "Ketu" ? "वक्री" : "",
        isCombust ? "अस्त" : "",
        hasVedha ? `${vedhaByPlanetHi} द्वारा वेध` : "",
      ]
        .filter(Boolean)
        .join(", ");

      const verdictHi =
        finalVerdict === "Favourable" ? "शुभ" : finalVerdict === "Mixed" ? "मिश्रित" : "सावधानी अपेक्षित";

      const summaryEn = `${planet} (${rule.planetHindi}) in ${targetSign.sanskritName} (${degreeInSign}°) — ${houseFromMoon}${getOrdinalSuffix(houseFromMoon)} house from ${sign.sanskritName}${stateTagEn ? ` [${stateTagEn}]` : ""}: ${finalVerdict}`;
      const summaryHi = `${rule.planetHindi} ${targetSign.hindiName} राशि (${degreeInSign}°) में — ${sign.hindiName} से ${houseFromMoon}वें भाव में${stateTagHi ? ` [${stateTagHi}]` : ""}: ${verdictHi}`;

      return {
        planet,
        planetHi: rule.planetHindi,
        signIndex,
        signEn: `${targetSign.englishName} (${targetSign.sanskritName})`,
        signHi: targetSign.hindiName,
        degreeInSign,
        houseFromMoon,
        isRetrograde,
        isCombust,
        hasVedha,
        vedhaByPlanet,
        vedhaByPlanetHi,
        verdict: finalVerdict,
        classicalSource: rule.classicalSource,
        summaryEn,
        summaryHi,
      };
    });

    const moonTransit = planetTransits.find((t) => t.planet === "Moon")!;
    const jupiterTransit = planetTransits.find((t) => t.planet === "Jupiter")!;
    const saturnTransit = planetTransits.find((t) => t.planet === "Saturn")!;
    const marsTransit = planetTransits.find((t) => t.planet === "Mars")!;
    const venusTransit = planetTransits.find((t) => t.planet === "Venus")!;
    const mercuryTransit = planetTransits.find((t) => t.planet === "Mercury")!;
    const sunTransit = planetTransits.find((t) => t.planet === "Sun")!;

    const moonHouse = moonTransit.houseFromMoon;
    const houseBank = CHANDRA_HOUSE_PHRASE_BANK[moonHouse] ?? CHANDRA_HOUSE_PHRASE_BANK[1];

    // 2. Evaluate Rashi Lord vs Day's Weekday Lord & Nakshatra Lord friendship (Naisargika Maitri)
    const varaLordRaw = panchang.varaDetails.lord.split(" ")[0]; // e.g. "Moon"
    const nakLordRaw = panchang.nakshatra.lord.split(" ")[0]; // e.g. "Jupiter"
    const rashiMaitri = NAISARGIKA_MAITRI[sign.rulingPlanetKey];

    let maitriBonus = 0;
    if (rashiMaitri) {
      if (rashiMaitri.friends.includes(varaLordRaw) || sign.rulingPlanetKey === varaLordRaw) {
        maitriBonus += 3;
      } else if (rashiMaitri.enemies.includes(varaLordRaw)) {
        maitriBonus -= 2;
      }
      if (rashiMaitri.friends.includes(nakLordRaw) || sign.rulingPlanetKey === nakLordRaw) {
        maitriBonus += 3;
      } else if (rashiMaitri.enemies.includes(nakLordRaw)) {
        maitriBonus -= 2;
      }
    }

    // 3. Compute Explicit Domain Scores (Love, Career, Health, Finance, Family)
    const computeDomainScore = (
      domainKey: "love" | "career" | "health" | "finance"
    ): { score: number; factorsEn: string[]; factorsHi: string[] } => {
      const spec = DOMAIN_SCORING_SPEC.domains[domainKey];
      let score = DOMAIN_SCORING_SPEC.baseline + maitriBonus;
      const factorsEn: string[] = [];
      const factorsHi: string[] = [];

      // (a) Chandra Gochar house contribution
      if (spec.primaryHouses.includes(moonHouse)) {
        score += 10;
        factorsEn.push(`Moon in ${moonHouse}${getOrdinalSuffix(moonHouse)} house directly activates ${domainKey} (+10)`);
        factorsHi.push(`चन्द्रमा का ${moonHouse}वें भाव में गोचर इस क्षेत्र को सीधा बल प्रदान कर रहा है (+10)`);
      } else if (moonTransit.verdict === "Favourable") {
        score += 6;
        factorsEn.push(`Auspicious Chandra Gochar in ${moonHouse}${getOrdinalSuffix(moonHouse)} house (+6)`);
        factorsHi.push(`चन्द्रमा का ${moonHouse}वें शुभ भाव में संचरण (+6)`);
      } else if (spec.challengingHouses.includes(moonHouse)) {
        score -= 8;
        factorsEn.push(`Moon in ${moonHouse}${getOrdinalSuffix(moonHouse)} house advises patience in ${domainKey} (-8)`);
        factorsHi.push(`चन्द्रमा ${moonHouse}वें भाव में होने से संयम अपेक्षित (-8)`);
      }

      // (b) Domain Karaka Planets Gochar
      for (const karaka of spec.karakaPlanets) {
        const kt = planetTransits.find((t) => t.planet === karaka);
        if (!kt) continue;
        if (kt.verdict === "Favourable") {
          const pts = kt.isCombust ? 3 : 5;
          score += pts;
          factorsEn.push(`${kt.planet} favourable in ${kt.houseFromMoon}${getOrdinalSuffix(kt.houseFromMoon)} house (+${pts})`);
          factorsHi.push(`कारक ग्रह ${kt.planetHi} का ${kt.houseFromMoon}वें भाव में शुभ गोचर (+${pts})`);
        } else if (kt.verdict === "Mixed") {
          score += 1;
        } else {
          score -= 3;
          factorsEn.push(`${kt.planet} in ${kt.houseFromMoon}${getOrdinalSuffix(kt.houseFromMoon)} house requires steady effort (-3)`);
          factorsHi.push(`${kt.planetHi} के ${kt.houseFromMoon}वें भाव गोचर से अतिरिक्त परिश्रम आवश्यक (-3)`);
        }
      }

      // (c) Benefic occupation of primary houses for this domain
      for (const h of spec.primaryHouses) {
        const occupants = houseToPlanetsMap.get(h) ?? [];
        if (occupants.includes("Jupiter") || occupants.includes("Venus") || occupants.includes("Mercury")) {
          score += 3;
        }
      }

      return {
        score: clamp(score, DOMAIN_SCORING_SPEC.minScore, DOMAIN_SCORING_SPEC.maxScore),
        factorsEn,
        factorsHi,
      };
    };

    const loveEval = computeDomainScore("love");
    const careerEval = computeDomainScore("career");
    const healthEval = computeDomainScore("health");
    const financeEval = computeDomainScore("finance");

    const familyScore = clamp(
      Math.round((loveEval.score + financeEval.score) / 2) +
        (moonHouse === 4 || moonHouse === 2 || moonHouse === 1 ? 4 : moonHouse === 8 ? -4 : 0),
      DOMAIN_SCORING_SPEC.minScore,
      DOMAIN_SCORING_SPEC.maxScore
    );

    const avgDomain =
      (loveEval.score + careerEval.score + healthEval.score + financeEval.score) / 4;
    const overallScore =
      avgDomain >= 84 ? 5 : avgDomain >= 74 ? 4 : avgDomain >= 62 ? 3 : avgDomain >= 52 ? 2 : 1;

    // 4. Deterministic Bilingual Composition Engine (Seeded Hash + Real Transit Clauses)
    const ovIdx = seededIndex(`${civilDateStr}:${sign.id}:overview`, houseBank.overviewEn.length);
    const caIdx = seededIndex(`${civilDateStr}:${sign.id}:career`, houseBank.careerEn.length);
    const loIdx = seededIndex(`${civilDateStr}:${sign.id}:love`, houseBank.loveEn.length);
    const heIdx = seededIndex(`${civilDateStr}:${sign.id}:health`, houseBank.healthEn.length);
    const fiIdx = seededIndex(`${civilDateStr}:${sign.id}:finance`, houseBank.financeEn.length);
    const faIdx = seededIndex(`${civilDateStr}:${sign.id}:family`, houseBank.familyEn.length);

    // Build dynamic transit clauses to weave into the readings so every sign/day reflects real sky positions
    const jupiterClauseEn =
      jupiterTransit.verdict === "Favourable"
        ? `Jupiter transiting your ${jupiterTransit.houseFromMoon}${getOrdinalSuffix(jupiterTransit.houseFromMoon)} house (${jupiterTransit.signEn}) provides dharmic protection and wise counsel.`
        : `With Jupiter in your ${jupiterTransit.houseFromMoon}${getOrdinalSuffix(jupiterTransit.houseFromMoon)} house (${jupiterTransit.signEn}), thorough verification of commitments outperforms haste.`;
    const jupiterClauseHi =
      jupiterTransit.verdict === "Favourable"
        ? `देवगुरु बृहस्पति का आपके ${jupiterTransit.houseFromMoon}वें भाव (${jupiterTransit.signHi}) में शुभ गोचर विवेकपूर्ण निर्णयों और भाग्योदय में सहायक है।`
        : `देवगुरु बृहस्पति आपके ${jupiterTransit.houseFromMoon}वें भाव (${jupiterTransit.signHi}) में संचरण कर रहे हैं, अतः प्रत्येक संकल्प में धैर्य और प्रामाणिकता बनाए रखें।`;

    const saturnClauseEn =
      saturnTransit.verdict === "Favourable"
        ? `Saturn in your ${saturnTransit.houseFromMoon}${getOrdinalSuffix(saturnTransit.houseFromMoon)} house strengthens long-term perseverance and execution.`
        : `Saturn in your ${saturnTransit.houseFromMoon}${getOrdinalSuffix(saturnTransit.houseFromMoon)} house rewards disciplined time-management and methodical effort.`;
    const saturnClauseHi =
      saturnTransit.verdict === "Favourable"
        ? `शनिदेव का ${saturnTransit.houseFromMoon}वें भाव (${saturnTransit.signHi}) में गोचर आपके परिश्रम को स्थायी सफलता में परिवर्तित करेगा।`
        : `${saturnTransit.houseFromMoon}वें भाव (${saturnTransit.signHi}) में स्थित शनिदेव अनुशासन और समयबद्ध कार्यशैली की अपेक्षा रखते हैं।`;

    const summary = `${houseBank.overviewEn[ovIdx]} Today the Moon transits ${moonTransit.signEn} in ${panchang.nakshatra.name} Nakshatra (Pada ${panchang.nakshatra.pada}) during ${panchang.tithi.paksha} ${panchang.tithi.name} Tithi. ${jupiterClauseEn}`;
    const summaryHindi = `${houseBank.overviewHi[ovIdx]} आज चन्द्रमा ${moonTransit.signHi} राशि एवं ${panchang.nakshatra.nameHindi} नक्षत्र (चरण ${panchang.nakshatra.pada}) में तथा ${panchang.tithi.pakshaHindi} ${panchang.tithi.nameHindi} तिथि में संचरण कर रहे हैं। ${jupiterClauseHi}`;

    const careerTextEn = `${houseBank.careerEn[caIdx]} ${saturnClauseEn}${mercuryTransit.isRetrograde ? " With Mercury retrograde (Vakri), review written contracts and messages carefully before dispatching." : ""}`;
    const careerTextHi = `${houseBank.careerHi[caIdx]} ${saturnClauseHi}${mercuryTransit.isRetrograde ? " बुध के वक्री होने के कारण महत्वपूर्ण दस्तावेजों और पत्राचार को भेजने से पूर्व पुनः जांच लें।" : ""}`;

    const loveTextEn = `${houseBank.loveEn[loIdx]} Venus transiting your ${venusTransit.houseFromMoon}${getOrdinalSuffix(venusTransit.houseFromMoon)} house (${venusTransit.signEn}) ${venusTransit.verdict === "Favourable" ? "heightens mutual affection and graceful understanding." : "encourages gentle listening and unselfish care in relationships."}`;
    const loveTextHi = `${houseBank.loveHi[loIdx]} शुक्र का आपके ${venusTransit.houseFromMoon}वें भाव (${venusTransit.signHi}) में गोचर ${venusTransit.verdict === "Favourable" ? "संबंधों में माधुर्य और आपसी सामंजस्य को बढ़ा रहा है।" : "संवाद में कोमलता और एक-दूसरे के प्रति आदर बनाए रखने की प्रेरणा देता है।"}`;

    const healthTextEn = `${houseBank.healthEn[heIdx]} With the Sun in your ${sunTransit.houseFromMoon}${getOrdinalSuffix(sunTransit.houseFromMoon)} house and Mars in your ${marsTransit.houseFromMoon}${getOrdinalSuffix(marsTransit.houseFromMoon)} house, ${healthEval.score >= 75 ? "physical stamina and recovery remain upbeat." : "pacing your energy and staying well-hydrated will keep Pitta and fatigue in check."}`;
    const healthTextHi = `${houseBank.healthHi[heIdx]} सूर्य आपके ${sunTransit.houseFromMoon}वें भाव तथा मंगल ${marsTransit.houseFromMoon}वें भाव में स्थित हैं—${healthEval.score >= 75 ? "आत्मबल और रोग-प्रतिरोधक क्षमता उत्तम रहेगी।" : "नियमित दिनचर्या, प्राणायाम और संतुलित जल-ग्रहण से स्वास्थ्य अनुकूल बना रहेगा।"}`;

    const financeTextEn = `${houseBank.financeEn[fiIdx]} Ruling lord ${sign.rulingPlanet} and ${panchang.varaDetails.lord} shape today's financial rhythm (${financeEval.score >= 75 ? "supportive for steady gains and structured planning" : "best suited for budgeting and avoiding speculative risk"}).`;
    const financeTextHi = `${houseBank.financeHi[fiIdx]} राशि स्वामी ${sign.rulingPlanetHindi} एवं आज के वारेश ${panchang.varaDetails.lordHindi} के समन्वय से ${financeEval.score >= 75 ? "आर्थिक नियोजन और धन-संग्रह में अनुकूलता रहेगी।" : "बजट का संतुलन बनाए रखना और जोखिम भरे सौदों से बचना हितकर रहेगा।"}`;

    const familyTextEn = `${houseBank.familyEn[faIdx]} Practicing patience during ${panchang.yoga.name} Yoga brings warmth to domestic conversations.`;
    const familyTextHi = `${houseBank.familyHi[faIdx]} ${panchang.yoga.nameHindi} योग के प्रभाव में पारिवारिक संवाद में सौहार्द और बड़ों का स्नेह बना रहेगा।`;

    // 5. Select Favourable Time Window from Today's Auspicious Choghadiya
    const goodChoghadiyas = panchang.choghadiya.day.filter((c) => c.auspicious);
    const chosenSlot =
      goodChoghadiyas[seededIndex(`${civilDateStr}:${sign.id}:slot`, Math.max(1, goodChoghadiyas.length))] ??
      panchang.choghadiya.day[0];

    const auspiciousTime = chosenSlot
      ? `${chosenSlot.period} (${chosenSlot.name} Choghadiya)`
      : `${panchang.auspiciousTimings.abhijitMuhurat} (Abhijit Muhurat)`;
    const auspiciousTimeHindi = chosenSlot
      ? `${chosenSlot.periodHindi} (${chosenSlot.nameHindi} चौघड़िया)`
      : `${panchang.auspiciousTimings.abhijitMuhuratHindi} (अभिजित मुहूर्त)`;

    // 6. Select Remedy (Upay), Mantra, Lucky Colour & Number based on Rashi Lord & Challenging Transit
    const challengingTransit =
      planetTransits.find((t) => t.planet === "Moon" && t.verdict === "Unfavourable") ??
      planetTransits.find((t) => t.verdict === "Unfavourable" && (t.planet === "Saturn" || t.planet === "Mars" || t.planet === "Jupiter")) ??
      planetTransits.find((t) => t.planet === sign.rulingPlanetKey)!;

    const upayProfile = PLANET_COLOURS_AND_MANTRAS[challengingTransit.planet] ?? PLANET_COLOURS_AND_MANTRAS[sign.rulingPlanetKey];
    const rashiProfile = PLANET_COLOURS_AND_MANTRAS[sign.rulingPlanetKey];

    const luckyNumber = ((rashiProfile.baseNumber + panchang.nakshatra.pada + sign.index) % 9) + 1;

    // 7. Build "Why this reading?" (computedFacts) in English and Hindi
    const factsEn: string[] = [
      `Chandra Gochar: Transiting Moon is in ${moonTransit.signEn} (${moonTransit.degreeInSign}°), which is the ${moonHouse}${getOrdinalSuffix(moonHouse)} house from your ${sign.sanskritName} (${sign.englishName}) Rashi — classified as ${moonTransit.verdict} in classical Phaladeepika Gochara.`,
      `Daily Panchang Alignment: ${panchang.tithi.paksha} ${panchang.tithi.name} Tithi (until ${panchang.tithi.endsAt}), ${panchang.nakshatra.name} Nakshatra Pada ${panchang.nakshatra.pada} (ruled by ${panchang.nakshatra.lord}), and ${panchang.yoga.name} Yoga on ${panchang.varaDetails.name} (ruled by ${panchang.varaDetails.lord}).`,
      `Major Slower Transits: Jupiter in ${jupiterTransit.signEn} (${jupiterTransit.houseFromMoon}${getOrdinalSuffix(jupiterTransit.houseFromMoon)} house — ${jupiterTransit.verdict}), Saturn in ${saturnTransit.signEn} (${saturnTransit.houseFromMoon}${getOrdinalSuffix(saturnTransit.houseFromMoon)} house — ${saturnTransit.verdict}), Rahu in ${planetTransits.find((t) => t.planet === "Rahu")!.signEn} (${planetTransits.find((t) => t.planet === "Rahu")!.houseFromMoon}${getOrdinalSuffix(planetTransits.find((t) => t.planet === "Rahu")!.houseFromMoon)} house).`,
      `Inner Planet Motion & States: Sun in ${sunTransit.signEn} (${sunTransit.houseFromMoon}H), Mars in ${marsTransit.signEn} (${marsTransit.houseFromMoon}H${marsTransit.isRetrograde ? ", Retrograde" : ""}${marsTransit.isCombust ? ", Combust" : ""}), Mercury in ${mercuryTransit.signEn} (${mercuryTransit.houseFromMoon}H${mercuryTransit.isRetrograde ? ", Retrograde" : ""}${mercuryTransit.isCombust ? ", Combust" : ""}), Venus in ${venusTransit.signEn} (${venusTransit.houseFromMoon}H${venusTransit.isRetrograde ? ", Retrograde" : ""}${venusTransit.isCombust ? ", Combust" : ""}).`,
      `Lahiri Ayanamsa (${sky.ayanamsa.toFixed(4)}°): All planetary longitudes and house cusps are calculated astronomically for ${civilDateStr} using the Chitra Paksha Lahiri sidereal zodiac.`,
    ];

    const factsHi: string[] = [
      `चन्द्र गोचर: आज गोचरस्थ चन्द्रमा ${moonTransit.signHi} राशि (${moonTransit.degreeInSign}°) में स्थित हैं, जो आपकी ${sign.hindiName} राशि से ${moonHouse}वां भाव (${houseBank.houseNameHi}) है — फलदीपिका गोचर शास्त्र के अनुसार यह '${moonTransit.verdict === "Favourable" ? "शुभ फलदायी" : moonTransit.verdict === "Mixed" ? "मिश्रित फलदायी" : "संयम एवं सावधानी सूचक"}' है।`,
      `दैनिक पंचांग समन्वय: ${panchang.tithi.pakshaHindi} ${panchang.tithi.nameHindi} तिथि (${panchang.tithi.endsAtHindi} तक), ${panchang.nakshatra.nameHindi} नक्षत्र चरण ${panchang.nakshatra.pada} (स्वामी: ${panchang.nakshatra.lordHindi}), ${panchang.yoga.nameHindi} योग तथा ${panchang.varaDetails.nameHindi} (वारेश: ${panchang.varaDetails.lordHindi})।`,
      `प्रमुख मंदगति ग्रह गोचर: देवगुरु बृहस्पति ${jupiterTransit.signHi} में (${jupiterTransit.houseFromMoon}वां भाव — ${jupiterTransit.verdict === "Favourable" ? "शुभ" : "मिश्रित/विचारणीय"}), शनिदेव ${saturnTransit.signHi} में (${saturnTransit.houseFromMoon}वां भाव — ${saturnTransit.verdict === "Favourable" ? "शुभ" : "मिश्रित/परिश्रम सूचक"}), तथा राहु ${planetTransits.find((t) => t.planet === "Rahu")!.signHi} में (${planetTransits.find((t) => t.planet === "Rahu")!.houseFromMoon}वां भाव)।`,
      `शीघ्रगामी ग्रह एवं वक्री/अस्त स्थिति: सूर्य ${sunTransit.signHi} (${sunTransit.houseFromMoon}वें भाव), मंगल ${marsTransit.signHi} (${marsTransit.houseFromMoon}वें भाव${marsTransit.isRetrograde ? ", वक्री" : ""}${marsTransit.isCombust ? ", अस्त" : ""}), बुध ${mercuryTransit.signHi} (${mercuryTransit.houseFromMoon}वें भाव${mercuryTransit.isRetrograde ? ", वक्री" : ""}${mercuryTransit.isCombust ? ", अस्त" : ""}), शुक्र ${venusTransit.signHi} (${venusTransit.houseFromMoon}वें भाव${venusTransit.isRetrograde ? ", वक्री" : ""}${venusTransit.isCombust ? ", अस्त" : ""})।`,
      `चित्रापक्ष लाहिड़ी अयनांश (${sky.ayanamsa.toFixed(4)}°): यह संपूर्ण राशिफल ${civilDateStr} के वास्तविक निरयण ग्रह स्पष्ट पर आधारित है।`,
    ];

    const planetaryTransitSummaryEn = `Moon in ${moonTransit.signEn} (${moonHouse}${getOrdinalSuffix(moonHouse)} house) • Jupiter in ${jupiterTransit.signEn} (${jupiterTransit.houseFromMoon}${getOrdinalSuffix(jupiterTransit.houseFromMoon)} house) • Saturn in ${saturnTransit.signEn} (${saturnTransit.houseFromMoon}${getOrdinalSuffix(saturnTransit.houseFromMoon)} house)`;
    const planetaryTransitSummaryHi = `चन्द्रमा ${moonTransit.signHi} में (${moonHouse}वां भाव) • गुरु ${jupiterTransit.signHi} में (${jupiterTransit.houseFromMoon}वां भाव) • शनि ${saturnTransit.signHi} में (${saturnTransit.houseFromMoon}वां भाव)`;

    const result: DailyHoroscope = {
      sign,
      date: civilDateStr,
      formattedDate,
      formattedDateHindi,
      overallScore,
      summary,
      summaryHindi,
      love: {
        score: loveEval.score,
        description: loveTextEn,
        descriptionHindi: loveTextHi,
        factorsEn: loveEval.factorsEn,
        factorsHi: loveEval.factorsHi,
      },
      career: {
        score: careerEval.score,
        description: careerTextEn,
        descriptionHindi: careerTextHi,
        factorsEn: careerEval.factorsEn,
        factorsHi: careerEval.factorsHi,
      },
      health: {
        score: healthEval.score,
        description: healthTextEn,
        descriptionHindi: healthTextHi,
        factorsEn: healthEval.factorsEn,
        factorsHi: healthEval.factorsHi,
      },
      finance: {
        score: financeEval.score,
        description: financeTextEn,
        descriptionHindi: financeTextHi,
        factorsEn: financeEval.factorsEn,
        factorsHi: financeEval.factorsHi,
      },
      family: {
        score: familyScore,
        description: familyTextEn,
        descriptionHindi: familyTextHi,
        factorsEn: [
          `Evaluated from 4th (Sukha) & 2nd (Kutumba) houses and ${panchang.yoga.name} Yoga`,
        ],
        factorsHi: [
          `चतुर्थ (सुख) व द्वितीय (कुटुंब) भाव तथा ${panchang.yoga.nameHindi} योग के आधार पर निर्धारित`,
        ],
      },
      luckyColor: rashiProfile.colorEn,
      luckyColorHindi: rashiProfile.colorHi,
      luckyNumber,
      auspiciousTime,
      auspiciousTimeHindi,
      remedy: upayProfile.remedyEn,
      remedyHindi: upayProfile.remedyHi,
      mantra: upayProfile.mantraEn,
      mantraHindi: upayProfile.mantraHi,
      planetaryTransit: planetaryTransitSummaryEn,
      planetaryTransitHindi: planetaryTransitSummaryHi,
      computedFacts: {
        ayanamsaDeg: `${sky.ayanamsa.toFixed(4)}° (Lahiri / Chitrapaksha)`,
        moonRashiEn: `${sign.englishName} (${sign.sanskritName})`,
        moonRashiHi: sign.hindiName,
        transitingMoonRashiEn: moonTransit.signEn,
        transitingMoonRashiHi: moonTransit.signHi,
        moonHouseFromRashi: moonHouse,
        moonHouseNameEn: houseBank.houseNameEn,
        moonHouseNameHi: houseBank.houseNameHi,
        moonHouseVerdict: moonTransit.verdict,
        nakshatraEn: panchang.nakshatra.name,
        nakshatraHi: panchang.nakshatra.nameHindi,
        nakshatraPada: panchang.nakshatra.pada,
        nakshatraLordEn: panchang.nakshatra.lord,
        nakshatraLordHi: panchang.nakshatra.lordHindi,
        tithiEn: panchang.tithi.name,
        tithiHi: panchang.tithi.nameHindi,
        pakshaEn: panchang.tithi.paksha,
        pakshaHi: panchang.tithi.pakshaHindi,
        yogaEn: panchang.yoga.name,
        yogaHi: panchang.yoga.nameHindi,
        varaEn: panchang.varaDetails.name,
        varaHi: panchang.varaDetails.nameHindi,
        varaLordEn: panchang.varaDetails.lord,
        varaLordHi: panchang.varaDetails.lordHindi,
        planetTransits,
        factsEn,
        factsHi,
      },
    };

    if (horoscopeMemoryCache.size >= MAX_HOROSCOPE_CACHE_ENTRIES) {
      const oldestKey = horoscopeMemoryCache.keys().next().value;
      if (oldestKey) horoscopeMemoryCache.delete(oldestKey);
    }
    horoscopeMemoryCache.set(cacheKey, {
      value: result,
      createdAtMs: Date.now(),
    });

    return result;
  }

  static getCacheStats() {
    return {
      entriesCount: horoscopeMemoryCache.size,
      maxEntries: MAX_HOROSCOPE_CACHE_ENTRIES,
      ttlSeconds: HOROSCOPE_CACHE_TTL_MS / 1000,
      cacheHits: horoscopeCacheHits,
      cacheMisses: horoscopeCacheMisses,
      sampleKeys: Array.from(horoscopeMemoryCache.keys()).slice(0, 8),
    };
  }
}

const MAX_HOROSCOPE_CACHE_ENTRIES = 240;
const HOROSCOPE_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const horoscopeMemoryCache = new Map<string, { value: DailyHoroscope; createdAtMs: number }>();
let horoscopeCacheHits = 0;
let horoscopeCacheMisses = 0;

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
