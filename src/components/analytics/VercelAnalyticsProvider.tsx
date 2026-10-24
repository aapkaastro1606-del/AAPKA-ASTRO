"use client";

import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { isRouteExcluded, isStaffOrOwnerUser } from "@/lib/analytics/trackEvent";
import { sanitizeUrl } from "@/lib/analytics/piiSanitizer";

const IS_VERCEL_ANALYTICS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true" ||
  process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "true" ||
  process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "1";

export function VercelAnalyticsProvider() {
  if (!IS_VERCEL_ANALYTICS_ENABLED) {
    return null;
  }

  return (
    <>
      <Analytics
        beforeSend={(event) => {
          // Exclude /admin, /dashboard, /instructor, /account
          if (isRouteExcluded(event.url)) {
            return null;
          }
          // Do not track signed-in Owner or staff
          if (isStaffOrOwnerUser()) {
            return null;
          }
          // Clean URL of any query parameters or PII
          return {
            ...event,
            url: sanitizeUrl(event.url),
          };
        }}
      />
      <SpeedInsights
        beforeSend={(data) => {
          if (isRouteExcluded(data.url)) {
            return null;
          }
          if (isStaffOrOwnerUser()) {
            return null;
          }
          return {
            ...data,
            url: sanitizeUrl(data.url),
          };
        }}
      />
    </>
  );
}
