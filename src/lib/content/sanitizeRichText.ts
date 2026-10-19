/**
 * Safe Rich Text Sanitizer
 * Limits formatting to headings, bold, italics, lists, and strictly validated links.
 * Prohibits raw HTML, scripts, frames, event handlers, and unauthorized URL protocols.
 * Links may ONLY be https, tel, mailto, or wa.me.
 */

const ALLOWED_PROTOCOLS = ["https://", "tel:", "mailto:", "https://wa.me/", "wa.me/"];

/**
 * Validates whether a URL uses an allowed protocol.
 */
export function isValidRichTextLink(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();

  // Explicitly block malicious URI schemes
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("file:")
  ) {
    return false;
  }

  return ALLOWED_PROTOCOLS.some((proto) => trimmed.startsWith(proto));
}

/**
 * Normalizes link href, ensuring wa.me links are formatted as full https://wa.me/
 */
export function normalizeLinkHref(url: string): string {
  const trimmed = url.trim();
  if (trimmed.toLowerCase().startsWith("wa.me/")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Sanitizes rich text HTML string for safe rendering and storage.
 * Works uniformly in both server-side Node.js and browser environments.
 */
export function sanitizeRichText(html: string): string {
  if (!html || typeof html !== "string") return "";

  // 1. Strip all script tags and their inner content
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 2. Strip all style tags and their inner content
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // 3. Strip iframes, objects, embeds, forms
  cleaned = cleaned.replace(/<(iframe|object|embed|applet|form|input|button|meta|link)\b[^>]*>/gi, "");
  cleaned = cleaned.replace(/<\/(iframe|object|embed|applet|form|input|button|meta|link)>/gi, "");

  // 4. Strip inline event handlers (e.g. onclick, onerror, onload, onmouseover)
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(["'][^"']*['"]|[^\s>]+)/gi, "");

  // 5. Transform and validate <a> tags
  cleaned = cleaned.replace(/<a\b([^>]*)>(.*?)<\/a>/gi, (match, attrs, innerText) => {
    const hrefMatch = attrs.match(/href\s*=\s*(["'])(.*?)\1/i);
    if (!hrefMatch) {
      return innerText; // Remove link if no href
    }

    const rawHref = hrefMatch[2].trim();
    if (!isValidRichTextLink(rawHref)) {
      // Unallowed protocol (e.g. javascript:, http:, etc.) -> render as plain text
      return innerText;
    }

    const safeHref = normalizeLinkHref(rawHref);
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="text-amber-800 underline hover:text-amber-900">${innerText}</a>`;
  });

  // 6. Whitelist allowed formatting tags:
  // Allowed: p, br, b, strong, i, em, u, h3, h4, h5, h6, ul, ol, li, a (already handled)
  cleaned = cleaned.replace(/<\/?([a-z0-9]+)\b([^>]*)>/gi, (tag, tagName, attrs) => {
    const lowerTag = tagName.toLowerCase();
    const safeTags = ["p", "br", "b", "strong", "i", "em", "u", "h3", "h4", "h5", "h6", "ul", "ol", "li", "a"];
    if (!safeTags.includes(lowerTag)) {
      return ""; // Strip any disallowed tag
    }
    // For non-anchor tags, strip all attributes to prevent style injection
    if (lowerTag === "a") {
      return tag; // Anchor tag already sanitized above
    }
    if (tag.startsWith("</")) {
      return `</${lowerTag}>`;
    }
    return `<${lowerTag}>`;
  });

  return cleaned.trim();
}
