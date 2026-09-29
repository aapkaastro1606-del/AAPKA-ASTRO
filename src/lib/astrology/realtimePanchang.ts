/**
 * ============================================================================
 * HIGH-PRECISION DRIK GANITA PANCHANG ENGINE (POWERED BY ASTRONOMY-ENGINE)
 * ============================================================================
 * Astronomical Conventions Documented & Enforced:
 * 1. Ayanamsa: Chitra Paksha Lahiri Ayanamsa (23°51'25.53" at J2000.0 with
 *    50.290966"/yr precession rate, matching the Indian Calendar Reform
 *    Committee / Rashtriya Panchang standard).
 * 2. Sunrise / Sunset: Apparent upper limb of the solar disk with standard
 *    atmospheric refraction (34' horizontal refraction + 16' solar semi-diameter
 *    = geometric solar altitude of -0.8333°), via Astronomy.SearchRiseSet.
 * 3. Panchang Day Window: Runs from local Sunrise(Day 0) to Sunrise(Day + 1).
 *    The day's primary Tithi/Nakshatra/Yoga/Karana is the limb prevailing at
 *    Sunrise(Day 0), accompanied by exact bisection root-found end times and
 *    subsequent intra-day transitions.
 * 4. Rahu / Ketu Node Convention: Computes both Mean Lunar Node (Madhyama Rahu)
 *    and True Oscillating Lunar Node (Spashta Rahu), defaulting to Mean Node
 *    for Drik/Lahiri consistency while exposing both in the report.
 * 5. Timezone Handling: Full IANA timezone formatting via Intl.DateTimeFormat
 *    (including automatic DST for Europe/London, America/New_York, etc.),
 *    with explicit next-day date labels for all post-midnight times.
 */

import * as Astronomy from "astronomy-engine";
import { FESTIVALS_2026, HinduFestival } from "./festivalService";

export interface PanchangLocation {
  id: string;
  name: string;
  nameHindi: string;
  state: string;
  stateHindi: string;
  lat: number;
  lon: number;
  timeZone: string; // IANA timezone identifier
}

export const PANCHANG_LOCATIONS: PanchangLocation[] = [
  { id: "delhi", name: "New Delhi", nameHindi: "नई दिल्ली", state: "Delhi NCR", stateHindi: "दिल्ली एनसीआर", lat: 28.6139, lon: 77.2090, timeZone: "Asia/Kolkata" },
  { id: "varanasi", name: "Varanasi (Kashi)", nameHindi: "वाराणसी (काशी)", state: "Uttar Pradesh", stateHindi: "उत्तर प्रदेश", lat: 25.3176, lon: 82.9739, timeZone: "Asia/Kolkata" },
  { id: "ujjain", name: "Ujjain (Avantika)", nameHindi: "उज्जैन (अवन्तिका)", state: "Madhya Pradesh", stateHindi: "मध्य प्रदेश", lat: 23.1765, lon: 75.7885, timeZone: "Asia/Kolkata" },
  { id: "ayodhya", name: "Ayodhya", nameHindi: "अयोध्या", state: "Uttar Pradesh", stateHindi: "उत्तर प्रदेश", lat: 26.7922, lon: 82.1998, timeZone: "Asia/Kolkata" },
  { id: "haridwar", name: "Haridwar", nameHindi: "हरिद्वार", state: "Uttarakhand", stateHindi: "उत्तराखंड", lat: 29.9457, lon: 78.1642, timeZone: "Asia/Kolkata" },
  { id: "mumbai", name: "Mumbai", nameHindi: "मुंबई", state: "Maharashtra", stateHindi: "महाराष्ट्र", lat: 19.0760, lon: 72.8777, timeZone: "Asia/Kolkata" },
  { id: "bengaluru", name: "Bengaluru", nameHindi: "बेंगलुरु", state: "Karnataka", stateHindi: "कर्नाटक", lat: 12.9716, lon: 77.5946, timeZone: "Asia/Kolkata" },
  { id: "jaipur", name: "Jaipur", nameHindi: "जयपुर", state: "Rajasthan", stateHindi: "राजस्थान", lat: 26.9124, lon: 75.7873, timeZone: "Asia/Kolkata" },
  { id: "kolkata", name: "Kolkata", nameHindi: "कोलकाता", state: "West Bengal", stateHindi: "पश्चिम बंगाल", lat: 22.5726, lon: 88.3639, timeZone: "Asia/Kolkata" },
  { id: "chennai", name: "Chennai", nameHindi: "चेन्नई", state: "Tamil Nadu", stateHindi: "तमिलनाडु", lat: 13.0827, lon: 80.2707, timeZone: "Asia/Kolkata" },
  { id: "hyderabad", name: "Hyderabad", nameHindi: "हैदराबाद", state: "Telangana", stateHindi: "तेलंगाना", lat: 17.3850, lon: 78.4867, timeZone: "Asia/Kolkata" },
  { id: "ahmedabad", name: "Ahmedabad", nameHindi: "अहमदाबाद", state: "Gujarat", stateHindi: "गुजरात", lat: 23.0225, lon: 72.5714, timeZone: "Asia/Kolkata" },
  { id: "pune", name: "Pune", nameHindi: "पुणे", state: "Maharashtra", stateHindi: "महाराष्ट्र", lat: 18.5204, lon: 73.8567, timeZone: "Asia/Kolkata" },
  { id: "lucknow", name: "Lucknow", nameHindi: "लखनऊ", state: "Uttar Pradesh", stateHindi: "उत्तर प्रदेश", lat: 26.8467, lon: 80.9462, timeZone: "Asia/Kolkata" },
  { id: "patna", name: "Patna", nameHindi: "पटना", state: "Bihar", stateHindi: "बिहार", lat: 25.5941, lon: 85.1376, timeZone: "Asia/Kolkata" },
  { id: "deoghar", name: "Deoghar (Baidyanath Dham)", nameHindi: "देवघर (बैद्यनाथ धाम)", state: "Jharkhand", stateHindi: "झारखंड", lat: 24.4852, lon: 86.6947, timeZone: "Asia/Kolkata" },
  { id: "london", name: "London", nameHindi: "लंदन (यू.के.)", state: "United Kingdom", stateHindi: "यूनाइटेड किंगडम", lat: 51.5074, lon: -0.1278, timeZone: "Europe/London" },
  { id: "new_york", name: "New York", nameHindi: "न्यूयॉर्क (यू.एस.ए.)", state: "United States", stateHindi: "संयुक्त राज्य अमेरिका", lat: 40.7128, lon: -74.0060, timeZone: "America/New_York" },
  { id: "toronto", name: "Toronto", nameHindi: "टोरंटो (कनाडा)", state: "Canada", stateHindi: "कनाडा", lat: 43.6532, lon: -79.3832, timeZone: "America/Toronto" },
  { id: "dubai", name: "Dubai", nameHindi: "दुबई (यू.ए.ई.)", state: "UAE", stateHindi: "संयुक्त अरब अमीरात", lat: 25.2048, lon: 55.2708, timeZone: "Asia/Dubai" },
  { id: "singapore", name: "Singapore", nameHindi: "सिंगापुर", state: "Singapore", stateHindi: "सिंगापुर", lat: 1.3521, lon: 103.8198, timeZone: "Asia/Singapore" },
];

export const TITHI_DATA = [
  { en: "Pratipada", hi: "प्रतिपदा" },
  { en: "Dwitiya", hi: "द्वितीया" },
  { en: "Tritiya", hi: "तृतीया" },
  { en: "Chaturthi", hi: "चतुर्थी" },
  { en: "Panchami", hi: "पंचमी" },
  { en: "Shashthi", hi: "षष्ठी" },
  { en: "Saptami", hi: "सप्तमी" },
  { en: "Ashtami", hi: "अष्टमी" },
  { en: "Navami", hi: "नवमी" },
  { en: "Dashami", hi: "दशमी" },
  { en: "Ekadashi", hi: "एकादशी" },
  { en: "Dwadashi", hi: "द्वादशी" },
  { en: "Trayodashi", hi: "त्रयोदशी" },
  { en: "Chaturdashi", hi: "चतुर्दशी" },
  { en: "Purnima", hi: "पूर्णिमा" },
  { en: "Pratipada", hi: "प्रतिपदा" },
  { en: "Dwitiya", hi: "द्वितीया" },
  { en: "Tritiya", hi: "तृतीया" },
  { en: "Chaturthi", hi: "चतुर्थी" },
  { en: "Panchami", hi: "पंचमी" },
  { en: "Shashthi", hi: "षष्ठी" },
  { en: "Saptami", hi: "सप्तमी" },
  { en: "Ashtami", hi: "अष्टमी" },
  { en: "Navami", hi: "नवमी" },
  { en: "Dashami", hi: "दशमी" },
  { en: "Ekadashi", hi: "एकादशी" },
  { en: "Dwadashi", hi: "द्वादशी" },
  { en: "Trayodashi", hi: "त्रयोदशी" },
  { en: "Chaturdashi", hi: "चतुर्दशी" },
  { en: "Amavasya", hi: "अमावस्या" },
];

export const NAKSHATRA_DATA = [
  { en: "Ashwini", hi: "अश्विनी", lordEn: "Ketu", lordHi: "केतु" },
  { en: "Bharani", hi: "भरणी", lordEn: "Venus (Shukra)", lordHi: "शुक्र" },
  { en: "Krittika", hi: "कृत्तिका", lordEn: "Sun (Surya)", lordHi: "सूर्य" },
  { en: "Rohini", hi: "रोहिणी", lordEn: "Moon (Chandra)", lordHi: "चन्द्र" },
  { en: "Mrigashira", hi: "मृगशिरा", lordEn: "Mars (Mangal)", lordHi: "मंगल" },
  { en: "Ardra", hi: "आर्द्रा", lordEn: "Rahu", lordHi: "राहु" },
  { en: "Punarvasu", hi: "पुनर्वसु", lordEn: "Jupiter (Guru)", lordHi: "गुरु (बृहस्पति)" },
  { en: "Pushya", hi: "पुष्य", lordEn: "Saturn (Shani)", lordHi: "शनि" },
  { en: "Ashlesha", hi: "आश्लेषा", lordEn: "Mercury (Budh)", lordHi: "बुध" },
  { en: "Magha", hi: "मघा", lordEn: "Ketu", lordHi: "केतु" },
  { en: "Purva Phalguni", hi: "पूर्वा फाल्गुनी", lordEn: "Venus (Shukra)", lordHi: "शुक्र" },
  { en: "Uttara Phalguni", hi: "उत्तरा फाल्गुनी", lordEn: "Sun (Surya)", lordHi: "सूर्य" },
  { en: "Hasta", hi: "हस्त", lordEn: "Moon (Chandra)", lordHi: "चन्द्र" },
  { en: "Chitra", hi: "चित्रा", lordEn: "Mars (Mangal)", lordHi: "मंगल" },
  { en: "Swati", hi: "स्वाति", lordEn: "Rahu", lordHi: "राहु" },
  { en: "Vishakha", hi: "विशाखा", lordEn: "Jupiter (Guru)", lordHi: "गुरु (बृहस्पति)" },
  { en: "Anuradha", hi: "अनुराधा", lordEn: "Saturn (Shani)", lordHi: "शनि" },
  { en: "Jyeshtha", hi: "ज्येष्ठा", lordEn: "Mercury (Budh)", lordHi: "बुध" },
  { en: "Mula", hi: "मूल", lordEn: "Ketu", lordHi: "केतु" },
  { en: "Purva Ashadha", hi: "पूर्वाषाढ़ा", lordEn: "Venus (Shukra)", lordHi: "शुक्र" },
  { en: "Uttara Ashadha", hi: "उत्तराषाढ़ा", lordEn: "Sun (Surya)", lordHi: "सूर्य" },
  { en: "Shravana", hi: "श्रवण", lordEn: "Moon (Chandra)", lordHi: "चन्द्र" },
  { en: "Dhanishta", hi: "धनिष्ठा", lordEn: "Mars (Mangal)", lordHi: "मंगल" },
  { en: "Shatabhisha", hi: "शतभिषा", lordEn: "Rahu", lordHi: "राहु" },
  { en: "Purva Bhadrapada", hi: "पूर्वा भाद्रपद", lordEn: "Jupiter (Guru)", lordHi: "गुरु (बृहस्पति)" },
  { en: "Uttara Bhadrapada", hi: "उत्तरा भाद्रपद", lordEn: "Saturn (Shani)", lordHi: "शनि" },
  { en: "Revati", hi: "रेवती", lordEn: "Mercury (Budh)", lordHi: "बुध" },
];

export const YOGA_DATA = [
  { en: "Vishkambha", hi: "विष्कम्भ", auspicious: false },
  { en: "Priti", hi: "प्रीति", auspicious: true },
  { en: "Ayushman", hi: "आयुष्मान", auspicious: true },
  { en: "Saubhagya", hi: "सौभाग्य", auspicious: true },
  { en: "Shobhana", hi: "शोभन", auspicious: true },
  { en: "Atiganda", hi: "अतिगण्ड", auspicious: false },
  { en: "Sukarma", hi: "सुकर्मा", auspicious: true },
  { en: "Dhriti", hi: "धृति", auspicious: true },
  { en: "Shula", hi: "शूल", auspicious: false },
  { en: "Ganda", hi: "गण्ड", auspicious: false },
  { en: "Vriddhi", hi: "वृद्धि", auspicious: true },
  { en: "Dhruva", hi: "ध्रुव", auspicious: true },
  { en: "Vyaghata", hi: "व्याघात", auspicious: false },
  { en: "Harshana", hi: "हर्षण", auspicious: true },
  { en: "Vajra", hi: "वज्र", auspicious: false },
  { en: "Siddhi", hi: "सिद्धि", auspicious: true },
  { en: "Vyatipata", hi: "व्यतीपात", auspicious: false },
  { en: "Variyan", hi: "वरीयान", auspicious: true },
  { en: "Parigha", hi: "परिघ", auspicious: false },
  { en: "Shiva", hi: "शिव", auspicious: true },
  { en: "Siddha", hi: "सिद्ध", auspicious: true },
  { en: "Sadhya", hi: "साध्य", auspicious: true },
  { en: "Shubha", hi: "शुभ", auspicious: true },
  { en: "Shukla", hi: "शुक्ल", auspicious: true },
  { en: "Brahma", hi: "ब्रह्म", auspicious: true },
  { en: "Indra", hi: "इन्द्र", auspicious: true },
  { en: "Vaidhriti", hi: "वैधृति", auspicious: false },
];

export const MOVABLE_KARANAS = [
  { en: "Bava", hi: "बव", isBhadra: false },
  { en: "Balava", hi: "बालव", isBhadra: false },
  { en: "Kaulava", hi: "कौलव", isBhadra: false },
  { en: "Taitila", hi: "तैतिल", isBhadra: false },
  { en: "Gara", hi: "गर", isBhadra: false },
  { en: "Vanija", hi: "वणिज", isBhadra: false },
  { en: "Vishti (Bhadra)", hi: "विष्टि (भद्रा)", isBhadra: true },
];

export const RASHI_DATA = [
  { id: "aries", en: "Mesha (Aries)", hi: "मेष", shortEn: "Mesha", lordEn: "Mars (Mangal)", lordHi: "मंगल" },
  { id: "taurus", en: "Vrishabha (Taurus)", hi: "वृषभ", shortEn: "Vrishabha", lordEn: "Venus (Shukra)", lordHi: "शुक्र" },
  { id: "gemini", en: "Mithuna (Gemini)", hi: "मिथुन", shortEn: "Mithuna", lordEn: "Mercury (Budh)", lordHi: "बुध" },
  { id: "cancer", en: "Karka (Cancer)", hi: "कर्क", shortEn: "Karka", lordEn: "Moon (Chandra)", lordHi: "चन्द्र" },
  { id: "leo", en: "Simha (Leo)", hi: "सिंह", shortEn: "Simha", lordEn: "Sun (Surya)", lordHi: "सूर्य" },
  { id: "virgo", en: "Kanya (Virgo)", hi: "कन्या", shortEn: "Kanya", lordEn: "Mercury (Budh)", lordHi: "बुध" },
  { id: "libra", en: "Tula (Libra)", hi: "तुला", shortEn: "Tula", lordEn: "Venus (Shukra)", lordHi: "शुक्र" },
  { id: "scorpio", en: "Vrishchika (Scorpio)", hi: "वृश्चिक", shortEn: "Vrishchika", lordEn: "Mars (Mangal)", lordHi: "मंगल" },
  { id: "sagittarius", en: "Dhanu (Sagittarius)", hi: "धनु", shortEn: "Dhanu", lordEn: "Jupiter (Guru)", lordHi: "गुरु" },
  { id: "capricorn", en: "Makara (Capricorn)", hi: "मकर", shortEn: "Makara", lordEn: "Saturn (Shani)", lordHi: "शनि" },
  { id: "aquarius", en: "Kumbha (Aquarius)", hi: "कुम्भ", shortEn: "Kumbha", lordEn: "Saturn (Shani)", lordHi: "शनि" },
  { id: "pisces", en: "Meena (Pisces)", hi: "मीन", shortEn: "Meena", lordEn: "Jupiter (Guru)", lordHi: "गुरु" },
];

export const MASA_DATA = [
  { en: "Chaitra", hi: "चैत्र" },
  { en: "Vaishakha", hi: "वैशाख" },
  { en: "Jyeshtha", hi: "ज्येष्ठ" },
  { en: "Ashadha", hi: "आषाढ़" },
  { en: "Shravana", hi: "श्रावण" },
  { en: "Bhadrapada", hi: "भाद्रपद" },
  { en: "Ashwin", hi: "आश्विन" },
  { en: "Kartika", hi: "कार्तिक" },
  { en: "Margashirsha", hi: "मार्गशीर्ष (अगहन)" },
  { en: "Pausha", hi: "पौष" },
  { en: "Magha", hi: "माघ" },
  { en: "Phalguna", hi: "फाल्गुन" },
];

export const VARA_DATA = [
  { en: "Ravivara (Sunday)", hi: "रविवार", lordEn: "Surya (Sun)", lordHi: "सूर्य देव", dishaShoolEn: "West", dishaShoolHi: "पश्चिम" },
  { en: "Somavara (Monday)", hi: "सोमवार", lordEn: "Chandra (Moon)", lordHi: "चन्द्र देव", dishaShoolEn: "East", dishaShoolHi: "पूर्व" },
  { en: "Mangalavara (Tuesday)", hi: "मंगलवार", lordEn: "Mangal (Mars)", lordHi: "मंगल देव", dishaShoolEn: "North", dishaShoolHi: "उत्तर" },
  { en: "Budhavara (Wednesday)", hi: "बुधवार", lordEn: "Budha (Mercury)", lordHi: "बुध देव", dishaShoolEn: "North", dishaShoolHi: "उत्तर" },
  { en: "Guruvara (Thursday)", hi: "गुरुवार (बृहस्पतिवार)", lordEn: "Brihaspati (Jupiter)", lordHi: "बृहस्पति देव", dishaShoolEn: "South", dishaShoolHi: "दक्षिण" },
  { en: "Shukravara (Friday)", hi: "शुक्रवार", lordEn: "Shukra (Venus)", lordHi: "शुक्र देव", dishaShoolEn: "West", dishaShoolHi: "पश्चिम" },
  { id: 6, en: "Shanivara (Saturday)", hi: "शनिवार", lordEn: "Shani (Saturn)", lordHi: "शनि देव", dishaShoolEn: "East", dishaShoolHi: "पूर्व" },
];

// Classical Varjyam & Amrit Kaal start Ghatika (out of 60 Ghatikas of Nakshatra duration; each lasts 4 Ghatikas)
const VARJYAM_START_GHATIKA = [
  50, 24, 30, 40, 14, 21, 30, 20, 32, 30, 20, 18, 21, 20,
  14, 14, 10, 14, 20, 24, 20, 10, 10, 18, 16, 24, 30,
];
const AMRIT_START_GHATIKA = [
  42, 48, 54, 52, 38, 45, 54, 44, 56, 54, 44, 42, 45, 44,
  38, 38, 34, 38, 44, 48, 44, 34, 34, 42, 40, 48, 54,
];

export interface ChoghadiyaSlot {
  period: string;
  periodHindi: string;
  name: "Udveg" | "Char" | "Labh" | "Amrit" | "Kaal" | "Shubh" | "Rog";
  nameHindi: string;
  rulerEn: string;
  rulerHi: string;
  auspicious: boolean;
  natureEn: string;
  natureHi: string;
  startMs: number;
  endMs: number;
  endTimeEn: string;
  endTimeHi: string;
}

export interface CustomPanchangLocation {
  id?: string;
  name: string;
  nameHindi?: string;
  state?: string;
  stateHindi?: string;
  lat: number;
  lon: number;
  timeZone: string;
}

export interface ChandrabalamEntry {
  rashiId: string;
  rashiEn: string;
  rashiHi: string;
  transitHouse: number;
  status: "Favourable" | "Moderate" | "Unfavourable";
  statusHi: string;
  noteEn: string;
  noteHi: string;
}

export interface FestivalOrVratItem {
  id: string;
  name: string;
  nameHindi: string;
  category: string;
  categoryHindi: string;
  description: string;
  descriptionHindi: string;
}

export type AuspiciousYogaId =
  | "sarvartha_siddhi"
  | "ravi_yog"
  | "amrit_yog"
  | "amrit_siddhi"
  | "guru_pushya";

export interface AuspiciousYogaItem {
  id: AuspiciousYogaId;
  nameEn: string;
  nameHi: string;
  isActive: boolean;
  timingEn: string;
  timingHi: string;
  descriptionEn: string;
  descriptionHi: string;
  ruleEn: string;
  ruleHi: string;
}

export function normalize360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Chitra Paksha Lahiri Ayanamsa (23°51'25.53" at J2000.0 + 50.290966"/yr precession)
 */
export function getLahiriAyanamsaAtDate(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const daysFromJ2000 = jd - 2451545.0;
  return 23.85709167 + (daysFromJ2000 * 50.290966) / (365.25 * 3600);
}

export function getSunMoonSiderealAt(date: Date): {
  sunTrop: number;
  moonTrop: number;
  sunSid: number;
  moonSid: number;
  ayanamsa: number;
  meanRahuSid: number;
  trueRahuSid: number;
} {
  const time = Astronomy.MakeTime(date);
  const ayanamsa = getLahiriAyanamsaAtDate(date);

  const sunPos = Astronomy.SunPosition(time);
  const moonVec = Astronomy.GeoMoon(time);
  const moonEcl = Astronomy.Ecliptic(moonVec);

  const sunTrop = normalize360(sunPos.elon);
  const moonTrop = normalize360(moonEcl.elon);
  const sunSid = normalize360(sunTrop - ayanamsa);
  const moonSid = normalize360(moonTrop - ayanamsa);

  // Mean & True Rahu (Ascending Lunar Node)
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;
  const meanOmega = normalize360(
    125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000.0
  );
  // Principal periodic terms for True Node (Meeus Ch. 47)
  const D = ((297.8501921 + 445267.1114034 * T) * Math.PI) / 180;
  const M = ((357.5291092 + 35999.0502909 * T) * Math.PI) / 180;
  const Mp = ((134.9633964 + 477198.8675055 * T) * Math.PI) / 180;
  const F = ((93.2720950 + 483202.0175233 * T) * Math.PI) / 180;
  const deltaOmega =
    -1.4979 * Math.sin(2 * (D - F)) -
    0.1500 * Math.sin(M) -
    0.1226 * Math.sin(2 * D) +
    0.1176 * Math.sin(2 * F) -
    0.0801 * Math.sin(2 * (Mp - F));
  const trueOmega = normalize360(meanOmega + deltaOmega);

  return {
    sunTrop,
    moonTrop,
    sunSid,
    moonSid,
    ayanamsa,
    meanRahuSid: normalize360(meanOmega - ayanamsa),
    trueRahuSid: normalize360(trueOmega - ayanamsa),
  };
}

/**
 * Finds the exact Date when a monotonically increasing modular angle `angleFn(t)`
 * crosses `targetDeg` after `startDate`, using 2-hour bracketing + 22-step bisection (~0.002s accuracy).
 */
function findAngleCrossingAfter(
  startDate: Date,
  angleFn: (d: Date) => number,
  stepDeg: number,
  maxHours: number = 40
): { endTime: Date; currentIndex: number; nextIndex: number } {
  const startAngle = angleFn(startDate);
  const totalBins = Math.round(360 / stepDeg);
  const currentIndex = Math.floor(startAngle / stepDeg) % totalBins;
  const nextIndex = (currentIndex + 1) % totalBins;
  const targetDistance = ((currentIndex + 1) * stepDeg - startAngle + 360) % 360 || stepDeg;

  const stepMs = 2 * 3600 * 1000; // 2 hours
  let tLow = startDate.getTime();
  let tHigh = tLow + stepMs;
  const maxMs = startDate.getTime() + maxHours * 3600 * 1000;

  while (tHigh <= maxMs) {
    const curAngle = angleFn(new Date(tHigh));
    const progressed = normalize360(curAngle - startAngle);
    if (progressed >= targetDistance && progressed < targetDistance + 90) {
      break;
    }
    tLow = tHigh;
    tHigh += stepMs;
  }

  for (let i = 0; i < 22; i++) {
    const tMid = 0.5 * (tLow + tHigh);
    const midAngle = angleFn(new Date(tMid));
    const progressed = normalize360(midAngle - startAngle);
    if (progressed >= targetDistance && progressed < targetDistance + 90) {
      tHigh = tMid;
    } else {
      tLow = tMid;
    }
  }

  return {
    endTime: new Date(0.5 * (tLow + tHigh)),
    currentIndex,
    nextIndex,
  };
}

/**
 * Formats a timestamp in the target IANA timezone.
 * If the timestamp falls on a subsequent civil day (after midnight), explicitly
 * appends the date and "(next day)" / "(अगले दिन)" so it can never be misread as AM of the same day.
 */
export function formatTimeInZone(
  instant: Date,
  civilDateStr: string,
  timeZone: string
): { en: string; hi: string; isNextDay: boolean } {
  const partsFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const instantDateStr = partsFmt.format(instant); // YYYY-MM-DD in target timeZone
  const isSameDay = instantDateStr === civilDateStr;
  const isNextDay = instantDateStr > civilDateStr;

  const timeEn = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(instant);

  const timeHi = timeEn.replace(/\bAM\b/i, "प्रातः").replace(/\bPM\b/i, "सायं");

  if (isSameDay) {
    return { en: timeEn, hi: timeHi, isNextDay: false };
  }

  const shortDateEn = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
  }).format(instant);

  const shortDateHi = new Intl.DateTimeFormat("hi-IN", {
    timeZone,
    month: "short",
    day: "numeric",
  }).format(instant);

  if (isNextDay) {
    return {
      en: `${timeEn}, ${shortDateEn} (next day)`,
      hi: `${timeHi}, ${shortDateHi} (अगले दिन)`,
      isNextDay: true,
    };
  }

  return {
    en: `${timeEn}, ${shortDateEn} (prev night)`,
    hi: `${timeHi}, ${shortDateHi} (पूर्व रात्रि)`,
    isNextDay: false,
  };
}

function getKaranaInfo(karanaIdx60: number): { en: string; hi: string; type: "Chara" | "Sthira"; isBhadra: boolean } {
  const idx = ((karanaIdx60 % 60) + 60) % 60;
  if (idx === 0) return { en: "Kintughna", hi: "किंस्तुघ्न", type: "Sthira", isBhadra: false };
  if (idx === 57) return { en: "Shakuni", hi: "शकुनि", type: "Sthira", isBhadra: false };
  if (idx === 58) return { en: "Chatushpada", hi: "चतुष्पद", type: "Sthira", isBhadra: false };
  if (idx === 59) return { en: "Naga", hi: "नाग", type: "Sthira", isBhadra: false };
  const mov = MOVABLE_KARANAS[(idx - 1) % 7];
  return { en: mov.en, hi: mov.hi, type: "Chara", isBhadra: mov.isBhadra };
}

/**
 * Determines the exact Amanta and Purnimanta Lunar Month (Masa) and detects Adhika Masa
 * by comparing the Sun's sidereal sign (Surya Rashi) at the bounding New Moons (Amavasya ends).
 */
function computeLunarMasa(sunrise: Date, tithiIndex: number): {
  amantaEn: string;
  amantaHi: string;
  purnimantaEn: string;
  purnimantaHi: string;
  isAdhikaMasa: boolean;
} {
  // Find previous New Moon (where Moon - Sun = 0) and next New Moon
  const angleDiffNow = normalize360(
    getSunMoonSiderealAt(sunrise).moonTrop - getSunMoonSiderealAt(sunrise).sunTrop
  );
  const approxDaysSinceNewMoon = (angleDiffNow / 360) * 29.530589;
  const searchStartPrev = new Date(sunrise.getTime() - (approxDaysSinceNewMoon + 2.5) * 86400000);
  const prevNewMoon = findAngleCrossingAfter(
    searchStartPrev,
    (d) => normalize360(getSunMoonSiderealAt(d).moonTrop - getSunMoonSiderealAt(d).sunTrop),
    360,
    140
  ).endTime;

  const nextNewMoon = findAngleCrossingAfter(
    new Date(sunrise.getTime() + 3600000),
    (d) => normalize360(getSunMoonSiderealAt(d).moonTrop - getSunMoonSiderealAt(d).sunTrop),
    360,
    800
  ).endTime;

  const sunRashiAtStart = Math.floor(getSunMoonSiderealAt(prevNewMoon).sunSid / 30);
  const sunRashiAtEnd = Math.floor(getSunMoonSiderealAt(nextNewMoon).sunSid / 30);

  // If the Sun does not change sidereal sign between two consecutive New Moons, it is an Adhika Masa
  const isAdhikaMasa = sunRashiAtStart === sunRashiAtEnd;
  const amantaIdx = isAdhikaMasa ? (sunRashiAtStart + 1) % 12 : sunRashiAtEnd % 12;
  const isKrishnaPaksha = tithiIndex >= 15;
  const purnimantaIdx = isAdhikaMasa
    ? amantaIdx
    : isKrishnaPaksha
    ? (amantaIdx + 1) % 12
    : amantaIdx;

  const amantaBase = MASA_DATA[amantaIdx];
  const purnimantaBase = MASA_DATA[purnimantaIdx];

  return {
    amantaEn: isAdhikaMasa ? `Adhika ${amantaBase.en}` : amantaBase.en,
    amantaHi: isAdhikaMasa ? `अधिक ${amantaBase.hi}` : amantaBase.hi,
    purnimantaEn: isAdhikaMasa ? `Adhika ${purnimantaBase.en}` : purnimantaBase.en,
    purnimantaHi: isAdhikaMasa ? `अधिक ${purnimantaBase.hi}` : purnimantaBase.hi,
    isAdhikaMasa,
  };
}

/**
 * Computes Day and Night Choghadiya (8 daytime + 8 nighttime slots) from true Sunrise, Sunset, and Next Sunrise
 */
function computeChoghadiya(
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date,
  weekday: number,
  civilDateStr: string,
  timeZone: string
): { day: ChoghadiyaSlot[]; night: ChoghadiyaSlot[] } {
  const CHOGHADIYA_META: Record<
    ChoghadiyaSlot["name"],
    { hi: string; rulerEn: string; rulerHi: string; auspicious: boolean; natureEn: string; natureHi: string }
  > = {
    Amrit: { hi: "अमृत", rulerEn: "Moon (Chandra)", rulerHi: "चन्द्र", auspicious: true, natureEn: "Best for all auspicious works", natureHi: "सर्वश्रेष्ठ शुभ चौघड़िया (सभी कार्यों हेतु)" },
    Shubh: { hi: "शुभ", rulerEn: "Jupiter (Guru)", rulerHi: "गुरु", auspicious: true, natureEn: "Auspicious for ceremonies & study", natureHi: "धार्मिक व मांगलिक कार्यों हेतु शुभ" },
    Labh: { hi: "लाभ", rulerEn: "Mercury (Budh)", rulerHi: "बुध", auspicious: true, natureEn: "Favourable for business & wealth", natureHi: "व्यापार, निवेश व शिक्षा हेतु उत्तम" },
    Char: { hi: "चर (चल)", rulerEn: "Venus (Shukra)", rulerHi: "शुक्र", auspicious: true, natureEn: "Good for travel & movement", natureHi: "यात्रा एवं गतिशील कार्यों हेतु अनुकूल" },
    Udveg: { hi: "उद्वेग", rulerEn: "Sun (Surya)", rulerHi: "सूर्य", auspicious: false, natureEn: "Avoid new beginnings (Govt tasks only)", natureHi: "अशुभ (केवल राजकीय कार्यों हेतु)" },
    Kaal: { hi: "काल", rulerEn: "Saturn (Shani)", rulerHi: "शनि", auspicious: false, natureEn: "Inauspicious — avoid new ventures", natureHi: "अशुभ — नए कार्य प्रारंभ न करें" },
    Rog: { hi: "रोग", rulerEn: "Mars (Mangal)", rulerHi: "मंगल", auspicious: false, natureEn: "Inauspicious — avoid auspicious acts", natureHi: "अशुभ — मांगलिक कार्यों का त्याग करें" },
  };

  const DAY_ORDER: ChoghadiyaSlot["name"][] = ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog"];
  const DAY_START_IDX = [0, 3, 6, 2, 5, 1, 4]; // Sun=Udveg, Mon=Amrit, Tue=Rog, Wed=Labh, Thu=Shubh, Fri=Char, Sat=Kaal

  const NIGHT_ORDER: ChoghadiyaSlot["name"][] = ["Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg"];
  const NIGHT_START_IDX = [0, 2, 4, 5, 6, 1, 3]; // Sun=Shubh, Mon=Char, Tue=Kaal, Wed=Labh, Thu=Udveg, Fri=Amrit, Sat=Rog

  const dayStep = (sunset.getTime() - sunrise.getTime()) / 8;
  const nightStep = (nextSunrise.getTime() - sunset.getTime()) / 8;

  const day: ChoghadiyaSlot[] = [];
  for (let i = 0; i < 8; i++) {
    const s = new Date(sunrise.getTime() + i * dayStep);
    const e = new Date(sunrise.getTime() + (i + 1) * dayStep);
    const name = DAY_ORDER[(DAY_START_IDX[weekday] + i) % 7];
    const meta = CHOGHADIYA_META[name];
    const sf = formatTimeInZone(s, civilDateStr, timeZone);
    const ef = formatTimeInZone(e, civilDateStr, timeZone);
    day.push({
      period: `${sf.en} – ${ef.en}`,
      periodHindi: `${sf.hi} – ${ef.hi}`,
      name,
      nameHindi: meta.hi,
      rulerEn: meta.rulerEn,
      rulerHi: meta.rulerHi,
      auspicious: meta.auspicious,
      natureEn: meta.natureEn,
      natureHi: meta.natureHi,
      startMs: s.getTime(),
      endMs: e.getTime(),
      endTimeEn: ef.en,
      endTimeHi: ef.hi,
    });
  }

  const night: ChoghadiyaSlot[] = [];
  for (let i = 0; i < 8; i++) {
    const s = new Date(sunset.getTime() + i * nightStep);
    const e = new Date(sunset.getTime() + (i + 1) * nightStep);
    const name = NIGHT_ORDER[(NIGHT_START_IDX[weekday] + i) % 7];
    const meta = CHOGHADIYA_META[name];
    const sf = formatTimeInZone(s, civilDateStr, timeZone);
    const ef = formatTimeInZone(e, civilDateStr, timeZone);
    night.push({
      period: `${sf.en} – ${ef.en}`,
      periodHindi: `${sf.hi} – ${ef.hi}`,
      name,
      nameHindi: meta.hi,
      rulerEn: meta.rulerEn,
      rulerHi: meta.rulerHi,
      auspicious: meta.auspicious,
      natureEn: meta.natureEn,
      natureHi: meta.natureHi,
      startMs: s.getTime(),
      endMs: e.getTime(),
      endTimeEn: ef.en,
      endTimeHi: ef.hi,
    });
  }

  return { day, night };
}

/**
 * Computes Chandrabalam for all 12 Rashis based on today's Moon transit sign
 */
export function computeChandrabalam(moonSignIdx: number): ChandrabalamEntry[] {
  const FAVOURABLE_HOUSES = new Set([1, 3, 6, 7, 10, 11]);
  const MODERATE_HOUSES = new Set([2, 5, 9]);

  return RASHI_DATA.map((rashi, idx) => {
    const house = ((moonSignIdx - idx + 12) % 12) + 1;
    if (FAVOURABLE_HOUSES.has(house)) {
      return {
        rashiId: rashi.id,
        rashiEn: rashi.en,
        rashiHi: rashi.hi,
        transitHouse: house,
        status: "Favourable",
        statusHi: "शुभ (चन्द्रबल युक्त)",
        noteEn: `Moon in ${house}${house === 1 ? "st" : house === 3 ? "rd" : "th"} house — strong lunar support`,
        noteHi: `${house}वें भाव में चन्द्रमा — श्रेष्ठ चन्द्रबल`,
      };
    }
    if (MODERATE_HOUSES.has(house)) {
      return {
        rashiId: rashi.id,
        rashiEn: rashi.en,
        rashiHi: rashi.hi,
        transitHouse: house,
        status: "Moderate",
        statusHi: "मध्यम (सामान्य)",
        noteEn: `Moon in ${house}${house === 2 ? "nd" : "th"} house — balanced energy`,
        noteHi: `${house}वें भाव में चन्द्रमा — मध्यम फलदायी`,
      };
    }
    return {
      rashiId: rashi.id,
      rashiEn: rashi.en,
      rashiHi: rashi.hi,
      transitHouse: house,
      status: "Unfavourable",
      statusHi: house === 8 ? "अशुभ (चन्द्राष्टम)" : "अशुभ (चन्द्रबल क्षीण)",
      noteEn: house === 8 ? "8th house (Chandra Ashtama) — avoid major risks" : `Moon in ${house}th house — chant Shiva/Chandra mantra`,
      noteHi: house === 8 ? "अष्टम चन्द्रमा (चन्द्राष्टम) — नए कार्यों में सावधानी रखें" : `${house}वें भाव में चन्द्रमा — शिव/चन्द्र मंत्र जपें`,
    };
  });
}

/**
 * Unified Festival & Vrat detector combining curated FESTIVALS_2026 with astronomical Tithi/Sankranti Vrats
 */
export function detectFestivalsAndVratsForDay(
  civilDateStr: string,
  tithiIndicesInDay: number[],
  pakshaEn: "Shukla Paksha" | "Krishna Paksha",
  amantaMasaEn: string,
  amantaMasaHi: string,
  sunSidAtSunrise: number,
  sunSidAtNextSunrise: number
): FestivalOrVratItem[] {
  const results: FestivalOrVratItem[] = [];

  // 1. Curated major festivals matching YYYY-MM-DD from FESTIVALS_2026
  const curated = FESTIVALS_2026.filter((f: HinduFestival) => f.date === civilDateStr);
  for (const f of curated) {
    results.push({
      id: f.id,
      name: f.name,
      nameHindi: f.nameHindi,
      category: f.category,
      categoryHindi:
        f.category === "Ekadashi"
          ? "एकादशी व्रत"
          : f.category === "Pradosh"
          ? "प्रदोष व्रत"
          : f.category === "Sankranti"
          ? "संक्रांति पर्व"
          : "प्रमुख पर्व एवं त्यौहार",
      description: f.significance,
      descriptionHindi: `${amantaMasaHi} मास (${f.paksha === "Shukla" ? "शुक्ल" : "कृष्ण"} पक्ष) — ${f.nameHindi}। आराध्य: ${f.deity}।`,
    });
  }

  // 2. Astronomical Vrat rules from active Tithi(s) of the day
  const uniqueTithis = Array.from(new Set(tithiIndicesInDay));
  for (const tIdx of uniqueTithis) {
    const tInPaksha = (tIdx % 15) + 1; // 1..15
    const isShukla = tIdx < 15;
    const pakshaLabelHi = isShukla ? "शुक्ल पक्ष" : "कृष्ण पक्ष";

    if (tInPaksha === 11 && !results.some((r) => r.category === "Ekadashi")) {
      results.push({
        id: `ekadashi-${civilDateStr}`,
        name: `${amantaMasaEn} ${isShukla ? "Shukla" : "Krishna"} Ekadashi Vrat`,
        nameHindi: `${amantaMasaHi} ${pakshaLabelHi} एकादशी व्रत`,
        category: "Ekadashi",
        categoryHindi: "एकादशी व्रत",
        description: `Sacred eleventh lunar day (${amantaMasaEn} ${pakshaEn}) dedicated to Lord Vishnu fast, Sahasranama recitation, and Dwadashi Parana.`,
        descriptionHindi: `भगवान श्री हरि विष्णु की उपासना, उपवास एवं विष्णु सहस्रनाम पाठ हेतु परम पुण्यदायी एकादशी तिथि।`,
      });
    }

    if (tInPaksha === 13 && !results.some((r) => r.category === "Pradosh")) {
      results.push({
        id: `pradosh-${civilDateStr}`,
        name: `Pradosh Vrat (${amantaMasaEn} ${isShukla ? "Shukla" : "Krishna"} Trayodashi)`,
        nameHindi: `प्रदोष व्रत (${amantaMasaHi} ${pakshaLabelHi} त्रयोदशी)`,
        category: "Pradosh",
        categoryHindi: "प्रदोष व्रत",
        description: "Auspicious Trayodashi evening (Pradosh Kaal) worship of Lord Shiva and Maa Parvati for spiritual liberation and prosperity.",
        descriptionHindi: "सूर्यास्त के पश्चात प्रदोष काल में भगवान आशुतोष शिव एवं माता पार्वती के अभिषेक व पूजन का पावन व्रत।",
      });
    }

    if (tIdx === 18 && !results.some((r) => r.id.includes("sankashti"))) {
      // Krishna Paksha Chaturthi (index 18)
      results.push({
        id: `sankashti-${civilDateStr}`,
        name: `Sankashti Ganesh Chaturthi Vrat`,
        nameHindi: `संकष्टी श्री गणेश चतुर्थी व्रत`,
        category: "Vrat",
        categoryHindi: "संकष्टी चतुर्थी व्रत",
        description: "Monthly Krishna Paksha Chaturthi fast dedicated to Lord Vignaharta Ganesha; fast concludes after Chandrodaya (Moonrise) Arghya.",
        descriptionHindi: "विघ्नहर्ता भगवान श्री गणेश की कृपा प्राप्ति हेतु चतुर्थी व्रत; रात्रि में चन्द्रोदय अर्घ्य के पश्चात व्रत पारण।",
      });
    }

    if (tIdx === 3 && !results.some((r) => r.id.includes("vinayaka"))) {
      // Shukla Paksha Chaturthi (index 3)
      results.push({
        id: `vinayaka-${civilDateStr}`,
        name: `Vinayaka Ganesh Chaturthi`,
        nameHindi: `विनायक श्री गणेश चतुर्थी`,
        category: "Vrat",
        categoryHindi: "विनायक चतुर्थी",
        description: "Shukla Paksha Chaturthi auspicious for midday Lord Ganesha worship and obstacle removal.",
        descriptionHindi: "शुक्ल पक्ष की चतुर्थी तिथि पर मध्याह्न काल में भगवान श्री गणेश की विशेष पूजा-अर्चना।",
      });
    }

    if (tIdx === 28 && !results.some((r) => r.id.includes("shivratri"))) {
      // Krishna Chaturdashi (index 28)
      results.push({
        id: `masik-shivratri-${civilDateStr}`,
        name: `Masik Shivratri Vrat`,
        nameHindi: `मासिक शिवरात्रि व्रत`,
        category: "Vrat",
        categoryHindi: "मासिक शिवरात्रि",
        description: "Monthly Krishna Paksha Chaturdashi night vigil and Nishita Kaal Rudrabhishekam of Lord Shiva.",
        descriptionHindi: "कृष्ण पक्ष की चतुर्दशी पर निशिता काल में भगवान शिव के रुद्राभिषेक एवं महामृत्युंजय मंत्र जाप का पर्व।",
      });
    }

    if (tIdx === 14 && !results.some((r) => r.category === "Purnima & Amavasya")) {
      results.push({
        id: `purnima-${civilDateStr}`,
        name: `${amantaMasaEn} Purnima Vrat & Satyanarayan Puja`,
        nameHindi: `${amantaMasaHi} पूर्णिमा व्रत एवं सत्यनारायण पूजा`,
        category: "Purnima & Amavasya",
        categoryHindi: "पूर्णिमा पर्व",
        description: `Full Moon (${amantaMasaEn} Purnima) sacred for holy river bath, Sri Satyanarayan Katha, and Lakshmi-Narayana worship.`,
        descriptionHindi: `${amantaMasaHi} पूर्णिमा के पावन अवसर पर पवित्र स्नान-दान, श्री सत्यनारायण व्रत कथा एवं चन्द्र अर्घ्य।`,
      });
    }

    if (tIdx === 29 && !results.some((r) => r.category === "Purnima & Amavasya")) {
      results.push({
        id: `amavasya-${civilDateStr}`,
        name: `${amantaMasaEn} Darsha Amavasya (Pitru Tarpan)`,
        nameHindi: `${amantaMasaHi} दर्श अमावस्या (पितृ तर्पण एवं दान)`,
        category: "Purnima & Amavasya",
        categoryHindi: "अमावस्या पर्व",
        description: `New Moon (${amantaMasaEn} Amavasya) dedicated to ancestral Pitru Tarpan, Peepal tree worship, and charity.`,
        descriptionHindi: `पितृ तर्पण, पीपल वृक्ष पूजन, दीपदान एवं पवित्र स्नान हेतु ${amantaMasaHi} अमावस्या तिथि।`,
      });
    }
  }

  // 3. Solar Sankranti check (Sun changes sidereal Rashi between sunrise and nextSunrise)
  const rashi0 = Math.floor(sunSidAtSunrise / 30);
  const rashi1 = Math.floor(sunSidAtNextSunrise / 30);
  if (rashi0 !== rashi1 && !results.some((r) => r.category === "Sankranti")) {
    const newRashi = RASHI_DATA[rashi1];
    results.push({
      id: `sankranti-${civilDateStr}`,
      name: `${newRashi.shortEn} Sankranti (Sun enters ${newRashi.en})`,
      nameHindi: `${newRashi.hi} संक्रांति (सूर्य का ${newRashi.hi} राशि में प्रवेश)`,
      category: "Sankranti",
      categoryHindi: "सूर्य संक्रांति",
      description: `Solar transition into ${newRashi.en}; Punya Kaal is highly auspicious for Surya Arghya, sacred bath, and charity.`,
      descriptionHindi: `भगवान सूर्य का ${newRashi.hi} राशि में गोचर प्रवेश; पुण्य काल में स्नान, सूर्य अर्घ्य एवं दान का विशेष महत्व है।`,
    });
  }

  return results;
}

/**
 * Classical Muhurta Chintamani Sarvartha Siddhi Yoga Table (Weekday -> Nakshatra indices 0..26)
 */
export const SARVARTHA_SIDDHI_MAP: Record<number, number[]> = {
  0: [12, 18, 11, 20, 25, 0, 7], // Sunday: Hasta, Mula, U.Phalguni, U.Ashadha, U.Bhadrapada, Ashwini, Pushya
  1: [21, 3, 4, 7, 16],          // Monday: Shravana, Rohini, Mrigashira, Pushya, Anuradha
  2: [0, 2, 8, 25],              // Tuesday: Ashwini, Krittika, Ashlesha, U.Bhadrapada
  3: [3, 16, 12, 2, 4],          // Wednesday: Rohini, Anuradha, Hasta, Krittika, Mrigashira
  4: [26, 16, 0, 6, 7],          // Thursday: Revati, Anuradha, Ashwini, Punarvasu, Pushya
  5: [26, 16, 0, 6, 21],         // Friday: Revati, Anuradha, Ashwini, Punarvasu, Shravana
  6: [21, 3, 14],                // Saturday: Shravana, Rohini, Swati
};

/**
 * Classical Muhurta Chintamani Amrit Siddhi Yoga Table (Weekday -> Nakshatra index 0..26)
 */
export const AMRIT_SIDDHI_MAP: Record<number, number> = {
  0: 12, // Sunday: Hasta
  1: 4,  // Monday: Mrigashira
  2: 0,  // Tuesday: Ashwini
  3: 16, // Wednesday: Anuradha
  4: 7,  // Thursday: Pushya
  5: 26, // Friday: Revati
  6: 3,  // Saturday: Rohini
};

/**
 * Classical 28 Anandadi Yoga cycle: Yoga #21 ("Amrita" / अमृत योग)
 */
export const AMRIT_YOGA_MAP: Record<number, number> = {
  0: 20, // Sunday: U.Ashadha
  1: 23, // Monday: Shatabhisha
  2: 0,  // Tuesday: Ashwini
  3: 4,  // Wednesday: Mrigashira
  4: 8,  // Thursday: Ashlesha
  5: 12, // Friday: Hasta
  6: 16, // Saturday: Anuradha
};

/**
 * Classical Ravi Yoga Nakshatra distance (inclusive forward count from Sun's Nakshatra to Moon's Nakshatra)
 */
export const RAVI_YOG_COUNTS = [4, 6, 9, 10, 13, 20];

export interface NakshatraInterval {
  nakIndex: number;
  start: Date;
  end: Date;
}

function mergeAdjacentSpans(spans: { start: Date; end: Date }[]): { start: Date; end: Date }[] {
  if (spans.length === 0) return [];
  const merged: { start: Date; end: Date }[] = [];
  let cur = { start: spans[0].start, end: spans[0].end };
  for (let i = 1; i < spans.length; i++) {
    const next = spans[i];
    if (Math.abs(next.start.getTime() - cur.end.getTime()) <= 65000) {
      cur.end = next.end;
    } else {
      merged.push(cur);
      cur = { start: next.start, end: next.end };
    }
  }
  merged.push(cur);
  return merged;
}

function formatYogaTiming(
  spans: { start: Date; end: Date }[],
  sunrise: Date,
  nextSunrise: Date,
  civilDateStr: string,
  timeZone: string
): { timingEn: string; timingHi: string; isActive: boolean } {
  if (spans.length === 0) {
    return {
      isActive: false,
      timingEn: "Not formed today",
      timingHi: "आज यह योग नहीं बन रहा है",
    };
  }

  const enParts: string[] = [];
  const hiParts: string[] = [];

  for (const span of spans) {
    const isAtSunrise = Math.abs(span.start.getTime() - sunrise.getTime()) < 60000;
    const isAtNextSunrise = Math.abs(span.end.getTime() - nextSunrise.getTime()) < 60000;

    const startFmt = formatTimeInZone(span.start, civilDateStr, timeZone);
    const endFmt = formatTimeInZone(span.end, civilDateStr, timeZone);

    if (isAtSunrise && isAtNextSunrise) {
      enParts.push(`Full Day (${startFmt.en} to ${endFmt.en})`);
      hiParts.push(`सम्पूर्ण दिन (${startFmt.hi} से ${endFmt.hi})`);
    } else {
      enParts.push(`${startFmt.en} to ${endFmt.en}`);
      hiParts.push(`${startFmt.hi} से ${endFmt.hi} तक`);
    }
  }

  return {
    isActive: true,
    timingEn: enParts.join(" • "),
    timingHi: hiParts.join(" • "),
  };
}

export function computeAuspiciousYogas(
  sunrise: Date,
  nextSunrise: Date,
  weekday: number,
  nakIntervals: NakshatraInterval[],
  civilDateStr: string,
  timeZone: string
): AuspiciousYogaItem[] {
  const nakStep = 360 / 27;

  // 1. Sarvartha Siddhi Yog
  const ssValid = SARVARTHA_SIDDHI_MAP[weekday] || [];
  const ssSpans = mergeAdjacentSpans(
    nakIntervals.filter((inv) => ssValid.includes(inv.nakIndex))
  );
  const ssFmt = formatYogaTiming(ssSpans, sunrise, nextSunrise, civilDateStr, timeZone);

  // 2. Ravi Yog
  const ryIntervals = nakIntervals.filter((inv) => {
    const midTime = new Date(0.5 * (inv.start.getTime() + inv.end.getTime()));
    const p = getSunMoonSiderealAt(midTime);
    const sunNak = Math.floor(p.sunSid / nakStep) % 27;
    const count = ((inv.nakIndex - sunNak + 27) % 27) + 1;
    return RAVI_YOG_COUNTS.includes(count);
  });
  const rySpans = mergeAdjacentSpans(ryIntervals);
  const ryFmt = formatYogaTiming(rySpans, sunrise, nextSunrise, civilDateStr, timeZone);

  // 3. Amrit Yog (28 Anandadi Yoga #21 Amrita)
  const ayTargetNak = AMRIT_YOGA_MAP[weekday];
  const aySpans = mergeAdjacentSpans(
    nakIntervals.filter((inv) => inv.nakIndex === ayTargetNak)
  );
  const ayFmt = formatYogaTiming(aySpans, sunrise, nextSunrise, civilDateStr, timeZone);

  // 4. Amrit Siddhi Yog
  const asTargetNak = AMRIT_SIDDHI_MAP[weekday];
  const asSpans = mergeAdjacentSpans(
    nakIntervals.filter((inv) => inv.nakIndex === asTargetNak)
  );
  const asFmt = formatYogaTiming(asSpans, sunrise, nextSunrise, civilDateStr, timeZone);

  // 5. Guru Pushya Yog (Thursday + Pushya Nakshatra index 7)
  const gpSpans = mergeAdjacentSpans(
    nakIntervals.filter((inv) => weekday === 4 && inv.nakIndex === 7)
  );
  const gpFmt = formatYogaTiming(gpSpans, sunrise, nextSunrise, civilDateStr, timeZone);

  return [
    {
      id: "sarvartha_siddhi",
      nameEn: "Sarvartha Siddhi Yog",
      nameHi: "सर्वार्थ सिद्धि योग",
      isActive: ssFmt.isActive,
      timingEn: ssFmt.timingEn,
      timingHi: ssFmt.timingHi,
      descriptionEn:
        "Signifying the 'fulfillment of all objectives', this classical yoga neutralizes numerous astrological doshas and grants success in education, property deals, business launches, and auspicious endeavors.",
      descriptionHi:
        "समस्त मनोरथों को सिद्ध करने वाला महायोग। यह अनेक ज्योतिषीय दोषों का निवारण कर नवीन व्यापार, वाहन/भवन क्रय, अनुबंध एवं अभीष्ट कार्यों में निर्विघ्न सफलता दिलाता है।",
      ruleEn:
        "Formed under classical Muhurta Chintamani weekday and nakshatra alignment tables.",
      ruleHi: "मुहूर्त चिंतामणि के अनुसार वार एवं विशिष्ट नक्षत्रों के शुभ संयोग द्वारा निर्मित।",
    },
    {
      id: "ravi_yog",
      nameEn: "Ravi Yog",
      nameHi: "रवि योग",
      isActive: ryFmt.isActive,
      timingEn: ryFmt.timingEn,
      timingHi: ryFmt.timingHi,
      descriptionEn:
        "Endowed with the radiant energy of Lord Surya, Ravi Yog destroys thousands of inauspicious planetary combinations and clears the path for triumph, healing, and prosperity.",
      descriptionHi:
        "भगवान सूर्य देव के दिव्य तेज से युक्त यह योग सहस्रों दुर्योगों व बाधाओं को भस्म करने में समर्थ माना गया है। यह विजय, स्वास्थ्य लाभ एवं महत्वपूर्ण कार्यों हेतु विशेष फलदायी है।",
      ruleEn:
        "Formed when the Moon's Nakshatra is the 4th, 6th, 9th, 10th, 13th, or 20th counted inclusively from the Sun's Nakshatra.",
      ruleHi:
        "सूर्य के वर्तमान नक्षत्र से चंद्रमा के नक्षत्र की गणना करने पर 4, 6, 9, 10, 13 अथवा 20वाँ नक्षत्र होने पर।",
    },
    {
      id: "amrit_yog",
      nameEn: "Amrit Yog",
      nameHi: "अमृत योग",
      isActive: ayFmt.isActive,
      timingEn: ayFmt.timingEn,
      timingHi: ayFmt.timingHi,
      descriptionEn:
        "The 21st yoga in the classical 28 Anandadi Yoga cycle, bestowing longevity, nectar-like vitality, and auspicious protection for beginning long-term projects.",
      descriptionHi:
        "वैदिक मुहूर्त शास्त्र के 28 आनंदादि योगों में 21वाँ 'अमृत' योग। यह अमृत तुल्य जीवन-ऊर्जा, आरोग्य तथा दीर्घकालिक मांगलिक कार्यों को स्थायित्व प्रदान करता है।",
      ruleEn:
        "21st yoga in the 28 Anandadi cycle calculated from the weekday's base nakshatra (Sunday+Uttara Ashadha, Monday+Shatabhisha, Tuesday+Ashwini, Wednesday+Mrigashira, Thursday+Ashlesha, Friday+Hasta, Saturday+Anuradha).",
      ruleHi:
        "वार के आधार नक्षत्र से गणना करने पर 28 आनंदादि योगों का 21वाँ अमृत योग (रवि+उत्तराषाढ़ा, सोम+शतभिषा, मंगल+अश्विनी, बुध+मृगशिरा, गुरु+आश्लेषा, शुक्र+हस्त, शनि+अनुराधा)।",
    },
    {
      id: "amrit_siddhi",
      nameEn: "Amrit Siddhi Yog",
      nameHi: "अमृत सिद्धि योग",
      isActive: asFmt.isActive,
      timingEn: asFmt.timingEn,
      timingHi: asFmt.timingHi,
      descriptionEn:
        "A premier Siddhi yoga from Muhurta Chintamani that converts efforts into everlasting positive fruits. Highly propitious for signing agreements, purchasing gold/jewelry, investments, and sacred rites.",
      descriptionHi:
        "मुहूर्त चिंतामणि का अत्यंत प्रभावशाली सिद्धि योग, जिसमें किए गए कार्य अमृत के समान अक्षय फल प्रदान करते हैं। व्यापारिक अनुबंध, स्वर्ण आभूषण क्रय, नए पदभार एवं धार्मिक अनुष्ठान हेतु उत्तम।",
      ruleEn:
        "Formed by specific weekday and nakshatra pairs: Sunday+Hasta, Monday+Mrigashira, Tuesday+Ashwini, Wednesday+Anuradha, Thursday+Pushya, Friday+Revati, Saturday+Rohini.",
      ruleHi:
        "वार एवं नक्षत्र का सिद्ध संयोग: रवि+हस्त, सोम+मृगशिरा, मंगल+अश्विनी, बुध+अनुराधा, गुरु+पुष्य, शुक्र+रेवती, शनि+रोहिणी।",
    },
    {
      id: "guru_pushya",
      nameEn: "Guru Pushya Yog",
      nameHi: "गुरु पुष्य योग",
      isActive: gpFmt.isActive,
      timingEn: gpFmt.timingEn,
      timingHi: gpFmt.timingHi,
      descriptionEn:
        "The king of auspicious muhurats (Gurupushyamrut Yoga), formed when Thursday coincides with the king of constellations, Pushya Nakshatra. Highest recommendation for gold purchase, new establishments, and wealth rituals.",
      descriptionHi:
        "समस्त मुहूर्तों का मुकुटमणि 'गुरुपुष्यामृत योग'। जब गुरुवार के दिन नक्षत्रराज पुष्य का शुभ संयोग होता है, तब यह महायोग बनता है। स्वर्ण, भूमि, वाहन, प्रतिष्ठान उद्घाटन एवं श्री महालक्ष्मी साधना हेतु सर्वश्रेष्ठ।",
      ruleEn:
        "Formed exclusively when Thursday (Guruvara) coincides with the Moon transiting Pushya Nakshatra.",
      ruleHi: "गुरुवार (बृहस्पतिवार) के दिन चंद्रमा के पुष्य नक्षत्र में संचरण करने पर निर्मित।",
    },
  ];
}

/**
 * Computes live, real-time Drik Ganita Panchang for any location and civil date.
 */
export function computeRealtimePanchang(
  cityOrCustom: string | CustomPanchangLocation = "delhi",
  targetDate?: Date | string
) {
  const location =
    typeof cityOrCustom === "string"
      ? PANCHANG_LOCATIONS.find((c) => c.id === cityOrCustom.toLowerCase()) ||
        PANCHANG_LOCATIONS.find((c) => c.name.toLowerCase() === cityOrCustom.toLowerCase()) ||
        PANCHANG_LOCATIONS[0]
      : {
          id: cityOrCustom.id || "custom",
          name: cityOrCustom.name,
          nameHindi: cityOrCustom.nameHindi || cityOrCustom.name,
          state: cityOrCustom.state || "",
          stateHindi: cityOrCustom.stateHindi || cityOrCustom.state || "",
          lat: cityOrCustom.lat,
          lon: cityOrCustom.lon,
          timeZone: cityOrCustom.timeZone || "Asia/Kolkata",
        };
  const { lat, lon, timeZone } = location;

  // Determine civil YYYY-MM-DD in the selected city's timezone
  let civilDateStr: string;
  if (typeof targetDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    civilDateStr = targetDate;
  } else {
    const dObj = targetDate instanceof Date ? targetDate : new Date();
    civilDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(dObj);
  }

  const [yStr, mStr, dStr] = civilDateStr.split("-");
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);

  // Find local solar midnight in UTC using longitude approximation (12:00 local solar = 12 - lon/15 UTC)
  // so SearchRiseSet(+1) reliably finds today's sunrise and sunset for any global longitude.
  const localMorningSearchStart = new Date(
    Date.UTC(year, month - 1, day, 0, 0, 0) - Math.round((lon / 15) * 3600 * 1000) + 2 * 3600 * 1000
  );
  const observer = new Astronomy.Observer(lat, lon, 0);

  const sunriseAstro = Astronomy.SearchRiseSet(
    Astronomy.Body.Sun,
    observer,
    +1,
    Astronomy.MakeTime(localMorningSearchStart),
    1
  );
  const sunrise = sunriseAstro
    ? sunriseAstro.date
    : new Date(localMorningSearchStart.getTime() + 4 * 3600 * 1000);

  const sunsetAstro = Astronomy.SearchRiseSet(
    Astronomy.Body.Sun,
    observer,
    -1,
    Astronomy.MakeTime(sunrise),
    1
  );
  const sunset = sunsetAstro
    ? sunsetAstro.date
    : new Date(sunrise.getTime() + 12 * 3600 * 1000);

  const nextSunriseAstro = Astronomy.SearchRiseSet(
    Astronomy.Body.Sun,
    observer,
    +1,
    Astronomy.MakeTime(new Date(sunset.getTime() + 60000)),
    1
  );
  const nextSunrise = nextSunriseAstro
    ? nextSunriseAstro.date
    : new Date(sunrise.getTime() + 24 * 3600 * 1000);

  const prevSunriseAstro = Astronomy.SearchRiseSet(
    Astronomy.Body.Sun,
    observer,
    +1,
    Astronomy.MakeTime(new Date(sunrise.getTime() - 26 * 3600 * 1000)),
    1
  );
  const prevSunrise = prevSunriseAstro
    ? prevSunriseAstro.date
    : new Date(sunrise.getTime() - 24 * 3600 * 1000);

  // Moonrise and Moonset within the Panchang day [sunrise, nextSunrise]
  const moonriseAstro = Astronomy.SearchRiseSet(
    Astronomy.Body.Moon,
    observer,
    +1,
    Astronomy.MakeTime(new Date(sunrise.getTime() - 2 * 3600 * 1000)),
    2
  );
  const moonsetAstro = Astronomy.SearchRiseSet(
    Astronomy.Body.Moon,
    observer,
    -1,
    Astronomy.MakeTime(new Date(sunrise.getTime() - 2 * 3600 * 1000)),
    2
  );

  const sunriseFmt = formatTimeInZone(sunrise, civilDateStr, timeZone);
  const sunsetFmt = formatTimeInZone(sunset, civilDateStr, timeZone);
  const moonriseFmt = moonriseAstro
    ? formatTimeInZone(moonriseAstro.date, civilDateStr, timeZone)
    : { en: "No Moonrise today", hi: "आज चन्द्रोदय नहीं", isNextDay: false };
  const moonsetFmt = moonsetAstro
    ? formatTimeInZone(moonsetAstro.date, civilDateStr, timeZone)
    : { en: "No Moonset today", hi: "आज चन्द्रास्त नहीं", isNextDay: false };

  // Sidereal longitudes at Sunrise(Day 0), PrevSunrise, and NextSunrise
  const posAtSunrise = getSunMoonSiderealAt(sunrise);
  const posAtPrevSunrise = getSunMoonSiderealAt(prevSunrise);
  const posAtNextSunrise = getSunMoonSiderealAt(nextSunrise);

  // 1. TITHI (with exact end time, next Tithi, and Kshaya / Vriddhi detection)
  const tithiFn = (d: Date) => {
    const p = getSunMoonSiderealAt(d);
    return normalize360(p.moonSid - p.sunSid);
  };
  const tithiCross1 = findAngleCrossingAfter(sunrise, tithiFn, 12, 36);
  const tithiIdxSunrise = tithiCross1.currentIndex; // 0..29
  const tithiIdxPrev = Math.floor(tithiFn(prevSunrise) / 12) % 30;
  const tithiIdxNext = Math.floor(tithiFn(nextSunrise) / 12) % 30;

  const tithiPrimary = TITHI_DATA[tithiIdxSunrise];
  const tithiNext = TITHI_DATA[tithiCross1.nextIndex];
  const isShukla = tithiIdxSunrise < 15;
  const pakshaEn: "Shukla Paksha" | "Krishna Paksha" = isShukla ? "Shukla Paksha" : "Krishna Paksha";
  const pakshaHi = isShukla ? "शुक्ल पक्ष" : "कृष्ण पक्ष";
  const tithiEndFmt = formatTimeInZone(tithiCross1.endTime, civilDateStr, timeZone);

  // Detect Vriddhi (same Tithi at two consecutive sunrises) or Kshaya (a Tithi starts after sunrise and ends before nextSunrise)
  let tithiAnomaly: "Normal" | "Vriddhi" | "Kshaya" = "Normal";
  let tithiAnomalyNoteEn = "";
  let tithiAnomalyNoteHi = "";
  const tithisActiveInDay = [tithiIdxSunrise];

  if (tithiCross1.endTime < nextSunrise) {
    tithisActiveInDay.push(tithiCross1.nextIndex);
  }

  if (tithiIdxSunrise === tithiIdxPrev || tithiIdxSunrise === tithiIdxNext) {
    tithiAnomaly = "Vriddhi";
    tithiAnomalyNoteEn = `Vriddhi Tithi (${tithiPrimary.en} prevails at two consecutive sunrises)`;
    tithiAnomalyNoteHi = `वृद्धि तिथि (${tithiPrimary.hi} तिथि दो सूर्योदयों में व्याप्त है)`;
  } else if ((tithiIdxNext - tithiIdxSunrise + 30) % 30 >= 2) {
    // Two Tithi transitions occurred between sunrise and nextSunrise -> tithiCross1.nextIndex is a Kshaya Tithi
    const tithiCross2 = findAngleCrossingAfter(new Date(tithiCross1.endTime.getTime() + 60000), tithiFn, 12, 30);
    const kshayaEndFmt = formatTimeInZone(tithiCross2.endTime, civilDateStr, timeZone);
    tithiAnomaly = "Kshaya";
    tithiAnomalyNoteEn = `Kshaya Tithi: ${tithiNext.en} begins at ${tithiEndFmt.en} and ends at ${kshayaEndFmt.en} before next sunrise, followed by ${TITHI_DATA[tithiCross2.nextIndex].en}.`;
    tithiAnomalyNoteHi = `क्षय तिथि: ${tithiNext.hi} ${tithiEndFmt.hi} से प्रारंभ होकर अगले सूर्योदय से पूर्व ${kshayaEndFmt.hi} पर समाप्त (तत्पश्चात ${TITHI_DATA[tithiCross2.nextIndex].hi})।`;
    tithisActiveInDay.push(tithiCross2.nextIndex);
  }

  // 2. NAKSHATRA (with Pada, exact end time, next Nakshatra, and Varjyam / Amrit Kaal)
  const nakStep = 360 / 27;
  const nakFn = (d: Date) => getSunMoonSiderealAt(d).moonSid;
  const nakCross = findAngleCrossingAfter(sunrise, nakFn, nakStep, 36);
  const nakPrevStart = findAngleCrossingAfter(
    new Date(sunrise.getTime() - 28 * 3600 * 1000),
    nakFn,
    nakStep,
    36
  ).endTime;

  const nakIdx = nakCross.currentIndex;
  const nakNextIdx = nakCross.nextIndex;
  const nakPada = Math.floor((posAtSunrise.moonSid % nakStep) / (nakStep / 4)) + 1;
  const nakPrimary = NAKSHATRA_DATA[nakIdx];
  const nakNext = NAKSHATRA_DATA[nakNextIdx];
  const nakEndFmt = formatTimeInZone(nakCross.endTime, civilDateStr, timeZone);

  // Compute Nakshatra-proportional Varjyam & Amrit Kaal (each lasts 4/60 of Nakshatra duration)
  const nakCross2 = findAngleCrossingAfter(new Date(nakCross.endTime.getTime() + 60000), nakFn, nakStep, 36);
  const nakDurationMs = Math.max(20 * 3600 * 1000, nakCross.endTime.getTime() - nakPrevStart.getTime());
  const nakNextDurationMs = Math.max(20 * 3600 * 1000, nakCross2.endTime.getTime() - nakCross.endTime.getTime());

  let varjyamStart = new Date(nakPrevStart.getTime() + (VARJYAM_START_GHATIKA[nakIdx] / 60) * nakDurationMs);
  let varjyamEnd = new Date(varjyamStart.getTime() + (4 / 60) * nakDurationMs);
  if (varjyamEnd < sunrise) {
    varjyamStart = new Date(nakCross.endTime.getTime() + (VARJYAM_START_GHATIKA[nakNextIdx] / 60) * nakNextDurationMs);
    varjyamEnd = new Date(varjyamStart.getTime() + (4 / 60) * nakNextDurationMs);
  }

  let amritStart = new Date(nakPrevStart.getTime() + (AMRIT_START_GHATIKA[nakIdx] / 60) * nakDurationMs);
  let amritEnd = new Date(amritStart.getTime() + (4 / 60) * nakDurationMs);
  if (amritEnd < sunrise) {
    amritStart = new Date(nakCross.endTime.getTime() + (AMRIT_START_GHATIKA[nakNextIdx] / 60) * nakNextDurationMs);
    amritEnd = new Date(amritStart.getTime() + (4 / 60) * nakNextDurationMs);
  }

  const varjyamStartFmt = formatTimeInZone(varjyamStart, civilDateStr, timeZone);
  const varjyamEndFmt = formatTimeInZone(varjyamEnd, civilDateStr, timeZone);
  const amritStartFmt = formatTimeInZone(amritStart, civilDateStr, timeZone);
  const amritEndFmt = formatTimeInZone(amritEnd, civilDateStr, timeZone);

  // 3. YOGA (with exact end time and next Yoga)
  const yogaFn = (d: Date) => {
    const p = getSunMoonSiderealAt(d);
    return normalize360(p.sunSid + p.moonSid);
  };
  const yogaCross = findAngleCrossingAfter(sunrise, yogaFn, nakStep, 36);
  const yogaPrimary = YOGA_DATA[yogaCross.currentIndex];
  const yogaNext = YOGA_DATA[yogaCross.nextIndex];
  const yogaEndFmt = formatTimeInZone(yogaCross.endTime, civilDateStr, timeZone);

  // 4. KARANA (both half-tithi Karanas of the day + Vishti/Bhadra detection)
  const karanaCross1 = findAngleCrossingAfter(sunrise, tithiFn, 6, 24);
  const karanaCross2 = findAngleCrossingAfter(new Date(karanaCross1.endTime.getTime() + 60000), tithiFn, 6, 24);
  const karana1 = getKaranaInfo(karanaCross1.currentIndex);
  const karana2 = getKaranaInfo(karanaCross1.nextIndex);
  const karana1EndFmt = formatTimeInZone(karanaCross1.endTime, civilDateStr, timeZone);
  const karana2EndFmt = formatTimeInZone(karanaCross2.endTime, civilDateStr, timeZone);

  let bhadraTimingEn = "No Vishti (Bhadra) active today";
  let bhadraTimingHi = "आज भद्रा (विष्टि करण) नहीं है";
  if (karana1.isBhadra) {
    bhadraTimingEn = `Vishti (Bhadra) active from Sunrise (${sunriseFmt.en}) until ${karana1EndFmt.en}`;
    bhadraTimingHi = `भद्रा (विष्टि) सूर्योदय (${sunriseFmt.hi}) से ${karana1EndFmt.hi} तक`;
  } else if (karana2.isBhadra && karanaCross1.endTime < nextSunrise) {
    bhadraTimingEn = `Vishti (Bhadra) active from ${karana1EndFmt.en} until ${karana2EndFmt.en}`;
    bhadraTimingHi = `भद्रा (विष्टि) ${karana1EndFmt.hi} से ${karana2EndFmt.hi} तक`;
  }

  // 5. VARA (Weekday & Ruling Planet)
  const weekdayDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const weekday = weekdayDate.getUTCDay(); // 0=Sun .. 6=Sat
  const varaObj = VARA_DATA[weekday];

  // 6. MOON SIGN (Chandra Rashi) & SUN SIGN (Surya Rashi) + Moon Sign Change Time
  const moonSignIdx = Math.floor(posAtSunrise.moonSid / 30) % 12;
  const sunSignIdx = Math.floor(posAtSunrise.sunSid / 30) % 12;
  const moonRashi = RASHI_DATA[moonSignIdx];
  const sunRashi = RASHI_DATA[sunSignIdx];

  const moonSignCross = findAngleCrossingAfter(sunrise, nakFn, 30, 72);
  const moonSignNext = RASHI_DATA[moonSignCross.nextIndex];
  const moonChangesToday = moonSignCross.endTime < nextSunrise;
  const moonSignChangeFmt = formatTimeInZone(moonSignCross.endTime, civilDateStr, timeZone);

  // 7. HINDU CALENDAR CONTEXT (Amanta & Purnimanta Masa, Adhika Masa, Ritu, Ayana, Samvat)
  const masa = computeLunarMasa(sunrise, tithiIdxSunrise);
  const isBeforeChaitra = month < 3 || (month === 3 && masa.amantaEn.includes("Phalguna"));
  const vikramSamvat = isBeforeChaitra ? year + 56 : year + 57;
  const shakaSamvat = isBeforeChaitra ? year - 79 : year - 78;
  const ayanaEn: "Uttarayana" | "Dakshinayana" =
    posAtSunrise.sunSid >= 270 || posAtSunrise.sunSid < 90 ? "Uttarayana" : "Dakshinayana";
  const ayanaHi = ayanaEn === "Uttarayana" ? "उत्तरायण" : "दक्षिणायन";

  // Sidereal Solar Ritu
  const rituIdx = Math.floor(normalize360(posAtSunrise.sunSid + 30) / 60) % 6;
  const RITU_LIST = [
    { en: "Vasanta (Spring)", hi: "वसंत ऋतु" },
    { en: "Grishma (Summer)", hi: "ग्रीष्म ऋतु" },
    { en: "Varsha (Monsoon)", hi: "वर्षा ऋतु" },
    { en: "Sharad (Autumn)", hi: "शरद ऋतु" },
    { en: "Hemanta (Pre-Winter)", hi: "हेमंत ऋतु" },
    { en: "Shishira (Winter)", hi: "शिशिर ऋतु" },
  ];
  const rituObj = RITU_LIST[rituIdx];

  // 8. AUSPICIOUS & INAUSPICIOUS PERIODS (proportional to true Dinamana & Ratrimana)
  const dinamanaMs = sunset.getTime() - sunrise.getTime();
  const ratrimanaMs = nextSunrise.getTime() - sunset.getTime();
  const octantMs = dinamanaMs / 8;
  const muhurat15Ms = dinamanaMs / 15;
  const nightMuhurat15Ms = ratrimanaMs / 15;

  const RAHU_OCTANT = [8, 2, 7, 5, 6, 4, 3]; // 1-based octant for Sun..Sat
  const YAMA_OCTANT = [5, 4, 3, 2, 1, 7, 6];
  const GULI_OCTANT = [7, 6, 5, 4, 3, 2, 1];

  const fmtSpan = (startMs: number, endMs: number) => {
    const s = formatTimeInZone(new Date(startMs), civilDateStr, timeZone);
    const e = formatTimeInZone(new Date(endMs), civilDateStr, timeZone);
    return { en: `${s.en} – ${e.en}`, hi: `${s.hi} – ${e.hi}` };
  };

  const rahuSpan = fmtSpan(
    sunrise.getTime() + (RAHU_OCTANT[weekday] - 1) * octantMs,
    sunrise.getTime() + RAHU_OCTANT[weekday] * octantMs
  );
  const yamaSpan = fmtSpan(
    sunrise.getTime() + (YAMA_OCTANT[weekday] - 1) * octantMs,
    sunrise.getTime() + YAMA_OCTANT[weekday] * octantMs
  );
  const guliSpan = fmtSpan(
    sunrise.getTime() + (GULI_OCTANT[weekday] - 1) * octantMs,
    sunrise.getTime() + GULI_OCTANT[weekday] * octantMs
  );

  // Abhijit Muhurat (8th of 15 Muhurats of Dinamana)
  const abhijitSpan = fmtSpan(
    sunrise.getTime() + 7 * muhurat15Ms,
    sunrise.getTime() + 8 * muhurat15Ms
  );
  // Vijaya Muhurat (11th of 15 Muhurats of Dinamana)
  const vijayaSpan = fmtSpan(
    sunrise.getTime() + 10 * muhurat15Ms,
    sunrise.getTime() + 11 * muhurat15Ms
  );
  // Brahma Muhurat (14th of 15 Night Muhurats, i.e., 2 Muhurats before Sunrise to 1 Muhurat before Sunrise)
  const brahmaSpan = fmtSpan(
    sunrise.getTime() - 2 * nightMuhurat15Ms,
    sunrise.getTime() - 1 * nightMuhurat15Ms
  );

  // Classical Durmuhurat slot(s) out of 15 day Muhurats
  const DURMUHURAT_SLOTS: number[][] = [
    [14],       // Sunday: 14th
    [9, 12],    // Monday: 9th & 12th
    [4],        // Tuesday: 4th
    [8],        // Wednesday: 8th
    [6, 12],    // Thursday: 6th & 12th
    [4, 9],     // Friday: 4th & 9th
    [1, 2],     // Saturday: 1st & 2nd
  ];
  const durSpans = DURMUHURAT_SLOTS[weekday].map((slot1Based) =>
    fmtSpan(
      sunrise.getTime() + (slot1Based - 1) * muhurat15Ms,
      sunrise.getTime() + slot1Based * muhurat15Ms
    )
  );
  const durMuhuratEn = durSpans.map((d) => d.en).join("; ");
  const durMuhuratHi = durSpans.map((d) => d.hi).join("; ");

  // 9. CHOGHADIYA (8 Day + 8 Night)
  const choghadiya = computeChoghadiya(sunrise, sunset, nextSunrise, weekday, civilDateStr, timeZone);

  // 10. CHANDRABALAM (12 Rashis)
  const chandrabalam = computeChandrabalam(moonSignIdx);

  // 11. FESTIVALS & VRATS OF THE DAY
  const festivals = detectFestivalsAndVratsForDay(
    civilDateStr,
    tithisActiveInDay,
    pakshaEn,
    masa.amantaEn,
    masa.amantaHi,
    posAtSunrise.sunSid,
    posAtNextSunrise.sunSid
  );

  // 12. FIVE AUSPICIOUS YOGAS (Sarvartha Siddhi, Ravi Yog, Amrit Yog, Amrit Siddhi, Guru Pushya)
  const nakIntervals: NakshatraInterval[] = [];
  if (nakCross.endTime >= nextSunrise) {
    nakIntervals.push({ nakIndex: nakCross.currentIndex, start: sunrise, end: nextSunrise });
  } else {
    nakIntervals.push({ nakIndex: nakCross.currentIndex, start: sunrise, end: nakCross.endTime });
    if (nakCross2.endTime >= nextSunrise) {
      nakIntervals.push({ nakIndex: nakCross.nextIndex, start: nakCross.endTime, end: nextSunrise });
    } else {
      nakIntervals.push({ nakIndex: nakCross.nextIndex, start: nakCross.endTime, end: nakCross2.endTime });
      nakIntervals.push({ nakIndex: nakCross2.nextIndex, start: nakCross2.endTime, end: nextSunrise });
    }
  }

  const auspiciousYogas = computeAuspiciousYogas(
    sunrise,
    nextSunrise,
    weekday,
    nakIntervals,
    civilDateStr,
    timeZone
  );

  const dateFormattedEn = new Intl.DateTimeFormat("en-IN", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(sunrise);

  const dateFormattedHi = new Intl.DateTimeFormat("hi-IN", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(sunrise);

  return {
    civilDateStr,
    date: dateFormattedEn,
    dateHindi: dateFormattedHi,
    location,
    city: location.name,
    cityHindi: location.nameHindi,
    timeZone,
    samvat: `Vikram Samvat ${vikramSamvat} • Shaka Samvat ${shakaSamvat}`,
    samvatHindi: `विक्रम संवत ${vikramSamvat} • शक संवत ${shakaSamvat}`,
    vikramSamvat,
    shakaSamvat,
    masa: {
      amanta: masa.amantaEn,
      amantaHindi: masa.amantaHi,
      purnimanta: masa.purnimantaEn,
      purnimantaHindi: masa.purnimantaHi,
      isAdhikaMasa: masa.isAdhikaMasa,
    },
    ritu: rituObj.en,
    rituHindi: rituObj.hi,
    ayana: ayanaEn,
    ayanaHindi: ayanaHi,
    conventions: {
      ayanamsaName: "Chitra Paksha Lahiri Ayanamsa",
      ayanamsaNameHindi: "चित्रापक्ष लहिरी अयनांश",
      ayanamsaDegrees: Number(posAtSunrise.ayanamsa.toFixed(4)),
      sunriseDefinition: "Sun upper limb with standard atmospheric refraction (-0.833° solar altitude)",
      sunriseDefinitionHindi: "सूर्य के ऊपरी कोर का उदय (वायुमंडलीय अपवर्तन सहित -0.833° उन्नतांश)",
      nodeConvention: "Mean Lunar Node (Madhyama Rahu) primary; True Node (Spashta Rahu) also computed",
      nodeConventionHindi: "मध्यम राहु (Mean Node) एवं स्पष्ट राहु (True Node) दोनों गणितीय रूप से उपलब्ध",
      meanRahuDegrees: Number(posAtSunrise.meanRahuSid.toFixed(2)),
      trueRahuDegrees: Number(posAtSunrise.trueRahuSid.toFixed(2)),
    },
    tithi: {
      name: tithiPrimary.en,
      nameHindi: tithiPrimary.hi,
      paksha: pakshaEn,
      pakshaHindi: pakshaHi,
      endsAt: tithiEndFmt.en,
      endsAtHindi: tithiEndFmt.hi,
      nextTithi: tithiNext.en,
      nextTithiHindi: tithiNext.hi,
      anomaly: tithiAnomaly,
      anomalyNoteEn: tithiAnomalyNoteEn,
      anomalyNoteHi: tithiAnomalyNoteHi,
    },
    nakshatra: {
      name: nakPrimary.en,
      nameHindi: nakPrimary.hi,
      pada: nakPada,
      endsAt: nakEndFmt.en,
      endsAtHindi: nakEndFmt.hi,
      lord: nakPrimary.lordEn,
      lordHindi: nakPrimary.lordHi,
      nextNakshatra: nakNext.en,
      nextNakshatraHindi: nakNext.hi,
      nextLord: nakNext.lordEn,
      nextLordHindi: nakNext.lordHi,
      hasTwoTransitionsInDay: nakCross2.endTime < nextSunrise,
      secondEndsAt:
        nakCross2.endTime < nextSunrise
          ? formatTimeInZone(nakCross2.endTime, civilDateStr, timeZone).en
          : undefined,
      secondEndsAtHindi:
        nakCross2.endTime < nextSunrise
          ? formatTimeInZone(nakCross2.endTime, civilDateStr, timeZone).hi
          : undefined,
      thirdNakshatra:
        nakCross2.endTime < nextSunrise ? NAKSHATRA_DATA[nakCross2.nextIndex].en : undefined,
      thirdNakshatraHindi:
        nakCross2.endTime < nextSunrise ? NAKSHATRA_DATA[nakCross2.nextIndex].hi : undefined,
    },
    yoga: {
      name: yogaPrimary.en,
      nameHindi: yogaPrimary.hi,
      auspicious: yogaPrimary.auspicious,
      endsAt: yogaEndFmt.en,
      endsAtHindi: yogaEndFmt.hi,
      nextYoga: yogaNext.en,
      nextYogaHindi: yogaNext.hi,
    },
    karana: {
      name: karana1.en,
      nameHindi: karana1.hi,
      type: karana1.type,
      endsAt: karana1EndFmt.en,
      endsAtHindi: karana1EndFmt.hi,
      secondKarana: karana2.en,
      secondKaranaHindi: karana2.hi,
      secondEndsAt: karana2EndFmt.en,
      secondEndsAtHindi: karana2EndFmt.hi,
      bhadraTiming: bhadraTimingEn,
      bhadraTimingHindi: bhadraTimingHi,
      hasBhadra: karana1.isBhadra || (karana2.isBhadra && karanaCross1.endTime < nextSunrise),
    },
    vaar: `${varaObj.en} — Ruled by ${varaObj.lordEn}`,
    vaarHindi: `${varaObj.hi} — स्वामी ग्रह: ${varaObj.lordHi}`,
    varaDetails: {
      name: varaObj.en,
      nameHindi: varaObj.hi,
      lord: varaObj.lordEn,
      lordHindi: varaObj.lordHi,
      dishaShool: varaObj.dishaShoolEn,
      dishaShoolHindi: varaObj.dishaShoolHi,
    },
    vaarDetails: {
      name: varaObj.en,
      nameHindi: varaObj.hi,
      lord: varaObj.lordEn,
      lordHindi: varaObj.lordHi,
      dishaShool: varaObj.dishaShoolEn,
      dishaShoolHindi: varaObj.dishaShoolHi,
    },
    sunTimes: {
      sunrise: sunriseFmt.en,
      sunriseHindi: sunriseFmt.hi,
      sunset: sunsetFmt.en,
      sunsetHindi: sunsetFmt.hi,
      sunSign: sunRashi.en,
      sunSignHindi: sunRashi.hi,
      sunLongitudeDeg: Number(posAtSunrise.sunSid.toFixed(2)),
    },
    moonTimes: {
      moonrise: moonriseFmt.en,
      moonriseHindi: moonriseFmt.hi,
      moonset: moonsetFmt.en,
      moonsetHindi: moonsetFmt.hi,
      moonSign: moonRashi.en,
      moonSignHindi: moonRashi.hi,
      moonSignChange: moonChangesToday
        ? `Enters ${moonSignNext.en} at ${moonSignChangeFmt.en}`
        : `Remains in ${moonRashi.en} all day (enters ${moonSignNext.en} at ${moonSignChangeFmt.en})`,
      moonSignChangeHindi: moonChangesToday
        ? `${moonSignChangeFmt.hi} पर ${moonSignNext.hi} राशि में प्रवेश`
        : `संपूर्ण दिन ${moonRashi.hi} राशि में (${moonSignChangeFmt.hi} पर ${moonSignNext.hi} में प्रवेश)`,
      moonLongitudeDeg: Number(posAtSunrise.moonSid.toFixed(2)),
    },
    auspiciousTimings: {
      abhijitMuhurat: abhijitSpan.en,
      abhijitMuhuratHindi: abhijitSpan.hi,
      amritKaal: `${amritStartFmt.en} – ${amritEndFmt.en}`,
      amritKaalHindi: `${amritStartFmt.hi} – ${amritEndFmt.hi}`,
      brahmaMuhurat: brahmaSpan.en,
      brahmaMuhuratHindi: brahmaSpan.hi,
      vijayaMuhurat: vijayaSpan.en,
      vijayaMuhuratHindi: vijayaSpan.hi,
    },
    inauspiciousTimings: {
      rahuKaal: rahuSpan.en,
      rahuKaalHindi: rahuSpan.hi,
      yamaganda: yamaSpan.en,
      yamagandaHindi: yamaSpan.hi,
      gulikaKaal: guliSpan.en,
      gulikaKaalHindi: guliSpan.hi,
      durMuhurat: durMuhuratEn,
      durMuhuratHindi: durMuhuratHi,
      varjyam: `${varjyamStartFmt.en} – ${varjyamEndFmt.en}`,
      varjyamHindi: `${varjyamStartFmt.hi} – ${varjyamEndFmt.hi}`,
      bhadra: bhadraTimingEn,
      bhadraHindi: bhadraTimingHi,
    },
    choghadiya,
    chandrabalam,
    festivals,
    auspiciousYogas,
    activeAuspiciousYogasCount: auspiciousYogas.filter((y) => y.isActive).length,
    timeline24h: {
      sunriseMs: sunrise.getTime(),
      sunsetMs: sunset.getTime(),
      nextSunriseMs: nextSunrise.getTime(),
      totalDurationMs: nextSunrise.getTime() - sunrise.getTime(),
      choghadiyaAll: [...choghadiya.day, ...choghadiya.night].map((slot) => {
        const totalMs = nextSunrise.getTime() - sunrise.getTime();
        const startPct = ((slot.startMs - sunrise.getTime()) / totalMs) * 100;
        const widthPct = ((slot.endMs - slot.startMs) / totalMs) * 100;
        return {
          ...slot,
          startPct: Number(startPct.toFixed(2)),
          widthPct: Number(widthPct.toFixed(2)),
        };
      }),
      specialPeriods: [
        {
          key: "rahuKaal" as const,
          labelEn: "Rahu Kaal",
          labelHi: "राहुकाल",
          periodEn: rahuSpan.en,
          periodHi: rahuSpan.hi,
          startMs: sunrise.getTime() + (RAHU_OCTANT[weekday] - 1) * octantMs,
          endMs: sunrise.getTime() + RAHU_OCTANT[weekday] * octantMs,
          endTimeEn: formatTimeInZone(
            new Date(sunrise.getTime() + RAHU_OCTANT[weekday] * octantMs),
            civilDateStr,
            timeZone
          ).en,
          endTimeHi: formatTimeInZone(
            new Date(sunrise.getTime() + RAHU_OCTANT[weekday] * octantMs),
            civilDateStr,
            timeZone
          ).hi,
          startPct: Number(
            (
              (((RAHU_OCTANT[weekday] - 1) * octantMs) /
                (nextSunrise.getTime() - sunrise.getTime())) *
              100
            ).toFixed(2)
          ),
          widthPct: Number(
            ((octantMs / (nextSunrise.getTime() - sunrise.getTime())) * 100).toFixed(2)
          ),
          isAuspicious: false,
        },
        {
          key: "yamaganda" as const,
          labelEn: "Yamaganda",
          labelHi: "यमगण्ड",
          periodEn: yamaSpan.en,
          periodHi: yamaSpan.hi,
          startMs: sunrise.getTime() + (YAMA_OCTANT[weekday] - 1) * octantMs,
          endMs: sunrise.getTime() + YAMA_OCTANT[weekday] * octantMs,
          endTimeEn: formatTimeInZone(
            new Date(sunrise.getTime() + YAMA_OCTANT[weekday] * octantMs),
            civilDateStr,
            timeZone
          ).en,
          endTimeHi: formatTimeInZone(
            new Date(sunrise.getTime() + YAMA_OCTANT[weekday] * octantMs),
            civilDateStr,
            timeZone
          ).hi,
          startPct: Number(
            (
              (((YAMA_OCTANT[weekday] - 1) * octantMs) /
                (nextSunrise.getTime() - sunrise.getTime())) *
              100
            ).toFixed(2)
          ),
          widthPct: Number(
            ((octantMs / (nextSunrise.getTime() - sunrise.getTime())) * 100).toFixed(2)
          ),
          isAuspicious: false,
        },
        {
          key: "gulikaKaal" as const,
          labelEn: "Gulika Kaal",
          labelHi: "गुलिक काल",
          periodEn: guliSpan.en,
          periodHi: guliSpan.hi,
          startMs: sunrise.getTime() + (GULI_OCTANT[weekday] - 1) * octantMs,
          endMs: sunrise.getTime() + GULI_OCTANT[weekday] * octantMs,
          endTimeEn: formatTimeInZone(
            new Date(sunrise.getTime() + GULI_OCTANT[weekday] * octantMs),
            civilDateStr,
            timeZone
          ).en,
          endTimeHi: formatTimeInZone(
            new Date(sunrise.getTime() + GULI_OCTANT[weekday] * octantMs),
            civilDateStr,
            timeZone
          ).hi,
          startPct: Number(
            (
              (((GULI_OCTANT[weekday] - 1) * octantMs) /
                (nextSunrise.getTime() - sunrise.getTime())) *
              100
            ).toFixed(2)
          ),
          widthPct: Number(
            ((octantMs / (nextSunrise.getTime() - sunrise.getTime())) * 100).toFixed(2)
          ),
          isAuspicious: false,
        },
        {
          key: "abhijitMuhurat" as const,
          labelEn: "Abhijit Muhurat",
          labelHi: "अभिजित मुहूर्त",
          periodEn: abhijitSpan.en,
          periodHi: abhijitSpan.hi,
          startMs: sunrise.getTime() + 7 * muhurat15Ms,
          endMs: sunrise.getTime() + 8 * muhurat15Ms,
          endTimeEn: formatTimeInZone(
            new Date(sunrise.getTime() + 8 * muhurat15Ms),
            civilDateStr,
            timeZone
          ).en,
          endTimeHi: formatTimeInZone(
            new Date(sunrise.getTime() + 8 * muhurat15Ms),
            civilDateStr,
            timeZone
          ).hi,
          startPct: Number(
            (((7 * muhurat15Ms) / (nextSunrise.getTime() - sunrise.getTime())) * 100).toFixed(2)
          ),
          widthPct: Number(
            ((muhurat15Ms / (nextSunrise.getTime() - sunrise.getTime())) * 100).toFixed(2)
          ),
          isAuspicious: true,
        },
      ],
    },
    specialSignificance: `Calculated from real planetary positions using the Chitra Paksha Lahiri Ayanamsa (${posAtSunrise.ayanamsa.toFixed(2)}°) for ${location.name}. Moon transits ${moonRashi.en} under ${nakPrimary.en} Nakshatra.`,
    specialSignificanceHindi: `चित्रापक्ष लहिरी अयनांश (${posAtSunrise.ayanamsa.toFixed(2)}°) एवं वास्तविक ग्रह स्पष्ट के आधार पर ${location.nameHindi} हेतु गणित। आज चन्द्रमा ${moonRashi.hi} राशि एवं ${nakPrimary.hi} नक्षत्र में संचरण कर रहे हैं।`,
  };
}
