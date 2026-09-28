import { NextRequest, NextResponse } from "next/server";
import { PanchangService } from "@/lib/services/panchangService";
import {
  getPanchangForCity,
  getPanchangCacheStats,
} from "@/lib/store/panchangStore";
import { DailyHoroscopeService, ZODIAC_SIGNS } from "@/lib/astrology/dailyHoroscope";
import { prisma } from "@/lib/db/prisma";

export interface AutomationRunReport {
  timestamp: string;
  executionDate: string;
  tomorrowDate: string;
  panchangStatus: "SUCCESS" | "FALLBACK" | "FAILED";
  horoscopeStatus: "SUCCESS" | "FALLBACK" | "FAILED";
  prewarmedCities: string[];
  panchangSummary?: {
    tithi: string;
    tithiHindi: string;
    nakshatra: string;
    nakshatraHindi: string;
    yoga: string;
    karana: string;
    sunrise: string;
    sunset: string;
  };
  signsCalculatedCount: number;
  signDaysPrewarmedCount: number;
  databasePersisted: boolean;
  readDependencyMode: "DETERMINISTIC_CACHE_WITH_ON_DEMAND_FALLBACK";
  cacheTelemetry: {
    panchang: ReturnType<typeof getPanchangCacheStats>;
    horoscope: ReturnType<typeof DailyHoroscopeService.getCacheStats>;
  };
  errors: string[];
}

let lastAutomationReport: AutomationRunReport | null = null;

const PREWARM_CITIES = [
  "delhi",
  "mumbai",
  "varanasi",
  "ujjain",
  "bengaluru",
  "kolkata",
  "london",
  "newyork",
];

export async function GET(req: NextRequest) {
  const errors: string[] = [];
  const now = new Date();
  const dateStr = now.toISOString().substring(0, 10);
  const tomorrowObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrowObj.toISOString().substring(0, 10);

  let panchangStatus: "SUCCESS" | "FALLBACK" | "FAILED" = "SUCCESS";
  let horoscopeStatus: "SUCCESS" | "FALLBACK" | "FAILED" = "SUCCESS";
  let panchangSummary: AutomationRunReport["panchangSummary"] = undefined;
  let databasePersisted = false;
  const prewarmedCities: string[] = [];

  try {
    // 1. Authorization check for Cron triggers (Vercel Cron sends Authorization: Bearer <CRON_SECRET>)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { success: false, message: "Unauthorized cron execution" },
          { status: 401 }
        );
      }
    }

    // 2. Pre-warm deterministic Panchang cache for Today & Tomorrow across major cities
    try {
      const delhiToday = getPanchangForCity("delhi", dateStr);
      panchangSummary = {
        tithi: `${delhiToday.tithi.paksha} ${delhiToday.tithi.name} (until ${delhiToday.tithi.endsAt})`,
        tithiHindi: `${delhiToday.tithi.pakshaHindi} ${delhiToday.tithi.nameHindi} (${delhiToday.tithi.endsAtHindi} तक)`,
        nakshatra: `${delhiToday.nakshatra.name} Pada ${delhiToday.nakshatra.pada} (until ${delhiToday.nakshatra.endsAt})`,
        nakshatraHindi: `${delhiToday.nakshatra.nameHindi} चरण ${delhiToday.nakshatra.pada} (${delhiToday.nakshatra.endsAtHindi} तक)`,
        yoga: delhiToday.yoga.name,
        karana: delhiToday.karana.name,
        sunrise: delhiToday.sunAndMoon.sunrise,
        sunset: delhiToday.sunAndMoon.sunset,
      };

      for (const cityId of PREWARM_CITIES) {
        getPanchangForCity(cityId, dateStr);
        getPanchangForCity(cityId, tomorrowStr);
        prewarmedCities.push(cityId);
      }

      // Optional archival into PostgreSQL PanchangEntry if database is configured & reachable.
      // Reads NEVER depend on this table; if DB is offline, pages continue via deterministic calculation.
      try {
        const panchangReport = await PanchangService.getDailyPanchang(dateStr, 28.6139, 77.209);
        const entryDate = new Date(dateStr);
        await prisma.panchangEntry.upsert({
          where: { date: entryDate },
          create: {
            date: entryDate,
            city: "New Delhi",
            tithi: panchangReport.limbs.tithi.name,
            nakshatra: panchangReport.limbs.nakshatra.name,
            yoga: panchangReport.limbs.yoga.name,
            karana: panchangReport.limbs.karana.name,
            sunrise: panchangReport.sunMoon.sunrise,
            sunset: panchangReport.sunMoon.sunset,
            rahuKaal: panchangReport.muhurat.rahuKaal,
            abhijitMuhurat: panchangReport.muhurat.abhijit,
            rawDataJson: panchangReport as any,
          },
          update: {
            tithi: panchangReport.limbs.tithi.name,
            nakshatra: panchangReport.limbs.nakshatra.name,
            yoga: panchangReport.limbs.yoga.name,
            karana: panchangReport.limbs.karana.name,
            sunrise: panchangReport.sunMoon.sunrise,
            sunset: panchangReport.sunMoon.sunset,
            rahuKaal: panchangReport.muhurat.rahuKaal,
            abhijitMuhurat: panchangReport.muhurat.abhijit,
            rawDataJson: panchangReport as any,
          },
        });
        databasePersisted = true;
      } catch (dbErr: any) {
        errors.push(
          `Database archival skipped (non-fatal; reads use deterministic cache/on-demand engine): ${
            dbErr?.message || "Database offline"
          }`
        );
      }
    } catch (pErr: any) {
      panchangStatus = "FALLBACK";
      errors.push(`Panchang pre-warm warning: ${pErr?.message}`);
    }

    // 3. Pre-warm Daily Horoscope cache for all 12 Chandra Rashis across Yesterday (-1), Today (0), and Tomorrow (+1)
    let signsCount = 0;
    let signDaysPrewarmedCount = 0;
    try {
      for (const sign of ZODIAC_SIGNS) {
        const hYesterday = DailyHoroscopeService.getHoroscope(sign.id, -1);
        const hToday = DailyHoroscopeService.getHoroscope(sign.id, 0);
        const hTomorrow = DailyHoroscopeService.getHoroscope(sign.id, 1);
        if (hToday && hToday.summary && hToday.summaryHindi) {
          signsCount++;
        }
        if (hYesterday) signDaysPrewarmedCount++;
        if (hToday) signDaysPrewarmedCount++;
        if (hTomorrow) signDaysPrewarmedCount++;
      }
      if (signsCount < 12) {
        horoscopeStatus = "FALLBACK";
        errors.push(`Only ${signsCount}/12 signs computed successfully`);
      }
    } catch (hErr: any) {
      horoscopeStatus = "FALLBACK";
      errors.push(`Horoscope pre-warm warning: ${hErr?.message}`);
    }

    const report: AutomationRunReport = {
      timestamp: now.toISOString(),
      executionDate: dateStr,
      tomorrowDate: tomorrowStr,
      panchangStatus,
      horoscopeStatus,
      prewarmedCities,
      panchangSummary,
      signsCalculatedCount: signsCount,
      signDaysPrewarmedCount,
      databasePersisted,
      readDependencyMode: "DETERMINISTIC_CACHE_WITH_ON_DEMAND_FALLBACK",
      cacheTelemetry: {
        panchang: getPanchangCacheStats(),
        horoscope: DailyHoroscopeService.getCacheStats(),
      },
      errors,
    };

    lastAutomationReport = report;
    console.log("[Daily Astrology Automation Run Completed]:", JSON.stringify(report));

    return NextResponse.json({
      success: true,
      message: "Daily astrology cron pre-warm and verification completed",
      report,
    });
  } catch (err: any) {
    console.error("[Daily Astrology Automation Non-Fatal Fallback]:", err);
    return NextResponse.json(
      {
        success: true,
        fallbackActive: true,
        message:
          "Cron encountered an unexpected error, but on-demand deterministic calculation remains active for all routes.",
        errors: [err?.message || "Unknown cron error"],
        lastAutomationReport,
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
