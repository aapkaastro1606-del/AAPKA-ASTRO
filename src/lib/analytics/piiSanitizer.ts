/**
 * PII Sanitizer for Privacy-Preserving Analytics
 *
 * Rule: NEVER put an email, phone number, UTR, personal name,
 * or booking reference into a URL or analytics event.
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// 12-digit UPI reference / UTR numbers (Must be processed BEFORE phone numbers to avoid partial match)
const UTR_REGEX = /\b\d{12}\b/g;

// Booking references: ASTRO-123456, VAASTU-123456, BOOK-123456
const BOOKING_REF_REGEX = /\b(?:ASTRO|VAASTU|BOOK|KUNDLI)-[A-Z0-9_-]+\b/gi;

// Indian phone numbers: +91 93112 15564, 9876543210, etc.
const INDIAN_PHONE_REGEX = /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|(?:\+?91[\s-]?)?[6-9]\d{9}\b/g;

// Standard US/International phone formats: (123) 456-7890, 123-456-7890
const GENERAL_PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

// Sensitive keys to completely strip from event payload objects
const SENSITIVE_KEYS = new Set([
  "email",
  "useremail",
  "clientemail",
  "phone",
  "userphone",
  "clientphone",
  "mobile",
  "phonenumber",
  "telephone",
  "utr",
  "utrnumber",
  "paymentreference",
  "transactionid",
  "name",
  "username",
  "clientname",
  "fullname",
  "firstname",
  "lastname",
  "seekername",
  "bookingid",
  "bookingreference",
  "dob",
  "birthdate",
  "timeofbirth",
  "placeofbirth",
  "birthplace",
  "latitude",
  "longitude",
  "password",
  "token",
  "secret",
  "screenshot",
  "screenshoturl",
  "address",
]);

/**
 * Sanitizes a string value by redacting any sensitive patterns.
 */
export function sanitizeString(value: string): string {
  if (!value || typeof value !== "string") return value;

  return value
    .replace(EMAIL_REGEX, "[REDACTED_EMAIL]")
    .replace(UTR_REGEX, "[REDACTED_UTR]")
    .replace(BOOKING_REF_REGEX, "[REDACTED_REF]")
    .replace(INDIAN_PHONE_REGEX, "[REDACTED_PHONE]")
    .replace(GENERAL_PHONE_REGEX, "[REDACTED_PHONE]");
}

/**
 * Strips PII from URLs (including search parameters that might leak emails or names).
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") return url;

  try {
    const parsed = new URL(url, "https://www.aapkaastro.com");
    const safeSearchParams = new URLSearchParams();

    parsed.searchParams.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (!SENSITIVE_KEYS.has(lowerKey)) {
        safeSearchParams.set(key, sanitizeString(val));
      }
    });

    const queryString = safeSearchParams.toString();
    const cleanPath = sanitizeString(parsed.pathname);
    return queryString ? `${cleanPath}?${queryString}` : cleanPath;
  } catch {
    return sanitizeString(url);
  }
}

/**
 * Deeply sanitizes an event params object:
 * 1. Removes any key known to carry PII (name, phone, email, UTR, bookingId, etc.)
 * 2. Scans all string values and redacts any matching patterns.
 */
export function sanitizeEventParams<T extends Record<string, any>>(params?: T): Record<string, any> {
  if (!params || typeof params !== "object") {
    return {};
  }

  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();

    // 1. Strip sensitive keys
    if (SENSITIVE_KEYS.has(lowerKey)) {
      continue;
    }

    // 2. Sanitize value types
    if (typeof value === "string") {
      clean[key] = sanitizeString(value);
    } else if (typeof value === "number" || typeof value === "boolean") {
      clean[key] = value;
    } else if (Array.isArray(value)) {
      clean[key] = value.map((item) =>
        typeof item === "string" ? sanitizeString(item) : item
      );
    } else if (value && typeof value === "object") {
      clean[key] = sanitizeEventParams(value);
    }
  }

  return clean;
}
