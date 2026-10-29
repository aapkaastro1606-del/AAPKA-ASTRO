import { prisma } from "@/lib/db/prisma";
import {
  LiveTvBroadcastSettings,
  DEFAULT_LIVE_TV_SETTINGS,
  evaluateLiveTvStatus,
  LiveTvEvaluationResult,
} from "@/config/liveTvBroadcastConfig";
import { AuditLogService } from "@/lib/services/auditLogService";
import { revalidateAffectedContent } from "@/lib/content/revalidation";

const SINGLETON_ID = "singleton_settings";

let cachedLiveTvSettings: LiveTvBroadcastSettings = {
  ...DEFAULT_LIVE_TV_SETTINGS,
};

export class LiveTvSettingsService {
  /**
   * Fetches the single source of truth for "Live on Television" settings.
   * Reads from Neon PostgreSQL (prisma.platformSetting.features.liveTv),
   * falling back to local memory cache and verified default constants.
   */
  static async getSettings(): Promise<LiveTvBroadcastSettings> {
    try {
      if (prisma && prisma.platformSetting) {
        const record = await prisma.platformSetting.findUnique({
          where: { id: SINGLETON_ID },
        });

        if (record && record.features) {
          const features = record.features as Record<string, any>;
          if (features.liveTv) {
            cachedLiveTvSettings = {
              ...DEFAULT_LIVE_TV_SETTINGS,
              ...features.liveTv,
              texts: {
                ...DEFAULT_LIVE_TV_SETTINGS.texts,
                ...(features.liveTv.texts || {}),
              },
              schedule: {
                ...DEFAULT_LIVE_TV_SETTINGS.schedule,
                ...(features.liveTv.schedule || {}),
              },
            };
            return cachedLiveTvSettings;
          }
        }
      }
    } catch (err) {
      console.warn("LiveTvSettingsService.getSettings database error:", err);
    }

    return cachedLiveTvSettings;
  }

  /**
   * Evaluates the current broadcast status (IST) based on persisted settings.
   */
  static async getStatus(mockDate?: Date | string): Promise<LiveTvEvaluationResult> {
    const settings = await this.getSettings();
    return evaluateLiveTvStatus(settings, mockDate);
  }

  /**
   * Updates Live on Television settings in PostgreSQL (Owner-only).
   */
  static async updateSettings(
    updates: Partial<LiveTvBroadcastSettings>,
    actorEmail: string = "owner@aapkaastro.com"
  ): Promise<LiveTvBroadcastSettings> {
    const current = await this.getSettings();
    const updated: LiveTvBroadcastSettings = {
      ...current,
      ...updates,
      texts: {
        ...current.texts,
        ...(updates.texts || {}),
      },
      schedule: {
        ...current.schedule,
        ...(updates.schedule || {}),
      },
    };

    cachedLiveTvSettings = updated;

    try {
      if (prisma && prisma.platformSetting) {
        const existing = await prisma.platformSetting.findUnique({
          where: { id: SINGLETON_ID },
        });

        const currentFeatures =
          existing && existing.features
            ? (existing.features as Record<string, any>)
            : {};

        await prisma.platformSetting.upsert({
          where: { id: SINGLETON_ID },
          create: {
            id: SINGLETON_ID,
            pricing: {} as any,
            features: {
              ...currentFeatures,
              liveTv: updated,
            } as any,
          },
          update: {
            features: {
              ...currentFeatures,
              liveTv: updated,
            } as any,
          },
        });

        await AuditLogService.log({
          action: "LIVE_TV_SETTINGS_UPDATED",
          actorEmail,
          targetId: "live_tv_settings",
          targetType: "PlatformSetting",
          notes: `Updated Live TV broadcast settings (programmeEnded: ${updated.programmeEnded}, notOnAirToday: ${updated.notOnAirToday}, channelLogoApproved: ${updated.channelLogoApproved})`,
        });

        try {
          revalidateAffectedContent("features");
        } catch {
          // Ignore revalidation in worker contexts
        }
      }
    } catch (err) {
      console.error("LiveTvSettingsService.updateSettings database error:", err);
    }

    return updated;
  }

  /**
   * Owner monthly reconfirmation:
   * Sets `lastReconfirmedAt` to current timestamp so the automatic 7-day expiration timer resets.
   */
  static async reconfirm(
    actorEmail: string = "owner@aapkaastro.com"
  ): Promise<LiveTvBroadcastSettings> {
    const updated = await this.updateSettings(
      {
        lastReconfirmedAt: new Date().toISOString(),
      },
      actorEmail
    );

    await AuditLogService.log({
      action: "LIVE_TV_PROGRAMME_RECONFIRMED",
      actorEmail,
      targetId: "live_tv_settings",
      targetType: "PlatformSetting",
      notes: "Owner reconfirmed that Kaal Ki Chaal is active on Live Times.",
    });

    return updated;
  }
}
