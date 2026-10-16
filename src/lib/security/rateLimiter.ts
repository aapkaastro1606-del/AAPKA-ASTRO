/**
 * ============================================================================
 * SLIDING-WINDOW RATE LIMITER
 * ============================================================================
 * Protects OTP generation and login verification endpoints against brute-force
 * and SMS-flooding attacks. Employs an in-memory sliding log with timestamp buckets.
 */

interface RateLimitRecord {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMinutes: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMinutes * 60 * 1000;
  }

  public check(key: string): { allowed: boolean; remaining: number; resetTimeMs: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Filter out expired timestamps
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldest = record.timestamps[0];
      const resetTimeMs = oldest + this.windowMs - now;
      return {
        allowed: false,
        remaining: 0,
        resetTimeMs: Math.max(0, resetTimeMs),
      };
    }

    // Record this attempt
    record.timestamps.push(now);

    return {
      allowed: true,
      remaining: this.maxRequests - record.timestamps.length,
      resetTimeMs: this.windowMs,
    };
  }

  public reset(key: string): void {
    this.store.delete(key);
  }
}

// Global Singletons for OTP endpoints
// Max 3 OTP sends per phone number per 10 minutes
export const otpSendRateLimiter = new SlidingWindowRateLimiter(3, 10);

// Max 5 OTP verification attempts per phone number per 10 minutes
export const otpVerifyRateLimiter = new SlidingWindowRateLimiter(5, 10);

// Heavy Public Endpoint Rate Limiters (1-minute sliding window)
export const kundliCalcRateLimiter = new SlidingWindowRateLimiter(20, 1);
export const locationSearchRateLimiter = new SlidingWindowRateLimiter(60, 1);
export const kundliLeadRateLimiter = new SlidingWindowRateLimiter(10, 1);
export const publicChatRateLimiter = new SlidingWindowRateLimiter(30, 1);
