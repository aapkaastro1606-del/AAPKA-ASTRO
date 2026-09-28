/**
 * ============================================================================
 * CLASSICAL VEDIC GOCHARA (TRANSIT) RULE TABLE & SCORING SPECIFICATION
 * ============================================================================
 * Classical Sources:
 * - Phaladeepika by Mantreshwara, Adhyaya 26 (Gochara Phala)
 * - Brihat Samhita by Varahamihira, Adhyaya 104 (Gochara Adhyaya)
 * - Brihat Parashara Hora Shastra (BPHS), Gochara & Ashtakavarga principles
 *
 * NOTE FOR REVIEW:
 * This file serves as the single readable source of truth for all daily
 * Chandra-Rashi (Moon Sign) transit evaluations and domain score weights.
 * Exported in human-readable form in `HOROSCOPE_RULES_FOR_REVIEW.md` for
 * review and calibration by Acharya Niraj Kumar.
 */

export type GocharaVerdict = "Favourable" | "Mixed" | "Unfavourable";

export interface PlanetHouseRule {
  planet: "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";
  planetHindi: string;
  sanskritName: string;
  classicalSource: string;
  favourableHouses: number[];
  mixedHouses: number[];
  unfavourableHouses: number[];
  /** Vedha (obstruction) pairing: key = favourable house, value = obstructing house (Saturn & Sun share no mutual vedha) */
  vedhaMap: Record<number, number>;
  /** Combustion (Asta) orb in degrees from Sun */
  combustionOrbDirectDeg?: number;
  combustionOrbRetroDeg?: number;
}

export const GOCHARA_PLANET_RULES: Record<PlanetHouseRule["planet"], PlanetHouseRule> = {
  Sun: {
    planet: "Sun",
    planetHindi: "सूर्य",
    sanskritName: "Surya",
    classicalSource: "Phaladeepika 26.5 & Brihat Samhita 104.3 (Shubha in 3, 6, 10, 11 from Janma Rashi)",
    favourableHouses: [3, 6, 10, 11],
    mixedHouses: [1, 2],
    unfavourableHouses: [4, 5, 7, 8, 9, 12],
    vedhaMap: { 3: 9, 6: 12, 10: 4, 11: 5 },
  },
  Moon: {
    planet: "Moon",
    planetHindi: "चन्द्र",
    sanskritName: "Chandra",
    classicalSource: "Phaladeepika 26.6 (Chandrabalam Shubha in 1, 3, 6, 7, 10, 11; Chandra Ashtama in 8th)",
    favourableHouses: [1, 3, 6, 7, 10, 11],
    mixedHouses: [2, 5, 9],
    unfavourableHouses: [4, 8, 12],
    vedhaMap: { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
  },
  Mars: {
    planet: "Mars",
    planetHindi: "मंगल",
    sanskritName: "Mangala / Kuja",
    classicalSource: "Phaladeepika 26.7 (Shubha in Upachaya 3, 6, 11 from Janma Rashi)",
    favourableHouses: [3, 6, 11],
    mixedHouses: [10],
    unfavourableHouses: [1, 2, 4, 5, 7, 8, 9, 12],
    vedhaMap: { 3: 12, 6: 9, 11: 5 },
    combustionOrbDirectDeg: 17,
    combustionOrbRetroDeg: 17,
  },
  Mercury: {
    planet: "Mercury",
    planetHindi: "बुध",
    sanskritName: "Budha",
    classicalSource: "Phaladeepika 26.8 (Shubha in 2, 4, 6, 8, 10, 11 from Janma Rashi)",
    favourableHouses: [2, 4, 6, 8, 10, 11],
    mixedHouses: [1, 9],
    unfavourableHouses: [3, 5, 7, 12],
    vedhaMap: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 8, 11: 12 },
    combustionOrbDirectDeg: 14,
    combustionOrbRetroDeg: 12,
  },
  Jupiter: {
    planet: "Jupiter",
    planetHindi: "गुरु (बृहस्पति)",
    sanskritName: "Brihaspati / Guru",
    classicalSource: "Phaladeepika 26.9 (Shubha in 2, 5, 7, 9, 11 from Janma Rashi — Guru-Bala)",
    favourableHouses: [2, 5, 7, 9, 11],
    mixedHouses: [1, 4, 10],
    unfavourableHouses: [3, 6, 8, 12],
    vedhaMap: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
    combustionOrbDirectDeg: 11,
    combustionOrbRetroDeg: 11,
  },
  Venus: {
    planet: "Venus",
    planetHindi: "शुक्र",
    sanskritName: "Shukra",
    classicalSource: "Phaladeepika 26.10 (Shubha in 1, 2, 3, 4, 5, 8, 9, 11, 12 from Janma Rashi)",
    favourableHouses: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    mixedHouses: [7],
    unfavourableHouses: [6, 10],
    vedhaMap: { 1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 6, 12: 3 },
    combustionOrbDirectDeg: 10,
    combustionOrbRetroDeg: 8,
  },
  Saturn: {
    planet: "Saturn",
    planetHindi: "शनि",
    sanskritName: "Shani",
    classicalSource: "Phaladeepika 26.11 (Shubha in 3, 6, 11; Sade Sati in 12, 1, 2; Dhaiya in 4, 8)",
    favourableHouses: [3, 6, 11],
    mixedHouses: [9, 10],
    unfavourableHouses: [1, 2, 4, 5, 7, 8, 12],
    vedhaMap: { 3: 12, 6: 9, 11: 5 },
    combustionOrbDirectDeg: 15,
    combustionOrbRetroDeg: 15,
  },
  Rahu: {
    planet: "Rahu",
    planetHindi: "राहु",
    sanskritName: "Rahu",
    classicalSource: "Phaladeepika 26.12 (Upachaya Gochara: Shubha in 3, 6, 10, 11)",
    favourableHouses: [3, 6, 10, 11],
    mixedHouses: [2, 9],
    unfavourableHouses: [1, 4, 5, 7, 8, 12],
    vedhaMap: {},
  },
  Ketu: {
    planet: "Ketu",
    planetHindi: "केतु",
    sanskritName: "Ketu",
    classicalSource: "Phaladeepika 26.12 (Upachaya & Moksha Gochara: Shubha in 3, 6, 10, 11; spiritual in 9, 12)",
    favourableHouses: [3, 6, 10, 11],
    mixedHouses: [9, 12],
    unfavourableHouses: [1, 2, 4, 5, 7, 8],
    vedhaMap: {},
  },
};

/**
 * Evaluates whether a planet in `houseFromMoon` (1..12) is Favourable, Mixed, or Unfavourable.
 */
export function evaluatePlanetHouseVerdict(
  planet: PlanetHouseRule["planet"],
  houseFromMoon: number
): GocharaVerdict {
  const rule = GOCHARA_PLANET_RULES[planet];
  if (rule.favourableHouses.includes(houseFromMoon)) return "Favourable";
  if (rule.mixedHouses.includes(houseFromMoon)) return "Mixed";
  return "Unfavourable";
}

/**
 * Natural Planetary Friendship Table (Naisargika Maitri — BPHS Ch. 3)
 * Used to score harmony between the Rashi Lord and the Day's Vara (Weekday) / Nakshatra Lord.
 */
export const NAISARGIKA_MAITRI: Record<string, { friends: string[]; neutrals: string[]; enemies: string[] }> = {
  Sun: { friends: ["Moon", "Mars", "Jupiter"], neutrals: ["Mercury"], enemies: ["Venus", "Saturn", "Rahu", "Ketu"] },
  Moon: { friends: ["Sun", "Mercury"], neutrals: ["Mars", "Jupiter", "Venus", "Saturn"], enemies: ["Rahu", "Ketu"] },
  Mars: { friends: ["Sun", "Moon", "Jupiter"], neutrals: ["Venus", "Saturn"], enemies: ["Mercury", "Rahu", "Ketu"] },
  Mercury: { friends: ["Sun", "Venus"], neutrals: ["Mars", "Jupiter", "Saturn"], enemies: ["Moon"] },
  Jupiter: { friends: ["Sun", "Moon", "Mars"], neutrals: ["Saturn"], enemies: ["Mercury", "Venus"] },
  Venus: { friends: ["Mercury", "Saturn", "Rahu"], neutrals: ["Mars", "Jupiter"], enemies: ["Sun", "Moon"] },
  Saturn: { friends: ["Mercury", "Venus", "Rahu"], neutrals: ["Jupiter"], enemies: ["Sun", "Moon", "Mars"] },
};

/**
 * Explicit Domain Scoring Weights (Baseline = 68, Bounded to 45..96)
 * Each domain score is a transparent sum of:
 * 1. Primary House(s) from Moon (Chandra Gochar)
 * 2. Domain Karaka Planet Gochar (e.g. Venus/Jupiter for Love; Sun/Saturn/Mercury for Career; Sun/Mars/Moon for Health; Jupiter/Venus/Mercury for Finance)
 * 3. Rashi Lord vs Weekday/Nakshatra Lord Maitri (friendship)
 * 4. Combustion (Asta) / Retrograde (Vakri) / Yoga adjustments
 */
export const DOMAIN_SCORING_SPEC = {
  baseline: 68,
  minScore: 45,
  maxScore: 96,
  domains: {
    love: {
      primaryHouses: [7, 5, 1, 11],
      challengingHouses: [6, 8, 12],
      karakaPlanets: ["Venus", "Jupiter", "Moon"] as PlanetHouseRule["planet"][],
      descriptionEn: "Evaluated from 7th (Kalatra), 5th (Preeti), 1st, and 11th houses + Venus (Shukra) & Jupiter (Guru) Gochar.",
      descriptionHi: "सप्तम (कलत्र), पंचम (प्रीति), प्रथम व एकादश भाव तथा शुक्र एवं गुरु के गोचर बल से निर्धारित।",
    },
    career: {
      primaryHouses: [10, 6, 11, 3],
      challengingHouses: [8, 12, 4],
      karakaPlanets: ["Saturn", "Sun", "Mercury", "Mars"] as PlanetHouseRule["planet"][],
      descriptionEn: "Evaluated from 10th (Karma), 6th (Seva/Competition), 11th (Gains), and 3rd (Initiative) houses + Saturn, Sun, Mercury & Mars Gochar.",
      descriptionHi: "दशम (कर्म), षष्ठ (स्पर्धा), एकादश (लाभ) व तृतीय (पराक्रम) भाव तथा शनि, सूर्य, बुध एवं मंगल के गोचर से निर्धारित।",
    },
    health: {
      primaryHouses: [1, 3, 6, 11],
      challengingHouses: [8, 12, 4],
      karakaPlanets: ["Sun", "Moon", "Mars", "Saturn"] as PlanetHouseRule["planet"][],
      descriptionEn: "Evaluated from 1st (Tanu/Vitality), 6th (Rog), and 8th (Chandra Ashtama) houses + Sun, Moon, Mars & Saturn Gochar.",
      descriptionHi: "प्रथम (तनु/ऊर्जा), षष्ठ (रोग-प्रतिरोध) व अष्टम (चन्द्राष्टम) भाव तथा सूर्य, चन्द्र, मंगल एवं शनि के गोचर से निर्धारित।",
    },
    finance: {
      primaryHouses: [2, 11, 9, 5],
      challengingHouses: [12, 8, 6],
      karakaPlanets: ["Jupiter", "Venus", "Mercury"] as PlanetHouseRule["planet"][],
      descriptionEn: "Evaluated from 2nd (Dhana), 11th (Labha), 9th (Bhagya), and 5th houses + Jupiter (Dhanakaraka), Venus & Mercury Gochar.",
      descriptionHi: "द्वितीय (धन), एकादश (लाभ), नवम (भाग्य) व पंचम भाव तथा धनाधिपति गुरु, शुक्र एवं बुध के गोचर से निर्धारित।",
    },
  },
};

/**
 * Curated Native Bilingual Phrase Bank for the 12 Chandra Gochar Houses (Moon Transit Houses 1..12)
 * Each house has multiple variants in English and authentic Vedic Hindi (not literal machine translation),
 * selected deterministically by a seeded hash of (date + sign + domain).
 */
export interface HouseNarrativeBank {
  house: number;
  houseNameEn: string;
  houseNameHi: string;
  verdict: GocharaVerdict;
  overviewEn: string[];
  overviewHi: string[];
  careerEn: string[];
  careerHi: string[];
  loveEn: string[];
  loveHi: string[];
  healthEn: string[];
  healthHi: string[];
  financeEn: string[];
  financeHi: string[];
  familyEn: string[];
  familyHi: string[];
}

export const CHANDRA_HOUSE_PHRASE_BANK: Record<number, HouseNarrativeBank> = {
  1: {
    house: 1,
    houseNameEn: "1st House (Janma Rashi / Tanu Bhava)",
    houseNameHi: "प्रथम भाव (जन्म राशि / तनु भाव)",
    verdict: "Favourable",
    overviewEn: [
      "With the Moon transiting your own Rashi (1st house), mental clarity, self-assurance, and personal magnetism remain strong throughout the day.",
      "Chandra Gochar through your 1st house brings emotional renewal, respectable recognition, and a calm yet decisive command over your priorities.",
    ],
    overviewHi: [
      "चन्द्रमा का आपकी ही राशि (प्रथम भाव) में गोचर आज आत्मबल, मानसिक प्रसन्नता और व्यक्तित्व में विशेष आकर्षण प्रदान कर रहा है।",
      "आपकी जन्म राशि में स्थित चन्द्रमा आज सुख-सुविधा, मान-सम्मान और महत्वपूर्ण कार्यों में सकारात्मक ऊर्जा का संचार करेगा।",
    ],
    careerEn: [
      "Take direct ownership of front-facing meetings and pending leadership decisions; your presence naturally inspires trust.",
      "Professional initiatives begun today benefit from clear intuition and timely support from key decision-makers.",
    ],
    careerHi: [
      "कार्यक्षेत्र में आपके स्वतंत्र निर्णय और नेतृत्व क्षमता की सराहना होगी; वरिष्ठ जनों का पूर्ण सहयोग प्राप्त होगा।",
      "व्यापार और नौकरी में नई कार्ययोजनाओं को आगे बढ़ाने के लिए आज का चन्द्रबल अत्यंत अनुकूल है।",
    ],
    loveEn: [
      "Warmth and emotional honesty draw your partner closer; expressing genuine appreciation strengthens marital harmony.",
      "Personal charm is heightened—an ideal day for heartfelt dialogue or resolving past silence with grace.",
    ],
    loveHi: [
      "दांपत्य और प्रेम संबंधों में आत्मीयता बढ़ेगी; जीवनसाथी आपकी भावनाओं का आदर करेगा।",
      "आपसी संवाद में मधुरता रहेगी और मन की बात सहजता से साझा करने से संबंध प्रगाढ़ होंगे।",
    ],
    healthEn: [
      "Vitality and immunity are well-supported; nourish your body with satvik meals and morning pranayama.",
      "Physical stamina remains steady, though keeping a cool head during midday hours preserves your inner equilibrium.",
    ],
    healthHi: [
      "शारीरिक ऊर्जा और प्रसन्नता बनी रहेगी; सात्विक आहार और प्रातःकालीन प्राणायाम से स्वास्थ्य उत्तम रहेगा।",
      "मन और शरीर में उत्तम संतुलन रहेगा; जल का पर्याप्त सेवन दिनभर स्फूर्ति बनाए रखेगा।",
    ],
    financeEn: [
      "Favourable planetary flow for wealth preservation, prudent purchases, and receiving dues owed to you.",
      "Financial inflows remain steady; spending on self-development or family dignity brings lasting value.",
    ],
    financeHi: [
      "आर्थिक मामलों में स्थिरता और धन-लाभ के शुभ संकेत हैं; रुका हुआ धन प्राप्त होने से संतोष मिलेगा।",
      "बचत और सुविचारित निवेश के लिए दिन अनुकूल है; उत्तम वस्त्र या उपयोगी वस्तुओं की प्राप्ति संभव है।",
    ],
    familyEn: [
      "Elders' blessings and cheerful domestic meals create an uplifting environment at home.",
      "Family members look to you for guidance today; shared traditions bring peace to the household.",
    ],
    familyHi: [
      "परिवार में सुख-शांति और स्नेह का वातावरण रहेगा; बड़े-बुजुर्गों का आशीर्वाद मनोबल बढ़ाएगा।",
      "घर-परिवार के सदस्यों के साथ उत्तम भोजन और सार्थक चर्चा से मन प्रसन्न रहेगा।",
    ],
  },
  2: {
    house: 2,
    houseNameEn: "2nd House (Dhana & Kutumba Bhava)",
    houseNameHi: "द्वितीय भाव (धन एवं कुटुम्ब भाव)",
    verdict: "Mixed",
    overviewEn: [
      "As the Moon transits your 2nd house of speech, family, and accumulated resources, measured words and financial discipline are your greatest assets.",
      "Chandra Gochar in the 2nd house turns your attention toward family treasury, vocal diplomacy, and safeguarding long-term assets.",
    ],
    overviewHi: [
      "द्वितीय (धन एवं वाणी) भाव में चन्द्रमा के गोचर से आज आर्थिक नियोजन और मधुर वाणी पर विशेष ध्यान देना हितकर रहेगा।",
      "कुटुम्ब और संचित धन के भाव में चन्द्र संचरण आज संयमित व्यवहार से कार्यों को सिद्ध करने का संकेत दे रहा है।",
    ],
    careerEn: [
      "Review contract clauses and financial commitments carefully; diplomatic speech turns a delicate negotiation in your favour.",
      "Focus on consolidating existing projects rather than rushing into unverified external promises.",
    ],
    careerHi: [
      "कार्यस्थल पर अपनी वाणी में संयम और सौम्यता रखें; दस्तावेजों व अनुबंधों की सूक्ष्मता से जांच करें।",
      "चल रहे कार्यों को व्यवस्थित रूप से पूर्ण करने पर ध्यान दें; धैर्यपूर्वक किए गए प्रयास सफल होंगे।",
    ],
    loveEn: [
      "Avoid sharp words during minor domestic disagreements; gentle reassurance keeps affection steady.",
      "Sharing family responsibilities patiently deepens mutual respect with your spouse.",
    ],
    loveHi: [
      "संबंधों में क्रोध या कटु वचन से बचें; धैर्य और स्नेहपूर्ण संवाद से पारिवारिक सामंजस्य बना रहेगा।",
      "जीवनसाथी के साथ आर्थिक व पारिवारिक विषयों पर शांत मन से विचार-विमर्श करना शुभ रहेगा।",
    ],
    healthEn: [
      "Pay attention to throat, dental, and eye comfort; avoid excessively cold or pungent foods.",
      "Rest your eyes from prolonged screens and favour warm herbal infusions in the evening.",
    ],
    healthHi: [
      "नेत्र, दांत और गले के स्वास्थ्य का ध्यान रखें; अत्यधिक ठंडे या तामसिक भोजन से परहेज करें।",
      "संतुलित दिनचर्या और समय पर विश्राम करने से थकान दूर रहेगी।",
    ],
    financeEn: [
      "Hold back on impulsive luxury spending; double-check outflows and focus on liquid savings.",
      "Wait for clearer terms before lending money or locking capital into short-term schemes.",
    ],
    financeHi: [
      "अनावश्यक खर्चों पर नियंत्रण रखें और आज किसी को उधार देने या जोखिम भरे निवेश से बचें।",
      "बजट बनाकर चलने से संचित धन सुरक्षित रहेगा और आर्थिक संतुलन बना रहेगा।",
    ],
    familyEn: [
      "Listen patiently to extended family members (Kutumba); calm mediation prevents trivial friction.",
      "Domestic harmony thrives when everyone's viewpoint is heard without haste.",
    ],
    familyHi: [
      "कुटुम्ब के मामलों में बड़ों की सलाह को प्राथमिकता दें; शांत संवाद से पारिवारिक एकता सुदृढ़ होगी।",
      "परिवार में छोटी बातों को तूल न दें; सामूहिक सहयोग से घरेलू कार्य सहज संपन्न होंगे।",
    ],
  },
  3: {
    house: 3,
    houseNameEn: "3rd House (Parakrama & Sahaja Bhava)",
    houseNameHi: "तृतीय भाव (पराक्रम एवं सहज भाव)",
    verdict: "Favourable",
    overviewEn: [
      "Moon in your 3rd house of Parakrama (courage and enterprise) bestows decisive energy, productive short travels, and victorious initiative.",
      "Classical Gochara texts praise the 3rd-house Moon for boosting self-effort, communication breakthroughs, and support from siblings and allies.",
    ],
    overviewHi: [
      "तृतीय (पराक्रम) भाव में चन्द्रमा का गोचर आपके साहस, कार्यक्षमता और आत्मविश्वास में उल्लेखनीय वृद्धि कर रहा है।",
      "शास्त्रानुसार तीसरे भाव का चन्द्रमा पुरुषार्थ सिद्धि, भाई-बहनों से सहयोग और शुभ समाचार प्राप्ति का कारक है।",
    ],
    careerEn: [
      "Excellent day for pitches, presentations, commercial outreach, and clearing technical bottlenecks through bold action.",
      "Colleagues and junior teammates rally behind your initiative; short business trips or calls yield tangible results.",
    ],
    careerHi: [
      "व्यापारिक विस्तार, नए संपर्क स्थापित करने और साहसिक निर्णय लेने के लिए आज का दिन अत्यंत श्रेष्ठ है।",
      "सहकर्मियों और अधीनस्थों का पूरा साथ मिलेगा; छोटी व्यावसायिक यात्राएं या संवाद लाभकारी सिद्ध होंगे।",
    ],
    loveEn: [
      "Playful, uplifting communication revitalizes your relationship; an outing or shared hobby brings joy.",
      "Expressing your feelings candidly clears hesitation and builds exciting momentum.",
    ],
    loveHi: [
      "प्रेम और वैवाहिक जीवन में उत्साह व प्रसन्नता रहेगी; संवाद से आपसी विश्वास और अधिक गहरा होगा।",
      "प्रियजन के साथ सुखद समय व्यतीत होगा और संबंधों में नई ताजगी का अनुभव करेंगे।",
    ],
    healthEn: [
      "Stamina and respiratory vigour are strong; brisk outdoor exercise channels your abundant energy well.",
      "High physical resilience helps you recover quickly from recent fatigue.",
    ],
    healthHi: [
      "शारीरिक स्फूर्ति और रोग-प्रतिरोधक क्षमता उत्तम रहेगी; प्रातःकालीन भ्रमण व व्यायाम विशेष लाभ देगा।",
      "मन में उत्साह रहने से पुरानी थकान दूर होगी और स्वास्थ्य सबल रहेगा।",
    ],
    financeEn: [
      "Gains through self-effort, commissions, digital commerce, or newly negotiated contracts are strongly indicated.",
      "Your proactive outreach opens fresh revenue channels and strengthens cash flow.",
    ],
    financeHi: [
      "स्वयं के परिश्रम और पराक्रम से धनार्जन के प्रबल योग हैं; व्यापार में अपेक्षित मुनाफा प्राप्त होगा।",
      "आर्थिक प्रयासों में सफलता मिलेगी और आय के स्रोतों में मजबूती आएगी।",
    ],
    familyEn: [
      "Warm camaraderie with brothers, sisters, and neighbours brings timely help and good news.",
      "A celebratory atmosphere with younger relatives brightens the household.",
    ],
    familyHi: [
      "भाई-बहनों और मित्रों के साथ संबंध मधुर होंगे तथा उनसे समय पर सहयोग प्राप्त होगा।",
      "परिवार में किसी शुभ समाचार के आगमन से हर्ष और उल्लास का वातावरण बनेगा।",
    ],
  },
  4: {
    house: 4,
    houseNameEn: "4th House (Sukha & Matri Bhava)",
    houseNameHi: "चतुर्थ भाव (सुख एवं मातृ भाव)",
    verdict: "Unfavourable",
    overviewEn: [
      "With the Moon transiting your 4th house, emotional sensitivity around home and inner peace calls for patience, grounding, and unhurried choices.",
      "Chandra Gochar in the 4th house advises prioritising mental calm and domestic equilibrium over aggressive external conflict.",
    ],
    overviewHi: [
      "चतुर्थ भाव में चन्द्रमा के गोचर से मन कुछ भावुक रह सकता है; आज धैर्य और मानसिक शांति बनाए रखना सर्वोपरि है।",
      "सुख भाव में चन्द्र संचरण आज घरेलू कार्यों में संयम रखने तथा जल्दबाजी के निर्णयों से बचने की प्रेरणा देता है।",
    ],
    careerEn: [
      "Stick to structured routines and avoid office politics; steady, quiet execution protects your professional standing.",
      "Defer major property or infrastructure commitments until terms are verified twice.",
    ],
    careerHi: [
      "कार्यक्षेत्र में अनावश्यक विवादों से दूर रहकर अपने मूल दायित्वों पर ध्यान केंद्रित करें।",
      "भूमि, भवन या बड़े व्यावसायिक परिवर्तन से जुड़े निर्णयों में आज जल्दबाजी न करें।",
    ],
    loveEn: [
      "Seek emotional reassurance through calm listening rather than silent expectations; nurture peace at home.",
      "Gentle empathy dissolves moodiness and keeps your relationship anchored.",
    ],
    loveHi: [
      "जीवनसाथी की भावनाओं को समझें और छोटी-छोटी बातों पर संदेह या खिन्नता से बचें।",
      "शांत और स्नेहपूर्ण व्यवहार से गृहस्थ जीवन में मधुरता बनी रहेगी।",
    ],
    healthEn: [
      "Guard chest comfort and sleep quality; evening pranayama and warm herbal milk calm emotional restlessness.",
      "Avoid late-night mental overexertion so your heart and mind stay refreshed.",
    ],
    healthHi: [
      "छाती में जकड़न या मानसिक बेचैनी से बचने के लिए अनुलोम-विलोम प्राणायाम और पर्याप्त विश्राम करें।",
      "रात्रि में सुपाच्य भोजन लें और मन को शांत रखने वाले सात्विक साहित्य या मंत्र का आश्रय लें।",
    ],
    financeEn: [
      "Keep a buffer for unplanned household or vehicle maintenance expenses; avoid speculative trades today.",
      "Conservative asset management prevents leakage of working capital.",
    ],
    financeHi: [
      "घर या वाहन के रखरखाव पर आकस्मिक व्यय संभव है; आज जोखिम भरे निवेश से दूरी बनाए रखें।",
      "आर्थिक लेन-देन में लिखित स्पष्टता रखें और बजट के अनुरूप ही खर्च करें।",
    ],
    familyEn: [
      "Pay special attention to your mother's health and comfort; spending quiet time with elders restores harmony.",
      "Creating a clutter-free, sacred space at home immediately lifts the family's spirits.",
    ],
    familyHi: [
      "माताजी के स्वास्थ्य और सुख-सुविधा का विशेष ध्यान रखें; उनकी सेवा व आशीर्वाद से मानसिक बल मिलेगा।",
      "घर के पूजा स्थल में संध्या दीप प्रज्वलित करने से पारिवारिक वातावरण शांत और सकारात्मक रहेगा।",
    ],
  },
  5: {
    house: 5,
    houseNameEn: "5th House (Vidya, Purva Punya & Putra Bhava)",
    houseNameHi: "पंचम भाव (विद्या, बुद्धि एवं संतान भाव)",
    verdict: "Mixed",
    overviewEn: [
      "Moon transiting your 5th house awakens creative intelligence, spiritual contemplation, and focus on children and higher learning.",
      "Chandra Gochar in the 5th house sharpens discernment (Viveka)—channel your active imagination into structured study and planning.",
    ],
    overviewHi: [
      "पंचम (बुद्धि एवं संतान) भाव में चन्द्रमा का गोचर आपकी कल्पनाशक्ति, अध्ययन और आध्यात्मिक रुचि को जागृत कर रहा है।",
      "त्रिकोण भाव में चन्द्र संचरण आज विवेकपूर्ण चिंतन और रचनात्मक कार्यों में एकाग्रता बनाए रखने का संकेत देता है।",
    ],
    careerEn: [
      "Research, strategy, teaching, and advisory work progress well when backed by thorough factual preparation.",
      "Avoid overthinking hypothetical scenarios; channel your intellect into concrete deliverables.",
    ],
    careerHi: [
      "शिक्षा, लेखन, परामर्श और योजनाबद्ध कार्यों में आपकी बौद्धिक क्षमता का उत्तम उपयोग होगा।",
      "भविष्य की योजनाओं पर गंभीरता से कार्य करें, किंतु अति-कल्पना के स्थान पर व्यावहारिक कदम उठाएं।",
    ],
    loveEn: [
      "Tender affection and heartfelt conversations flourish when you let go of over-analysis.",
      "A thoughtful note or shared artistic interest brings romantic warmth.",
    ],
    loveHi: [
      "प्रेम संबंधों में भावुकता अधिक रहेगी; परस्पर विश्वास और सरलता से रिश्तों में प्रगाढ़ता आएगी।",
      "प्रियजन के साथ रचनात्मक या आध्यात्मिक विषयों पर चर्चा मन को आनंदित करेगी।",
    ],
    healthEn: [
      "Support digestive fire (Jatharagni) with timely, warm meals and avoid skipping breakfast.",
      "Mindful breathing keeps stomach acidity and mental nervousness away.",
    ],
    healthHi: [
      "पाचन तंत्र और उदर स्वास्थ्य का ध्यान रखें; समय पर सुपाच्य एवं ताजा भोजन ग्रहण करें।",
      "मानसिक उद्वेग से बचने के लिए ध्यान (मेडिटेशन) और इष्ट मंत्र का जप अत्यंत लाभकारी रहेगा।",
    ],
    financeEn: [
      "Favour steady long-term knowledge investments over impulsive intraday speculation.",
      "Careful financial modelling reveals a smart path to grow your savings.",
    ],
    financeHi: [
      "शेयर बाजार या आकस्मिक सट्टेबाजी में जल्दबाजी न करें; दीर्घकालिक और सुरक्षित निवेश को ही चुनें।",
      "बुद्धिमत्तापूर्ण आर्थिक नियोजन से भविष्य की निधि सुदृढ़ होगी।",
    ],
    familyEn: [
      "Children's education or milestones bring pride; guide younger family members with gentle encouragement.",
      "Devotional chanting or reading scriptures together brings serenity to the home.",
    ],
    familyHi: [
      "संतान की शिक्षा या प्रगति से संबंधित विषयों में सकारात्मक मार्गदर्शन देने का अवसर मिलेगा।",
      "परिवार में इष्टदेव की आराधना और सत्संग से सुख-शांति का संचार होगा।",
    ],
  },
  6: {
    house: 6,
    houseNameEn: "6th House (Ripu-Jay & Rog-Shanti Upachaya Bhava)",
    houseNameHi: "षष्ठ भाव (रोग-शत्रु जय एवं उपचय भाव)",
    verdict: "Favourable",
    overviewEn: [
      "Classical Gochara shastras hail the 6th-house Moon as highly victorious: obstacles dissolve, competitors yield, and complex tasks reach completion.",
      "With the Moon in your 6th Upachaya house, disciplined effort triumphs over pending challenges and strengthens your practical position.",
    ],
    overviewHi: [
      "षष्ठ (उपचय) भाव में चन्द्रमा का गोचर शास्त्रों में अत्यंत विजयदायी माना गया है—आज बाधाएं दूर होंगी और विरोधियों पर प्रभाव बढ़ेगा।",
      "छठे भाव का शुभ चन्द्रबल आज कठिन कार्यों को पूर्ण करने, ऋण मुक्ति के प्रयासों और कार्य-सिद्धि में विशेष सफलता दिलाएगा।",
    ],
    careerEn: [
      "Ideal day for competitive exams, legal/compliance audits, resolving operational backlogs, and excelling in service roles.",
      "Your methodical problem-solving outshines rivals and wins institutional backing.",
    ],
    careerHi: [
      "प्रतियोगी परीक्षाओं, न्यायिक मामलों और कार्यक्षेत्र की जटिल समस्याओं को सुलझाने में आज निश्चित सफलता मिलेगी।",
      "आपकी कर्मठता और अनुशासन के आगे प्रतिद्वंद्वी शांत रहेंगे तथा उच्चाधिकारी आपके कार्य से संतुष्ट होंगे।",
    ],
    loveEn: [
      "Practical acts of service and reliability speak louder than grand promises in your relationship today.",
      "Past misunderstandings clear up as both partners focus on mutual support.",
    ],
    loveHi: [
      "संबंधों में पुराने मतभेद समाप्त होंगे और एक-दूसरे के प्रति सहयोग व समर्पण का भाव बढ़ेगा।",
      "जीवनसाथी के दैनिक कार्यों में सहभागी बनना आपसी स्नेह को और मजबूत करेगा।",
    ],
    healthEn: [
      "Recovery from past ailments accelerates; disciplined diet and fitness routines yield visible vitality.",
      "Strong constitutional resilience keeps your energy steady from morning to night.",
    ],
    healthHi: [
      "स्वास्थ्य में सुधार और पुराने कष्टों से राहत मिलने के प्रबल योग हैं; रोग-प्रतिरोधक क्षमता मजबूत रहेगी।",
      "नियमित योग और अनुशासित दिनचर्या से शरीर में नई स्फूर्ति का अनुभव होगा।",
    ],
    financeEn: [
      "Excellent transit for recovering stuck payments, reducing debt obligations, and earning steady professional income.",
      "Prudent financial discipline strengthens your balance sheet today.",
    ],
    financeHi: [
      "पुराने ऋणों के निपटारे और अटके हुए धन की वसूली के लिए आज का दिन विशेष रूप से अनुकूल है।",
      "सेवा, व्यवसाय और परिश्रम से आर्थिक लाभ प्राप्त होगा तथा कोष में वृद्धि होगी।",
    ],
    familyEn: [
      "Maternal relatives (Matul Paksha) offer helpful cooperation; household order is restored.",
      "Peace returns to the domestic sphere as lingering worries are resolved.",
    ],
    familyHi: [
      "ननिहाल पक्ष से शुभ समाचार या सहयोग प्राप्त होगा तथा पारिवारिक चिंताओं का समाधान निकलेगा।",
      "घर के लंबित कार्यों को पूर्ण करने में सभी सदस्यों का सार्थक योगदान मिलेगा।",
    ],
  },
  7: {
    house: 7,
    houseNameEn: "7th House (Kalatra, Vyapara & Partnership Bhava)",
    houseNameHi: "सप्तम भाव (दांपत्य, साझेदारी एवं व्यापार भाव)",
    verdict: "Favourable",
    overviewEn: [
      "Moon transiting your 7th house casting a direct fullness aspect (Saptama Drishti) onto your Janma Rashi brings partnership harmony, social respect, and commercial gains.",
      "Chandra Gochar in the 7th house favours collaborative alliances, dignified public interactions, and mutual understanding.",
    ],
    overviewHi: [
      "सप्तम भाव में स्थित चन्द्रमा की आपकी जन्म राशि पर पूर्ण सीधी दृष्टि आज दांपत्य सुख, व्यापारिक लाभ और सामाजिक प्रतिष्ठा प्रदान कर रही है।",
      "साझेदारी और जनसंपर्क के भाव में चन्द्रमा का शुभ गोचर आज आपसी समन्वय से बड़ी उपलब्धि दिलाने में सहायक है।",
    ],
    careerEn: [
      "Sign joint ventures, onboard clients, and lead diplomatic negotiations—your collaborative fairness wins lasting allies.",
      "Public-facing commerce, consulting, and retail trades experience brisk momentum.",
    ],
    careerHi: [
      "व्यापारिक साझेदारी, ग्राहक संवाद और नए अनुबंधों के लिए आज का दिन अत्यंत शुभ एवं फलदायी है।",
      "दैनिक व्यापार और जनसंपर्क से जुड़े कार्यों में प्रतिष्ठा तथा आय दोनों में वृद्धि होगी।",
    ],
    loveEn: [
      "One of the finest monthly transits for marital bliss, romantic harmony, and meaningful marriage discussions.",
      "Affection, mutual admiration, and shared companionship make the evening memorable.",
    ],
    loveHi: [
      "दांपत्य जीवन में प्रेम, माधुर्य और आपसी विश्वास चरम पर रहेगा; अविवाहितों के लिए विवाह प्रस्ताव अनुकूल रहेंगे।",
      "जीवनसाथी के साथ भावनात्मक निकटता बढ़ेगी और सुखद समय व्यतीत होगा।",
    ],
    healthEn: [
      "Balanced vitality and emotional cheerfulness uplift your physical well-being; stay well-hydrated.",
      "Refreshing walks and wholesome cuisine keep your energy radiant.",
    ],
    healthHi: [
      "प्रसन्नचित्त मन के कारण शारीरिक स्वास्थ्य भी उत्तम और ऊर्जावान बना रहेगा।",
      "सात्विक एवं पौष्टिक आहार से शरीर में कांति और स्फूर्ति बनी रहेगी।",
    ],
    financeEn: [
      "Profitable inflows from trade, partnerships, and client retainers strengthen your financial position.",
      "Auspicious day for mutually beneficial commercial settlements.",
    ],
    financeHi: [
      "व्यापार और साझेदारी के कार्यों से उत्तम धन लाभ होगा; दैनिक आमदनी में वृद्धि के योग हैं।",
      "आर्थिक लेन-देन और व्यापारिक निवेश से संतोषजनक प्रतिफल प्राप्त होगा।",
    ],
    familyEn: [
      "Spouse and family elders share harmonious counsel; auspicious social invitations brighten the home.",
      "Hospitality and shared celebration bring warmth to the family circle.",
    ],
    familyHi: [
      "परिवार और जीवनसाथी के मध्य सुंदर समन्वय रहेगा; घर में किसी मांगलिक या सामाजिक चर्चा से हर्ष होगा।",
      "अतिथि सत्कार या स्वजनों से भेंट से पारिवारिक वातावरण आनंदमय रहेगा।",
    ],
  },
  8: {
    house: 8,
    houseNameEn: "8th House (Chandra Ashtama / Ayur & Gupta Bhava)",
    houseNameHi: "अष्टम भाव (चन्द्राष्टम / आयु एवं गुप्त भाव)",
    verdict: "Unfavourable",
    overviewEn: [
      "The Moon transits your 8th house today (Chandra Ashtama)—classical Jyotish advises pausing major new launches in favour of quiet planning, research, and spiritual mindfulness.",
      "During Chandra Ashtama (8th-house Moon), patience, inner poise, and careful verification protect you from unnecessary haste.",
    ],
    overviewHi: [
      "आज चन्द्रमा आपकी राशि से अष्टम भाव (चन्द्राष्टम) में संचरण कर रहे हैं—अतः नए या जोखिम भरे कार्यों का प्रारंभ करने के स्थान पर धैर्य व संयम रखें।",
      "चन्द्राष्टम के समय शांत चित्त रहकर नियमित कार्य करना, गहन अध्ययन और भगवद् स्मरण करना समस्त विघ्नों से रक्षा करता है।",
    ],
    careerEn: [
      "Focus on deep research, auditing, and completing routine obligations; postpone high-stakes announcements by a day.",
      "Double-check technical details and avoid reacting to sudden provocations at work.",
    ],
    careerHi: [
      "कार्यक्षेत्र में आज नए प्रयोगों या बड़े परिवर्तनों को टालें तथा चल रहे कार्यों को सावधानीपूर्वक पूर्ण करें।",
      "शोध, ऑडिट व गहन विश्लेषण के कार्यों में सफलता मिलेगी; वरिष्ठों से वाद-विवाद से बचें।",
    ],
    loveEn: [
      "Practice extra patience and transparent communication with your partner so minor delays are not misconstrued.",
      "Quiet support and forgiving words preserve relationship serenity today.",
    ],
    loveHi: [
      "संबंधों में वाणी और भावनाओं पर संयम रखें; जीवनसाथी के साथ किसी भी प्रकार की गलतफहमी को तुरंत शांत संवाद से सुलझाएं।",
      "अनावश्यक तर्क-वितर्क से बचकर परस्पर सहयोग का भाव बनाए रखें।",
    ],
    healthEn: [
      "Prioritise rest, hydration, and cautious driving; avoid heavy or late-night meals during Chandra Ashtama.",
      "10 minutes of Mahamrityunjaya or Shiva chanting restores calm to the nervous system.",
    ],
    healthHi: [
      "स्वास्थ्य और खान-पान के प्रति विशेष सजग रहें; वाहन सावधानी से चलाएं और पर्याप्त विश्राम लें।",
      "चन्द्राष्टम के प्रभाव को शांत करने हेतु शिव उपासना और प्राणायाम को दिनचर्या में शामिल करें।",
    ],
    financeEn: [
      "Strictly avoid speculative lending, unverified investments, or impulsive contracts today.",
      "Safeguard existing liquidity and verify banking or tax paperwork thoroughly.",
    ],
    financeHi: [
      "आज किसी भी प्रकार के बड़े आर्थिक जोखिम, उधार या सट्टेबाजी से पूर्णतः दूर रहें।",
      "आर्थिक दस्तावेजों और लेन-देन की भली-भांति जांच कर ही कदम बढ़ाएं।",
    ],
    familyEn: [
      "Maintain calm composure in inheritance or in-law discussions; gentle humility averts discord.",
      "Evening prayers at home create a protective, peaceful shield for the household.",
    ],
    familyHi: [
      "ससुराल पक्ष या पैतृक विषयों में शांत और संतुलित दृष्टिकोण अपनाएं।",
      "संध्या समय भगवान शिव या इष्टदेव के समक्ष दीप प्रज्वलन से घर में सुख-शांति बनी रहेगी।",
    ],
  },
  9: {
    house: 9,
    houseNameEn: "9th House (Dharma, Bhagya & Guru Bhava)",
    houseNameHi: "नवम भाव (धर्म, भाग्य एवं गुरु भाव)",
    verdict: "Mixed",
    overviewEn: [
      "Moon transiting your 9th house of Dharma and Bhagya elevates your ethical vision, spiritual inclination, and connection with mentors.",
      "Chandra Gochar in the 9th trine inspires higher learning, long-horizon planning, and meritorious deeds.",
    ],
    overviewHi: [
      "नवम (भाग्य एवं धर्म) भाव में चन्द्रमा का गोचर आपके आध्यात्मिक चिंतन, सत्कर्म और दूरगामी योजनाओं को बल दे रहा है।",
      "धर्म त्रिकोण में चन्द्र संचरण आज गुरुजनों के मार्गदर्शन और सात्विक प्रयासों से भाग्योदय का मार्ग प्रशस्त करेगा।",
    ],
    careerEn: [
      "Long-term strategy, institutional relations, higher education, and ethical leadership receive wise guidance.",
      "Mentors and senior advisors offer valuable perspective on your next career milestone.",
    ],
    careerHi: [
      "उच्च शिक्षा, परामर्श, प्रशासनिक कार्य और दीर्घकालिक व्यावसायिक योजनाओं में सकारात्मक प्रगति होगी।",
      "वरिष्ठ अधिकारियों और अनुभवी मार्गदर्शकों की सलाह से कार्यक्षेत्र की दिशा स्पष्ट होगी।",
    ],
    loveEn: [
      "Shared philosophical values and mutual respect bring noble warmth to your bond.",
      "Visiting a temple or serene nature spot together deepens soulful understanding.",
    ],
    loveHi: [
      "रिश्तों में मर्यादा, आदर और आध्यात्मिक सामंजस्य का सुंदर समावेश रहेगा।",
      "जीवनसाथी के साथ किसी धार्मिक या शांत स्थल के दर्शन से मन प्रसन्न होगा।",
    ],
    healthEn: [
      "Mental peace and optimism uplift physical recovery; gentle stretching keeps hips and thighs limber.",
      "Fresh morning air and Surya Arghya invigorate your constitution.",
    ],
    healthHi: [
      "मानसिक प्रसन्नता और सकारात्मक सोच से स्वास्थ्य में ताजगी बनी रहेगी।",
      "प्रातःकाल सूर्य अर्घ्य और हल्के योगाभ्यास से शरीर ऊर्जावान रहेगा।",
    ],
    financeEn: [
      "Steady progress in long-term wealth planning, educational funds, and ethical investments.",
      "Dharmic charity (Dana) performed today multiplies auspicious goodwill.",
    ],
    financeHi: [
      "भाग्य के सहयोग से दीर्घकालिक आर्थिक योजनाओं में स्थिरता आएगी; धर्मार्थ कार्यों में व्यय संतोष देगा।",
      "नियमबद्ध निवेश और सात्विक धनार्जन के प्रयास सफल रहेंगे।",
    ],
    familyEn: [
      "Father's or family elders' counsel proves especially insightful; ancestral traditions bring unity.",
      "Blessings from teachers and elders grace your household.",
    ],
    familyHi: [
      "पिता एवं गुरुजनों का आशीर्वाद प्राप्त होगा तथा उनके अनुभव से पारिवारिक मामलों में सही दिशा मिलेगी।",
      "परिवार में धार्मिक अनुष्ठान या शुभ विचारों के आदान-प्रदान से सात्विक वातावरण रहेगा।",
    ],
  },
  10: {
    house: 10,
    houseNameEn: "10th House (Karma, Rajya & Kirti Bhava)",
    houseNameHi: "दशम भाव (कर्म, राज्य एवं कीर्ति भाव)",
    verdict: "Favourable",
    overviewEn: [
      "Moon transiting your 10th house of Karma and authority brings professional accomplishment, public prestige, and successful execution of major goals.",
      "Classical Gochara texts celebrate the 10th-house Moon for fulfilling ambitious undertakings (Karya Siddhi) and earning institutional honour.",
    ],
    overviewHi: [
      "दशम (कर्म एवं राज्य) भाव में चन्द्रमा का गोचर कार्य-सिद्धि, पद-प्रतिष्ठा और व्यावसायिक उत्कर्ष का प्रबल योग बना रहा है।",
      "शास्त्रानुसार दसवें भाव का चन्द्रमा आपके समस्त महत्वपूर्ण संकल्पों को पूर्ण करने और मान-सम्मान बढ़ाने वाला है।",
    ],
    careerEn: [
      "Prime transit for executive decisions, leadership presentations, government/administrative dealings, and career advancement.",
      "Your diligence is visibly rewarded; pending approvals and high-priority deliverables move to completion.",
    ],
    careerHi: [
      "नौकरी और व्यवसाय में उच्चाधिकारियों का पूर्ण विश्वास प्राप्त होगा; पदोन्नति या नई जिम्मेदारी के प्रबल योग हैं।",
      "राजकीय कार्यों, प्रबंधन और महत्वपूर्ण परियोजनाओं में आपकी कार्यकुशलता से बड़ी सफलता मिलेगी।",
    ],
    loveEn: [
      "Your partner takes pride in your dedication; balance busy professional hours with a warm evening check-in.",
      "Mutual respect and shared life ambitions strengthen your partnership.",
    ],
    loveHi: [
      "आपकी व्यावसायिक उपलब्धियों से जीवनसाथी और परिवार को गर्व की अनुभूति होगी।",
      "कार्य की व्यस्तता के बीच प्रियजन के लिए निकाला गया समय संबंधों में मधुरता घोलेगा।",
    ],
    healthEn: [
      "High purposeful energy sustains you all day; remember to stretch your knees and back between long desk sessions.",
      "Active engagement keeps both mind and body sharp.",
    ],
    healthHi: [
      "कार्य-उत्साह के कारण ऊर्जा का स्तर उच्च रहेगा; घुटनों और पीठ के विश्राम का थोड़ा ध्यान रखें।",
      "सकारात्मक व्यस्तता से मन प्रसन्न और शरीर चुस्त-दुरुस्त रहेगा।",
    ],
    financeEn: [
      "Career growth directly enhances revenue; business collections and professional fees flow in smoothly.",
      "Sound day for expanding commercial assets and strengthening enterprise cash flow.",
    ],
    financeHi: [
      "व्यावसायिक प्रगति और कर्मबल से उत्तम अर्थलाभ होगा; व्यापारिक कोष में वृद्धि होगी।",
      "कार्यक्षेत्र से जुड़े आर्थिक समझौते और निवेश लाभकारी सिद्ध होंगे।",
    ],
    familyEn: [
      "Family reputation rises; parents and elders rejoice in your responsible conduct.",
      "Harmonious cooperation at home supports your outer responsibilities.",
    ],
    familyHi: [
      "परिवार में आपकी प्रतिष्ठा और उत्तरदायित्व की सराहना होगी; माता-पिता का स्नेह प्राप्त होगा।",
      "घरेलू सहयोग मिलने से आप अपने कार्यक्षेत्र में निश्चिंत होकर श्रेष्ठ प्रदर्शन कर सकेंगे।",
    ],
  },
  11: {
    house: 11,
    houseNameEn: "11th House (Labha, Aaya & Siddhi Bhava)",
    houseNameHi: "एकादश भाव (लाभ, आय एवं सिद्धि भाव)",
    verdict: "Favourable",
    overviewEn: [
      "Moon in your 11th house of Labha (gains and fulfilment) is one of the most auspicious Gochara placements—bringing financial inflows, wish fulfilment, and joyous social alliances.",
      "Chandra Gochar through the 11th house rewards past efforts with tangible prosperity, supportive networks, and elevated cheer.",
    ],
    overviewHi: [
      "एकादश (लाभ एवं सिद्धि) भाव में चन्द्रमा का गोचर सर्वश्रेष्ठ शुभ फलों—धन लाभ, मनोकामना पूर्ति और मित्रों के सहयोग—का सृजन कर रहा है।",
      "लाभ भाव का चन्द्रबल आज आपके पूर्व प्रयासों को फलीभूत कर आर्थिक उन्नति और सामाजिक प्रसन्नता प्रदान करेगा।",
    ],
    careerEn: [
      "Targets are met ahead of schedule; networking, team incentives, and revenue milestones flourish.",
      "Influential allies and professional circles open doors to lucrative opportunities.",
    ],
    careerHi: [
      "व्यापार और करियर में पूर्व में किए गए परिश्रम का श्रेष्ठ प्रतिफल प्राप्त होगा; नए व्यावसायिक नेटवर्क से लाभ मिलेगा।",
      "उच्च स्तर के संपर्कों और सहयोगियों की मदद से बड़ी योजनाएं सफल होंगी।",
    ],
    loveEn: [
      "Joyful harmony, social celebrations, and shared dreams make this a delightful day for love and marriage.",
      "Single seekers may meet someone compatible through trusted friends or cultural gatherings.",
    ],
    loveHi: [
      "प्रेम और वैवाहिक जीवन में उल्लास, सामंजस्य और सुखद सहभागिता बनी रहेगी।",
      "मित्रता और पारस्परिक समझ से रिश्ते और अधिक मधुर एवं सुदृढ़ होंगे।",
    ],
    healthEn: [
      "Buoyant mood and robust immunity support quick recuperation and vibrant energy.",
      "Emotional fulfilment naturally refreshes your physical stamina.",
    ],
    healthHi: [
      "मन की प्रसन्नता और उत्साह का सीधा सकारात्मक प्रभाव आपके उत्तम स्वास्थ्य पर दिखाई देगा।",
      "ऊर्जा और स्फूर्ति का स्तर पूरे दिन श्रेष्ठ बना रहेगा।",
    ],
    financeEn: [
      "Peak monthly transit for liquid income, investment returns, bonuses, and commercial profits.",
      "Multiple income streams show positive movement; an auspicious day to consolidate gains.",
    ],
    financeHi: [
      "धन आगमन, निवेश से मुनाफे और व्यापारिक लाभ के लिए यह माह के सर्वोत्तम गोचरों में से एक है।",
      "आय के एकाधिक स्रोतों से आर्थिक स्थिति अत्यंत सुदृढ़ होगी।",
    ],
    familyEn: [
      "Elder siblings and close friends bring happy tidings; auspicious gatherings uplift the household.",
      "Generosity and shared prosperity create a festive mood at home.",
    ],
    familyHi: [
      "बड़े भाई-बहनों और घनिष्ठ मित्रों से विशेष सहयोग व स्नेह प्राप्त होगा।",
      "परिवार में सुख-समृद्धि और उत्सव जैसा आनंदमय वातावरण रहेगा।",
    ],
  },
  12: {
    house: 12,
    houseNameEn: "12th House (Vyaya, Moksha & Dhyana Bhava)",
    houseNameHi: "द्वादश भाव (व्यय, मोक्ष एवं ध्यान भाव)",
    verdict: "Unfavourable",
    overviewEn: [
      "With the Moon transiting your 12th house of Vyaya and contemplation, conserve energy, budget expenses mindfully, and favour spiritual reflection over hasty expansion.",
      "Chandra Gochar in the 12th house invites quiet introspection, charitable giving, and completing behind-the-scenes preparation before the Moon enters your Rashi next.",
    ],
    overviewHi: [
      "द्वादश (व्यय एवं ध्यान) भाव में चन्द्रमा के गोचर के कारण आज खर्चों पर नियंत्रण रखने और मानसिक ऊर्जा को संचित करने की आवश्यकता है।",
      "बारहवें भाव का चन्द्र संचरण आज भागदौड़ के स्थान पर शांत चिंतन, दान-पुण्य और आगामी योजनाओं की रूपरेखा बनाने हेतु प्रेरित करता है।",
    ],
    careerEn: [
      "Ideal for remote/international coordination, quiet backstage preparation, and clearing documentation; avoid hasty new launches.",
      "Pace your workload thoughtfully and double-check cross-border or logistical details.",
    ],
    careerHi: [
      "विदेश से जुड़े कार्यों, पृष्ठभूमि की तैयारियों और शोध कार्यों के लिए समय अनुकूल है; नए विवादों से दूर रहें।",
      "कार्यक्षेत्र में धैर्यपूर्वक अपनी जिम्मेदारियां निभाएं; शीघ्र ही चन्द्रमा आपकी राशि में प्रवेश कर नई गति देंगे।",
    ],
    loveEn: [
      "Give your partner calm, unhurried space and avoid reading negativity into brief silences.",
      "Quiet, soulful companionship brings far more comfort than crowded social noise today.",
    ],
    loveHi: [
      "संबंधों में धैर्य और उदारता बनाए रखें; छोटी-छोटी बातों पर अनावश्यक चिंता करने से बचें।",
      "शांत और आत्मीय संवाद से दांपत्य जीवन में विश्वास बना रहेगा।",
    ],
    healthEn: [
      "Prioritise deep, uninterrupted sleep and eye/foot comfort; wind down screens early tonight.",
      "Gentle yoga nidra or evening meditation prevents physical exhaustion.",
    ],
    healthHi: [
      "नेत्रों की थकान और अनिद्रा से बचने के लिए रात्रि में समय पर विश्राम करें तथा स्क्रीन का प्रयोग कम करें।",
      "योग-निद्रा और ध्यान से मानसिक शांति व शारीरिक विश्रांति प्राप्त होगी।",
    ],
    financeEn: [
      "Watch out for unplanned outflows; channel discretionary spending toward worthy charity (Satvik Dana) rather than impulse buys.",
      "Postpone non-essential capital commitments by 24–48 hours until the Moon enters your 1st house.",
    ],
    financeHi: [
      "अनावश्यक और आकस्मिक खर्चों पर अंकुश लगाएं; आज उधार देने या बड़े निवेश से बचना श्रेयस्कर है।",
      "सामर्थ्यानुसार किसी पात्र या धार्मिक कार्य में किया गया थोड़ा दान अशुभ व्यय को शुभ फल में परिवर्तित करेगा।",
    ],
    familyEn: [
      "Maintain a serene, low-key atmosphere at home; avoid re-opening old domestic debates.",
      "Evening lamp lighting and quiet prayer bring peaceful rest to the family.",
    ],
    familyHi: [
      "घर-परिवार में शांति और सादगी बनाए रखें; पुराने विषयों पर बहस करने से बचें।",
      "संध्याकाल में भगवद् भजन और दीप प्रज्वलन से घर में सकारात्मक ऊर्जा बनी रहेगी।",
    ],
  },
};
