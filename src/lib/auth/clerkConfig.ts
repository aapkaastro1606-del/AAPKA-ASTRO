/**
 * Clerk Configuration Validator & Key Resolver
 *
 * Provides safe resolution for Clerk publishable keys and configuration states.
 * Automatically safeguards against invalid placeholders and prevents misconfigured
 * live keys (such as keys pinned strictly to viar.in) from crashing on other hosts.
 */
export const DEFAULT_CLERK_PUBLISHABLE_KEY =
  "pk_test_cHJvZm91bmQtY2ljYWRhLTk2OTQuY2xlcmsuYWNjb3VudHMuZGV2JA";

export function getClerkPublishableKey(): string {
  const envKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (
    !envKey ||
    envKey.includes("change_in_production") ||
    envKey === "pk_test_placeholder" ||
    envKey === "pk_live_Y2xlcmsudmlhci5pbiQ"
  ) {
    return DEFAULT_CLERK_PUBLISHABLE_KEY;
  }
  return envKey;
}

export const isClerkConfigured = (): boolean => {
  const key = getClerkPublishableKey();
  if (!key) return false;
  return key.startsWith("pk_test_") || key.startsWith("pk_live_");
};
