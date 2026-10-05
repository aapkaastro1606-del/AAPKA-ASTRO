/**
 * FEATURED INSTAGRAM REELS CONFIGURATION
 * ============================================================================
 * Official Profile: https://www.instagram.com/aapkaastrologer/
 *
 * This configuration holds the manually-curated list of real Instagram reels
 * embedded directly using Instagram's native oEmbed / embed.js widget.
 *
 * This is an interim solution pending full Meta Graph API auto-sync, requiring
 * zero API tokens or Facebook Developer App setup.
 *
 * NOTE FOR CLIENT / OPERATOR:
 * Replace the placeholder reel shortcode URLs below with your real Instagram
 * post/reel URLs from https://www.instagram.com/aapkaastrologer/
 * (e.g. "https://www.instagram.com/reel/C9ABCxyz123/").
 *
 * You can also add, remove, pin, hide, and reorder reels dynamically at runtime
 * through the Operator Cockpit (/dashboard/reels) without code deployments.
 */

export interface FeaturedInstagramReel {
  id: string;
  instagramUrl: string;
  caption: string;
  category: "Horoscope" | "Vastu" | "Gemstone" | "Remedy";
  pinnedToHome: boolean;
  isHidden: boolean;
  order: number;
  date?: string;
}

export const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/aapkaastrologer/";
export const INSTAGRAM_HANDLE = "@aapkaastrologer";

/**
 * Default Curated Reels List
 * Pre-populated with real-format Instagram Reel URLs from @aapkaastrologer
 * ready for the client to customize or replace.
 */
export const DEFAULT_FEATURED_REELS: FeaturedInstagramReel[] = [
  {
    id: "reel-featured-1",
    // CLIENT NOTE: Replace this placeholder URL with your real Instagram Reel URL from @aapkaastrologer
    instagramUrl: "https://www.instagram.com/reel/DGY7_example1/",
    caption: "Daily Vedic Jyotish & Planetary Transit Guidance by Acharya Niraj Kumar",
    category: "Horoscope",
    pinnedToHome: true,
    isHidden: false,
    order: 1,
    date: "Recent Guidance",
  },
  {
    id: "reel-featured-2",
    // CLIENT NOTE: Replace this placeholder URL with your real Instagram Reel URL from @aapkaastrologer
    instagramUrl: "https://www.instagram.com/reel/DGY7_example2/",
    caption: "AstroVastu Living Space Harmony & Directional Corrections",
    category: "Vastu",
    pinnedToHome: true,
    isHidden: false,
    order: 2,
    date: "Recent Guidance",
  },
  {
    id: "reel-featured-3",
    // CLIENT NOTE: Replace this placeholder URL with your real Instagram Reel URL from @aapkaastrologer
    instagramUrl: "https://www.instagram.com/reel/DGY7_example3/",
    caption: "Natural Consecrated Gemstones & Vedic Remedies (Zero Superstition)",
    category: "Gemstone",
    pinnedToHome: true,
    isHidden: false,
    order: 3,
    date: "Recent Guidance",
  },
  {
    id: "reel-featured-4",
    // CLIENT NOTE: Replace this placeholder URL with your real Instagram Reel URL from @aapkaastrologer
    instagramUrl: "https://www.instagram.com/reel/DGY7_example4/",
    caption: "Sacred Morning Surya Arghya & Practical Karmic Remedies",
    category: "Remedy",
    pinnedToHome: true,
    isHidden: false,
    order: 4,
    date: "Recent Guidance",
  },
];
