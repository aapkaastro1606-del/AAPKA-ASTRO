import { MetadataRoute } from "next";
import { BlogStore } from "@/lib/store/blogStore";
import { ZODIAC_SIGNS } from "@/lib/astrology/dailyHoroscope";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aapkaastro.com";
  const now = new Date();

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/services/kundli",
    "/services/vastu",
    "/services/gemstones",
    "/services/consultation",
    "/blog",
    "/panchang",
    "/panchang/tomorrow",
    "/hi/panchang",
    "/hi/panchang/tomorrow",
    "/horoscope",
    "/hi/horoscope",
    "/reels",
    "/testimonials",
    "/contact",
    "/kundli-generator",
    "/calculators/moon-sign",
    "/consult",
    "/wallet",
    "/login",
    "/signup",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency:
      route === "" ||
      route.includes("panchang") ||
      route.includes("horoscope")
        ? ("daily" as const)
        : ("weekly" as const),
    priority:
      route === ""
        ? 1.0
        : route.startsWith("/services") ||
          route === "/consult" ||
          route.includes("panchang") ||
          route.includes("horoscope")
        ? 0.9
        : 0.7,
  }));

  const horoscopeSignRoutes: MetadataRoute.Sitemap = ZODIAC_SIGNS.flatMap((sign) => [
    {
      url: `${baseUrl}/horoscope/${sign.id}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
      alternates: {
        languages: {
          "en-IN": `${baseUrl}/horoscope/${sign.id}`,
          "hi-IN": `${baseUrl}/hi/horoscope/${sign.id}`,
        },
      },
    },
    {
      url: `${baseUrl}/hi/horoscope/${sign.id}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
      alternates: {
        languages: {
          "en-IN": `${baseUrl}/horoscope/${sign.id}`,
          "hi-IN": `${baseUrl}/hi/horoscope/${sign.id}`,
        },
      },
    },
  ]);

  const blogRoutes = BlogStore.getPublishedPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt || Date.now()),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...horoscopeSignRoutes, ...blogRoutes];
}
