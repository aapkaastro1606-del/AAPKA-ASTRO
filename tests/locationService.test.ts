import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  LocationService,
  resolveTimezone,
  getTimezoneOffsetHours,
  LocationProvider,
  LocationResult,
} from "../src/lib/services/locationService";

describe("Universal LocationService & Worldwide Geocoding", () => {
  test("resolves high-frequency Indian towns (e.g. Noida, Gurugram, Ayodhya) via fast-path cache", async () => {
    const results = await LocationService.search("Noida", 5);
    assert.ok(results.length > 0, "Should return results for Noida");
    const noida = results[0];
    assert.equal(noida.name, "Noida");
    assert.equal(noida.countryCode, "IN");
    assert.equal(noida.timezone, 5.5);
    assert.equal(noida.timezoneId, "Asia/Kolkata");
    assert.ok(Math.abs(noida.latitude - 28.5355) < 0.1);
    assert.ok(Math.abs(noida.longitude - 77.391) < 0.1);
  });

  test("resolves international locations (e.g. London, New York, Tokyo, Dubai)", async () => {
    const londonResults = await LocationService.search("London", 5);
    assert.ok(londonResults.length > 0, "Should return results for London");
    const london = londonResults.find((l) => l.countryCode === "GB") || londonResults[0];
    assert.equal(london.name, "London");
    assert.ok(Math.abs(london.latitude - 51.5) < 0.5);

    const nyResults = await LocationService.search("New York", 5);
    assert.ok(nyResults.length > 0, "Should return results for New York");
    const ny = nyResults.find((l) => l.countryCode === "US") || nyResults[0];
    assert.equal(ny.name, "New York");
    assert.equal(ny.countryCode, "US");
    assert.equal(ny.timezoneId, "America/New_York");
  });

  test("accurately calculates IANA timezones and UTC offsets worldwide with resolveTimezone()", () => {
    // 1. India (Noida)
    const inTz = resolveTimezone(28.5355, 77.391);
    assert.equal(inTz.timezoneId, "Asia/Kolkata");
    assert.equal(inTz.offset, 5.5);

    // 2. Nepal (Kathmandu - fractional 5:45 offset)
    const npTz = resolveTimezone(27.7172, 85.324);
    assert.equal(npTz.timezoneId, "Asia/Kathmandu");
    assert.equal(npTz.offset, 5.75);

    // 3. UAE (Dubai - +4 offset)
    const aeTz = resolveTimezone(25.2048, 55.2708);
    assert.equal(aeTz.timezoneId, "Asia/Dubai");
    assert.equal(aeTz.offset, 4.0);

    // 4. Japan (Tokyo - +9 offset)
    const jpTz = resolveTimezone(35.6762, 139.6503);
    assert.equal(jpTz.timezoneId, "Asia/Tokyo");
    assert.equal(jpTz.offset, 9.0);
  });

  test("supports hot-swappable custom LocationProvider via LocationService.setProvider()", async () => {
    const originalProvider = (LocationService as any).provider;
    const originalProviderName = LocationService.getProviderName();

    const mockProvider: LocationProvider = {
      name: "Mock Enterprise Provider",
      async search(q: string): Promise<LocationResult[]> {
        return [
          {
            id: "custom-test-1",
            name: "Mock City",
            displayName: `Mock City (${q}), Testland`,
            country: "Testland",
            countryCode: "TL",
            latitude: 12.34,
            longitude: 56.78,
            timezone: 3.0,
            timezoneId: "UTC",
          },
        ];
      },
    };

    LocationService.setProvider(mockProvider);
    assert.equal(LocationService.getProviderName(), "Mock Enterprise Provider");

    const searchRes = await LocationService.search("customqueryxyz", 5);
    assert.ok(searchRes.length > 0);
    assert.equal(searchRes[0].name, "Mock City");

    // Reset back
    LocationService.setProvider(originalProvider);
    assert.equal(LocationService.getProviderName(), originalProviderName);
  });

  test("provides graceful fallback when user inputs unmatched place name", () => {
    const fb = LocationService.resolveFallback("Some Unknown Valley");
    assert.ok(fb);
    assert.ok(fb.latitude);
    assert.ok(fb.longitude);
  });
});
