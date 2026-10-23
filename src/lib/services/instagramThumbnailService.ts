import {
  extractInstagramShortcode,
  getReelFallbackPoster,
} from "@/config/featuredReels";

/**
 * Service to resolve, download, and cache cover thumbnails for Instagram Reels.
 * Uses Instagram's OpenGraph metadata served to external crawlers (facebookexternalhit),
 * ensuring every reel added by an admin has an authentic cover image frame.
 */
export class InstagramThumbnailService {
  static extractShortcode = extractInstagramShortcode;
  static getFallbackPoster = getReelFallbackPoster;

  /**
   * Fetches og:image URL from Instagram for the given shortcode.
   */
  static async fetchInstagramOgImage(shortcode: string): Promise<string | null> {
    if (typeof window !== "undefined") return null;
    const httpsModule = await import("https");
    const https = httpsModule.default || httpsModule;
    const reelUrl = `https://www.instagram.com/reel/${shortcode}/`;
    return new Promise((resolve) => {
      const options = {
        headers: {
          "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        timeout: 6000,
      };

      const req = https.get(reelUrl, options, (res: any) => {
        let html = "";
        res.on("data", (chunk: any) => {
          html += chunk;
          // Abort reading if we already found og:image to save bandwidth
          if (html.includes('property="og:image"') || html.includes("property='og:image'")) {
            const match = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                          html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
            if (match && match[1]) {
              req.destroy();
              resolve(match[1].replace(/&amp;/g, "&"));
              return;
            }
          }
        });

        res.on("end", () => {
          const match = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                        html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
          if (match && match[1]) {
            resolve(match[1].replace(/&amp;/g, "&"));
          } else {
            resolve(null);
          }
        });
      });

      req.on("error", () => resolve(null));
      req.on("timeout", () => {
        req.destroy();
        resolve(null);
      });
    });
  }

  /**
   * Downloads remote image and saves locally if directory is writable.
   */
  static async downloadAndSavePoster(remoteUrl: string, shortcode: string): Promise<string | null> {
    if (typeof window !== "undefined") return null;
    try {
      const pathModule = await import("path");
      const path = pathModule.default || pathModule;
      const fsModule = await import("fs");
      const fs = fsModule.default || fsModule;
      const httpsModule = await import("https");
      const https = httpsModule.default || httpsModule;

      const postersDir = path.join(process.cwd(), "public", "videos", "reels", "posters");
      if (!fs.existsSync(postersDir)) {
        fs.mkdirSync(postersDir, { recursive: true });
      }

      const filePath = path.join(postersDir, `thumb-${shortcode}.jpg`);
      const webPath = `/videos/reels/posters/thumb-${shortcode}.jpg`;

      // If already downloaded and valid size, return path
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (stat.size > 1000) return webPath;
      }

      return new Promise((resolve) => {
        const fileStream = fs.createWriteStream(filePath);
        const req = https.get(remoteUrl, { timeout: 8000 }, (res: any) => {
          if (res.statusCode !== 200) {
            fileStream.close();
            try { fs.unlinkSync(filePath); } catch {}
            resolve(null);
            return;
          }
          res.pipe(fileStream);
          fileStream.on("finish", () => {
            fileStream.close();
            const stat = fs.statSync(filePath);
            if (stat.size > 1000) {
              resolve(webPath);
            } else {
              try { fs.unlinkSync(filePath); } catch {}
              resolve(null);
            }
          });
        });

        req.on("error", () => {
          fileStream.close();
          try { fs.unlinkSync(filePath); } catch {}
          resolve(null);
        });

        req.on("timeout", () => {
          req.destroy();
          fileStream.close();
          try { fs.unlinkSync(filePath); } catch {}
          resolve(null);
        });
      });
    } catch (err) {
      console.warn("[InstagramThumbnailService] File system write skipped:", err);
      return null;
    }
  }

  /**
   * Main resolution method:
   * 1. Check if local poster exists.
   * 2. Try fetching og:image from Instagram and caching locally.
   * 3. Fallback to direct CDN URL or category-based default poster.
   */
  static async resolveThumbnail(instagramUrl: string, category?: string): Promise<{ posterUrl: string; shortcode: string | null }> {
    const shortcode = this.extractShortcode(instagramUrl);
    if (!shortcode) {
      return { posterUrl: this.getFallbackPoster(category), shortcode: null };
    }

    // 1. Check if local poster file already exists
    const localWebPath = `/videos/reels/posters/thumb-${shortcode}.jpg`;
    try {
      if (typeof window === "undefined") {
        const pathModule = await import("path");
        const path = pathModule.default || pathModule;
        const fsModule = await import("fs");
        const fs = fsModule.default || fsModule;
        const localFilePath = path.join(process.cwd(), "public", "videos", "reels", "posters", `thumb-${shortcode}.jpg`);
        if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 1000) {
          return { posterUrl: localWebPath, shortcode };
        }
      }
    } catch {}

    // 2. Fetch from Instagram OpenGraph
    try {
      const ogImageUrl = await this.fetchInstagramOgImage(shortcode);
      if (ogImageUrl) {
        // Attempt downloading and saving locally
        const savedPath = await this.downloadAndSavePoster(ogImageUrl, shortcode);
        if (savedPath) {
          return { posterUrl: savedPath, shortcode };
        }
        // If local save is not possible (e.g. read-only serverless environment), return remote CDN URL
        return { posterUrl: ogImageUrl, shortcode };
      }
    } catch (e) {
      console.warn(`[InstagramThumbnailService] Failed to resolve og:image for ${shortcode}:`, e);
    }

    // 3. Fallback to authentic branded poster frame
    return { posterUrl: this.getFallbackPoster(category), shortcode };
  }
}
