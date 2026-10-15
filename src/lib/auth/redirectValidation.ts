/**
 * Redirect URL Security Validator
 *
 * Strictly ensures redirect targets are safe, internal relative paths starting
 * with a single forward slash.
 * Disallows external URLs, protocol evasion, scheme evasion (//), and login loops.
 */
export function validateRedirectUrl(
  rawUrl: string | null | undefined,
  defaultUrl: string = "/account"
): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return defaultUrl;
  }

  const trimmed = rawUrl.trim();

  // Must start with exactly one '/' and NOT '//' or '/\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return defaultUrl;
  }

  // Must not contain URL scheme / protocol markers (e.g. http:, https:, javascript:, data:)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return defaultUrl;
  }

  // Must not contain backslashes (Windows path / URL parser evasion)
  if (trimmed.includes("\\")) {
    return defaultUrl;
  }

  // Prevent recursive authentication loops
  const pathOnly = trimmed.split("?")[0].toLowerCase();
  if (pathOnly === "/login" || pathOnly === "/signup") {
    return defaultUrl;
  }

  return trimmed;
}
