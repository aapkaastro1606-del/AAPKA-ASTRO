import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.aapkaastro.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/admin/*",
          "/account",
          "/account/",
          "/account/*",
          "/api",
          "/api/",
          "/api/*",
          "/dashboard",
          "/dashboard/",
          "/dashboard/*",
          "/wallet",
          "/wallet/",
          "/wallet/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
