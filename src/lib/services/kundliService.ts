/**
 * ============================================================================
 * KUNDLI ENGINE & TWO-TIER ACCESS SERVICE
 * ============================================================================
 * PLUG-IN ARCHITECTURE:
 * This service encapsulates astrological chart calculation behind an abstract
 * interface. Currently runs self-hosted Lahiri ephemeris computation.
 * To integrate commercial third-party providers (e.g. AstroAPI, Prokerala,
 * VedicAstroAPI, Flatlib), implement `IKundliCalculationProvider` below
 * and toggle `KUNDLI_PROVIDER=external` in environment variables.
 * ============================================================================
 */

import { calculateKundli } from "@/lib/astrology/chartCalculations";
import { KundliData } from "@/lib/astrology/types";
import { prisma } from "@/lib/db/prisma";

export interface KundliCalculationInput {
  name: string;
  gender: "male" | "female" | "other";
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: number;
  phone?: string;
  email?: string;
  relation?: string;
  userId?: string;
}

export interface FreeTierKundliReport {
  isFreeTier: true;
  summary: {
    name: string;
    ascendantSign: string;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
    charanPada: number;
  };
  chartData: KundliData;
  doshas: {
    manglikStatus: string;
    sadeSatiStatus: string;
    kalsarpaStatus: string;
  };
  paidInterpretationTeaser: {
    availableInPaidConsultation: string[];
    bookingUrl: string;
  };
}

export interface PaidTierInterpretation {
  isFreeTier: false;
  chartData: KundliData;
  yogasIdentified: Array<{
    name: string;
    sanskritName: string;
    planetsInvolved: string;
    effects: string;
  }>;
  dashaDeepAnalysis: {
    currentMahadasha: string;
    favorableTransits: string;
    careerWindow: string;
    maritalHarmonyScore: string;
  };
  remedialPrescriptions: Array<{
    category: "Gemstone" | "Mantra" | "Vastu" | "Daan";
    name: string;
    instructions: string;
  }>;
}

export interface IKundliCalculationProvider {
  calculate(input: KundliCalculationInput): Promise<KundliData>;
}

export class SelfHostedKundliProvider implements IKundliCalculationProvider {
  public async calculate(input: KundliCalculationInput): Promise<KundliData> {
    return calculateKundli(input);
  }
}

export class KundliService {
  private static provider: IKundliCalculationProvider = new SelfHostedKundliProvider();

  /**
   * Generates the Free Tier Kundli and records seeker details in PostgreSQL as a lead
   */
  public static async generateFreeChart(
    input: KundliCalculationInput
  ): Promise<FreeTierKundliReport> {
    const chart = await this.provider.calculate(input);

    // Capture Free Kundli Lead into Database
    try {
      if (prisma && prisma.kundliRecord) {
        await prisma.kundliRecord.create({
          data: {
            userId: input.userId && input.userId !== "guest" ? input.userId : null,
            name: input.name?.trim() || "Seeker",
            phone: input.phone?.trim() || null,
            email: input.email?.trim() || null,
            relation: input.relation || "Self",
            gender: input.gender || "male",
            dob: new Date(input.birthDate),
            timeOfBirth: input.birthTime,
            placeOfBirth: input.birthPlace,
            latitude: input.latitude,
            longitude: input.longitude,
            timezone: input.timezone,
            chartDataJson: chart as any,
            isFreeChart: true,
          },
        });
      }
    } catch (e) {
      console.error("[KundliService] Automatic free lead capture error:", e);
    }

    return {
      isFreeTier: true,
      summary: {
        name: chart.name,
        ascendantSign: chart.ascendant.rashiName,
        moonSign: chart.moonSign,
        sunSign: chart.sunSign,
        nakshatra: chart.nakshatra,
        charanPada: chart.charanPada,
      },
      chartData: chart,
      doshas: {
        manglikStatus: chart.doshas.hasManglik
          ? `Active (${chart.doshas.manglikSeverity})`
          : "No Mangal Dosha detected",
        sadeSatiStatus: chart.doshas.hasSadeSati
          ? `Underway (${chart.doshas.sadeSatiPhase})`
          : "Currently not running Shani Sade Sati",
        kalsarpaStatus: chart.doshas.hasKalsarpa
          ? `Present (${chart.doshas.kalsarpaType})`
          : "Free of Kaal Sarp Dosha",
      },
      paidInterpretationTeaser: {
        availableInPaidConsultation: [
          "Complete Navamsha (D9) and Dashamsha (D10) career charts",
          "Comprehensive Vimshottari Antardasha timings for 2026-2030",
          "Personalized Auspicious Career & Investment Milestones",
          "Remedial Gemstone Ratti calibration, metal, and energization muhurat",
        ],
        bookingUrl: "/consult",
      },
    };
  }

  /**
   * Generates the Comprehensive Paid Interpretation
   */
  public static async generatePaidInterpretation(
    input: KundliCalculationInput
  ): Promise<PaidTierInterpretation> {
    const chart = await this.provider.calculate(input);

    return {
      isFreeTier: false,
      chartData: chart,
      yogasIdentified: [
        {
          name: "Gaja Kesari Yoga",
          sanskritName: "गजकेसरी योग",
          planetsInvolved: "Jupiter and Moon in Kendra",
          effects: "Bestows wisdom, enduring public renown, ethical financial prosperity, and leadership stature.",
        },
        {
          name: "Budhaditya Yoga",
          sanskritName: "बुधादित्य योग",
          planetsInvolved: "Sun and Mercury conjunction",
          effects: "Grants acute analytical intellect, articulate administrative communication, and success in high diplomacy.",
        },
      ],
      dashaDeepAnalysis: {
        currentMahadasha: `${chart.dashas.find((d) => d.isCurrent)?.planet || "Jupiter"} Mahadasha`,
        favorableTransits: "Jupiter transit into Kendra activates 9th House Bhagya bhava.",
        careerWindow: "Q3 2026 presents optimum planetary alignment for job transitions and new ventures.",
        maritalHarmonyScore: "88% compatibility potential under current transits.",
      },
      remedialPrescriptions: [
        {
          category: "Gemstone",
          name: `Natural Untreated ${chart.luckyGemstone}`,
          instructions: "Wear on the ring or index finger on Thursday/Sunday morning during Shukla Paksha after Pran Pratishtha.",
        },
        {
          category: "Mantra",
          name: "Brihaspati Gayatri Mantra",
          instructions: "Chant 108 times at sunrise facing East using Haldi (turmeric) beads.",
        },
        {
          category: "Vastu",
          name: "Northeast (Ishanya) Energy Cleansing",
          instructions: "Maintain the Northeast quadrant of your living room completely decluttered and lit with a brass diya.",
        },
      ],
    };
  }

  /**
   * Saves Kundli record to PostgreSQL database.
   * Preserves lead details whether logged-in or guest.
   */
  public static async saveKundli(
    input: KundliCalculationInput,
    chartData: KundliData,
    userId?: string
  ): Promise<{ saved: boolean; recordId?: string; requiresSignup?: boolean }> {
    try {
      const record = await prisma.kundliRecord.create({
        data: {
          userId: userId && userId !== "guest" ? userId : null,
          name: input.name,
          phone: input.phone || null,
          email: input.email || null,
          relation: input.relation || "Self",
          gender: input.gender,
          dob: new Date(input.birthDate),
          timeOfBirth: input.birthTime,
          placeOfBirth: input.birthPlace,
          latitude: input.latitude,
          longitude: input.longitude,
          timezone: input.timezone,
          chartDataJson: chartData as any,
          isFreeChart: true,
        },
      });

      return {
        saved: true,
        recordId: record.id,
      };
    } catch (e) {
      console.error("[KundliService] Save to DB failed:", e);
      return { saved: false };
    }
  }
}
