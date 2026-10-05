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

// Attempt initialization immediately if on client
if (typeof window !== "undefined") {
  initClientStorage();
}

export const ReelsStore = {
  /**
   * Returns all visible (non-hidden) reels sorted by order
   */
  getVisibleReels: (): AstroReel[] => {
    initClientStorage();
    return [...memoryReels]
      .filter((r) => !r.isHidden)
      .sort((a, b) => a.order - b.order);
  },

  /**
   * Returns visible reels pinned to homepage sorted by order
   */
  getPinnedReels: (): AstroReel[] => {
    initClientStorage();
    return [...memoryReels]
      .filter((r) => r.pinnedToHome && !r.isHidden)
      .sort((a, b) => a.order - b.order);
  },

  /**
   * Returns all reels regardless of pin or hidden status
   */
  getAllReels: (): AstroReel[] => {
    initClientStorage();
    return [...memoryReels].sort((a, b) => a.order - b.order);
  },

  /**
   * Adds a new curated Instagram reel
   */
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

  /**
   * Removes a reel by ID
   */
  removeReel: (id: string): void => {
    initClientStorage();
    memoryReels = memoryReels.filter((r) => r.id !== id);
    persist();
  },

  /**
   * Moves a reel up or down in display order
   */
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

  /**
   * Toggles the pinnedToHome flag
   */
  togglePin: (id: string): void => {
    initClientStorage();
    const reel = memoryReels.find((r) => r.id === id);
    if (reel) {
      reel.pinnedToHome = !reel.pinnedToHome;
      persist();
    }
  },

  /**
   * Toggles the isHidden flag
   */
  toggleHide: (id: string): void => {
    initClientStorage();
    const reel = memoryReels.find((r) => r.id === id);
    if (reel) {
      reel.isHidden = !reel.isHidden;
      persist();
    }
  },

  /**
   * Resets the store back to initial default configuration
   */
  resetToDefaults: (): void => {
    memoryReels = [...DEFAULT_FEATURED_REELS];
    persist();
  },
};
