import {
  DEFAULT_FEATURED_REELS,
  FeaturedInstagramReel,
  INSTAGRAM_PROFILE_URL,
} from "@/config/featuredReels";

export type AstroReel = FeaturedInstagramReel;

const STORAGE_KEY = "aapka_curated_reels";

// In-memory working copy
let memoryReels: AstroReel[] = [...DEFAULT_FEATURED_REELS];

// Client-side initialization helper
function initClientStorage() {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryReels = parsed;
      }
    }
  } catch (e) {
    console.error("[ReelsStore] Failed to load from localStorage:", e);
  }
}

// Client-side persistence helper
function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryReels));
    window.dispatchEvent(new CustomEvent("aapka_reels_updated", { detail: memoryReels }));
  } catch (e) {
    console.error("[ReelsStore] Failed to persist to localStorage:", e);
  }
}

if (typeof window !== "undefined") {
  initClientStorage();
}

export const ReelsStore = {
  /**
   * Returns all visible (non-hidden) reels sorted by order (synchronous fallback)
   */
  getVisibleReels: (): AstroReel[] => {
    initClientStorage();
    return [...memoryReels]
      .filter((r) => !r.isHidden)
      .sort((a, b) => a.order - b.order);
  },

  /**
   * Returns visible reels pinned to homepage sorted by order (synchronous fallback)
   */
  getPinnedReels: (): AstroReel[] => {
    initClientStorage();
    return [...memoryReels]
      .filter((r) => r.pinnedToHome && !r.isHidden)
      .sort((a, b) => a.order - b.order);
  },

  /**
   * Returns all reels regardless of pin or hidden status (synchronous fallback)
   */
  getAllReels: (): AstroReel[] => {
    initClientStorage();
    return [...memoryReels].sort((a, b) => a.order - b.order);
  },

  /**
   * DATABASE ASYNC METHODS: Prisma backed source of truth in PostgreSQL (Neon)
   */
  async ensureSeededAsync() {
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (!prisma || !prisma.instagramMedia) return;

      const count = await prisma.instagramMedia.count();
      if (count === 0) {
        for (const r of DEFAULT_FEATURED_REELS) {
          await prisma.instagramMedia.create({
            data: {
              externalId: r.id,
              permalink: r.instagramUrl,
              thumbnailUrl: r.posterUrl || null,
              caption: r.caption,
              category: r.category,
              pinned: r.pinnedToHome,
              hidden: r.isHidden,
              displayOrder: r.order,
              mediaType: "REEL",
            },
          });
        }
      }
    } catch (e) {
      console.warn("[ReelsStore] Seed check warning:", e);
    }
  },

  async getAllReelsAsync(): Promise<AstroReel[]> {
    try {
      await this.ensureSeededAsync();
      const { prisma } = await import("@/lib/db/prisma");
      if (prisma && prisma.instagramMedia) {
        const rows = await prisma.instagramMedia.findMany({
          orderBy: { displayOrder: "asc" },
        });

        if (rows.length > 0) {
          return rows.map((r) => {
            const defaultMatch = DEFAULT_FEATURED_REELS.find(
              (df) => df.id === r.externalId || df.instagramUrl === r.permalink
            );
            return {
              id: r.externalId,
              instagramUrl: r.permalink,
              videoUrl: defaultMatch?.videoUrl || undefined,
              posterUrl: r.thumbnailUrl || defaultMatch?.posterUrl || undefined,
              videoDuration: defaultMatch?.videoDuration || "1:00",
              caption: r.caption || "Vedic Guidance",
              category: (r.category as any) || "Horoscope",
              pinnedToHome: r.pinned,
              isHidden: r.hidden,
              order: r.displayOrder,
              date: "Recent Guidance",
            };
          });
        }
      }
    } catch (e) {
      console.warn("[ReelsStore] Database query error, using memory fallback:", e);
    }
    return this.getAllReels();
  },

  async getVisibleReelsAsync(): Promise<AstroReel[]> {
    const all = await this.getAllReelsAsync();
    return all.filter((r) => !r.isHidden).sort((a, b) => a.order - b.order);
  },

  async getPinnedReelsAsync(): Promise<AstroReel[]> {
    const all = await this.getAllReelsAsync();
    return all.filter((r) => r.pinnedToHome && !r.isHidden).sort((a, b) => a.order - b.order);
  },

  /**
   * Adds a new curated Instagram reel to database
   */
  async addReelAsync(data: {
    instagramUrl: string;
    caption?: string;
    category?: "Horoscope" | "Vastu" | "Gemstone" | "Remedy";
    pinnedToHome?: boolean;
  }): Promise<AstroReel> {
    const newReel = this.addReel(data);
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (prisma && prisma.instagramMedia) {
        await prisma.instagramMedia.create({
          data: {
            externalId: newReel.id,
            permalink: newReel.instagramUrl,
            thumbnailUrl: newReel.posterUrl || null,
            caption: newReel.caption,
            category: newReel.category,
            pinned: newReel.pinnedToHome,
            hidden: newReel.isHidden,
            displayOrder: newReel.order,
            mediaType: "REEL",
          },
        });
      }
    } catch (e) {
      console.error("[ReelsStore] DB create failed:", e);
    }
    return newReel;
  },

  addReel: (data: {
    instagramUrl: string;
    caption?: string;
    category?: "Horoscope" | "Vastu" | "Gemstone" | "Remedy";
    pinnedToHome?: boolean;
  }): AstroReel => {
    initClientStorage();
    const newOrder = memoryReels.length > 0 ? Math.max(...memoryReels.map((r) => r.order)) + 1 : 1;
    const newReel: AstroReel = {
      id: `reel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      instagramUrl: data.instagramUrl.trim(),
      caption: data.caption?.trim() || "Vedic Guidance by Acharya Niraj Kumar",
      category: data.category || "Horoscope",
      pinnedToHome: data.pinnedToHome !== undefined ? data.pinnedToHome : true,
      isHidden: false,
      order: newOrder,
      date: "Recent Guidance",
    };
    memoryReels.push(newReel);
    persist();
    return newReel;
  },

  async removeReelAsync(id: string): Promise<void> {
    this.removeReel(id);
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (prisma && prisma.instagramMedia) {
        await prisma.instagramMedia.deleteMany({
          where: { externalId: id },
        });
      }
    } catch (e) {
      console.error("[ReelsStore] DB delete failed:", e);
    }
  },

  removeReel: (id: string): void => {
    initClientStorage();
    memoryReels = memoryReels.filter((r) => r.id !== id);
    persist();
  },

  async reorderReelAsync(id: string, direction: "up" | "down"): Promise<void> {
    this.reorderReel(id, direction);
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (prisma && prisma.instagramMedia) {
        const sorted = [...memoryReels].sort((a, b) => a.order - b.order);
        for (let i = 0; i < sorted.length; i++) {
          await prisma.instagramMedia.updateMany({
            where: { externalId: sorted[i].id },
            data: { displayOrder: i + 1 },
          });
        }
      }
    } catch (e) {
      console.error("[ReelsStore] DB reorder failed:", e);
    }
  },

  reorderReel: (id: string, direction: "up" | "down"): void => {
    initClientStorage();
    const sorted = [...memoryReels].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((r) => r.id === id);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      const tempOrder = sorted[index].order;
      sorted[index].order = sorted[index - 1].order;
      sorted[index - 1].order = tempOrder;
    } else if (direction === "down" && index < sorted.length - 1) {
      const tempOrder = sorted[index].order;
      sorted[index].order = sorted[index + 1].order;
      sorted[index + 1].order = tempOrder;
    }

    memoryReels = sorted;
    persist();
  },

  async togglePinAsync(id: string): Promise<void> {
    this.togglePin(id);
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (prisma && prisma.instagramMedia) {
        const target = memoryReels.find((r) => r.id === id);
        if (target) {
          await prisma.instagramMedia.updateMany({
            where: { externalId: id },
            data: { pinned: target.pinnedToHome },
          });
        }
      }
    } catch (e) {
      console.error("[ReelsStore] DB togglePin failed:", e);
    }
  },

  togglePin: (id: string): void => {
    initClientStorage();
    const reel = memoryReels.find((r) => r.id === id);
    if (reel) {
      reel.pinnedToHome = !reel.pinnedToHome;
      persist();
    }
  },

  async toggleHideAsync(id: string): Promise<void> {
    this.toggleHide(id);
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (prisma && prisma.instagramMedia) {
        const target = memoryReels.find((r) => r.id === id);
        if (target) {
          await prisma.instagramMedia.updateMany({
            where: { externalId: id },
            data: { hidden: target.isHidden },
          });
        }
      }
    } catch (e) {
      console.error("[ReelsStore] DB toggleHide failed:", e);
    }
  },

  toggleHide: (id: string): void => {
    initClientStorage();
    const reel = memoryReels.find((r) => r.id === id);
    if (reel) {
      reel.isHidden = !reel.isHidden;
      persist();
    }
  },

  async resetToDefaultsAsync(): Promise<void> {
    this.resetToDefaults();
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (prisma && prisma.instagramMedia) {
        await prisma.instagramMedia.deleteMany({});
        await this.ensureSeededAsync();
      }
    } catch (e) {
      console.error("[ReelsStore] DB reset failed:", e);
    }
  },

  resetToDefaults: (): void => {
    memoryReels = [...DEFAULT_FEATURED_REELS];
    persist();
  },
};
