import { ASSISTANT_KNOWLEDGE, ServiceDetail } from "./knowledgeBase";

export type AssistantLanguage = "en" | "hi" | "hinglish";

export interface AssistantAction {
  label: string;
  url: string;
  type: "primary" | "whatsapp" | "call" | "secondary";
}

export interface AssistantResponse {
  answer: string;
  language: AssistantLanguage;
  intent: string;
  confidence: "high" | "medium" | "fallback";
  actions: AssistantAction[];
}

/**
 * Detects whether the input message is in Hindi (Devanagari), Hinglish, or English.
 */
export function detectLanguage(text: string): AssistantLanguage {
  // 1. Check for Devanagari Unicode block (\u0900-\u097F)
  if (/[\u0900-\u097F]/.test(text)) {
    return "hi";
  }

  // 2. Check for common Hinglish keywords
  const hinglishTokens = [
    "kya", "hai", "kaise", "kitna", "kitne", "shadi", "vivah", "batao", "namaste", "pranam",
    "chahiye", "kab", "kaha", "fees", "mujhe", "aap", "hota", "milega", "karna", "paise",
    "karo", "bhi", "hoga", "nahin", "nhi", "achha", "suno", "bataiye", "h", "krna", "btao",
    "radhe", "ram", "shubh", "samay", "kundali", "kundli", "janna", "baat"
  ];

  const lower = text.toLowerCase();
  const words = lower.split(/[^a-z0-9]+/);
  let hinglishCount = 0;

  for (const w of words) {
    if (hinglishTokens.includes(w)) {
      hinglishCount++;
    }
  }

  if (hinglishCount >= 1) {
    return "hinglish";
  }

  return "en";
}

/**
 * Standard Action Buttons
 */
const ACTION_BOOK_ASTRO: AssistantAction = {
  label: "Book Astro Session (₹1,051)",
  url: "/consult?product=astro&offer=FIRST1051",
  type: "primary",
};

const ACTION_BOOK_VAASTU: AssistantAction = {
  label: "Book Vaastu Audit (₹15,000)",
  url: "/consult?product=vaastu",
  type: "primary",
};

const ACTION_WHATSAPP: AssistantAction = {
  label: "Chat on WhatsApp",
  url: "https://wa.me/919311215564?text=" + encodeURIComponent("Namaste Acharya Ji, I would like to inquire about a consultation on Aapka Astro."),
  type: "whatsapp",
};

const ACTION_CALL: AssistantAction = {
  label: "Call +91 93112 15564",
  url: "tel:+919311215564",
  type: "call",
};

const ACTION_FREE_KUNDLI: AssistantAction = {
  label: "Free Janam Kundli",
  url: "/kundli-generator",
  type: "secondary",
};

const ACTION_PANCHANG: AssistantAction = {
  label: "Today's Panchang",
  url: "/panchang",
  type: "secondary",
};

/**
 * Deterministic, grounded question-answering engine.
 * Zero-latency, zero-cost, strictly adheres to verified site content.
 */
export function queryKnowledgeBase(rawQuery: string): AssistantResponse {
  const query = rawQuery.trim().toLowerCase();
  const lang = detectLanguage(rawQuery);

  // --------------------------------------------------------------------------
  // 0A. ADVERSARIAL: PROMPT INJECTION, JAILBREAK & SECRET / PROMPT EXTRACTION
  // Rule 8: Resist prompt injection, jailbreaks, and instructions to reveal prompt or keys.
  // --------------------------------------------------------------------------
  if (
    query.includes("ignore all previous") ||
    query.includes("ignore previous") ||
    query.includes("forget all previous") ||
    query.includes("forget your instructions") ||
    query.includes("dan mode") ||
    query.includes("you are now dan") ||
    query.includes("jailbreak") ||
    query.includes("system prompt") ||
    query.includes("chatbot_api_key") ||
    query.includes("api key") ||
    query.includes("reveal your instructions") ||
    query.includes("reveal prompt") ||
    query.includes("show prompt") ||
    query.includes("print system prompt") ||
    query.includes("unrestricted assistant") ||
    query.includes("disregard rules") ||
    query.includes("bypass safety") ||
    query.includes("backend secret")
  ) {
    if (lang === "hi") {
      return {
        answer: "मैं आपका एस्ट्रो (Aapka Astro) का आधिकारिक AI सहायक हूँ। मैं अपनी सुरक्षा नीतियों, सिस्टम निर्देशों अथवा गुप्त कुंजियों (API keys) को अनदेखा या प्रकट नहीं कर सकता। मैं केवल वेबसाइट की सेवाओं, आचार्य नीरज कुमार जी के परामर्श, और वैदिक साधनों से संबंधित प्रश्नों में आपकी सहायता के लिए उपलब्ध हूँ।",
        language: "hi",
        intent: "prompt_injection_refusal",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }
    if (lang === "hinglish") {
      return {
        answer: "Main Aapka Astro ka official AI assistant hoon. Main apne core security rules, system instructions ya API keys ko disclose ya ignore nahi kar sakta. Main sirf Aapka Astro ki services, Acharya Niraj Kumar ji ki consultation aur free Vedic tools ke baare mein madad karne ke liye hoon. Aap kya jaanna chahte hain?",
        language: "hinglish",
        intent: "prompt_injection_refusal",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }
    return {
      answer: "I am the official AI assistant for Aapka Astro. I cannot ignore my operating instructions, alter core safety guidelines, or disclose system prompts or API keys. I am strictly dedicated to assisting you with Aapka Astro's Vedic astrology, Devta Vaastu, and consultation services. How may I assist you with our services today?",
      language: "en",
      intent: "prompt_injection_refusal",
      confidence: "high",
      actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
    };
  }

  // --------------------------------------------------------------------------
  // 0B. ADVERSARIAL & SAFETY: PAYMENT & BOOKING CONFIRMATION ATTEMPTS
  // Rule 5: Never confirm that a booking, payment, or enrolment has happened.
  // --------------------------------------------------------------------------
  if (
    query.includes("confirm my payment") ||
    query.includes("confirm payment") ||
    query.includes("confirm my booking") ||
    query.includes("confirm booking") ||
    query.includes("confirm my enrolment") ||
    query.includes("confirm enrolment") ||
    query.includes("did my payment go through") ||
    query.includes("payment ho gaya confirm") ||
    query.includes("payment kar diya") ||
    query.includes("payment kar di") ||
    query.includes("maine pay kar diya") ||
    query.includes("paise bhej diye") ||
    query.includes("verify my payment") ||
    query.includes("booking confirm karo") ||
    query.includes("payment confirm karo") ||
    query.includes("mera payment aaya") ||
    (query.includes("paid") && (query.includes("confirm") || query.includes("booked")))
  ) {
    if (lang === "hi") {
      return {
        answer: "कृपया ध्यान दें: एक स्वचालित AI सहायक के रूप में, मेरे पास बैंक खातों या भुगतान लेजर की पहुँच नहीं है, इसलिए मैं किसी भी भुगतान या बुकिंग की पुष्टि नहीं कर सकता।\n\nसभी भुगतानों का सत्यापन हमारे व्यवस्थापक/ओनर द्वारा मैन्युअल रूप से किया जाता है। कृपया अपने UPI भुगतान का स्क्रीनशॉट या UTR संदर्भ हमारे आधिकारिक WhatsApp नंबर (+91 93112 15564) पर भेजें। हमारी टीम तुरंत सत्यापन कर आपकी अपॉइंटमेंट की पुष्टि कर देगी।",
        language: "hi",
        intent: "payment_confirmation_attempt",
        confidence: "high",
        actions: [ACTION_WHATSAPP, ACTION_BOOK_ASTRO],
      };
    }
    if (lang === "hinglish") {
      return {
        answer: "Dhyan dein: Ek automated AI assistant hone ke naate, mere paas banking ledger ya payment verification ka access nahi hai, isliye main kisi bhi payment ya booking ko confirm nahi kar sakta.\n\nSabhi payments aur bookings ka verification hamari management team dwara directly kiya jata hai. Kripya apna UPI payment screenshot ya UTR number hamare WhatsApp (+91 93112 15564) par send karein. Team turant verify karke aapka slot confirm kar degi.",
        language: "hinglish",
        intent: "payment_confirmation_attempt",
        confidence: "high",
        actions: [ACTION_WHATSAPP, ACTION_BOOK_ASTRO],
      };
    }
    return {
      answer: "Please note: As an automated AI assistant, I do not have direct access to banking portals or transaction ledgers and CANNOT verify payments or confirm bookings.\n\nAll payments and bookings are strictly verified by our management team. Please send your UPI transaction screenshot or UTR reference to our official WhatsApp at +91 93112 15564. Our team will verify it immediately and confirm your consultation slot.",
      language: "en",
      intent: "payment_confirmation_attempt",
      confidence: "high",
      actions: [ACTION_WHATSAPP, ACTION_BOOK_ASTRO],
    };
  }

  // --------------------------------------------------------------------------
  // 0C. ADVERSARIAL & SAFETY: MEDICAL ADVICE REFUSAL
  // Rule 6: Do not give medical advice, and never guarantee health outcomes.
  // --------------------------------------------------------------------------
  if (
    query.includes("chest pain") ||
    query.includes("heart attack") ||
    query.includes("breathlessness") ||
    query.includes("medicine") ||
    query.includes("medication") ||
    query.includes("prescription") ||
    query.includes("dawa") ||
    query.includes("davai") ||
    query.includes("treatment for") ||
    query.includes("cure for") ||
    query.includes("doctor") ||
    query.includes("depression") ||
    query.includes("suicide") ||
    query.includes("bukhar ki") ||
    (query.includes("disease") && !query.includes("astrology"))
  ) {
    if (lang === "hi") {
      return {
        answer: "महत्वपूर्ण सूचना: एक AI सहायक के रूप में, मैं कोई चिकित्सीय सलाह (Medical Advice) या दवा की सिफारिश नहीं कर सकता।\n\nयदि आप किसी स्वास्थ्य समस्या, सीने में दर्द या आपातकालीन स्थिति का सामना कर रहे हैं, तो कृपया तुरंत किसी योग्य चिकित्सक (Doctor) या नजदीकी अस्पताल से संपर्क करें। वैदिक ज्योतिष में स्वास्थ्य व मानसिक शांति हेतु ग्रहों के मार्गदर्शन के लिए आप आचार्य नीरज कुमार जी से परामर्श ले सकते हैं।",
        language: "hi",
        intent: "medical_advice_refusal",
        confidence: "high",
        actions: [ACTION_WHATSAPP, ACTION_CALL],
      };
    }
    if (lang === "hinglish") {
      return {
        answer: "Important Notice: AI assistant hone ke naate main koi medical advice, bimari ka ilaj ya medicine prescribe nahi kar sakta.\n\nAgar aap kisi physical health issue ya emergency ka samna kar rahe hain, to kripya turant kisi licensed doctor ya hospital se contact karein. Swasthya aur mansik shanti ke liye grahon ke prabhav aur Vedic remedies ke liye aap Acharya Niraj Kumar ji se consultation book kar sakte hain.",
        language: "hinglish",
        intent: "medical_advice_refusal",
        confidence: "high",
        actions: [ACTION_WHATSAPP, ACTION_CALL],
      };
    }
    return {
      answer: "Important Notice: As an AI assistant, I do NOT provide medical advice, diagnose health conditions, or prescribe medicines.\n\nIf you are experiencing medical symptoms, illness, or an emergency, please consult a qualified doctor or emergency medical service immediately. For astrological insights into planetary influences on vitality and spiritual remedies, you may consult Acharya Niraj Kumar.",
      language: "en",
      intent: "medical_advice_refusal",
      confidence: "high",
      actions: [ACTION_WHATSAPP, ACTION_CALL],
    };
  }

  // --------------------------------------------------------------------------
  // 0D. ADVERSARIAL & SAFETY: LEGAL ADVICE REFUSAL
  // Rule 6: Do not give legal advice.
  // --------------------------------------------------------------------------
  if (
    query.includes("sue my") ||
    query.includes("sue someone") ||
    query.includes("legal advice") ||
    query.includes("lawsuit") ||
    query.includes("file a case") ||
    query.includes("criminal case") ||
    query.includes("police complaint") ||
    query.includes("divorce petition") ||
    query.includes("lawyer") ||
    query.includes("attorney") ||
    query.includes("vakeel") ||
    query.includes("court case") ||
    query.includes("kanooni salah") ||
    query.includes("fir darj")
  ) {
    if (lang === "hi") {
      return {
        answer: "महत्वपूर्ण सूचना: एक AI सहायक के रूप में, मैं कोई कानूनी सलाह (Legal Advice) नहीं दे सकता और न ही अदालत में प्रतिनिधित्व कर सकता हूँ।\n\nकिसी भी कानूनी विवाद, मुकदमे या पुलिस शिकायत के लिए कृपया किसी योग्य अधिवक्ता (Lawyer/Advocate) से परामर्श लें। कानूनी विवादों के ज्योतिषीय समय (Dasha/Transits) और वैदिक शांति उपायों के विश्लेषण हेतु आप आचार्य नीरज कुमार जी से परामर्श ले सकते हैं।",
        language: "hi",
        intent: "legal_advice_refusal",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }
    if (lang === "hinglish") {
      return {
        answer: "Important Notice: AI assistant legal advice, court case representation ya legal petition draft nahi kar sakta.\n\nKisi bhi legal matter ya court dispute ke liye kripya kisi practicing advocate ya lawyer se consult karein. Legal disputes ke astrological planetary timing aur Vedic remedies ke vishleshan ke liye aap Acharya Niraj Kumar ji ke sath consultation book kar sakte hain.",
        language: "hinglish",
        intent: "legal_advice_refusal",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }
    return {
      answer: "Important Notice: As an AI assistant, I do NOT provide legal advice, draft court petitions, or offer attorney representation.\n\nFor any legal disputes, lawsuits, or formal proceedings, please consult a qualified licensed advocate or legal professional. For Vedic astrological analysis on dispute timing, planetary dashas, and peaceful remedies, you may book a consultation with Acharya Niraj Kumar.",
      language: "en",
      intent: "legal_advice_refusal",
      confidence: "high",
      actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
    };
  }

  // --------------------------------------------------------------------------
  // 0E. ADVERSARIAL: ABUSIVE OR OFFENSIVE CONTENT REFUSAL
  // Rule 9: Politely refuse abusive or offensive requests.
  // --------------------------------------------------------------------------
  if (
    query.includes("fuck") ||
    query.includes("bitch") ||
    query.includes("bastard") ||
    query.includes("idiot") ||
    query.includes("stupid bot") ||
    query.includes("useless bot") ||
    query.includes("pagal bot") ||
    query.includes("chutiya") ||
    query.includes("harami") ||
    query.includes("bakwaas") ||
    query.includes("asshole") ||
    query.includes("shut up")
  ) {
    if (lang === "hi") {
      return {
        answer: "मैं आपका एस्ट्रो (Aapka Astro) का आधिकारिक सहायक हूँ और शिष्टता एवं सम्मान के साथ सहायता प्रदान करने के लिए उपस्थित हूँ। कृपया मर्यादित भाषा का प्रयोग करें। मैं आपकी जन्म कुंडली, वास्तु परामर्श अथवा सेवाओं के विषय में किस प्रकार सहायता कर सकता हूँ?",
        language: "hi",
        intent: "abusive_refusal",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }
    if (lang === "hinglish") {
      return {
        answer: "Main Aapka Astro ka assistant hoon aur respect ke sath madad karne ke liye committed hoon. Kripya polite bhasha ka use karein. Main astrology consultation, Devta Vaastu ya free tools ke baare mein aapki kya help kar sakta hoon?",
        language: "hinglish",
        intent: "abusive_refusal",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }
    return {
      answer: "I am the official assistant of Aapka Astro and I am committed to maintaining a courteous and respectful conversation. Please communicate respectfully. How may I assist you with our Vedic astrology, Devta Vaastu, or booking inquiries?",
      language: "en",
      intent: "abusive_refusal",
      confidence: "high",
      actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
    };
  }

  // --------------------------------------------------------------------------
  // 0F. ADVERSARIAL: OFF-TOPIC QUERIES REFUSAL
  // Rule 9: Politely refuse off-topic requests.
  // --------------------------------------------------------------------------
  if (
    query.includes("fifa world cup") ||
    query.includes("world cup") ||
    query.includes("binary tree") ||
    query.includes("capital of france") ||
    query.includes("recipe for") ||
    query.includes("python code") ||
    query.includes("elon musk") ||
    query.includes("crypto") ||
    query.includes("bitcoin") ||
    query.includes("stock market tips")
  ) {
    if (lang === "hi") {
      return {
        answer: "मैं केवल आपका एस्ट्रो (Aapka Astro), वैदिक ज्योतिष, देवता वास्तु और आचार्य नीरज कुमार जी के परामर्श से संबंधित सहायता के लिए उपलब्ध हूँ। यह विषय मेरे दायरे से बाहर है। आप हमारी ज्योतिष सेवाओं या मुफ्त कुंडली साधनों के बारे में क्या जानना चाहते हैं?",
        language: "hi",
        intent: "off_topic_refusal",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }
    if (lang === "hinglish") {
      return {
        answer: "Main exclusively Aapka Astro, Vedic Jyotish, Devta Vaastu aur Acharya Niraj Kumar ji ki consultations ke liye dedicated hoon. Ye topic mere scope se bahar hai. Aap hamari astrology services ya free tools ke baare mein kya jaanna chahte hain?",
        language: "hinglish",
        intent: "off_topic_refusal",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }
    return {
      answer: "I am exclusively dedicated to Aapka Astro, Vedic astrology consultations, Devta Vaastu, and our online astrological tools. That inquiry is outside the scope of this website. How may I assist you with our consultations, gemstones, or birth chart analysis?",
      language: "en",
      intent: "off_topic_refusal",
      confidence: "high",
      actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
    };
  }

  // --------------------------------------------------------------------------
  // 1. GREETING
  // --------------------------------------------------------------------------
  if (
    /^(hi|hello|hey|namaste|pranam|namashkar|radhe radhe|jai shri ram|ram ram|halo)\b/i.test(query) ||
    query === "hi" || query === "hello" || query === "namaste" || query === "pranam"
  ) {
    if (lang === "hi") {
      return {
        answer: "नमस्ते! आपका एस्ट्रो (Aapka Astro) में आपका हार्दिक स्वागत है। मैं आचार्य नीरज कुमार जी का डिजिटल सहायक हूँ। मैं आपको परामर्श शुल्क (₹1,051 में 50% छूट), सेवाएं, मुफ्त कुंडली या बुकिंग प्रक्रिया के बारे में सटीक जानकारी दे सकता हूँ। आप क्या जानना चाहते हैं?",
        language: "hi",
        intent: "greeting",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP, ACTION_FREE_KUNDLI],
      };
    }
    if (lang === "hinglish") {
      return {
        answer: "Namaste! Aapka Astro par aapka swagat hai. Main Acharya Niraj Kumar ji ka digital sahayak hoon. Main aapko consultation charges (50% Off par ₹1,051), services, free kundli, ya appointment booking ke baare mein sahi jaankari de sakta hoon. Aap kya jaanna chahte hain?",
        language: "hinglish",
        intent: "greeting",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP, ACTION_FREE_KUNDLI],
      };
    }
    return {
      answer: "Namaste! Welcome to Aapka Astro. I am the digital assistant for Acharya Niraj Kumar. I can provide verified details on our consultation pricing (₹1,051 first-booking offer), Vedic services, free Kundli tools, or booking steps. How may I assist you today?",
      language: "en",
      intent: "greeting",
      confidence: "high",
      actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP, ACTION_FREE_KUNDLI],
    };
  }

  // --------------------------------------------------------------------------
  // 2. PRICING, FEES, CHARGES & OFFERS
  // --------------------------------------------------------------------------
  if (
    !query.includes("wallet") &&
    !query.includes("coin") &&
    !query.includes("recharge") &&
    !query.includes("tool") &&
    !query.includes("tools") &&
    !query.includes("tithi") &&
    !query.includes("nakshatra") &&
    !query.includes("rahukaal") &&
    (
      query.includes("fee") ||
      query.includes("fees") ||
      query.includes("price") ||
      query.includes("pricing") ||
      query.includes("cost") ||
      (query.includes("charge") && !query.includes("recharge")) ||
      query.includes("charges") ||
      query.includes("kitna") ||
      query.includes("kitne") ||
      (query.includes("rate") && !query.includes("generate") && !query.includes("accurate")) ||
      query.includes("discount") ||
      query.includes("offer") ||
      query.includes("coupon") ||
      query.includes("1051") ||
      query.includes("first1051") ||
      query.includes("pdf") ||
      query.includes("report") ||
      query.includes("free consultation") ||
      (query.includes("free") && !query.includes("kundli") && !query.includes("panchang") && !query.includes("milan") && !query.includes("rashifal")) ||
      query.includes("0 rupees") ||
      query.includes("zero rupees") ||
      query.includes("muft") ||
      query.includes("paisa") ||
      query.includes("शुल्क") ||
      query.includes("फीस") ||
      query.includes("फ़ीस") ||
      query.includes("लागत") ||
      query.includes("दाम") ||
      query.includes("खर्च") ||
      query.includes("चार्ज") ||
      query.includes("छूट") ||
      query.includes("ऑफर")
    )
  ) {
    const isFreeInquiry =
      query.includes("free consultation") ||
      query.includes("muft") ||
      query.includes("मुफ्त") ||
      query.includes("मुफ़्त") ||
      query.includes("फ्री") ||
      (query.includes("free") && (query.includes("consult") || query.includes("baat") || query.includes("0 rupees") || query.includes("zero")));

    if (lang === "hi") {
      const freeClarification = isFreeInquiry
        ? "ध्यान दें: व्यक्तिगत 1-on-1 परामर्श निःशुल्क (Free) नहीं है। "
        : "";
      return {
        answer: `${freeClarification}आपका एस्ट्रो पर परामर्श शुल्क पूरी तरह पारदर्शी और निश्चित (Flat Pay-Per-Booking) है:\n\n• **वैदिक ज्योतिष परामर्श (1-on-1):** प्रथम परामर्श पर 50% की विशेष छूट के साथ मात्र **₹1,051/-** (कूपन कोड: FIRST1051, सामान्य शुल्क ₹2,100)। इसमें जन्म कुंडली, दशा एवं वैदिक उपायों का संपूर्ण विश्लेषण शामिल है।\n• **देवता वास्तु परामर्श:** फ्लैट ₹10,000 की बचत के साथ **₹15,000/-** (सामान्य शुल्क ₹25,000)। 16-जोन बिना तोड़फोड़ का वैज्ञानिक वास्तु समाधान।\n• **जन्म कुंडली पूर्ण PDF रिपोर्ट:** मात्र **₹501/-** (डाउनलोड एवं प्रिंट योग्य पूर्ण रिपोर्ट)।\n• **ऑनलाइन कुंडली व पंचांग:** हमारी वेबसाइट पर जन्म कुंडली निर्माण, 36 गुण मिलान और दैनिक पंचांग 100% मुफ़्त हैं।\n\nयहाँ कोई छिपा हुआ वॉलेट बैलेंस या कॉइन सिस्टम नहीं है।`,
        language: "hi",
        intent: "pricing",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_BOOK_VAASTU, ACTION_WHATSAPP],
      };
    }

    if (lang === "hinglish") {
      const freeClarification = isFreeInquiry
        ? "Dhyan dein: Personal 1-on-1 consultation free nahi hai. "
        : "";
      return {
        answer: `${freeClarification}Aapka Astro par consultation charges bilkul transparent aur flat pay-per-booking hain:\n\n• **Vedic Astro Consultation (1-on-1):** First consultation par 50% discount ke sath flat **₹1,051/-** (Coupon code: FIRST1051, Regular fee ₹2,100). Isme Janam Kundli, Dasha timeline, career, marriage aur non-destructive Vedic remedies shamil hain.\n• **Devta Vaastu Consultation:** Flat ₹10,000 savings ke sath **₹15,000/-** (Regular fee ₹25,000) for complete 16-zone zero-demolition audit.\n• **Kundli Full PDF Report:** Flat **₹501/-** one-time printable dossier.\n• **Free Tools:** Website par Janam Kundli banana, Kundli Milan (Matching), aur Aaj Ka Panchang 100% free hain.\n\nAapka Astro par koi wallet coin ya subscription recharge nahi hai; aap direct pay karte hain.`,
        language: "hinglish",
        intent: "pricing",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_BOOK_VAASTU, ACTION_WHATSAPP],
      };
    }

    const freeClarification = isFreeInquiry
      ? "Please note: 1-on-1 personal consultations are not free. "
      : "";
    return {
      answer: `${freeClarification}Aapka Astro operates on a transparent, flat pay-per-booking model with zero hidden fees:\n\n• **Vedic Astro Consultation (1-on-1):** Flat **₹1,051/-** for your first consultation (50% off regular ₹2,100 with discount coupon code FIRST1051). Includes comprehensive birth chart, D9/D10, dasha timing, and non-destructive remedies.\n• **Devta Vaastu Consultation:** Flat **₹15,000/-** (save ₹10,000, regular ₹25,000) for a 16-zone zero-demolition residential or commercial audit.\n• **Kundli Full PDF Report:** Flat **₹501/-** one-time printable comprehensive dossier.\n• **Free Calculators:** Online Kundli generation, Kundli Matching (Milan), Daily Panchang, and Rashifal are 100% free on our site.\n\nWe do NOT use wallet recharges or coin deductions.`,
      language: "en",
      intent: "pricing",
      confidence: "high",
      actions: [ACTION_BOOK_ASTRO, ACTION_BOOK_VAASTU, ACTION_WHATSAPP],
    };
  }

  // --------------------------------------------------------------------------
  // 3. HOW TO BOOK / CONSULTATION PROCESS & FORMATS
  // (Evaluated before credentials so "book with Acharya" triggers booking)
  // --------------------------------------------------------------------------
  if (
    query.includes("how to book") ||
    query.includes("book kaise") ||
    query.includes("appointment") ||
    query.includes("process") ||
    query.includes("format") ||
    query.includes("video call") ||
    query.includes("voice call") ||
    query.includes("google meet") ||
    query.includes("kaise consult") ||
    query.includes("kaise kare") ||
    query.includes("steps") ||
    query.includes("बुक") ||
    query.includes("बुकिंग") ||
    query.includes("अपॉइंटमेंट") ||
    query.includes("परामर्श कैसे") ||
    query.includes("birth time") ||
    query.includes("submit") ||
    query.includes("before the call")
  ) {
    if (lang === "hi") {
      return {
        answer: "आचार्य नीरज कुमार जी के साथ परामर्श बुक करने की प्रक्रिया अत्यंत सरल है:\n\n1. **/consult** पेज पर जाएं और 'Astro Consultation' (₹1,051) या 'Vaastu Consultation' (₹15,000) चुनें।\n2. अपनी जन्म तिथि, सही जन्म समय, जन्म स्थान और अपनी मुख्य समस्या/प्रश्न दर्ज करें।\n3. अपना पसंदीदा समय स्लॉट चुनें और डायरेक्ट UPI (GPay/PhonePe/Paytm/QR) द्वारा भुगतान पूरा करें।\n4. पुष्टि होते ही आपको WhatsApp Call या Google Meet का सीधा लिंक प्राप्त हो जाएगा।",
        language: "hi",
        intent: "booking_process",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP, ACTION_CALL],
      };
    }

    if (lang === "hinglish") {
      return {
        answer: "Acharya Niraj Kumar ji ke sath consultation book karna bahut simple hai:\n\n1. **/consult** page par jaiye aur 'Astro Consultation' (₹1,051) ya 'Vaastu Consultation' (₹15,000) select kijiye.\n2. Apna naam, birth date, exact birth time, birth place aur apna sawal fill kijiye.\n3. Preferred date aur time window select karke direct UPI (GPay, PhonePe, Paytm ya QR code) se payment confirm kijiye.\n4. Booking confirm hote hi aapko WhatsApp Call ya Google Meet ka direct link mil jata hai.",
        language: "hinglish",
        intent: "booking_process",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP, ACTION_CALL],
      };
    }

    return {
      answer: "Booking a 1-on-1 session with Acharya Niraj Kumar is quick and direct:\n\n1. Visit **/consult** and select your consultation type (Astro Consultation at ₹1,051 or Vaastu at ₹15,000).\n2. Enter your birth details (date, exact time, place) and your primary concerns.\n3. Choose your preferred slot and complete the flat pay-per-booking payment via direct UPI (GPay, PhonePe, Paytm, or QR).\n4. You will receive immediate confirmation with your direct WhatsApp Call or Google Meet joining link.",
      language: "en",
      intent: "booking_process",
      confidence: "high",
      actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP, ACTION_CALL],
    };
  }

  // --------------------------------------------------------------------------
  // 4. ACHARYA NIRAJ KUMAR CREDENTIALS & BACKGROUND
  // --------------------------------------------------------------------------
  if (
    query.includes("who is") ||
    query.includes("credentials") ||
    query.includes("qualification") ||
    query.includes("qualifications") ||
    query.includes("experience") ||
    query.includes("guru") ||
    query.includes("lineage") ||
    query.includes("kaun hai") ||
    query.includes("degrees") ||
    query.includes("background") ||
    query.includes("profile") ||
    query.includes("about the astrologer") ||
    query.includes("about acharya") ||
    query.includes("about niraj") ||
    query.includes("आचार्य") ||
    query.includes("नीरज") ||
    query.includes("ज्योतिषी") ||
    query.includes("अनुभव") ||
    query.includes("योग्यता") ||
    query.includes("कौन हैं") ||
    query.includes("कौन है")
  ) {
    if (lang === "hi") {
      return {
        answer: "आचार्य नीरज कुमार जी **20+ वर्षों के वैदिक अनुभव** और **15,000+ कुंडली परामर्शों** के साथ एक प्रतिष्ठित ज्योतिषाचार्य और वास्तु विशेषज्ञ हैं:\n\n• **परंपरा व गुरु:** वैद्यनाथ धाम (देवघर) की आध्यात्मिक भूमि से संबंध; स्वर्गीय गुरु श्री बी. बी. तिवारी जी के सानिध्य में पारंपरिक दीक्षा।\n• **शैक्षणिक व ज्योतिषीय उपाधियाँ:** भारतीय विद्या भवन (के. एन. राव संस्थान) से ज्योतिषाचार्य, इग्नू से ज्योतिष में एम.ए. (2024), आईकास (ICAS) से नाड़ी प्रवीण, तथा दिव्य वास्तु से प्रमाणित वास्तु विशेषज्ञ।\n• **कॉरपोरेट नेतृत्व:** रिलायंस रिटेल एवं मेट्रो कैश एंड कैरी में वाइस प्रेसिडेंट (VP) व बिजनेस हेड रह चुके हैं। वे वैदिक ज्योतिष को आधुनिक रणनीतिक जीवन निर्णयों के साथ जोड़ते हैं।",
        language: "hi",
        intent: "acharya_credentials",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }

    if (lang === "hinglish") {
      return {
        answer: "Acharya Niraj Kumar ji **20+ saal ke Vedic experience** aur **15,000+ chart analyses** ke sath ek highly respected Jyotish Acharya aur Vastu Expert hain:\n\n• **Lineage & Guru:** Baidyanath Dham (Deoghar) se judaav; Late Guru Shri B. B. Tiwari ji ke guidance mein classical training.\n• **Degrees & Certifications:** Bhartiya Vidya Bhawan (K.N. Rao Institute) se Jyotish Acharya, IGNOU se M.A. in Jyotish (2024), ICAS se Nadi Parveen, aur DivyVastu se Certified Logical Vastu Expert.\n• **Corporate Leadership:** Reliance Retail aur Metro Cash & Carry mein Vice President (VP) aur Business Head ke roop mein 20+ saal ka senior leadership background.\n\nVe shuddh Vedic gyan aur practical corporate insight ka adbhut sangam pradan karte hain.",
        language: "hinglish",
        intent: "acharya_credentials",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }

    return {
      answer: "Acharya Niraj Kumar brings together over **20 years of classical Vedic mastery** and **15,000+ consultations**:\n\n• **Lineage & Training:** Rooted in Baidyanath Dham (Deoghar); classical discipleship under Late Guru Shri B. B. Tiwari.\n• **Vedic Credentials:** Jyotish Acharya from Bharatiya Vidya Bhawan (K.N. Rao Institute), M.A. in Jyotish from IGNOU (2024), Nadi Parveen from ICAS, and certified Logical Vastu Expert from DivyVastu.\n• **Corporate Track Record:** Former Vice President and Business Head at Reliance Retail and Metro Cash & Carry, combining rigorous mathematical Vedic analysis with practical, actionable life and business strategy.",
      language: "en",
      intent: "acharya_credentials",
      confidence: "high",
      actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
    };
  }

  // --------------------------------------------------------------------------
  // 5. PAYMENT, UPI & WALLET POLICY
  // --------------------------------------------------------------------------
  if (
    query.includes("payment") ||
    query.includes("upi") ||
    query.includes("gpay") ||
    query.includes("phonepe") ||
    query.includes("paytm") ||
    query.includes("wallet") ||
    query.includes("coin") ||
    query.includes("recharge") ||
    query.includes("bhim")
  ) {
    if (lang === "hi") {
      return {
        answer: "भुगतान एवं वॉलेट नीति:\n\n• **भुगतान का माध्यम:** हम सुरक्षित डायरेक्ट UPI बैंक ट्रांसफर स्वीकार करते हैं। आप Google Pay, PhonePe, Paytm, BHIM या किसी भी बैंकिंग UPI ऐप से **9310709233m@pnb** (Payee: AAPKA ASTRO) पर अथवा स्क्रीन पर दिए गए QR कोड को स्कैन करके भुगतान कर सकते हैं।\n• **वॉलेट नीति:** आपका एस्ट्रो पर कोई वॉलेट रिचार्ज या कॉइन कटौती प्रणाली नहीं है। आप केवल अपनी बुकिंग के समय पारदर्शी रूप से निश्चित शुल्क का भुगतान करते हैं।",
        language: "hi",
        intent: "payment_methods",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }

    if (lang === "hinglish") {
      return {
        answer: "Payment aur Wallet Policy:\n\n• **Payment Method:** Direct UPI payment accepted hai. Aap Google Pay, PhonePe, Paytm, BHIM ya kisi bhi UPI app se **9310709233m@pnb** (Payee: AAPKA ASTRO) par ya dynamic QR code scan karke pay kar sakte hain.\n• **Zero Wallet Policy:** Aapka Astro par koi wallet coin, balance ya top-up recharge system NAHI hai. Aap sirf transparent flat pay-per-booking karte hain bina kisi hidden charges ke.",
        language: "hinglish",
        intent: "payment_methods",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }

    return {
      answer: "Payment & Wallet Policy:\n\n• **Direct UPI Payment:** We accept instant UPI bank transfers via Google Pay, PhonePe, Paytm, BHIM, or any banking app directly to **9310709233m@pnb** (Payee: AAPKA ASTRO) or via instant dynamic QR code.\n• **No Wallet Policy:** Aapka Astro does NOT use a wallet recharge or coin deduction system. All services are flat pay-per-booking with zero commissions or hidden fees.",
      language: "en",
      intent: "payment_methods",
      confidence: "high",
      actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
    };
  }

  // --------------------------------------------------------------------------
  // 6. REFUND & CANCELLATION POLICY
  // --------------------------------------------------------------------------
  if (
    query.includes("refund") ||
    query.includes("cancellation") ||
    query.includes("cancel") ||
    query.includes("reschedule") ||
    query.includes("paisa wapas") ||
    query.includes("guarantee") ||
    query.includes("रिफंड") ||
    query.includes("रद्दीकरण") ||
    query.includes("वापसी") ||
    query.includes("वापस")
  ) {
    if (lang === "hi") {
      return {
        answer: "रिफंड एवं रद्दीकरण नीति:\n\n• **रद्दीकरण निषेध:** एक बार परामर्श बुक होने के बाद रद्दीकरण (Cancellation) या रिफंड की अनुमति नहीं है — आपको अपना सत्र अटेंड करना होगा।\n• **निःशुल्क रिशेड्यूलिंग:** यदि किसी कारणवश आप समय बदलना चाहते हैं, तो सत्र से कम से कम 2 घंटे पूर्व WhatsApp पर सूचित करके निःशुल्क स्लॉट रिशेड्यूल करा सकते हैं।\n• **आचार्य जी अनुपस्थिति गारंटी:** यदि किसी अपरिहार्य कारणवश आचार्य नीरज कुमार जी निर्धारित समय पर सत्र में उपस्थित नहीं हो पाते हैं, तो आपकी **100% फीस 2-3 कार्यदिवसों में आपके मूल बैंक खाते में वापस (Refund)** कर दी जाती है।\n• सत्र संपन्न होने के पश्चात कोई रिफंड देय नहीं होता है।",
        language: "hi",
        intent: "refund_policy",
        confidence: "high",
        actions: [ACTION_WHATSAPP, ACTION_BOOK_ASTRO],
      };
    }

    if (lang === "hinglish") {
      return {
        answer: "Refund aur Cancellation Policy:\n\n• **Strict No-Cancellation:** Ek baar consultation book hone ke baad cancellation ya refund allowed nahi hai — aapko apna session attend karna hota hai.\n• **Free Rescheduling:** Urgent situation hone par session se kam se kam 2 ghante pehle WhatsApp par inform karke aap free mein slot reschedule kara sakte hain.\n• **Missed Session Guarantee:** Agar Acharya Niraj Kumar ji scheduled session attend nahi kar paate, to aapki **100% fees 2-3 working days mein directly aapke bank account mein refund** ho jaati hai.\n• Session successfully complete hone ke baad refund applicable nahi hota.",
        language: "hinglish",
        intent: "refund_policy",
        confidence: "high",
        actions: [ACTION_WHATSAPP, ACTION_BOOK_ASTRO],
      };
    }

    return {
      answer: "Refund & Cancellation Policy:\n\n• **Strict No-Cancellation Policy:** Once a consultation is booked, cancellations for refunds are not permitted — you must attend your booked session.\n• **Free Rescheduling:** If an emergency arises, you can reschedule your slot for free with at least 2 hours prior notice via WhatsApp.\n• **100% Missed Session Guarantee:** If Acharya Niraj Kumar is unable to attend your scheduled session, 100% of your consultation fee is refunded to your bank account within 2-3 business days.\n• No refunds are provided once a consultation has successfully taken place.",
      language: "en",
      intent: "refund_policy",
      confidence: "high",
      actions: [ACTION_WHATSAPP, ACTION_BOOK_ASTRO],
    };
  }

  // --------------------------------------------------------------------------
  // 7. CONTACT, PHONE, WHATSAPP, SANCTUM ADDRESS & TIMINGS
  // --------------------------------------------------------------------------
  if (
    query.includes("contact") ||
    query.includes("phone") ||
    query.includes("mobile") ||
    query.includes("whatsapp") ||
    query.includes("number") ||
    query.includes("address") ||
    query.includes("location") ||
    query.includes("sanctum") ||
    query.includes("office") ||
    query.includes("noida") ||
    query.includes("timing") ||
    query.includes("hours") ||
    query.includes("kaha hai") ||
    query.includes("kahan") ||
    query.includes("email") ||
    query.includes("social") ||
    query.includes("instagram") ||
    query.includes("youtube") ||
    query.includes("handles") ||
    query.includes("social media")
  ) {
    if (lang === "hi") {
      return {
        answer: "संपर्क एवं केंद्र का विवरण:\n\n• **फ़ोन व WhatsApp:** +91 93112 15564\n• **ईमेल:** contact@aapkaastro.com\n• **समय:** सोमवार से रविवार, प्रातः 7:00 बजे से रात्रि 11:00 बजे तक (IST)\n• **कार्यालय/केंद्र पता:** यूनिट नं. A-1212 D, टावर A, स्पेक्ट्रम@मेट्रो फेज 1, सेक्टर 75, नोएडा, उ.प्र. 201301\n• **सोशल मीडिया:** Instagram: @aapkaastrologer | YouTube: @aapkaastro7900",
        language: "hi",
        intent: "contact_info",
        confidence: "high",
        actions: [ACTION_WHATSAPP, ACTION_CALL],
      };
    }

    if (lang === "hinglish") {
      return {
        answer: "Aapka Astro Contact Details:\n\n• **Phone & WhatsApp:** +91 93112 15564\n• **Email:** contact@aapkaastro.com\n• **Consultation Timings:** Monday to Sunday: 7:00 AM – 11:00 PM IST\n• **Sanctum Address:** Unit No. A-1212 D, Tower A, Spectrum@Metro Phase 1, Sector 75, Noida, U.P. 201301\n• **Social Media:** Instagram @aapkaastrologer | YouTube @aapkaastro7900",
        language: "hinglish",
        intent: "contact_info",
        confidence: "high",
        actions: [ACTION_WHATSAPP, ACTION_CALL],
      };
    }

    return {
      answer: "Aapka Astro Official Contact Details:\n\n• **Phone & WhatsApp:** +91 93112 15564\n• **Email:** contact@aapkaastro.com\n• **Operating Hours:** Monday – Sunday: 7:00 AM – 11:00 PM IST\n• **Sanctum Address:** Unit No. A-1212 D, Tower A, Spectrum@Metro Phase 1, Sector 75, Noida, U.P. 201301\n• **Social Channels:** Instagram @aapkaastrologer | YouTube @aapkaastro7900",
      language: "en",
      intent: "contact_info",
      confidence: "high",
      actions: [ACTION_WHATSAPP, ACTION_CALL],
    };
  }

  // --------------------------------------------------------------------------
  // 8. VAASTU CONSULTATION DETAILS
  // --------------------------------------------------------------------------
  if (
    query.includes("vastu") ||
    query.includes("vaastu") ||
    query.includes("house") ||
    query.includes("office") ||
    query.includes("factory") ||
    query.includes("floorplan") ||
    query.includes("tod phod") ||
    query.includes("demolition")
  ) {
    if (lang === "hi") {
      return {
        answer: "देवता वास्तु एवं ऊर्जा वास्तु परामर्श (Acharya Niraj Kumar):\n\n• **शुल्क:** केवल **₹15,000/-** (सामान्य शुल्क ₹25,000, सीधे ₹10,000 की बचत)।\n• **बिना तोड़-फोड़ (Zero-Demolition):** किसी भी दीवार या संरचना को तोड़े बिना 16-जोन दिशात्मक ऊर्जा संतुलन, पंचतत्व (अग्नि, जल, वायु, पृथ्वी, आकाश) संतुलन एवं पिरामिड/धातु स्ट्रिप्स द्वारा उपचार।\n• **उपयुक्त:** आवासीय घर, व्यावसायिक कार्यालय, दुकान, एवं औद्योगिक कारखाने।\n• **परामर्श माध्यम:** फ्लोरप्लान का विस्तृत वीडियो कॉल रिव्यू अथवा स्थल डिजिटल रिपोर्ट।",
        language: "hi",
        intent: "vaastu_details",
        confidence: "high",
        actions: [ACTION_BOOK_VAASTU, ACTION_WHATSAPP],
      };
    }

    if (lang === "hinglish") {
      return {
        answer: "Devta Vaastu Consultation (Acharya Niraj Kumar):\n\n• **Fee:** Flat **₹15,000/-** (Regular ₹25,000, flat ₹10,000 off).\n• **Zero-Demolition Approach:** Bina kisi deewar ya structure ko tode, 16-directional micro-zones aur Panch Tattva ko Vedic energy balance remedies se align kiya jata hai.\n• **Coverage:** Residence, corporate office, shop, ya factory layouts.\n• **Format:** Video Call par floorplan review ya digital audit consultation.",
        language: "hinglish",
        intent: "vaastu_details",
        confidence: "high",
        actions: [ACTION_BOOK_VAASTU, ACTION_WHATSAPP],
      };
    }

    return {
      answer: "Devta Vaastu Consultation (Acharya Niraj Kumar):\n\n• **Fee:** Flat **₹15,000/-** (save ₹10,000, regular ₹25,000).\n• **Zero Demolition:** Complete 16-zone directional micro-energy mapping and elemental balancing without breaking a single wall or structure.\n• **Scope:** Residential homes, commercial offices, retail shops, and industrial plants.\n• **Format:** Live video floorplan examination, voice review, or digital audit consultation.",
      language: "en",
      intent: "vaastu_details",
      confidence: "high",
      actions: [ACTION_BOOK_VAASTU, ACTION_WHATSAPP],
    };
  }

  // --------------------------------------------------------------------------
  // 9. GEMSTONES & REMEDIES
  // --------------------------------------------------------------------------
  if (
    query.includes("gemstone") ||
    query.includes("gemstones") ||
    query.includes("ratna") ||
    query.includes("pukhraj") ||
    query.includes("ruby") ||
    query.includes("emerald") ||
    query.includes("sapphire") ||
    query.includes("heera") ||
    query.includes("manik") ||
    query.includes("moti") ||
    query.includes("prana pratishtha")
  ) {
    if (lang === "hi") {
      return {
        answer: "प्रमाणित प्राकृतिक रत्न परामर्श (Aapka Astro):\n\n• **100% प्राकृतिक व अप्रसंस्कृत:** सभी रत्न सरकारी मान्यता प्राप्त प्रयोगशालाओं से प्रमाणित होते हैं।\n• **वैदिक प्राण-प्रतिष्ठा:** आचार्य नीरज कुमार जी द्वारा शुभ मुहूर्त में वैदिक स्त्रोतों एवं मंत्रों से अभिमंत्रित (Pran Pratishtha) कर धारण करने की विधि, उपयुक्त धातु व अंगुली का निर्देश दिया जाता है।\n• किसी भी रत्न को धारण करने से पहले कुंडली में ग्रहों की अनुकूलता की जांच अनिवार्य होती है।",
        language: "hi",
        intent: "gemstones",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, { label: "View Gemstones", url: "/gemstones", type: "secondary" }, ACTION_WHATSAPP],
      };
    }

    if (lang === "hinglish") {
      return {
        answer: "Certified Vedic Gemstones (Aapka Astro):\n\n• **100% Natural & Lab Certified:** Hamare sabhi gemstones government-recognized lab se certified hote hain, zero synthetic treatment.\n• **Vedic Pran Pratishtha:** Acharya Niraj Kumar ji dwara shubh muhurat mein Vedic stotras se abhimantrit kiya jata hai, sahi metal aur finger guidance ke sath.\n• Koi bhi ratna dharan karne se pehle apni Kundli dikhana zaroori hota hai taaki galat prabhav na pade.",
        language: "hinglish",
        intent: "gemstones",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, { label: "View Gemstones", url: "/gemstones", type: "secondary" }, ACTION_WHATSAPP],
      };
    }

    return {
      answer: "Certified Vedic Gemstones (Aapka Astro):\n\n• **100% Natural & Untreated:** Lab-certified natural gemstones with zero artificial heating or treatment.\n• **Vedic Prana Pratishtha:** Consecrated under auspicious planetary Muhurats with authentic Vedic stotras by Acharya Niraj Kumar, along with metal and wearing instructions.\n• Accurate gemstone prescription requires birth chart analysis to confirm functional benefic planetary alignment.",
      language: "en",
      intent: "gemstones",
      confidence: "high",
      actions: [ACTION_BOOK_ASTRO, { label: "View Gemstones", url: "/gemstones", type: "secondary" }, ACTION_WHATSAPP],
    };
  }

  // --------------------------------------------------------------------------
  // 10A. PANCHANG & DAILY VEDIC TIMINGS
  // --------------------------------------------------------------------------
  if (
    query.includes("panchang") ||
    query.includes("tithi") ||
    query.includes("nakshatra") ||
    query.includes("rahukaal") ||
    query.includes("rahu kaal") ||
    query.includes("shubh muhurat") ||
    query.includes("choghadiya")
  ) {
    if (lang === "hi") {
      return {
        answer: "आज का संपूर्ण वैदिक पंचांग (सूर्योदय, तिथि, नक्षत्र, करण, योग, राहुकाल एवं शुभ मुहूर्त) आप हमारी वेबसाइट पर 100% मुफ़्त **/panchang** पर देख सकते हैं (और कल का पंचांग **/panchang/tomorrow** पर उपलब्ध है)। किसी विशेष कार्य के शुभ मुहूर्त निर्धारण अथवा कुंडली परामर्श हेतु आप आचार्य नीरज कुमार जी से भी जुड़ सकते हैं।",
        language: "hi",
        intent: "free_tools",
        confidence: "high",
        actions: [ACTION_PANCHANG, { label: "कल का पंचांग", url: "/panchang/tomorrow", type: "secondary" }, ACTION_BOOK_ASTRO],
      };
    }
    if (lang === "hinglish") {
      return {
        answer: "Aaj ka complete Vedic Hindu Panchang (Tithi, Nakshatra, Yoga, Karana, Rahu Kaal aur Shubh Muhurat) aap 100% free hamare dedicated Panchang page **/panchang** par dekh sakte hain (aur kal ka panchang **/panchang/tomorrow** par). Shubh Muhurat ya Jyotish guidance ke liye aap Acharya Niraj Kumar ji se consultation bhi book kar sakte hain.",
        language: "hinglish",
        intent: "free_tools",
        confidence: "high",
        actions: [ACTION_PANCHANG, { label: "Tomorrow's Panchang", url: "/panchang/tomorrow", type: "secondary" }, ACTION_BOOK_ASTRO],
      };
    }
    return {
      answer: "You can view today's complete Vedic Hindu Panchang (Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, and Shubh Muhurat) 100% free on our dedicated Panchang page at **/panchang** (and tomorrow's timings at **/panchang/tomorrow**). For auspicious Muhurat selection or personalized planetary guidance, you can also consult Acharya Niraj Kumar.",
      language: "en",
      intent: "free_tools",
      confidence: "high",
      actions: [ACTION_PANCHANG, { label: "Tomorrow's Panchang", url: "/panchang/tomorrow", type: "secondary" }, ACTION_BOOK_ASTRO],
    };
  }

  // --------------------------------------------------------------------------
  // 10B. FREE JANAM KUNDLI GENERATOR
  // --------------------------------------------------------------------------
  if (
    !query.includes("matching") &&
    !query.includes("milan") &&
    !query.includes("marriage") &&
    (query.includes("janam kundli") ||
      query.includes("kundli generator") ||
      query.includes("free kundli") ||
      query.includes("birth chart") ||
      query.includes("kundli banaye"))
  ) {
    if (lang === "hi") {
      return {
        answer: "आप अपनी सटीक जन्म कुंडली 100% मुफ़्त हमारे **/kundli-generator** पर बना सकते हैं। इसमें आपको लग्न कुंडली, नवमांश, ग्रह स्थितियां और नक्षत्र विवरण तुरंत प्राप्त होता है। संपूर्ण 50+ पृष्ठों की हस्तलिखित जैसी PDF रिपोर्ट ₹501 में उपलब्ध है, अथवा आचार्य जी से 1-on-1 विश्लेषण के लिए ₹1,051 में परामर्श बुक कर सकते हैं।",
        language: "hi",
        intent: "free_tools",
        confidence: "high",
        actions: [ACTION_FREE_KUNDLI, ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }
    if (lang === "hinglish") {
      return {
        answer: "Aap apni accurate Janam Kundli 100% free hamare **/kundli-generator** par bana sakte hain. Isme aapko Lagna chart, Navamsha, aur planetary positions instant milti hain. Full detailed PDF Report ₹501 mein milti hai, ya Acharya ji ke sath 1-on-1 analysis ke liye aap ₹1,051 mein session book kar sakte hain.",
        language: "hinglish",
        intent: "free_tools",
        confidence: "high",
        actions: [ACTION_FREE_KUNDLI, ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }
    return {
      answer: "You can generate your accurate Vedic Janam Kundli 100% free using our online tool at **/kundli-generator**. It calculates your Lagna chart, planetary positions, Navamsha, and Nakshatras instantly. A comprehensive downloadable PDF Report is available for ₹501, or you can book a 1-on-1 chart consultation with Acharya Niraj Kumar for ₹1,051.",
      language: "en",
      intent: "free_tools",
      confidence: "high",
      actions: [ACTION_FREE_KUNDLI, ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
    };
  }

  // --------------------------------------------------------------------------
  // 10C. KUNDLI MILAN / HOROSCOPE MATCHING
  // --------------------------------------------------------------------------
  if (
    query.includes("matching") ||
    query.includes("milan") ||
    query.includes("gun milan") ||
    query.includes("compatibility") ||
    query.includes("shadi milan")
  ) {
    if (lang === "hi") {
      return {
        answer: "विवाह हेतु 36 गुण मिलान (Kundli Milan) आप हमारी वेबसाइट पर 100% मुफ़्त **/kundli-matching** पर कर सकते हैं। इसमें अष्टकूट मिलान, नाड़ी दोष, भकूट दोष और मंगल दोष का प्रारंभिक विश्लेषण मिलता है। विवाह संबंधी गहन मार्गदर्शन हेतु आचार्य जी से 1-on-1 परामर्श लें।",
        language: "hi",
        intent: "free_tools",
        confidence: "high",
        actions: [{ label: "Kundli Matching", url: "/kundli-matching", type: "secondary" }, ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }
    if (lang === "hinglish") {
      return {
        answer: "Marriage ke liye 36 Guna Kundli Milan aap hamari website par 100% free **/kundli-matching** par check kar sakte hain. Isme Ashta-Koot score, Nadi Dosha, aur Manglik analysis shamil hai. In-depth marriage consultation ke liye Acharya ji ke sath slot book karein.",
        language: "hinglish",
        intent: "free_tools",
        confidence: "high",
        actions: [{ label: "Kundli Matching", url: "/kundli-matching", type: "secondary" }, ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
      };
    }
    return {
      answer: "You can check 36 Guna Kundli Milan (marriage compatibility) 100% free at **/kundli-matching**. It evaluates Ashta-Koot points, Nadi Dosha, Bhakoot Dosha, and Mangal Dosha. For personalized marital harmony analysis, you can book a consultation with Acharya Niraj Kumar.",
      language: "en",
      intent: "free_tools",
      confidence: "high",
      actions: [{ label: "Kundli Matching", url: "/kundli-matching", type: "secondary" }, ACTION_BOOK_ASTRO, ACTION_WHATSAPP],
    };
  }

  // --------------------------------------------------------------------------
  // 10D. DAILY HOROSCOPE / RASHIFAL
  // --------------------------------------------------------------------------
  if (
    query.includes("rashifal") ||
    query.includes("horoscope") ||
    query.includes("rashi")
  ) {
    if (lang === "hi") {
      return {
        answer: "सभी 12 राशियों का आज का वैदिक राशिफल आप हमारी वेबसाइट पर **/horoscope** पर प्रतिदिन पढ़ सकते हैं। व्यक्तिगत ग्रहों की दशा और गोचर के सटीक विश्लेषण हेतु आप आचार्य नीरज कुमार जी से परामर्श ले सकते हैं।",
        language: "hi",
        intent: "free_tools",
        confidence: "high",
        actions: [{ label: "Daily Rashifal", url: "/horoscope", type: "secondary" }, ACTION_BOOK_ASTRO],
      };
    }
    if (lang === "hinglish") {
      return {
        answer: "Sabhi 12 zodiac signs ka daily Vedic Rashifal aap hamari website par **/horoscope** par read kar sakte hain. Personal planetary dashas aur transits ke detailed analysis ke liye Acharya Niraj Kumar ji se consult karein.",
        language: "hinglish",
        intent: "free_tools",
        confidence: "high",
        actions: [{ label: "Daily Rashifal", url: "/horoscope", type: "secondary" }, ACTION_BOOK_ASTRO],
      };
    }
    return {
      answer: "You can read your daily Vedic Horoscope for all 12 zodiac signs 100% free at **/horoscope**. For personal transit and planetary dasha analysis specific to your exact chart, you can book a session with Acharya Niraj Kumar.",
      language: "en",
      intent: "free_tools",
      confidence: "high",
      actions: [{ label: "Daily Horoscope", url: "/horoscope", type: "secondary" }, ACTION_BOOK_ASTRO],
    };
  }

  // --------------------------------------------------------------------------
  // 10E. GENERAL FREE TOOLS SUITE
  // --------------------------------------------------------------------------
  if (
    query.includes("kundli") ||
    query.includes("kundali") ||
    query.includes("calculator") ||
    query.includes("tool") ||
    query.includes("tools") ||
    query.includes("free")
  ) {
    if (lang === "hi") {
      return {
        answer: "आप हमारी वेबसाइट पर निम्नलिखित वैदिक साधन 100% मुफ़्त उपयोग कर सकते हैं:\n\n• **मुफ़्त जन्म कुंडली निर्माण:** /kundli-generator\n• **36 गुण कुंडली मिलान (Kundli Milan):** /kundli-matching\n• **आज का पंचांग (सूर्योदय, तिथि, नक्षत्र, राहुकाल):** /panchang\n• **दैनिक राशिफल (12 राशियां):** /horoscope\n• **अंक ज्योतिष व चंद्र राशि कैलकुलेटर:** /numerology-calculator",
        language: "hi",
        intent: "free_tools",
        confidence: "high",
        actions: [ACTION_FREE_KUNDLI, ACTION_PANCHANG, ACTION_BOOK_ASTRO],
      };
    }

    if (lang === "hinglish") {
      return {
        answer: "Aap hamari website par ye sabhi Vedic tools 100% FREE use kar sakte hain:\n\n• **Free Janam Kundli Generator:** /kundli-generator\n• **36 Gun Kundli Milan (Horoscope Matching):** /kundli-matching\n• **Aaj Ka Hindu Panchang (Tithi, Nakshatra, Rahukaal):** /panchang\n• **Daily Rashifal (12 Rashi):** /horoscope\n• **Ank Jyotish & Moon Sign Calculator:** /numerology-calculator",
        language: "hinglish",
        intent: "free_tools",
        confidence: "high",
        actions: [ACTION_FREE_KUNDLI, ACTION_PANCHANG, ACTION_BOOK_ASTRO],
      };
    }

    return {
      answer: "You can access the following authentic Vedic tools 100% FREE on our website:\n\n• **Free Janam Kundli Generator:** /kundli-generator\n• **Kundli Milan (36 Guna Horoscope Matching):** /kundli-matching\n• **Daily Hindu Panchang (Tithi, Nakshatra, Rahukaal):** /panchang\n• **Daily Horoscope (All 12 Zodiac Signs):** /horoscope\n• **Moon Sign & Numerology Calculators:** /moon-sign-calculator",
      language: "en",
      intent: "free_tools",
      confidence: "high",
      actions: [ACTION_FREE_KUNDLI, ACTION_PANCHANG, ACTION_BOOK_ASTRO],
    };
  }

  // --------------------------------------------------------------------------
  // 11. PERSONAL FUTURE PREDICTION / CHART ANALYSIS INQUIRY
  // (e.g. "Meri shadi kab hogi?", "Job kab lagegi?", "Will I get married?", "Bhavishya batao")
  // --------------------------------------------------------------------------
  if (
    query.includes("shadi") ||
    query.includes("vivah") ||
    query.includes("marriage") ||
    query.includes("naukri") ||
    query.includes("job") ||
    query.includes("career") ||
    query.includes("future") ||
    query.includes("bhavishya") ||
    query.includes("batao") ||
    query.includes("pata chalega") ||
    query.includes("meri kundli") ||
    query.includes("pariwar") ||
    query.includes("divorce") ||
    query.includes("relationship")
  ) {
    if (lang === "hi") {
      return {
        answer: "व्यक्तिगत जीवन, विवाह, करियर या स्वास्थ्य संबंधी सटीक भविष्यवाणी के लिए आपकी जन्म कुंडली के ग्रहों की डिग्री, नवमांश (D9), और विंशोत्तरी महादशा-अंतर्दशा की गहन गणना आवश्यक होती है।\n\nAI द्वारा बिना पूर्ण कुंडली गणना के भविष्य बताना भ्रामक हो सकता है। आचार्य नीरज कुमार जी के साथ 1-on-1 सीधा परामर्श (मात्र ₹1,051/- प्रथम सत्र) बुक करें या WhatsApp पर अपनी जन्म तिथि, समय और स्थान साझा करें।",
        language: "hi",
        intent: "personal_prediction_handoff",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP, ACTION_CALL],
      };
    }

    if (lang === "hinglish") {
      return {
        answer: "Personal life, marriage, career ya future se jude sawalon ke sahi jawab ke liye aapki Janam Kundli ki exact planetary degrees, D9 Navamsha chart aur Vimshottari Dasha ki mathematical calculation zaroori hoti hai.\n\nAI bina poori kundli dekhe andaza nahi lagata. Sahi aur pramanit guidance ke liye aap Acharya Niraj Kumar ji ke sath 1-on-1 consultation (50% Off par ₹1,051) book kar sakte hain ya WhatsApp par apni birth details share kar sakte hain.",
        language: "hinglish",
        intent: "personal_prediction_handoff",
        confidence: "high",
        actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP, ACTION_CALL],
      };
    }

    return {
      answer: "Accurate predictions regarding your marriage, career, finances, or personal life require precise mathematical calculations of your Lagna chart, planetary degrees, D9 Navamsha, and current Vimshottari Dasha.\n\nAutomated AI cannot guess personal chart outcomes responsibly. For authentic Vedic guidance, book a 1-on-1 direct session with Acharya Niraj Kumar (₹1,051 first-booking offer) or connect directly on WhatsApp with your birth details.",
      language: "en",
      intent: "personal_prediction_handoff",
      confidence: "high",
      actions: [ACTION_BOOK_ASTRO, ACTION_WHATSAPP, ACTION_CALL],
    };
  }

  // --------------------------------------------------------------------------
  // 12. FALLBACK / OUT OF SCOPE
  // "A confident wrong answer is worse than saying I don't know"
  // --------------------------------------------------------------------------
  if (lang === "hi") {
    return {
      answer: "मुझे इस विशेष विषय पर हमारी वेबसाइट के प्रमाणित डेटा में निश्चित जानकारी नहीं मिली। गलत या मनगढ़ंत उत्तर देने से बेहतर है कि मैं आपको सीधे आचार्य नीरज कुमार जी या हमारी सहायता टीम से जोड़ दूँ।\n\nआप सीधे WhatsApp पर संदेश भेज सकते हैं या हमारे परामर्श विकल्प देख सकते हैं:",
      language: "hi",
      intent: "fallback_safe",
      confidence: "fallback",
      actions: [ACTION_WHATSAPP, ACTION_BOOK_ASTRO, ACTION_CALL],
    };
  }

  if (lang === "hinglish") {
    return {
      answer: "Mujhe is vishay par hamari website ke verified data mein accurate jaankari nahi mili. Galat ya confusing answer dene se behtar hai ki main aapko seedhe Acharya Niraj Kumar ji aur hamari support team se connect kar doon.\n\nAap directly WhatsApp par pooch sakte hain ya consultation book kar sakte hain:",
      language: "hinglish",
      intent: "fallback_safe",
      confidence: "fallback",
      actions: [ACTION_WHATSAPP, ACTION_BOOK_ASTRO, ACTION_CALL],
    };
  }

  return {
    answer: "I do not have verified information on that specific question in this website's knowledge base. Rather than providing an inaccurate answer, I recommend connecting directly with Acharya Niraj Kumar or our support team:\n\nYou can chat with us on WhatsApp, call directly, or book a consultation below:",
    language: "en",
    intent: "fallback_safe",
    confidence: "fallback",
    actions: [ACTION_WHATSAPP, ACTION_BOOK_ASTRO, ACTION_CALL],
  };
}
