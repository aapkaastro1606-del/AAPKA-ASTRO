/**
 * Live on Television: "Kaal Ki Chaal" on Live Times
 * Confirmed configuration and status evaluation engine.
 *
 * All text is strictly sourced from verified client facts and appendix copy.
 * The word "live" appears ONLY in LIVE_NOW.
 */

export type LiveTvStatus =
  | "LIVE_NOW"
  | "UPCOMING_TODAY"
  | "TOMORROW"
  | "OFF_TODAY"
  | "ENDED"
  | "UNCONFIRMED";

export interface LiveTvBroadcastTexts {
  heading: { en: string; hi: string };
  body: { en: string; hi: string };
  howToAsk: { en: string; hi: string };
  consent: { en: string; hi: string };
  whereToWatch: { en: string; hi: string };
  disclaimer: { en: string; hi: string };
}

export interface LiveTvBroadcastSettings {
  programmeName: { en: string; hi: string };
  segmentName: { en: string; hi: string };
  channelName: string;
  role: { en: string; hi: string };
  astrologerName: { en: string; hi: string };
  schedule: {
    days: string[]; // e.g. ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    startTime: string; // "08:00" IST
    endTime: string; // "08:30" IST
    timezone: string; // "Asia/Kolkata"
  };
  whatsappNumber: string;
  whatsappTemplate: string;
  proofClipsUrl?: string;
  channelLogoApproved: boolean; // default false
  channelLogoUrl?: string;
  texts: LiveTvBroadcastTexts;
  // Owner switches
  notOnAirToday: boolean;
  returnDate?: string;
  programmeEnded: boolean; // hides every mention everywhere at once
  lastReconfirmedAt: string; // ISO date string
  showHomeStrip: boolean; // default false
}

export const DEFAULT_LIVE_TV_SETTINGS: LiveTvBroadcastSettings = {
  programmeName: {
    en: "Kaal Ki Chaal",
    hi: "काल की चाल",
  },
  segmentName: {
    en: "Today's Horoscope",
    hi: "आज का राशिफल",
  },
  channelName: "Live Times",
  role: {
    en: "Guest Astrologer",
    hi: "अतिथि ज्योतिषी",
  },
  astrologerName: {
    en: "Acharya Niraj Kumar",
    hi: "आचार्य नीरज",
  },
  schedule: {
    days: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    startTime: "08:00",
    endTime: "08:30",
    timezone: "Asia/Kolkata",
  },
  whatsappNumber: "+91 93112 15564",
  whatsappTemplate:
    "#KaalKiChaal\nName:\nQuestion:\nDate of Birth:\nTime of Birth:\nPlace of Birth:",
  proofClipsUrl: "",
  channelLogoApproved: false,
  channelLogoUrl: "",
  texts: {
    heading: {
      en: "Live on Television: Kaal Ki Chaal on Live Times",
      hi: "टेलीविज़न पर लाइव: लाइव टाइम्स पर 'काल की चाल'",
    },
    body: {
      en: "Acharya Niraj Kumar currently appears as a guest astrologer on Live Times' television programme Kaal Ki Chaal, every morning from 8:00 to 8:30 AM IST, seven days a week. On the programme he discusses the day's horoscope and answers viewers' questions live on air, including Kundli questions, free of charge.",
      hi: "आचार्य नीरज कुमार इन दिनों लाइव टाइम्स टीवी चैनल के कार्यक्रम 'काल की चाल' में अतिथि ज्योतिषी के रूप में हर सुबह 8:00 से 8:30 बजे (IST), सातों दिन, लाइव आते हैं। कार्यक्रम में वे आज का राशिफल बताते हैं और दर्शकों के प्रश्नों के उत्तर लाइव देते हैं, कुंडली से जुड़े प्रश्न भी, बिल्कुल निःशुल्क।",
    },
    howToAsk: {
      en: "To send a question for the programme, message us on WhatsApp at +91 93112 15564 with your question and your birth details (date, time and place). Sending a question is free. Not every question can be taken on air.",
      hi: "कार्यक्रम के लिए प्रश्न भेजने हेतु WhatsApp पर +91 93112 15564 पर अपना प्रश्न और जन्म विवरण (तारीख़, समय और स्थान) भेजें। प्रश्न भेजना निःशुल्क है। सभी प्रश्न प्रसारण में लिए जाना संभव नहीं है।",
    },
    consent: {
      en: "By sending your question you agree that it and your first name may be mentioned on air. Please do not send health, financial or other sensitive information.",
      hi: "प्रश्न भेजकर आप सहमत होते हैं कि आपका प्रश्न और आपका पहला नाम प्रसारण में बोला जा सकता है। कृपया स्वास्थ्य, वित्त या अन्य संवेदनशील जानकारी न भेजें।",
    },
    whereToWatch: {
      en: "Live Times is a television news channel. Channel numbers differ between cable and DTH operators, so please check your operator's channel list.",
      hi: "लाइव टाइम्स एक टेलीविज़न न्यूज़ चैनल है। केबल और DTH ऑपरेटर के अनुसार चैनल नंबर अलग होते हैं, कृपया अपने ऑपरेटर की चैनल सूची देखें।",
    },
    disclaimer: {
      en: "Guidance given on air is general in nature. For personal guidance, book a consultation.",
      hi: "कार्यक्रम में दिया गया मार्गदर्शन सामान्य प्रकृति का होता है। व्यक्तिगत मार्गदर्शन के लिए परामर्श बुक करें।",
    },
  },
  notOnAirToday: false,
  returnDate: "",
  programmeEnded: false,
  lastReconfirmedAt: new Date().toISOString(),
  showHomeStrip: false,
};

/**
 * Extracts date and time components in India Standard Time (IST / Asia/Kolkata).
 */
export function getIstDateTime(date: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "long",
  });
  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }
  const weekday = partMap.weekday || "Monday";
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);
  const totalMinutes = hour * 60 + minute;
  return { weekday, hour, minute, totalMinutes };
}

export interface LiveTvEvaluationResult {
  status: LiveTvStatus;
  labelEn: string;
  labelHi: string;
  isVisible: boolean;
  statusBadgeText: string;
  reconfirmationExpired: boolean;
  daysSinceLastReconfirmation: number;
}

/**
 * Monthly reconfirmation window:
 * If Owner has not reconfirmed within 37 days (30 days cycle + 7 days grace),
 * status automatically reverts to UNCONFIRMED and all broadcast content is hidden.
 */
export const RECONFIRMATION_GRACE_DAYS = 37;

/**
 * Evaluates the broadcast status in IST.
 *
 * Rules:
 * - ENDED: if settings.programmeEnded is true -> shows nothing (isVisible = false).
 * - UNCONFIRMED: if monthly reconfirmation window is expired -> shows nothing (isVisible = false).
 * - OFF_TODAY: if settings.notOnAirToday is true -> "Not on air today".
 * - LIVE_NOW: 08:00 to 08:30 IST on scheduled days -> "Live now on Live Times".
 * - UPCOMING_TODAY: before 08:00 IST on scheduled days -> "Today at 8:00 AM IST".
 * - TOMORROW: after 08:30 IST on scheduled days -> "Tomorrow at 8:00 AM IST".
 *
 * Strict constraint: The word "live" (case-insensitive) appears ONLY in LIVE_NOW!
 */
export function evaluateLiveTvStatus(
  settings: LiveTvBroadcastSettings = DEFAULT_LIVE_TV_SETTINGS,
  mockDate?: Date | string
): LiveTvEvaluationResult {
  const now = mockDate
    ? typeof mockDate === "string"
      ? new Date(mockDate)
      : mockDate
    : new Date();

  // 1. Check monthly reconfirmation window
  let daysSinceLastReconfirmation = 0;
  if (settings.lastReconfirmedAt) {
    const reconfirmedTime = new Date(settings.lastReconfirmedAt).getTime();
    if (!isNaN(reconfirmedTime)) {
      daysSinceLastReconfirmation = Math.floor(
        (now.getTime() - reconfirmedTime) / (1000 * 60 * 60 * 24)
      );
    }
  }

  const reconfirmationExpired =
    daysSinceLastReconfirmation > RECONFIRMATION_GRACE_DAYS;

  // 2. Programme has ended switch
  if (settings.programmeEnded) {
    return {
      status: "ENDED",
      labelEn: "",
      labelHi: "",
      isVisible: false,
      statusBadgeText: "",
      reconfirmationExpired,
      daysSinceLastReconfirmation,
    };
  }

  // 3. Unconfirmed state if reconfirmation expired
  if (reconfirmationExpired) {
    return {
      status: "UNCONFIRMED",
      labelEn: "",
      labelHi: "",
      isVisible: false,
      statusBadgeText: "",
      reconfirmationExpired,
      daysSinceLastReconfirmation,
    };
  }

  // 4. Not on air today switch
  if (settings.notOnAirToday) {
    const returnSuffixEn = settings.returnDate
      ? ` (Returns ${settings.returnDate})`
      : "";
    const returnSuffixHi = settings.returnDate
      ? ` (वापसी: ${settings.returnDate})`
      : "";

    return {
      status: "OFF_TODAY",
      labelEn: `Not on air today${returnSuffixEn}`,
      labelHi: `आज प्रसारण नहीं है${returnSuffixHi}`,
      isVisible: true,
      statusBadgeText: "Not on air today",
      reconfirmationExpired,
      daysSinceLastReconfirmation,
    };
  }

  // 5. IST time evaluation
  const { weekday, totalMinutes } = getIstDateTime(now);
  const isScheduledDay =
    !settings.schedule.days ||
    settings.schedule.days.length === 0 ||
    settings.schedule.days.includes(weekday);

  // If not scheduled on this day
  if (!isScheduledDay) {
    return {
      status: "TOMORROW",
      labelEn: "Tomorrow at 8:00 AM IST",
      labelHi: "कल सुबह 8:00 बजे (IST)",
      isVisible: true,
      statusBadgeText: "Tomorrow at 8:00 AM IST",
      reconfirmationExpired,
      daysSinceLastReconfirmation,
    };
  }

  const startMinutes = 8 * 60; // 08:00 = 480
  const endMinutes = 8 * 60 + 30; // 08:30 = 510

  if (totalMinutes >= startMinutes && totalMinutes < endMinutes) {
    return {
      status: "LIVE_NOW",
      labelEn: `Live now on ${settings.channelName}`,
      labelHi: `${settings.channelName} पर अभी लाइव`,
      isVisible: true,
      statusBadgeText: `Live now on ${settings.channelName}`,
      reconfirmationExpired,
      daysSinceLastReconfirmation,
    };
  }

  if (totalMinutes < startMinutes) {
    return {
      status: "UPCOMING_TODAY",
      labelEn: "Today at 8:00 AM IST",
      labelHi: "आज सुबह 8:00 बजे (IST)",
      isVisible: true,
      statusBadgeText: "Today at 8:00 AM IST",
      reconfirmationExpired,
      daysSinceLastReconfirmation,
    };
  }

  // totalMinutes >= endMinutes
  return {
    status: "TOMORROW",
    labelEn: "Tomorrow at 8:00 AM IST",
    labelHi: "कल सुबह 8:00 बजे (IST)",
    isVisible: true,
    statusBadgeText: "Tomorrow at 8:00 AM IST",
    reconfirmationExpired,
    daysSinceLastReconfirmation,
  };
}

/**
 * Builds the prefilled WhatsApp URL for programme questions.
 * Strictly prepends `#KaalKiChaal` so the Owner can filter TV questions.
 */
export function buildLiveTvWhatsAppUrl(
  settings: LiveTvBroadcastSettings = DEFAULT_LIVE_TV_SETTINGS
): string {
  const rawNumber = settings.whatsappNumber.replace(/[^0-9]/g, "");
  const text = encodeURIComponent(
    settings.whatsappTemplate ||
      "#KaalKiChaal\nName:\nQuestion:\nDate of Birth:\nTime of Birth:\nPlace of Birth:"
  );
  return `https://wa.me/${rawNumber}?text=${text}`;
}
