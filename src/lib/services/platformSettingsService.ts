import { prisma } from "@/lib/db/prisma";
import { AdminStore, PricingSettings } from "@/lib/store/adminStore";
import { DEFAULT_NAVRATRI_PROMO_CONFIG } from "@/config/placeholderContent";
import { AuditLogService } from "@/lib/services/auditLogService";
import { BookingEmailService } from "@/lib/services/bookingEmailService";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";

export interface PaymentSettings {
  upiId: string;
  payeeName: string;
  qrImageUrl?: string | null;
  whatsappNumber: string;
  whatsappConfirmed: boolean;
  unpaidExpiryDays: number;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: "9311215564@okbizaxis",
  payeeName: "Aapka Astro",
  qrImageUrl: null,
  whatsappNumber: "+91 93112 15564",
  whatsappConfirmed: false,
  unpaidExpiryDays: 2,
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
}
