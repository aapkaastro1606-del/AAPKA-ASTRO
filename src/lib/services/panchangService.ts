/**
 * ============================================================================
 * VEDIC PANCHANG CALCULATION & GRAPHIC AGGREGATION SERVICE
 * ============================================================================
 * Delegates all astronomical computations to the unified Drik Ganita engine
 * (`computeRealtimePanchang` in `src/lib/astrology/realtimePanchang.ts`) and
 * integrates optional Instagram Panchang graphics and PostgreSQL caching.
 */

import { computeRealtimePanchang, PANCHANG_LOCATIONS } from "@/lib/astrology/realtimePanchang";
import { InstagramSyncService } from "./instagramSyncService";
import { prisma } from "@/lib/db/prisma";

export interface PanchangReport {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  samvat: {
    vikram: number;
    shaka: number;
    ayan: "Uttarayana" | "Dakshinayana";
    ritu: string;
    month: string;
    amantaMonth: string;
    purnimantaMonth: string;
    isAdhikaMasa: boolean;
    paksha: "Shukla" | "Krishna";
  };
  limbs: {
    tithi: { name: string; nameHindi: string; paksha: string; endsAt: string; nextTithi: string; anomaly: string };
    nakshatra: { name: string; nameHindi: string; pada: number; lord: string; endsAt: string; nextNakshatra: string };
    yoga: { name: string; nameHindi: string; nature: "Shubha" | "Ashubha"; endsAt: string; nextYoga: string };
    karana: { name: string; nameHindi: string; type: "Chara" | "Sthira"; endsAt: string; secondKarana: string; bhadraTiming: string };
    vara: { name: string; nameHindi: string; lord: string };
  };
  sunMoon: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    sunSign: string;
    moonSign: string;
    moonSignChange: string;
  };
  muhurat: {
    abhijit: string;
    amritKaal: string;
    brahmaMuhurat: string;
    vijayaMuhurat: string;
    rahuKaal: string;
    yamaganda: string;
    gulika: string;
    durmuhurat: string;
    varjyam: string;
  };
  choghadiya: Array<{
    period: string;
    name: string;
    type: "Amrit" | "Shubh" | "Labh" | "Char" | "Rog" | "Kaal" | "Udveg";
    auspicious: boolean;
  }>;
  nightChoghadiya: Array<{
    period: string;
    name: string;
    type: "Amrit" | "Shubh" | "Labh" | "Char" | "Rog" | "Kaal" | "Udveg";
    auspicious: boolean;
  }>;
  chandrabalam: ReturnType<typeof computeRealtimePanchang>["chandrabalam"];
  festivals: ReturnType<typeof computeRealtimePanchang>["festivals"];
  instagramGraphicUrl: string | null;
  source: "INSTAGRAM_GRAPHIC_AND_EPHEMERIS" | "PURE_CALCULATION_ENGINE";
}

export class PanchangService {
  /**
   * Generates a complete Panchang report for a given date and location
   */
  public static async getDailyPanchang(
    dateStr?: string,
    lat: number = 28.6139,
    lon: number = 77.209,
    cityId?: string
  ): Promise<PanchangReport> {
    // Match cityId or find nearest city in PANCHANG_LOCATIONS by lat/lon
    let resolvedCityId = cityId || "delhi";
    if (!cityId) {
      let bestDist = Infinity;
      for (const loc of PANCHANG_LOCATIONS) {
        const d = Math.hypot(loc.lat - lat, loc.lon - lon);
        if (d < bestDist) {
          bestDist = d;
          resolvedCityId = loc.id;
        }
      }
    }

    const rt = computeRealtimePanchang(resolvedCityId, dateStr);
    const today = rt.civilDateStr;
    const graphicUrl = await InstagramSyncService.getTodayPanchangGraphic(today);

    const report: PanchangReport = {
      date: today,
      dayOfWeek: rt.varaDetails.name,
      samvat: {
        vikram: rt.vikramSamvat,
        shaka: rt.shakaSamvat,
        ayan: rt.ayana,
        ritu: rt.ritu,
        month: rt.masa.purnimanta,
        amantaMonth: rt.masa.amanta,
        purnimantaMonth: rt.masa.purnimanta,
        isAdhikaMasa: rt.masa.isAdhikaMasa,
        paksha: rt.tithi.paksha.startsWith("Shukla") ? "Shukla" : "Krishna",
      },
      limbs: {
        tithi: {
          name: rt.tithi.name,
          nameHindi: rt.tithi.nameHindi,
          paksha: rt.tithi.paksha,
          endsAt: rt.tithi.endsAt,
          nextTithi: rt.tithi.nextTithi,
          anomaly: rt.tithi.anomaly,
        },
        nakshatra: {
          name: rt.nakshatra.name,
          nameHindi: rt.nakshatra.nameHindi,
          pada: rt.nakshatra.pada,
          lord: rt.nakshatra.lord,
          endsAt: rt.nakshatra.endsAt,
          nextNakshatra: rt.nakshatra.nextNakshatra,
        },
        yoga: {
          name: rt.yoga.name,
          nameHindi: rt.yoga.nameHindi,
          nature: rt.yoga.auspicious ? "Shubha" : "Ashubha",
          endsAt: rt.yoga.endsAt,
          nextYoga: rt.yoga.nextYoga,
        },
        karana: {
          name: rt.karana.name,
          nameHindi: rt.karana.nameHindi,
          type: rt.karana.type,
          endsAt: rt.karana.endsAt,
          secondKarana: rt.karana.secondKarana,
          bhadraTiming: rt.karana.bhadraTiming,
        },
        vara: {
          name: rt.varaDetails.name,
          nameHindi: rt.varaDetails.nameHindi,
          lord: rt.varaDetails.lord,
        },
      },
      sunMoon: {
        sunrise: rt.sunTimes.sunrise,
        sunset: rt.sunTimes.sunset,
        moonrise: rt.moonTimes.moonrise,
        moonset: rt.moonTimes.moonset,
        sunSign: rt.sunTimes.sunSign,
        moonSign: rt.moonTimes.moonSign,
        moonSignChange: rt.moonTimes.moonSignChange,
      },
      muhurat: {
        abhijit: rt.auspiciousTimings.abhijitMuhurat,
        amritKaal: rt.auspiciousTimings.amritKaal,
        brahmaMuhurat: rt.auspiciousTimings.brahmaMuhurat,
        vijayaMuhurat: rt.auspiciousTimings.vijayaMuhurat,
        rahuKaal: rt.inauspiciousTimings.rahuKaal,
        yamaganda: rt.inauspiciousTimings.yamaganda,
        gulika: rt.inauspiciousTimings.gulikaKaal,
        durmuhurat: rt.inauspiciousTimings.durMuhurat,
        varjyam: rt.inauspiciousTimings.varjyam,
      },
      choghadiya: rt.choghadiya.day.map((c) => ({
        period: c.period,
        name: c.name,
        type: c.name,
        auspicious: c.auspicious,
      })),
      nightChoghadiya: rt.choghadiya.night.map((c) => ({
        period: c.period,
        name: c.name,
        type: c.name,
        auspicious: c.auspicious,
      })),
      chandrabalam: rt.chandrabalam,
      festivals: rt.festivals,
      instagramGraphicUrl: graphicUrl,
      source: graphicUrl ? "INSTAGRAM_GRAPHIC_AND_EPHEMERIS" : "PURE_CALCULATION_ENGINE",
    };

    try {
      const entryDate = new Date(today);
      await prisma.panchangEntry.upsert({
        where: { date: entryDate },
        create: {
          date: entryDate,
          city: rt.city,
          tithi: report.limbs.tithi.name,
          nakshatra: report.limbs.nakshatra.name,
          yoga: report.limbs.yoga.name,
          karana: report.limbs.karana.name,
          sunrise: report.sunMoon.sunrise,
          sunset: report.sunMoon.sunset,
          rahuKaal: report.muhurat.rahuKaal,
          abhijitMuhurat: report.muhurat.abhijit,
          rawDataJson: report as any,
        },
        update: {
          tithi: report.limbs.tithi.name,
          nakshatra: report.limbs.nakshatra.name,
          yoga: report.limbs.yoga.name,
          karana: report.limbs.karana.name,
          sunrise: report.sunMoon.sunrise,
          sunset: report.sunMoon.sunset,
          rahuKaal: report.muhurat.rahuKaal,
          abhijitMuhurat: report.muhurat.abhijit,
          rawDataJson: report as any,
        },
      });
    } catch {
      // Graceful in-memory fallback when database is not running
    }

    return report;
  }
}
