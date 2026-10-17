import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  safeExternalCall,
  isChatbotEnabled,
  isEmailEnabled,
  isReelsEnabled,
} from "../src/lib/utils/resilience";
import {
  LocationService,
  NominatimLocationProvider,
  GoogleLocationProvider,
  MockLocationProvider,
  resolveDefaultProvider,
} from "../src/lib/services/locationService";
import {
  kundliCalcRateLimiter,
  locationSearchRateLimiter,
  kundliLeadRateLimiter,
  publicChatRateLimiter,
} from "../src/lib/security/rateLimiter";
import { BookingEmailService } from "../src/lib/services/bookingEmailService";

describe("Graceful Degradation & Kill Switch Suite", () => {
  const originalEnv = { ...process.env };

  test("kill switches enforce default-safe contracts", () => {
    try {
      // 1. CHATBOT_ENABLED kill switch
      process.env.CHATBOT_ENABLED = "false";
      assert.strictEqual(isChatbotEnabled(), false);
      process.env.CHATBOT_ENABLED = "true";
      assert.strictEqual(isChatbotEnabled(), true);

      // 2. EMAIL_ENABLED default-safe on preview
      delete process.env.EMAIL_ENABLED;
      process.env.VERCEL_ENV = "preview";
      assert.strictEqual(isEmailEnabled(), false, "Preview must default EMAIL_ENABLED to false");

      process.env.VERCEL_ENV = "production";
      process.env.NODE_ENV = "production";
      process.env.EMAIL_ENABLED = "true";
      assert.strictEqual(isEmailEnabled(), true);

      process.env.EMAIL_ENABLED = "false";
      assert.strictEqual(isEmailEnabled(), false);

      // 3. REELS_ENABLED kill switch
      process.env.REELS_ENABLED = "false";
      assert.strictEqual(isReelsEnabled(), false);
      process.env.REELS_ENABLED = "true";
      assert.strictEqual(isReelsEnabled(), true);
    } finally {
      process.env = { ...originalEnv };
    }
  });

  test("safeExternalCall resolves within timeout and recovers with fallback on failure or timeout", async () => {
    // Case A: Successful call resolves normally
    const successResult = await safeExternalCall({
      name: "Test Normal Call",
      timeoutMs: 5000,
      fallback: "fallback_value",
      fn: async () => "success_value",
    });
    assert.strictEqual(successResult, "success_value");

    // Case B: Exception in external call gracefully invokes fallback
    const exceptionResult = await safeExternalCall({
      name: "Test Failing Call",
      timeoutMs: 5000,
      fallback: "recovered_fallback",
      fn: async () => {
        throw new Error("Simulated network outage");
      },
    });
    assert.strictEqual(exceptionResult, "recovered_fallback");

    // Case C: Hanging call times out and recovers via fallback
    const startTime = Date.now();
    const timeoutResult = await safeExternalCall({
      name: "Test Hanging Call",
      timeoutMs: 5000, // min bound is 5000ms
      fallback: "timeout_fallback",
      fn: async () => {
        await new Promise((r) => setTimeout(r, 7000));
        return "too_late";
      },
    });
    const duration = Date.now() - startTime;
    assert.strictEqual(timeoutResult, "timeout_fallback");
    assert.ok(duration >= 4800 && duration <= 6500, `Duration ${duration}ms should be around 5000ms`);
  });

  test("geocoding service provides swappable providers and built-in city fallback", async () => {
    const initialProvider = (LocationService as any).provider;
    try {
      // 1. Swappable provider resolution
      process.env.GEOCODER_PROVIDER = "google";
      process.env.GEOCODER_API_KEY = "test_key_12345";
      const googleProvider = resolveDefaultProvider();
      assert.strictEqual(googleProvider.name, "Google Geocoding API");

      process.env.GEOCODER_PROVIDER = "mock";
      const mockProvider = resolveDefaultProvider();
      assert.strictEqual(mockProvider.name, "Mock / Fast-Path Geocoder");

      process.env.GEOCODER_PROVIDER = "nominatim";
      const nominatimProvider = resolveDefaultProvider();
      assert.strictEqual(nominatimProvider.name, "OpenStreetMap Nominatim");

      // 2. Fast-path search returns known city with coordinates and timezone
      const delhiMatches = await LocationService.search("Delhi", 5);
      assert.ok(delhiMatches.length > 0);
      assert.strictEqual(delhiMatches[0].name, "New Delhi");
      assert.strictEqual(delhiMatches[0].timezone, 5.5);

      // 3. Fallback behavior when geocoder is unreachable
      LocationService.setProvider({
        name: "Failing Geocoder",
        search: async () => {
          throw new Error("Downstream 503 Service Unavailable");
        },
      });

      const fallbackResult = await LocationService.searchWithStatus("Varanasi", 5);
      assert.ok(fallbackResult.locations.length > 0);
      // Varanasi is in built-in list
      assert.strictEqual(fallbackResult.locations[0].name, "Varanasi");
      assert.strictEqual(fallbackResult.isFallback, true); // Fell back to built-in list
      assert.ok(fallbackResult.warning?.includes("Geocoding service unavailable"));

      // Unmatched query falling back gracefully
      const unknownResult = await LocationService.searchWithStatus("UnknownVillageXYZ", 5);
      assert.strictEqual(unknownResult.isFallback, true);
      assert.ok(unknownResult.warning?.includes("Geocoding service unavailable"));
      assert.ok(unknownResult.locations.length > 0);
    } finally {
      process.env = { ...originalEnv };
      if (initialProvider) {
        LocationService.setProvider(initialProvider);
      }
    }
  });

  test("rate limiters on heavy public endpoints enforce thresholds", () => {
    const testIp = `test-ip-${Date.now()}`;

    // Kundli calculation: max 20 requests
    for (let i = 0; i < 20; i++) {
      const check = kundliCalcRateLimiter.check(testIp);
      assert.strictEqual(check.allowed, true);
    }
    const kundliBlocked = kundliCalcRateLimiter.check(testIp);
    assert.strictEqual(kundliBlocked.allowed, false, "21st Kundli calculation must be blocked");

    // Location search: max 60 requests
    for (let i = 0; i < 60; i++) {
      const check = locationSearchRateLimiter.check(testIp);
      assert.strictEqual(check.allowed, true);
    }
    const locationBlocked = locationSearchRateLimiter.check(testIp);
    assert.strictEqual(locationBlocked.allowed, false, "61st location search must be blocked");

    // Kundli lead submission: max 10 requests
    for (let i = 0; i < 10; i++) {
      const check = kundliLeadRateLimiter.check(testIp);
      assert.strictEqual(check.allowed, true);
    }
    const leadBlocked = kundliLeadRateLimiter.check(testIp);
    assert.strictEqual(leadBlocked.allowed, false, "11th lead submission must be blocked");
  });

  test("email delivery failure never blocks booking and records simulated/failed status", async () => {
    try {
      // Simulate Preview environment with EMAIL_ENABLED disabled
      process.env.VERCEL_ENV = "preview";
      delete process.env.EMAIL_ENABLED;

      const result = await (BookingEmailService as any).dispatchResendEmail({
        to: "seeker@test.com",
        subject: "Your Booking Confirmation",
        html: "<p>Booking confirmed</p>",
        text: "Booking confirmed",
        templateName: "BookingConfirmation",
        bookingId: "TEST-BK-001",
      });

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.simulated, true);
      assert.ok(result.error?.includes("EMAIL_KILL_SWITCH") || result.error?.includes("disabled"));
    } finally {
      process.env = { ...originalEnv };
    }
  });
});
