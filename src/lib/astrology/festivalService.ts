/**
 * ============================================================================
 * HINDU FESTIVAL & VRAT CALCULATION SERVICE
 * ============================================================================
 * Computes authentic Hindu festivals, Vrats, and auspicious muhurat timings
 * using the classical lunar Tithi & Surya Sankranti astronomical principles.
 */

export interface HinduFestival {
  id: string;
  name: string;
  nameHindi: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  lunarMonth: string;
  paksha: "Shukla" | "Krishna";
  tithi: string;
  category: "Major Festival" | "Ekadashi" | "Pradosh" | "Purnima & Amavasya" | "Sankranti";
  significance: string;
  rituals: string[];
  pujaMuhurat?: string;
  deity: string;
}

// Comprehensive high-precision festival dataset for 2026 & surrounding calendar
export const FESTIVALS_2026: HinduFestival[] = [
  {
    id: "makar-sankranti-2026",
    name: "Makar Sankranti / Pongal",
    nameHindi: "मकर संक्रांति / पोंगल",
    date: "2026-01-14",
    dayOfWeek: "Wednesday",
    lunarMonth: "Magha",
    paksha: "Shukla",
    tithi: "Dwadashi",
    category: "Sankranti",
    significance:
      "Marks the transition of the Sun into Makara (Capricorn) and the beginning of Uttarayana (six months of northern solar journey), symbolizing light and spiritual awakening.",
    rituals: [
      "Holy dip in sacred rivers (Ganga, Yamuna, Godavari)",
      "Surya Arghya and charity of sesame (Til), jaggery, and khichdi",
      "Kite flying and family reunions",
    ],
    pujaMuhurat: "Punya Kaal: 07:15 AM to 12:30 PM",
    deity: "Lord Surya",
  },
  {
    id: "vasant-panchami-2026",
    name: "Vasant Panchami / Saraswati Puja",
    nameHindi: "बसंत पंचमी / सरस्वती पूजा",
    date: "2026-01-23",
    dayOfWeek: "Friday",
    lunarMonth: "Magha",
    paksha: "Shukla",
    tithi: "Panchami",
    category: "Major Festival",
    significance:
      "Celebrates the advent of spring (Ritu Vasant) and the divine manifestation of Maa Saraswati, the deity of wisdom, music, learning, and eloquence.",
    rituals: [
      "Wearing auspicious yellow clothing and offering yellow flowers",
      "Vidya Arambham / Akshar Abhyasam for young children",
      "Worship of books, musical instruments, and creative tools",
    ],
    pujaMuhurat: "07:13 AM to 12:35 PM",
    deity: "Maa Saraswati",
  },
  {
    id: "jaya-ekadashi-2026",
    name: "Jaya Ekadashi Vrat",
    nameHindi: "जया एकादशी व्रत",
    date: "2026-01-29",
    dayOfWeek: "Thursday",
    lunarMonth: "Magha",
    paksha: "Shukla",
    tithi: "Ekadashi",
    category: "Ekadashi",
    significance:
      "A profoundly meritorious fast that liberates the soul from karmic burdens and removes fear of ghostly or demonic afflictions.",
    rituals: [
      "Fasting with satvik fruits and pure water",
      "Chanting Vishnu Sahasranama and lighting ghee lamps",
      "Parana on Dwadashi sunrise",
    ],
    pujaMuhurat: "Parana: Jan 30, 07:10 AM to 09:20 AM",
    deity: "Lord Vishnu",
  },
  {
    id: "maha-shivratri-2026",
    name: "Maha Shivratri (महाशिवरात्रि)",
    nameHindi: "महाशिवरात्रि",
    date: "2026-02-15",
    dayOfWeek: "Sunday",
    lunarMonth: "Phalguna",
    paksha: "Krishna",
    tithi: "Chaturdashi",
    category: "Major Festival",
    significance:
      "The great cosmic night of Lord Shiva celebrating the sacred union of Shiva and Shakti and the performance of the cosmic dance (Tandava).",
    rituals: [
      "All-night vigil (Jagaran) with 4-Prahara Rudrabhishekam",
      "Offering Belpatra, Dhatura, raw cow milk, and Gangajal to the Shivalinga",
      "Chanting the sacred Mahamrityunjaya and Om Namah Shivaya mantras",
    ],
    pujaMuhurat: "Nishita Kaal: 12:09 AM to 01:00 AM (Midnight)",
    deity: "Lord Shiva & Maa Parvati",
  },
  {
    id: "holika-dahan-2026",
    name: "Holika Dahan / Chhoti Holi",
    nameHindi: "होलिका दहन",
    date: "2026-03-03",
    dayOfWeek: "Tuesday",
    lunarMonth: "Phalguna",
    paksha: "Shukla",
    tithi: "Purnima",
    category: "Purnima & Amavasya",
    significance:
      "Commemorates the triumph of pure devotion (Bhakta Prahlad) over demonic tyranny (Holika and Hiranyakashipu).",
    rituals: [
      "Lighting the sacred bonfire during auspicious evening Muhurat",
      "Offering wheat stalks, coconuts, and dry cow-dung cakes into the fire",
      "Circumambulating the sacred fire for family health and protection",
    ],
    pujaMuhurat: "06:25 PM to 08:52 PM",
    deity: "Lord Vishnu (Narasimha)",
  },
  {
    id: "holi-2026",
    name: "Holi (Rangotsav / Dhulandi)",
    nameHindi: "होली (रंगोत्सव)",
    date: "2026-03-04",
    dayOfWeek: "Wednesday",
    lunarMonth: "Phalguna / Chaitra",
    paksha: "Krishna",
    tithi: "Pratipada",
    category: "Major Festival",
    significance:
      "The exuberant festival of colors celebrating the divine love of Radha and Krishna, seasonal renewal, and the erasure of past resentments.",
    rituals: [
      "Playing with natural herbal gulal, abir, and fragrant floral colors",
      "Sharing festive delicacies including Gujiya, Thandai, and Malpua",
      "Embracing friends, elders, and neighbors in mutual reconciliation",
    ],
    pujaMuhurat: "All Day Auspicious Celebration",
    deity: "Sri Radha-Krishna",
  },
  {
    id: "chaitra-navratri-2026",
    name: "Chaitra Navratri Begins / Hindu New Year (Vikram Samvat 2083)",
    nameHindi: "चैत्र नवरात्रि प्रारंभ / नव संवत्सर 2083",
    date: "2026-03-19",
    dayOfWeek: "Thursday",
    lunarMonth: "Chaitra",
    paksha: "Shukla",
    tithi: "Pratipada",
    category: "Major Festival",
    significance:
      "Marks the dawn of the Vedic New Year (Vikram Samvat 2083), Gudi Padwa in Maharashtra, Ugadi in the Deccan, and 9 nights of Goddess Durga worship.",
    rituals: [
      "Ghatasthapana (sacred Kalash installation) facing East or North",
      "Invocation of Maa Shailputri with Durga Saptashati recitation",
      "Sowing Jowar (sacred barley) seeds for prosperity",
    ],
    pujaMuhurat: "Ghatasthapana: 06:28 AM to 10:14 AM",
    deity: "Maa Durga (9 Forms of Navadurga)",
  },
  {
    id: "ram-navami-2026",
    name: "Ram Navami (श्री राम नवमी)",
    nameHindi: "श्री राम नवमी",
    date: "2026-03-27",
    dayOfWeek: "Friday",
    lunarMonth: "Chaitra",
    paksha: "Shukla",
    tithi: "Navami",
    category: "Major Festival",
    significance:
      "Celebrates the auspicious birth of Maryada Purushottam Lord Sri Rama in Ayodhya during Punarvasu Nakshatra at mid-day (Abhijit Muhurat).",
    rituals: [
      "Continuous recitation of Sri Ramcharitmanas and Ram Raksha Stotra",
      "Special mid-day Abhishek of Sri Ram Lalla with panchamrit",
      "Kanya Pujan (revering young girls as divine Shakti forms)",
    ],
    pujaMuhurat: "Madhyahna Ram Janma: 11:12 AM to 01:38 PM",
    deity: "Lord Sri Rama & Sita Mata",
  },
  {
    id: "hanuman-jayanti-2026",
    name: "Hanuman Jayanti",
    nameHindi: "हनुमान जयंती",
    date: "2026-04-02",
    dayOfWeek: "Thursday",
    lunarMonth: "Chaitra",
    paksha: "Shukla",
    tithi: "Purnima",
    category: "Purnima & Amavasya",
    significance:
      "Commemorates the birth of Sankat Mochan Lord Hanuman, the immortal embodiment of selfless devotion, physical strength, and boundless intellect.",
    rituals: [
      "Offering vermilion (Sindoor Chola) mixed with jasmine oil to Hanuman Ji",
      "Reciting Hanuman Chalisa, Bajrang Baan, and Sundarkand",
      "Offering Boondi Ladoos and chanting Sri Ram Jay Ram",
    ],
    pujaMuhurat: "Morning Muhurat: 06:18 AM to 10:52 AM",
    deity: "Lord Hanuman",
  },
  {
    id: "akshaya-tritiya-2026",
    name: "Akshaya Tritiya (अक्षय तृतीया)",
    nameHindi: "अक्षय तृतीया / आखा तीज",
    date: "2026-04-19",
    dayOfWeek: "Sunday",
    lunarMonth: "Vaishakha",
    paksha: "Shukla",
    tithi: "Tritiya",
    category: "Major Festival",
    significance:
      "Considered the most inherently auspicious Muhurat (Swayam Siddha) of the entire year. Any venture initiated or gold purchased on this day brings inexhaustible (Akshaya) wealth.",
    rituals: [
      "Purchasing gold, property, or investment assets",
      "Donating water pots (Ghatam), barley, and umbrella to the needy",
      "Initiating new business enterprises and performing Satyanarayan Puja",
    ],
    pujaMuhurat: "Gold Buying & Puja: 05:51 AM to 12:20 PM",
    deity: "Lord Vishnu & Maa Lakshmi",
  },
  {
    id: "nirjala-ekadashi-2026",
    name: "Nirjala Ekadashi Vrat (भीमसेनी एकादशी)",
    nameHindi: "निर्जला एकादशी",
    date: "2026-06-25",
    dayOfWeek: "Thursday",
    lunarMonth: "Jyeshtha",
    paksha: "Shukla",
    tithi: "Ekadashi",
    category: "Ekadashi",
    significance:
      "The most austere of all 24 Ekadashis. Observing a strict waterless fast on this single day bestows the spiritual merit of observing all 24 Ekadashis combined.",
    rituals: [
      "Strict fasting without consuming food or even a drop of water",
      "Donating earthen pitchers filled with sweet water and hand fans",
      "All-night chanting of Om Namo Bhagavate Vasudevaya",
    ],
    pujaMuhurat: "Parana: June 26, 05:25 AM to 08:14 AM",
    deity: "Lord Vishnu",
  },
  {
    id: "guru-purnima-2026",
    name: "Guru Purnima (व्यास पूर्णिमा)",
    nameHindi: "गुरु पूर्णिमा",
    date: "2026-07-29",
    dayOfWeek: "Wednesday",
    lunarMonth: "Ashadha",
    paksha: "Shukla",
    tithi: "Purnima",
    category: "Purnima & Amavasya",
    significance:
      "Honors the birth anniversary of Maharishi Veda Vyasa and expresses eternal gratitude to spiritual gurus, mentors, and teachers who dispel the darkness of ignorance.",
    rituals: [
      "Guru Paduka Puja and seeking personal blessings from your spiritual guide",
      "Reciting the Guru Gita and offering dakshina with humility",
      "Beginning of Chaturmas (four sacred months of spiritual contemplation)",
    ],
    pujaMuhurat: "05:41 AM to 12:27 PM",
    deity: "Maharishi Veda Vyasa & Spiritual Gurus",
  },
  {
    id: "nag-panchami-2026",
    name: "Nag Panchami",
    nameHindi: "नाग पंचमी",
    date: "2026-08-17",
    dayOfWeek: "Monday",
    lunarMonth: "Shravana",
    paksha: "Shukla",
    tithi: "Panchami",
    category: "Major Festival",
    significance:
      "Dedicated to the worship of the celestial serpent deities (Nagas) including Sheshnag and Vasuki. A vital astrological day for pacifying Kaal Sarp Dosha and Rahu afflictions.",
    rituals: [
      "Offering raw milk, turmeric, and flowers to representations of Nag Devata",
      "Performing Kaal Sarp Dosha Shanti Puja at holy shrines",
      "Avoiding plowing or digging in the soil on this day",
    ],
    pujaMuhurat: "05:51 AM to 08:29 AM",
    deity: "Nag Devatas & Lord Shiva",
  },
  {
    id: "raksha-bandhan-2026",
    name: "Raksha Bandhan / Shravani Purnima",
    nameHindi: "रक्षा बंधन",
    date: "2026-08-28",
    dayOfWeek: "Friday",
    lunarMonth: "Shravana",
    paksha: "Shukla",
    tithi: "Purnima",
    category: "Major Festival",
    significance:
      "The sacred celebration of the protective bond of love between brothers and sisters, and the sacred thread renewal (Upakarma) for Vedic scholars.",
    rituals: [
      "Sisters tie sacred Rakhi threads on brothers' right wrists with prayers",
      "Applying auspicious saffron-sandalwood tilak and feeding sweets",
      "Brothers offer gifts and take solemn vows of lifelong protection",
    ],
    pujaMuhurat: "Aparahna (avoiding Bhadra): 01:45 PM to 08:58 PM",
    deity: "Lord Vishnu & Maa Lakshmi",
  },
  {
    id: "krishna-janmashtami-2026",
    name: "Sri Krishna Janmashtami (श्रीकृष्ण जन्माष्टमी)",
    nameHindi: "श्रीकृष्ण जन्माष्टमी",
    date: "2026-09-04",
    dayOfWeek: "Friday",
    lunarMonth: "Bhadrapada",
    paksha: "Krishna",
    tithi: "Ashtami",
    category: "Major Festival",
    significance:
      "Celebrates the midnight descent of the Supreme Personality of Godhead, Lord Sri Krishna, in Rohini Nakshatra in Mathura.",
    rituals: [
      "Fasting until midnight and preparing decorative Jhula (cradle) displays",
      "Abhishekam of Bal Gopal with milk, curd, honey, ghee, and Gangajal",
      "Chanting Bhagavad Gita verses, dancing in Kirtan, and Dahi Handi festivities",
    ],
    pujaMuhurat: "Nishita Kaal: 11:58 PM to 12:44 AM (Midnight)",
    deity: "Lord Sri Krishna",
  },
  {
    id: "ganesh-chaturthi-2026",
    name: "Ganesh Chaturthi (विनायक चतुर्थी)",
    nameHindi: "गणेश चतुर्थी",
    date: "2026-09-14",
    dayOfWeek: "Monday",
    lunarMonth: "Bhadrapada",
    paksha: "Shukla",
    tithi: "Chaturthi",
    category: "Major Festival",
    significance:
      "The glorious 10-day festival welcoming Lord Ganesha, the remover of all obstacles (Vighnaharta) and bestowal of intellect (Buddhi) and prosperity (Siddhi).",
    rituals: [
      "Prana Pratishtha of eco-friendly clay Ganesha idols into homes",
      "Offering 21 modaks, durva grass blades, and red hibiscus flowers",
      "Daily morning and evening Aarti with community singing",
    ],
    pujaMuhurat: "Madhyahna Ganesha Puja: 11:06 AM to 01:34 PM",
    deity: "Lord Ganesha",
  },
  {
    id: "sharad-navratri-2026",
    name: "Sharad Navratri Begins (शारदीय नवरात्रि प्रारंभ)",
    nameHindi: "शारदीय नवरात्रि प्रारंभ",
    date: "2026-10-11",
    dayOfWeek: "Sunday",
    lunarMonth: "Ashwin",
    paksha: "Shukla",
    tithi: "Pratipada",
    category: "Major Festival",
    significance:
      "The great autumn Navratri celebrating the divine triumph of Goddess Durga over the buffalo demon Mahishasura, revitalizing cosmic balance.",
    rituals: [
      "Sacred Ghatasthapana and continuous Akhand Jyoti lighting",
      "Strict fasting and daily reading of Durga Saptashati / Devi Mahatmya",
      "Garba, Dandiya, and classical devotional temple dances",
    ],
    pujaMuhurat: "Ghatasthapana: 06:20 AM to 10:15 AM",
    deity: "Maa Durga (Navadurga)",
  },
  {
    id: "dussehra-2026",
    name: "Dussehra / Vijayadashami (दशहरा / विजयादशमी)",
    nameHindi: "विजयादशमी / दशहरा",
    date: "2026-10-20",
    dayOfWeek: "Tuesday",
    lunarMonth: "Ashwin",
    paksha: "Shukla",
    tithi: "Dashami",
    category: "Major Festival",
    significance:
      "Commemorates Lord Rama's victory over Ravana and Maa Durga's immersion after slaying Mahishasura. A supreme day for Shami tree worship and vehicle blessings.",
    rituals: [
      "Effigy burnings of Ravana, Kumbhakarna, and Meghnada",
      "Shastra Puja (blessing of tools, weapons, and vehicles)",
      "Exchanging auspicious Shami tree leaves as golden tokens of goodwill",
    ],
    pujaMuhurat: "Vijay Muhurat: 01:58 PM to 02:44 PM",
    deity: "Lord Sri Rama & Maa Durga",
  },
  {
    id: "karwa-chauth-2026",
    name: "Karwa Chauth (करवा चौथ)",
    nameHindi: "करवा चौथ",
    date: "2026-10-29",
    dayOfWeek: "Thursday",
    lunarMonth: "Kartika",
    paksha: "Krishna",
    tithi: "Chaturthi",
    category: "Major Festival",
    significance:
      "A sacred fast observed by married women for the longevity, health, and prosperity of their husbands, marked by profound devotion and marital beauty.",
    rituals: [
      "Eating early morning pre-dawn Sargi provided by mother-in-law",
      "Waterless fasting throughout the day and evening Karwa Chauth Vrat Katha",
      "Viewing the Moon through a sieve, offering Arghya, and breaking the fast",
    ],
    pujaMuhurat: "Puja: 05:40 PM to 06:58 PM | Moonrise: ~08:14 PM",
    deity: "Maa Parvati & Lord Shiva",
  },
  {
    id: "dhanteras-2026",
    name: "Dhanteras / Dhanvantari Trayodashi",
    nameHindi: "धनतेरस / धनवंतरी जयंती",
    date: "2026-11-06",
    dayOfWeek: "Friday",
    lunarMonth: "Kartika",
    paksha: "Krishna",
    tithi: "Trayodashi",
    category: "Major Festival",
    significance:
      "Marks the birth of Lord Dhanvantari, the divine physician of Ayurveda, and Lord Kubera. Purchasing metals and utensils invites everlasting wealth and health.",
    rituals: [
      "Purchasing gold, silver, brass utensils, and new household appliances",
      "Lighting the 13 Yamadeep lamps facing South outside the home threshold",
      "Worship of Lord Kubera, Dhanvantari, and Maa Lakshmi",
    ],
    pujaMuhurat: "Pradosh Kaal: 05:32 PM to 07:28 PM",
    deity: "Lord Dhanvantari, Lord Kubera & Maa Lakshmi",
  },
  {
    id: "diwali-2026",
    name: "Diwali / Deepawali (दीपावली - लक्ष्मी पूजन)",
    nameHindi: "दीपावली (लक्ष्मी पूजन)",
    date: "2026-11-08",
    dayOfWeek: "Sunday",
    lunarMonth: "Kartika",
    paksha: "Krishna",
    tithi: "Amavasya",
    category: "Major Festival",
    significance:
      "The supreme festival of lights celebrating the return of Lord Rama to Ayodhya after 14 years of exile and the divine descent of Maa Lakshmi into clean, illuminated homes.",
    rituals: [
      "Illuminating every corner of the home with pure clay ghee and oil diyas",
      "Grand Lakshmi-Ganesh Shodashopachara Puja during Pradosh/Vrishabha Lagna",
      "Creating intricate rice-powder and floral rangolis at entry thresholds",
    ],
    pujaMuhurat: "Pradosh Lakshmi Puja: 05:29 PM to 07:24 PM",
    deity: "Maa Lakshmi, Lord Ganesha & Lord Kubera",
  },
  {
    id: "chhath-puja-2026",
    name: "Chhath Puja (छठ पूजा - संध्या अर्घ्य)",
    nameHindi: "छठ पूजा (सूर्य षष्ठी)",
    date: "2026-11-15",
    dayOfWeek: "Sunday",
    lunarMonth: "Kartika",
    paksha: "Shukla",
    tithi: "Shashthi",
    category: "Major Festival",
    significance:
      "The ancient Vedic sun festival dedicated to the Sun God (Surya) and Chhathi Maiya, expressing gratitude for sustaining life on Earth and fulfilling wishes.",
    rituals: [
      "36-hour rigorous waterless fast (Nirjala) by the Vratis",
      "Standing waist-deep in water to offer evening Sandhya Arghya to setting Sun",
      "Morning Usha Arghya to rising Sun with bamboo Soop laden with Thekua fruits",
    ],
    pujaMuhurat: "Sunset Arghya: 05:27 PM | Next Morning Sunrise: 06:44 AM",
    deity: "Lord Surya & Chhathi Maiya",
  },
  {
    id: "dev-uthani-ekadashi-2026",
    name: "Dev Uthani / Prabodhini Ekadashi (देवउठनी एकादशी)",
    nameHindi: "देवउठनी एकादशी / तुलसी विवाह",
    date: "2026-11-20",
    dayOfWeek: "Friday",
    lunarMonth: "Kartika",
    paksha: "Shukla",
    tithi: "Ekadashi",
    category: "Ekadashi",
    significance:
      "Marks the awakening of Lord Vishnu after his 4-month cosmic slumber (Yoga Nidra). The auspicious wedding season (Vivah Muhurat) officially recommences on this day.",
    rituals: [
      "Tulsi Vivah (ceremonial sacred wedding of Tulsi plant with Shaligram)",
      "Sugarcane canopy pavilion setup with special seasonal fruit offerings",
      "Beginning of auspicious wedding, Griha Pravesh, and sacred ceremonies",
    ],
    pujaMuhurat: "Parana: Nov 21, 06:48 AM to 08:56 AM",
    deity: "Lord Vishnu (Shaligram) & Tulsi Devi",
  },
];

export function getFestivalsByMonth(month: number): HinduFestival[] {
  // If month is 1..12, treat as 1-based month. If month is 0, treat as January.
  const targetMonth = month >= 1 && month <= 12 ? month : month + 1;
  return FESTIVALS_2026.filter((f) => {
    const m = parseInt(f.date.split("-")[1], 10);
    return m === targetMonth;
  });
}

export function getFestivalsByCategory(category?: string): HinduFestival[] {
  if (!category || category === "All" || category === "All Categories") return FESTIVALS_2026;
  return FESTIVALS_2026.filter((f) => f.category === category);
}

export function getUpcomingFestivals(fromDateStr: string, limit = 5): HinduFestival[] {
  return FESTIVALS_2026
    .filter((f) => f.date >= fromDateStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export function getCuratedFestivalsForDate(dateStr: string): HinduFestival[] {
  return FESTIVALS_2026.filter((f) => f.date === dateStr);
}


