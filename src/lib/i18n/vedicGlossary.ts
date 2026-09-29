/**
 * ============================================================================
 * CENTRALIZED VEDIC JYOTISH & PANCHANG GLOSSARY (ENGLISH & DEVANAGARI HINDI)
 * ============================================================================
 * Single source of truth for all traditional Sanskrit-derived Hindi (Devanagari)
 * and English astrological terms and UI copy across Daily Panchang & Horoscope.
 *
 * Client editors can update any Devanagari string in this file without touching
 * calculation or component rendering logic.
 */

export interface BilingualTerm {
  key: string;
  en: string;
  hi: string;
}

/**
 * 1. 30 Tithis (15 Shukla Paksha + 15 Krishna Paksha)
 */
export const TITHIS_30: BilingualTerm[] = [
  { key: "shukla_1", en: "Shukla Pratipada", hi: "शुक्ल प्रतिपदा" },
  { key: "shukla_2", en: "Shukla Dwitiya", hi: "शुक्ल द्वितीया" },
  { key: "shukla_3", en: "Shukla Tritiya", hi: "शुक्ल तृतीया" },
  { key: "shukla_4", en: "Shukla Chaturthi", hi: "शुक्ल चतुर्थी" },
  { key: "shukla_5", en: "Shukla Panchami", hi: "शुक्ल पंचमी" },
  { key: "shukla_6", en: "Shukla Shashthi", hi: "शुक्ल षष्ठी" },
  { key: "shukla_7", en: "Shukla Saptami", hi: "शुक्ल सप्तमी" },
  { key: "shukla_8", en: "Shukla Ashtami", hi: "शुक्ल अष्टमी" },
  { key: "shukla_9", en: "Shukla Navami", hi: "शुक्ल नवमी" },
  { key: "shukla_10", en: "Shukla Dashami", hi: "शुक्ल दशमी" },
  { key: "shukla_11", en: "Shukla Ekadashi", hi: "शुक्ल एकादशी" },
  { key: "shukla_12", en: "Shukla Dwadashi", hi: "शुक्ल द्वादशी" },
  { key: "shukla_13", en: "Shukla Trayodashi", hi: "शुक्ल त्रयोदशी" },
  { key: "shukla_14", en: "Shukla Chaturdashi", hi: "शुक्ल चतुर्दशी" },
  { key: "purnima", en: "Purnima", hi: "पूर्णिमा" },
  { key: "krishna_1", en: "Krishna Pratipada", hi: "कृष्ण प्रतिपदा" },
  { key: "krishna_2", en: "Krishna Dwitiya", hi: "कृष्ण द्वितीया" },
  { key: "krishna_3", en: "Krishna Tritiya", hi: "कृष्ण तृतीया" },
  { key: "krishna_4", en: "Krishna Chaturthi", hi: "कृष्ण चतुर्थी" },
  { key: "krishna_5", en: "Krishna Panchami", hi: "कृष्ण पंचमी" },
  { key: "krishna_6", en: "Krishna Shashthi", hi: "कृष्ण षष्ठी" },
  { key: "krishna_7", en: "Krishna Saptami", hi: "कृष्ण सप्तमी" },
  { key: "krishna_8", en: "Krishna Ashtami", hi: "कृष्ण अष्टमी" },
  { key: "krishna_9", en: "Krishna Navami", hi: "कृष्ण नवमी" },
  { key: "krishna_10", en: "Krishna Dashami", hi: "कृष्ण दशमी" },
  { key: "krishna_11", en: "Krishna Ekadashi", hi: "कृष्ण एकादशी" },
  { key: "krishna_12", en: "Krishna Dwadashi", hi: "कृष्ण द्वादशी" },
  { key: "krishna_13", en: "Krishna Trayodashi", hi: "कृष्ण त्रयोदशी" },
  { key: "krishna_14", en: "Krishna Chaturdashi", hi: "कृष्ण चतुर्दशी" },
  { key: "amavasya", en: "Amavasya", hi: "अमावस्या" },
];

/**
 * 2. 2 Pakshas (Lunar Fortnights)
 */
export const PAKSHAS_2: BilingualTerm[] = [
  { key: "shukla_paksha", en: "Shukla Paksha", hi: "शुक्ल पक्ष" },
  { key: "krishna_paksha", en: "Krishna Paksha", hi: "कृष्ण पक्ष" },
];

/**
 * 3. 27 Nakshatras (Lunar Mansions)
 */
export const NAKSHATRAS_27: BilingualTerm[] = [
  { key: "ashwini", en: "Ashwini", hi: "अश्विनी" },
  { key: "bharani", en: "Bharani", hi: "भरणी" },
  { key: "krittika", en: "Krittika", hi: "कृत्तिका" },
  { key: "rohini", en: "Rohini", hi: "रोहिणी" },
  { key: "mrigashira", en: "Mrigashira", hi: "मृगशिरा" },
  { key: "ardra", en: "Ardra", hi: "आर्द्रा" },
  { key: "punarvasu", en: "Punarvasu", hi: "पुनर्वसु" },
  { key: "pushya", en: "Pushya", hi: "पुष्य" },
  { key: "ashlesha", en: "Ashlesha", hi: "आश्लेषा" },
  { key: "magha", en: "Magha", hi: "मघा" },
  { key: "purva_phalguni", en: "Purva Phalguni", hi: "पूर्वाफाल्गुनी" },
  { key: "uttara_phalguni", en: "Uttara Phalguni", hi: "उत्तराफाल्गुनी" },
  { key: "hasta", en: "Hasta", hi: "हस्त" },
  { key: "chitra", en: "Chitra", hi: "चित्रा" },
  { key: "swati", en: "Swati", hi: "स्वाति" },
  { key: "vishakha", en: "Vishakha", hi: "विशाखा" },
  { key: "anuradha", en: "Anuradha", hi: "अनुराधा" },
  { key: "jyeshtha", en: "Jyeshtha", hi: "ज्येष्ठा" },
  { key: "mula", en: "Mula", hi: "मूल" },
  { key: "purva_ashadha", en: "Purva Ashadha", hi: "पूर्वाषाढ़ा" },
  { key: "uttara_ashadha", en: "Uttara Ashadha", hi: "उत्तराषाढ़ा" },
  { key: "shravana", en: "Shravana", hi: "श्रवण" },
  { key: "dhanishta", en: "Dhanishta", hi: "धनिष्ठा" },
  { key: "shatabhisha", en: "Shatabhisha", hi: "शतभिषा" },
  { key: "purva_bhadrapada", en: "Purva Bhadrapada", hi: "पूर्वाभाद्रपद" },
  { key: "uttara_bhadrapada", en: "Uttara Bhadrapada", hi: "उत्तराभाद्रपद" },
  { key: "revati", en: "Revati", hi: "रेवती" },
];

/**
 * 4. 27 Nitya Yogas
 */
export const YOGAS_27: BilingualTerm[] = [
  { key: "vishkumbha", en: "Vishkumbha", hi: "विष्कुम्भ" },
  { key: "priti", en: "Priti", hi: "प्रीति" },
  { key: "ayushman", en: "Ayushman", hi: "आयुष्मान" },
  { key: "saubhagya", en: "Saubhagya", hi: "सौभाग्य" },
  { key: "shobhana", en: "Shobhana", hi: "शोभन" },
  { key: "atiganda", en: "Atiganda", hi: "अतिगण्ड" },
  { key: "sukarma", en: "Sukarma", hi: "सुकर्मा" },
  { key: "dhriti", en: "Dhriti", hi: "धृति" },
  { key: "shula", en: "Shula", hi: "शूल" },
  { key: "ganda", en: "Ganda", hi: "गण्ड" },
  { key: "vriddhi", en: "Vriddhi", hi: "वृद्धि" },
  { key: "dhruva", en: "Dhruva", hi: "ध्रुव" },
  { key: "vyaghata", en: "Vyaghata", hi: "व्याघात" },
  { key: "harshana", en: "Harshana", hi: "हर्षण" },
  { key: "vajra", en: "Vajra", hi: "वज्र" },
  { key: "siddhi", en: "Siddhi", hi: "सिद्धि" },
  { key: "vyatipata", en: "Vyatipata", hi: "व्यतीपात" },
  { key: "variyan", en: "Variyan", hi: "वरीयान" },
  { key: "parigha", en: "Parigha", hi: "परिघ" },
  { key: "shiva", en: "Shiva", hi: "शिव" },
  { key: "siddha", en: "Siddha", hi: "सिद्ध" },
  { key: "sadhya", en: "Sadhya", hi: "साध्य" },
  { key: "shubha", en: "Shubha", hi: "शुभ" },
  { key: "shukla", en: "Shukla", hi: "शुक्ल" },
  { key: "brahma", en: "Brahma", hi: "ब्रह्म" },
  { key: "aindra", en: "Aindra", hi: "ऐन्द्र" },
  { key: "vaidhriti", en: "Vaidhriti", hi: "वैधृति" },
];

/**
 * 5. 11 Karanas (7 Chara + 4 Sthira, including Vishti / Bhadra)
 */
export const KARANAS_11: BilingualTerm[] = [
  { key: "bava", en: "Bava", hi: "बव" },
  { key: "balava", en: "Balava", hi: "बालव" },
  { key: "kaulava", en: "Kaulava", hi: "कौलव" },
  { key: "taitila", en: "Taitila", hi: "तैतिल" },
  { key: "gara", en: "Gara", hi: "गर" },
  { key: "vanija", en: "Vanija", hi: "वणिज" },
  { key: "vishti", en: "Vishti (Bhadra)", hi: "विष्टि (भद्रा)" },
  { key: "shakuni", en: "Shakuni", hi: "शकुनि" },
  { key: "chatushpada", en: "Chatushpada", hi: "चतुष्पद" },
  { key: "naga", en: "Naga", hi: "नाग" },
  { key: "kimstughna", en: "Kimstughna", hi: "किंस्तुघ्न" },
];

/**
 * 6. 7 Varas (Weekdays)
 */
export const VARAS_7: BilingualTerm[] = [
  { key: "ravivara", en: "Sunday (Ravivara)", hi: "रविवार" },
  { key: "somavara", en: "Monday (Somavara)", hi: "सोमवार" },
  { key: "mangalavara", en: "Tuesday (Mangalavara)", hi: "मंगलवार" },
  { key: "budhavara", en: "Wednesday (Budhavara)", hi: "बुधवार" },
  { key: "guruvara", en: "Thursday (Guruvara)", hi: "गुरुवार" },
  { key: "shukravara", en: "Friday (Shukravara)", hi: "शुक्रवार" },
  { key: "shanivara", en: "Saturday (Shanivara)", hi: "शनिवार" },
];

/**
 * 7. 12 Lunar Masas (Months)
 */
export const MASAS_12: BilingualTerm[] = [
  { key: "chaitra", en: "Chaitra", hi: "चैत्र" },
  { key: "vaishakha", en: "Vaishakha", hi: "वैशाख" },
  { key: "jyeshtha", en: "Jyeshtha", hi: "ज्येष्ठ" },
  { key: "ashadha", en: "Ashadha", hi: "आषाढ़" },
  { key: "shravana", en: "Shravana", hi: "श्रावण" },
  { key: "bhadrapada", en: "Bhadrapada", hi: "भाद्रपद" },
  { key: "ashwin", en: "Ashwin", hi: "आश्विन" },
  { key: "kartika", en: "Kartika", hi: "कार्तिक" },
  { key: "margashirsha", en: "Margashirsha", hi: "मार्गशीर्ष" },
  { key: "pausha", en: "Pausha", hi: "पौष" },
  { key: "magha", en: "Magha", hi: "माघ" },
  { key: "phalguna", en: "Phalguna", hi: "फाल्गुन" },
];

/**
 * 8. 6 Ritus (Vedic Seasons)
 */
export const RITUS_6: BilingualTerm[] = [
  { key: "vasanta", en: "Vasanta (Spring)", hi: "वसंत ऋतु" },
  { key: "grishma", en: "Grishma (Summer)", hi: "ग्रीष्म ऋतु" },
  { key: "varsha", en: "Varsha (Monsoon)", hi: "वर्षा ऋतु" },
  { key: "sharad", en: "Sharad (Autumn)", hi: "शरद ऋतु" },
  { key: "hemanta", en: "Hemanta (Pre-Winter)", hi: "हेमंत ऋतु" },
  { key: "shishira", en: "Shishira (Winter)", hi: "शिशिर ऋतु" },
];

/**
 * 9. 12 Rashis (Sidereal Signs)
 */
export const RASHIS_12: BilingualTerm[] = [
  { key: "aries", en: "Mesha (Aries)", hi: "मेष" },
  { key: "taurus", en: "Vrishabha (Taurus)", hi: "वृषभ" },
  { key: "gemini", en: "Mithuna (Gemini)", hi: "मिथुन" },
  { key: "cancer", en: "Karka (Cancer)", hi: "कर्क" },
  { key: "leo", en: "Simha (Leo)", hi: "सिंह" },
  { key: "virgo", en: "Kanya (Virgo)", hi: "कन्या" },
  { key: "libra", en: "Tula (Libra)", hi: "तुला" },
  { key: "scorpio", en: "Vrishchika (Scorpio)", hi: "वृश्चिक" },
  { key: "sagittarius", en: "Dhanu (Sagittarius)", hi: "धनु" },
  { key: "capricorn", en: "Makara (Capricorn)", hi: "मकर" },
  { key: "aquarius", en: "Kumbha (Aquarius)", hi: "कुम्भ" },
  { key: "pisces", en: "Meena (Pisces)", hi: "मीन" },
];

/**
 * 10. 9 Grahas (Vedic Planets)
 */
export const GRAHAS_9: BilingualTerm[] = [
  { key: "sun", en: "Sun (Surya)", hi: "सूर्य" },
  { key: "moon", en: "Moon (Chandra)", hi: "चन्द्र" },
  { key: "mars", en: "Mars (Mangal)", hi: "मंगल" },
  { key: "mercury", en: "Mercury (Budh)", hi: "बुध" },
  { key: "jupiter", en: "Jupiter (Brihaspati / Guru)", hi: "बृहस्पति (गुरु)" },
  { key: "venus", en: "Venus (Shukra)", hi: "शुक्र" },
  { key: "saturn", en: "Saturn (Shani)", hi: "शनि" },
  { key: "rahu", en: "Rahu", hi: "राहु" },
  { key: "ketu", en: "Ketu", hi: "केतु" },
];

/**
 * 11. 7 Choghadiya Names
 */
export const CHOGHADIYAS_7: BilingualTerm[] = [
  { key: "shubh", en: "Shubh", hi: "शुभ" },
  { key: "amrit", en: "Amrit", hi: "अमृत" },
  { key: "char", en: "Char", hi: "चर" },
  { key: "labh", en: "Labh", hi: "लाभ" },
  { key: "udveg", en: "Udveg", hi: "उद्वेग" },
  { key: "rog", en: "Rog", hi: "रोग" },
  { key: "kaal", en: "Kaal", hi: "काल" },
];

/**
 * 12. All Panchang UI Labels & Terminology
 */
export const PANCHANG_UI_COPY = {
  pageBadge: {
    en: "Drik Ganita Vedic Panchang • Chitra Paksha Lahiri Ayanamsa",
    hi: "दृक् गणित वैदिक पंचांग • चित्रापक्ष लाहिड़ी अयनांश",
  },
  pageTitle: {
    en: "Daily Hindu Panchang & Shubh Muhurat",
    hi: "आज का संपूर्ण वैदिक पंचांग एवं शुभ मुहूर्त",
  },
  pageSubtitle: {
    en: "Calculated from real planetary positions using the Lahiri Ayanamsa for your selected city and timezone.",
    hi: "चयनित नगर के अक्षांश-देशांतर व समय-मान के अनुसार वास्तविक ग्रह स्पष्ट एवं लाहिड़ी अयनांश पर आधारित।",
  },
  selectLocation: { en: "City / Location:", hi: "नगर / स्थान चुनें:" },
  selectDate: { en: "Date:", hi: "दिनांक चुनें:" },
  prevDay: { en: "← Previous Day", hi: "← पिछला दिन" },
  todayBtn: { en: "Today", hi: "आज" },
  nextDay: { en: "Next Day →", hi: "अगला दिन →" },
  sunrise: { en: "Sunrise (Suryodaya)", hi: "सूर्योदय" },
  sunset: { en: "Sunset (Suryast)", hi: "सूर्यास्त" },
  moonrise: { en: "Moonrise (Chandrodaya)", hi: "चन्द्रोदय" },
  moonset: { en: "Moonset (Chandrast)", hi: "चन्द्रास्त" },
  moonSign: { en: "Moon Sign (Chandra Rashi)", hi: "चन्द्र राशि" },
  sunSign: { en: "Sun Sign (Surya Rashi)", hi: "सूर्य राशि" },
  samvatHeader: { en: "Hindu Calendar & Samvatsara Context", hi: "संवत्सर, मास एवं ऋतु विवरण" },
  vikramSamvat: { en: "Vikram Samvat", hi: "विक्रम संवत्" },
  shakaSamvat: { en: "Shaka Samvat", hi: "शक संवत्" },
  amantaMasa: { en: "Amanta Masa", hi: "अमान्त मास" },
  purnimantaMasa: { en: "Purnimanta Masa", hi: "पूर्णिमान्त मास" },
  paksha: { en: "Paksha (Fortnight)", hi: "पक्ष" },
  ritu: { en: "Ritu (Vedic Season)", hi: "ऋतु" },
  ayana: { en: "Ayana (Solar Course)", hi: "अयन" },
  dishaShool: { en: "Disha Shool (Avoid Travel)", hi: "दिशा शूल" },
  fiveLimbsTitle: { en: "The Five Limbs of Panchang (पंचांग के पांच अंग)", hi: "पंचांग के पांच मुख्य अंग (तिथि, वार, नक्षत्र, योग, करण)" },
  tithi: { en: "Tithi (Lunar Day)", hi: "तिथि" },
  vara: { en: "Vara (Weekday)", hi: "वार (दिन)" },
  nakshatra: { en: "Nakshatra (Constellation)", hi: "नक्षत्र" },
  yoga: { en: "Yoga", hi: "योग" },
  karana: { en: "Karana (Half-Tithi)", hi: "करण" },
  endsAt: { en: "Active until", hi: "समाप्ति समय" },
  nextElement: { en: "Followed by", hi: "इसके उपरांत" },
  rulingLord: { en: "Ruling Planet", hi: "स्वामी ग्रह" },
  pada: { en: "Pada", hi: "चरण" },
  auspiciousTitle: { en: "Shubh Muhurat (Auspicious Timings)", hi: "शुभ मुहूर्त एवं अमृत काल" },
  inauspiciousTitle: { en: "Ashubh Kaal (Periods to Avoid)", hi: "अशुभ समय (राहुकाल, यमगण्ड, भद्रा आदि)" },
  abhijitMuhurat: { en: "Abhijit Muhurat", hi: "अभिजित मुहूर्त" },
  brahmaMuhurat: { en: "Brahma Muhurat", hi: "ब्रह्म मुहूर्त" },
  amritKaal: { en: "Amrit Kaal", hi: "अमृत काल" },
  vijayaMuhurat: { en: "Vijaya Muhurat", hi: "विजय मुहूर्त" },
  rahuKaal: { en: "Rahu Kaal", hi: "राहुकाल" },
  yamaganda: { en: "Yamaganda", hi: "यमगण्ड" },
  gulikaKaal: { en: "Gulika Kaal", hi: "गुलिक काल" },
  durMuhurat: { en: "Durmuhurat", hi: "दुर्मुहूर्त" },
  varjyam: { en: "Varjyam", hi: "वर्ज्य" },
  bhadra: { en: "Vishti / Bhadra", hi: "विष्टि (भद्रा)" },
  choghadiyaTitle: { en: "Day & Night Choghadiya Muhurat", hi: "दिन एवं रात्रि का चौघड़िया मुहूर्त" },
  dayChoghadiya: { en: "Day Choghadiya (Sunrise to Sunset)", hi: "दिन का चौघड़िया (सूर्योदय से सूर्यास्त)" },
  nightChoghadiya: { en: "Night Choghadiya (Sunset to Next Sunrise)", hi: "रात्रि का चौघड़िया (सूर्यास्त से अगले सूर्योदय)" },
  chandrabalamTitle: { en: "Chandrabalam (Moon Transit Strength for All 12 Rashis)", hi: "चन्द्रबल तालिका (१२ राशियों के लिए आज का चन्द्र गोचर बल)" },
  festivalsTitle: { en: "Today's Festivals, Ekadashi & Vrats", hi: "आज के पर्व, व्रत एवं विशेष योग" },
  noFestivalsToday: {
    en: "No major pan-India festival falls on this sunrise day; observe regular Nitya Puja and Ishta Sadhana.",
    hi: "आज कोई प्रमुख सार्वजनिक पर्व नहीं है; नित्य पूजन एवं इष्ट-साधना हेतु दिन उत्तम है।",
  },
  consultBannerTitle: {
    en: "Need a Personalised Muhurat for Griha Pravesh, Marriage, or Business Launch?",
    hi: "गृह प्रवेश, विवाह, वाहन क्रय या व्यापार मुहूर्त के लिए व्यक्तिगत परामर्श चाहते हैं?",
  },
  consultBannerSub: {
    en: "General Panchang shows the daily sky. For a Muhurat matched to your Janam Rashi, Nakshatra, and Tarabalam, consult directly with Acharya Niraj Kumar.",
    hi: "आपकी जन्म राशि, नक्षत्र और ताराबल के अनुसार शुद्ध मुहूर्त निर्धारण हेतु आचार्य नीरज कुमार जी से सीधा परामर्श लें।",
  },
  consultCta: { en: "Consult Acharya Ji Live", hi: "आचार्य जी से परामर्श करें" },
  horoscopeLinkCta: { en: "Read Today's Chandra Rashi Horoscope", hi: "आज का चन्द्र राशिफल पढ़ें" },
  searchCityPlaceholder: {
    en: "Search any city or town worldwide...",
    hi: "किसी भी नगर या कस्बे का नाम खोजें...",
  },
  useMyLocationBtn: { en: "Use my location", hi: "मेरा स्थान चुनें" },
  locatingBtn: { en: "Locating...", hi: "स्थान खोजा जा रहा है..." },
  tomorrowRouteBtn: { en: "Tomorrow's Panchang →", hi: "कल का पंचांग →" },
  todayRouteBtn: { en: "Today's Panchang", hi: "आज का पंचांग" },
  timelineTitle: {
    en: "24-Hour Vedic Timeline (Sunrise to Next Sunrise)",
    hi: "चौबीस-घंटे की वैदिक काल-रेखा (सूर्योदय से अगले सूर्योदय तक)",
  },
  currentlyActiveLabel: { en: "Currently:", hi: "वर्तमान समय:" },
  untilLabel: { en: "until", hi: "तक" },
  nowMarkerLabel: { en: "NOW", hi: "अभी" },
  shareWhatsAppBtn: { en: "Share on WhatsApp", hi: "व्हाट्सऐप पर साझा करें" },
  softConsultNote: {
    en: "Need a personal muhurat for something important? Consult Acharya Ji (50% off first consultation) →",
    hi: "किसी महत्वपूर्ण कार्य के लिए व्यक्तिगत शुभ मुहूर्त चाहिए? आचार्य जी से परामर्श करें (प्रथम परामर्श पर ५०% की छूट) →",
  },
  fallbackErrorNotice: {
    en: "Showing last verified Panchang data while recalculating.",
    hi: "गणना में क्षणिक व्यवधान के कारण पूर्व-सत्यापित पंचांग दर्शाया जा रहा है।",
  },
  auspiciousYogasTitle: {
    en: "Auspicious Yogas (Shubh Yogas)",
    hi: "दैनिक शुभ योग",
  },
  auspiciousYogasSub: {
    en: "Calculated from genuine astronomical positions of the Sun and Moon under classical Muhurta Chintamani and Anandadi rules.",
    hi: "सूर्य एवं चंद्रमा के वास्तविक खगोलीय स्पष्ट तथा मुहूर्त चिंतामणि व आनंदादि सूत्रों के आधार पर सटीक दैनिक गणना।",
  },
  activeTodayBadge: { en: "Active Today", hi: "आज सक्रिय" },
  notFormedBadge: { en: "Not Formed Today", hi: "आज अनुपस्थित" },
  auspiciousTimingLabel: { en: "Auspicious Timing", hi: "शुभ समयावधि" },
  formationRuleLabel: { en: "Astrological Rule", hi: "शास्त्रीय योग विधान" },
} as const;

/**
 * 13. All Horoscope UI Labels & Terminology
 */
export const HOROSCOPE_UI_COPY = {
  all12Rashis: { en: "All 12 Chandra Rashis", hi: "सभी १२ चन्द्र राशियाँ" },
  calculateMoonSignPrompt: {
    en: "Don't know your Rashi? Calculate Moon Sign →",
    hi: "अपनी चन्द्र राशि नहीं जानते? यहाँ गणना करें →",
  },
  vedicMoonSignBadge: {
    en: "Vedic Chandra Rashi (Moon Sign) Gochara Horoscope",
    hi: "वैदिक जन्म चन्द्र राशि (चन्द्र गोचर) दैनिक राशिफल",
  },
  yesterdayTab: { en: "Yesterday", hi: "कल (बीता हुआ)" },
  todayTab: { en: "Today", hi: "आज" },
  tomorrowTab: { en: "Tomorrow", hi: "कल (आने वाला)" },
  overviewSection: {
    en: "1. Daily Overview & Chandra Gochar Guidance",
    hi: "१. दैनिक सारांश एवं चन्द्र गोचर फल",
  },
  whyThisReadingTitle: {
    en: "Why this reading? (Computed Astronomical & Vedic Gochara Facts)",
    hi: "यह राशिफल कैसे गणना किया गया? (वास्तविक ग्रह स्पष्ट एवं गोचर तथ्य)",
  },
  careerSection: { en: "Career & Profession", hi: "करियर एवं व्यवसाय (कर्म भाव)" },
  loveSection: { en: "Love & Relationships", hi: "प्रेम एवं दांपत्य संबंध" },
  healthSection: { en: "Health & Vitality", hi: "स्वास्थ्य एवं शारीरिक ऊर्जा" },
  financeSection: { en: "Finance & Wealth", hi: "आर्थिक स्थिति एवं धन-लाभ" },
  familySection: { en: "Family & Domestic Harmony", hi: "पारिवारिक जीवन एवं गृह-सुख" },
  luckyColour: { en: "Lucky Colour", hi: "शुभ रंग" },
  luckyNumber: { en: "Lucky Number", hi: "शुभ अंक" },
  favourableWindow: { en: "Favourable Time Window", hi: "अनुकूल शुभ समय" },
  vedicRemedy: { en: "Vedic Remedy (Upay) for Today", hi: "आज का वैदिक उपाय" },
  vedicMantra: { en: "Vedic Mantra for Today", hi: "आज का वैदिक बीज मंत्र" },
  switchRashiHeading: {
    en: "Switch to Another Chandra Rashi",
    hi: "अन्य चन्द्र राशियों का दैनिक राशिफल देखें",
  },
  shareWhatsAppBtn: { en: "Share on WhatsApp", hi: "व्हाट्सऐप पर साझा करें" },
  softConsultNote: {
    en: "Need a personal muhurat or Janam Kundli reading? Consult Acharya Ji (50% off first consultation) →",
    hi: "किसी महत्वपूर्ण निर्णय हेतु व्यक्तिगत कुंडली या मुहूर्त परामर्श चाहिए? आचार्य जी से परामर्श करें (प्रथम परामर्श पर ५०% की छूट) →",
  },
} as const;
