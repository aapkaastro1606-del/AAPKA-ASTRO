import crypto from "crypto";

// Salt for hashing IPs to ensure one-way privacy (never stores raw IP)
const HASH_SALT = process.env.RATE_LIMIT_SALT || "aapka-astro-privacy-salt-2026";

export function hashIp(ip: string): string {
  return crypto
    .createHash("sha256")
    .update(`${ip}:${HASH_SALT}`)
    .digest("hex")
    .substring(0, 32);
}

interface WindowLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory counters (stores ONLY hashed strings and numeric counts)
const shortWindowLimits = new Map<string, WindowLimitEntry>(); // 15 msgs / 10 mins
const dailyWindowLimits = new Map<string, WindowLimitEntry>(); // 100 msgs / day

// Global daily cap tracking
let globalDailyCount = 0;
let globalDailyResetAt = getEndOfDayTimestamp();

function getEndOfDayTimestamp(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: "short_window" | "daily_user" | "daily_global";
  retryAfterSeconds?: number;
  friendlyMessage?: string;
  whatsappUrl?: string;
}

export function checkChatbotRateLimit(
  rawIp: string,
  sessionKey?: string
): RateLimitResult {
  const now = Date.now();
  const hashedIdentifier = hashIp(`${rawIp}:${sessionKey || "guest"}`);

  // 1. Check Global Daily Message Cap
  const configuredGlobalCap = parseInt(
    process.env.CHATBOT_DAILY_MESSAGE_CAP || "1000",
    10
  );

  if (now > globalDailyResetAt) {
    globalDailyCount = 0;
    globalDailyResetAt = getEndOfDayTimestamp();
  }

  if (globalDailyCount >= configuredGlobalCap) {
    const retryAfter = Math.ceil((globalDailyResetAt - now) / 1000);
    return {
      allowed: false,
      reason: "daily_global",
      retryAfterSeconds: retryAfter,
      friendlyMessage:
        "Hamara daily assistant query quota complete ho chuka hai. Kripya hamari support team se WhatsApp par seedha sampark karein.",
      whatsappUrl:
        "https://wa.me/919311215564?text=" +
        encodeURIComponent(
          "Namaste Acharya Ji, I would like to inquire about a consultation on Aapka Astro."
        ),
    };
  }

  // 2. Check 10-Minute Short Window Limit (15 messages / 10 minutes)
  const SHORT_WINDOW_MS = 10 * 60 * 1000;
  const SHORT_WINDOW_MAX = 15;

  let shortEntry = shortWindowLimits.get(hashedIdentifier);
  if (!shortEntry || now > shortEntry.resetAt) {
    shortEntry = { count: 0, resetAt: now + SHORT_WINDOW_MS };
    shortWindowLimits.set(hashedIdentifier, shortEntry);
  }

  if (shortEntry.count >= SHORT_WINDOW_MAX) {
    const retryAfter = Math.ceil((shortEntry.resetAt - now) / 1000);
    return {
      allowed: false,
      reason: "short_window",
      retryAfterSeconds: retryAfter,
      friendlyMessage:
        "Aapne pichhle 10 minute mein message limit reach kar li hai. Kripya thoda intezar karein ya turant WhatsApp par baat karein.",
      whatsappUrl:
        "https://wa.me/919311215564?text=" +
        encodeURIComponent(
          "Namaste Acharya Ji, I need urgent assistance regarding Aapka Astro consultation."
        ),
    };
  }

  // 3. Check 24-Hour Per-User Limit (100 messages / day)
  const DAILY_MAX = 100;

  let dailyEntry = dailyWindowLimits.get(hashedIdentifier);
  if (!dailyEntry || now > dailyEntry.resetAt) {
    dailyEntry = { count: 0, resetAt: getEndOfDayTimestamp() };
    dailyWindowLimits.set(hashedIdentifier, dailyEntry);
  }

  if (dailyEntry.count >= DAILY_MAX) {
    const retryAfter = Math.ceil((dailyEntry.resetAt - now) / 1000);
    return {
      allowed: false,
      reason: "daily_user",
      retryAfterSeconds: retryAfter,
      friendlyMessage:
        "Aapki aaj ki daily message limit poori ho chuki hai. Acharya Niraj Kumar ji se paramarsh hetu WhatsApp ya Call par connect karein.",
      whatsappUrl:
        "https://wa.me/919311215564?text=" +
        encodeURIComponent(
          "Namaste Acharya Ji, I have questions regarding Vedic Consultation on Aapka Astro."
        ),
    };
  }

  // Record allowed message
  shortEntry.count++;
  dailyEntry.count++;
  globalDailyCount++;

  return { allowed: true };
}

/**
 * Resets limits for testing purposes
 */
export function _resetRateLimitsForTesting(): void {
  shortWindowLimits.clear();
  dailyWindowLimits.clear();
  globalDailyCount = 0;
  globalDailyResetAt = getEndOfDayTimestamp();
}
