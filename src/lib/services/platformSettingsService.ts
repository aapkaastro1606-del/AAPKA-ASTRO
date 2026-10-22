import { prisma } from "@/lib/db/prisma";
import { AdminStore, PricingSettings } from "@/lib/store/adminStore";
import { DEFAULT_NAVRATRI_PROMO_CONFIG } from "@/config/placeholderContent";
import { AuditLogService } from "@/lib/services/auditLogService";
import { BookingEmailService } from "@/lib/services/bookingEmailService";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";


export interface AstrologerPresence {
  status: "AVAILABLE" | "BUSY" | "BREAK" | "OFFLINE";
  statusMessage?: string;
  nextAvailableAt?: string;
  updatedAt?: string;
}

export const DEFAULT_PRESENCE: AstrologerPresence = {
  status: "AVAILABLE",
  statusMessage: "Available right now for 1-on-1 consultations",
  nextAvailableAt: "Tomorrow, 10:00 AM IST",
  updatedAt: new Date().toISOString(),
};

export interface PaymentSettings {
  upiId: string;
  payeeName: string;
  qrImageUrl?: string | null;
  whatsappNumber: string;
  whatsappConfirmed: boolean;
  unpaidExpiryDays: number;
}

/**
 * Validates standard NPCI UPI Virtual Payment Address (VPA) format.
 * Format: username@handle (e.g. 9311215564@okbizaxis, user@okhdfcbank)
 */
export function isValidUpiId(upiId: unknown): boolean {
  if (typeof upiId !== "string") return false;
  const trimmed = upiId.trim();
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}$/;
  return upiRegex.test(trimmed);
}

/**
 * Safely masks a UPI ID for diagnostic and administrative display.
 * Retains the provider handle and first/last characters while redacting sensitive digits.
 * e.g. 9311215564@okbizaxis -> 93***64@okbizaxis
 */
export function maskUpiId(upiId: string | null | undefined): string {
  if (!upiId || typeof upiId !== "string") return "Unconfigured";
  const trimmed = upiId.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return "***";
  const user = trimmed.slice(0, atIndex);
  const handle = trimmed.slice(atIndex + 1);

  if (user.length <= 2) {
    return `${user[0]}***@${handle}`;
  }
  if (user.length <= 4) {
    return `${user.slice(0, 2)}***@${handle}`;
  }
  return `${user.slice(0, 2)}***${user.slice(-2)}@${handle}`;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: "9311215564@okbizaxis",
  payeeName: "Aapka Astro Official",
  qrImageUrl: null,
  whatsappNumber: "+91 93112 15564",
  whatsappConfirmed: true,
  unpaidExpiryDays: 3,
};

export const DEFAULT_DATABASE_PRICING: PricingSettings = {
  flatStandardFee: 2100,
  flatFirstConsultationFee: 1051,
  discountPercentage: 50,
  vaastuStandardFee: 25000,
  vaastuPromoFee: 15000,
  vaastuDiscountPercentage: 40,
  kundliPdfFee: 501,
  navratriPromo: { ...DEFAULT_NAVRATRI_PROMO_CONFIG },
  chatRate: 15,
  voiceRate: 20,
  videoRate: 25,
  minimumRechargeAmount: 100,
  firstTimeFreeMinutes: 0,
};

const SINGLETON_ID = "singleton_settings";

export class PlatformSettingsService {
  /**
   * Fetch current platform pricing from PostgreSQL (Neon).
   * Automatically initializes the database record if it doesn't exist.
   */
  static async getPricing(): Promise<PricingSettings> {
    try {
      if (!prisma || !prisma.platformSetting) {
        return AdminStore.getPricing();
      }

      let record = await prisma.platformSetting.findUnique({
        where: { id: SINGLETON_ID },
      });

      if (!record) {
        record = await prisma.platformSetting.create({
          data: {
            id: SINGLETON_ID,
            pricing: DEFAULT_DATABASE_PRICING as any,
          },
        });
      }

      const storedPricing = record.pricing as unknown as PricingSettings;
      const mergedPricing: PricingSettings = {
        ...DEFAULT_DATABASE_PRICING,
        ...(storedPricing || {}),
      };

      // Keep in-memory store synchronized
      AdminStore.updatePricing(mergedPricing);

      return mergedPricing;
    } catch (error) {
      console.error("PlatformSettingsService.getPricing database error:", error);
      return AdminStore.getPricing();
    }
  }

  /**
   * Update platform pricing in PostgreSQL (Neon) and sync memory cache.
   */
  static async updatePricing(updates: Partial<PricingSettings>): Promise<PricingSettings> {
    try {
      const current = await this.getPricing();
      const updated: PricingSettings = {
        ...current,
        ...updates,
      };

      if (prisma && prisma.platformSetting) {
        await prisma.platformSetting.upsert({
          where: { id: SINGLETON_ID },
          create: {
            id: SINGLETON_ID,
            pricing: updated as any,
          },
          update: {
            pricing: updated as any,
          },
        });
      }

      AdminStore.updatePricing(updated);
      return updated;
    } catch (error) {
      console.error("PlatformSettingsService.updatePricing database error:", error);
      AdminStore.updatePricing(updates);
      return AdminStore.getPricing();
    }
  }

  /**
   * Fetch full settings record including popups and feature flags
   */
  static async getSettings() {
    try {
      if (!prisma || !prisma.platformSetting) {
        return {
          id: SINGLETON_ID,
          pricing: AdminStore.getPricing(),
          popups: null,
          features: null,
        };
      }

      let record = await prisma.platformSetting.findUnique({
        where: { id: SINGLETON_ID },
      });

      if (!record) {
        record = await prisma.platformSetting.create({
          data: {
            id: SINGLETON_ID,
            pricing: DEFAULT_DATABASE_PRICING as any,
          },
        });
      }

      return record;
    } catch (error) {
      console.error("PlatformSettingsService.getSettings database error:", error);
      return {
        id: SINGLETON_ID,
        pricing: AdminStore.getPricing(),
        popups: null,
        features: null,
      };
    }
  }

  /**
   * Fetch Owner-editable payment settings from PostgreSQL (Neon).
   * Falls back to DEFAULT_PAYMENT_SETTINGS if unconfigured.
   */
  static async getPaymentSettings(): Promise<PaymentSettings> {
    try {
      if (!prisma || !prisma.platformSetting) {
        return { ...DEFAULT_PAYMENT_SETTINGS };
      }

      const record = await prisma.platformSetting.findUnique({
        where: { id: SINGLETON_ID },
      });

      if (!record || !record.paymentSettings) {
        return { ...DEFAULT_PAYMENT_SETTINGS };
      }

      return {
        ...DEFAULT_PAYMENT_SETTINGS,
        ...(record.paymentSettings as unknown as Partial<PaymentSettings>),
      };
    } catch (error) {
      console.error("PlatformSettingsService.getPaymentSettings error:", error);
      return { ...DEFAULT_PAYMENT_SETTINGS };
    }
  }

  /**
   * Update Owner-editable payment settings in PostgreSQL (Neon).
   * Every change is audit-logged and an alert email is sent to the Owner.
   */
  static async updatePaymentSettings(
    paramsOrUpdates:
      | {
          updates: Partial<PaymentSettings>;
          actorEmail: string;
          actorId?: string;
          ipAddress?: string | null;
          userAgent?: string | null;
        }
      | Partial<PaymentSettings>,
    actorEmailArg?: string
  ): Promise<PaymentSettings> {
    let updates: Partial<PaymentSettings>;
    let actorEmail: string;
    let actorId: string | undefined;
    let ipAddress: string | null | undefined;
    let userAgent: string | null | undefined;

    if ("updates" in paramsOrUpdates && typeof paramsOrUpdates.actorEmail === "string") {
      updates = paramsOrUpdates.updates;
      actorEmail = paramsOrUpdates.actorEmail;
      actorId = paramsOrUpdates.actorId;
      ipAddress = paramsOrUpdates.ipAddress;
      userAgent = paramsOrUpdates.userAgent;
    } else {
      updates = paramsOrUpdates as Partial<PaymentSettings>;
      actorEmail = actorEmailArg || "";
    }

    if (!isOwnerEmail(actorEmail)) {
      throw new Error("Unauthorized: Only the platform Owner may update payment routing settings.");
    }

    if (updates.upiId !== undefined) {
      if (!isValidUpiId(updates.upiId)) {
        throw new Error(
          `Invalid UPI ID format: "${updates.upiId}". Expected format: username@handle (e.g. 9311215564@okbizaxis).`
        );
      }
      updates.upiId = updates.upiId.trim();
    }

    const current = await this.getPaymentSettings();
    const updated: PaymentSettings = {
      ...current,
      ...updates,
    };

    if (prisma && prisma.platformSetting) {
      await prisma.platformSetting.upsert({
        where: { id: SINGLETON_ID },
        create: {
          id: SINGLETON_ID,
          pricing: DEFAULT_DATABASE_PRICING as any,
          paymentSettings: updated as any,
        },
        update: {
          paymentSettings: updated as any,
        },
      });
    }

    // 1. Audit Log in PostgreSQL
    await AuditLogService.log({
      action: "PAYMENT_SETTINGS_UPDATED",
      actorId: actorId,
      actorEmail: actorEmail,
      targetId: SINGLETON_ID,
      targetType: "PLATFORM_SETTINGS",
      previousState: current,
      newState: updated,
      notes: `Updated payment settings: UPI=${updated.upiId}, Payee=${updated.payeeName}, WhatsApp=${updated.whatsappNumber}, Confirmed=${updated.whatsappConfirmed}`,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    // 2. Email alert to Owner (fire-and-forget so UI stays responsive)
    BookingEmailService.sendOwnerPaymentSettingsAlert({
      actorEmail: actorEmail,
      previousSettings: current,
      newSettings: updated,
      ipAddress: ipAddress,
    }).catch((err) => console.warn("Failed to dispatch owner alert email:", err));

    return updated;
  }
  /**
   * Fetch Astrologer presence from PostgreSQL.
   */
  static async getPresence(): Promise<AstrologerPresence> {
    try {
      if (!prisma || !prisma.platformSetting) {
        return { ...DEFAULT_PRESENCE };
      }

      const record = await prisma.platformSetting.findUnique({
        where: { id: SINGLETON_ID },
      });

      const features = (record?.features as any) || {};
      if (features.presence && features.presence.status) {
        return {
          ...DEFAULT_PRESENCE,
          ...features.presence,
        };
      }

      return { ...DEFAULT_PRESENCE };
    } catch (error) {
      console.error("PlatformSettingsService.getPresence error:", error);
      return { ...DEFAULT_PRESENCE };
    }
  }

  /**
   * Update Astrologer presence in PostgreSQL.
   */
  static async setPresence(updates: Partial<AstrologerPresence>): Promise<AstrologerPresence> {
    const current = await this.getPresence();
    const updated: AstrologerPresence = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (prisma && prisma.platformSetting) {
      const record = await prisma.platformSetting.findUnique({
        where: { id: SINGLETON_ID },
      });
      const features = (record?.features as any) || {};
      await prisma.platformSetting.upsert({
        where: { id: SINGLETON_ID },
        create: {
          id: SINGLETON_ID,
          pricing: DEFAULT_DATABASE_PRICING as any,
          features: { ...features, presence: updated },
        },
        update: {
          features: { ...features, presence: updated },
        },
      });
    }

    return updated;
  }
}
