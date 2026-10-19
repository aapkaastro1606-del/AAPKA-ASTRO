/**
 * ==============================================================================
 * AAPKA ASTRO — EXTERNAL CALL RESILIENCE & KILL SWITCH UTILITIES
 * ==============================================================================
 * Guarantees that no external service (Database, Resend, AI Provider, Cloudflare R2,
 * Geocoder, or Instagram) can hang or crash a page request.
 *
 * Operational Contracts:
 * 1. External Call Timeout: 5 to 8 seconds (default: 6,000ms).
 * 2. Try/Catch Fallback: Returns deterministic fallback data and logs a structured error.
 * 3. Kill Switches (default safe):
 *    - CHATBOT_ENABLED: Disables AI assistant when false.
 *    - EMAIL_ENABLED: Default safe — false on Vercel preview so previews never email real users.
 *    - REELS_ENABLED: Disables dynamic Instagram media fetching when false.
 * ==============================================================================
 */

export interface ExternalCallOptions<T> {
  name: string;
  timeoutMs?: number; // Bounds: 5000ms - 8000ms (default 6000ms)
  fallback: T | (() => T | Promise<T>);
  fn: (signal?: AbortSignal) => Promise<T>;
}

export async function safeExternalCall<T>(options: ExternalCallOptions<T>): Promise<T> {
  const timeoutMs = Math.min(8000, Math.max(5000, options.timeoutMs ?? 6000));
  const controller = new AbortController();

  let timeoutId: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`[EXTERNAL TIMEOUT] ${options.name} timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([options.fn(controller.signal), timeoutPromise]);
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (err: any) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error(
      `🚨 [GRACEFUL DEGRADATION] External dependency failure in '${options.name}':`,
      err?.message || err
    );

    if (typeof options.fallback === "function") {
      try {
        return await (options.fallback as () => T | Promise<T>)();
      } catch (fallbackErr: any) {
        console.error(
          `🚨 [FALLBACK FAILURE] Fallback function for '${options.name}' failed:`,
          fallbackErr?.message || fallbackErr
        );
        throw fallbackErr;
      }
    }

    return options.fallback;
  }
}

/**
 * Kill switch evaluations with default-safe behavior.
 */
export function isChatbotEnabled(): boolean {
  if (process.env.CHATBOT_ENABLED === "false") {
    return false;
  }
  return true;
}

export function isEmailEnabled(): boolean {
  // Explicit override takes precedence
  if (process.env.EMAIL_ENABLED === "false") {
    return false;
  }
  if (process.env.EMAIL_ENABLED === "true") {
    return true;
  }

  // DEFAULT SAFE ON PREVIEW: Previews must NEVER email real users!
  const isVercelPreview =
    process.env.VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

  if (isVercelPreview) {
    return false;
  }

  // In test environment, default to false unless explicitly configured
  if (process.env.NODE_ENV === "test") {
    return false;
  }

  return true;
}

export function isReelsEnabled(): boolean {
  if (process.env.REELS_ENABLED === "false") {
    return false;
  }
  return true;
}
