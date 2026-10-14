/**
 * FEATURED INSTAGRAM REELS CONFIGURATION
 * ============================================================================
 * Official Profile: https://www.instagram.com/aapkaastrologer/
 *
 * This configuration holds Acharya Niraj Kumar's authentic Instagram reels.
 * Uses high-performance, lazy-loaded HTML5 video playback with poster frames,
 * zero layout shift, and instant click-through to the official Instagram profile.
 */

export interface FeaturedInstagramReel {
  id: string;
  instagramUrl: string;
  videoUrl?: string;
  posterUrl?: string;
  videoDuration?: string;
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
 * Authentic Featured Reels by Acharya Niraj Kumar
 * Sourced directly from @aapkaastrologer with real MP4 streams and video posters.
 */
export const DEFAULT_FEATURED_REELS: FeaturedInstagramReel[] = [
  {
    id: "reel-DeZIvudACZW",
    instagramUrl: "https://www.instagram.com/reel/DeZIvudACZW/",
    videoUrl: "/videos/reels/igexport-DeZIvudACZW.mp4",
    posterUrl: "/videos/reels/posters/thumb-DeZIvudACZW.jpg",
    videoDuration: "3:18",
    caption: "वैदिक ज्योतिष एवं जीवन मार्गदर्शन — प्रामाणिक पराशरी एवं नाड़ी सिद्धांत",
    category: "Remedy",
    pinnedToHome: true,
    isHidden: false,
    order: 1,
    date: "Latest Guidance",
  },
  {
    id: "reel-Dd-2GAGBUxn",
    instagramUrl: "https://www.instagram.com/reel/Dd-2GAGBUxn/",
    videoUrl: "/videos/reels/igexport-Dd-2GAGBUxn.mp4",
    posterUrl: "/videos/reels/posters/thumb-Dd-2GAGBUxn.jpg",
    videoDuration: "0:44",
    caption: "मेष लग्न में राहु-केतु का प्रभाव एवं फलित — प्रत्यक्ष कुण्डली चक्र विश्लेषण",
    category: "Horoscope",
    pinnedToHome: true,
    isHidden: false,
    order: 2,
    date: "Kundli Wisdom",
  },
  {
    id: "reel-Dedvn-PhujK",
    instagramUrl: "https://www.instagram.com/reel/Dedvn-PhujK/",
    videoUrl: "/videos/reels/igexport-Dedvn-PhujK.mp4",
    posterUrl: "/videos/reels/posters/thumb-Dedvn-PhujK.jpg",
    videoDuration: "1:20",
    caption: "मकर राशि गोचर फल एवं महत्वपूर्ण सावधानियां (Makar Rashi Transit Alert)",
    category: "Horoscope",
    pinnedToHome: true,
    isHidden: false,
    order: 3,
    date: "Transit Alert",
  },
  {
    id: "reel-DeLxjXEBePK",
    instagramUrl: "https://www.instagram.com/reel/DeLxjXEBePK/",
    videoUrl: "/videos/reels/igexport-DeLxjXEBePK.mp4",
    posterUrl: "/videos/reels/posters/thumb-DeLxjXEBePK.jpg",
    videoDuration: "0:49",
    caption: "कन्या लग्न में राहु-केतु अक्ष का रहस्य — जन्म कुण्डली 6वें और 12वें भाव का प्रभाव",
    category: "Horoscope",
    pinnedToHome: true,
    isHidden: false,
    order: 4,
    date: "Kundli Wisdom",
  },
  {
    id: "reel-Dds0dUhy58r",
    instagramUrl: "https://www.instagram.com/reel/Dds0dUhy58r/",
    videoUrl: "/videos/reels/igexport-Dds0dUhy58r.mp4",
    posterUrl: "/videos/reels/posters/thumb-Dds0dUhy58r.jpg",
    videoDuration: "1:10",
    caption: "सटीक जन्म कुण्डली गणना एवं वास्तु संतुलन — अंधविश्वास से परे वैज्ञानिक ज्योतिष",
    category: "Vastu",
    pinnedToHome: false,
    isHidden: false,
    order: 5,
    date: "Vastu Balance",
  },
];
