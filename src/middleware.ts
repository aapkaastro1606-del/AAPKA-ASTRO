import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { isClerkConfigured, getClerkPublishableKey } from "@/lib/auth/clerkConfig";
import { evaluateRouteAccess, UserRole } from "@/lib/auth/roles";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import {
  isOwnerEmail,
  StaffPermissionService,
  STAFF_SECTIONS,
  StaffSection,
} from "@/lib/auth/staffPermissions";

const isAccountRoute = createRouteMatcher(["/account(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAstrologerRoute = createRouteMatcher(["/astrologer(.*)"]);

const publishableKey = getClerkPublishableKey();
const isProduction = process.env.NODE_ENV === "production";
const isSatelliteDomain =
  publishableKey.startsWith("pk_live_") &&
  process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === "true";
const clerkDomain = isSatelliteDomain ? (process.env.NEXT_PUBLIC_CLERK_DOMAIN || undefined) : undefined;
const signInPath = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/login";
const signUpPath = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/signup";

const isClerkActive = isClerkConfigured();

/**
 * Fallback middleware when Clerk credentials are unconfigured or in local preview.
 * Strictly enforces RBAC against session cookies rather than passing through unconditionally.
 */
function fallbackMiddleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isProtected =
    isDashboardRoute(req) ||
    isAdminRoute(req) ||
    isAstrologerRoute(req);

  if (isProtected) {
    const authState = getAuthFromRequest(req);
    const access = evaluateRouteAccess(
      pathname,
      authState.role,
      authState.isAuthenticated,
      authState.permissions,
      authState.email
    );

    if (!access.allowed) {
      return NextResponse.redirect(new URL(access.redirectUrl, req.url));
    }
  }

  return NextResponse.next();
}

const liveClerkMiddleware = clerkMiddleware(
  async (auth, req) => {
    return NextResponse.next();
  },
  {
    domain: clerkDomain,
    isSatellite: isSatelliteDomain,
    signInUrl: signInPath,
    signUpUrl: signUpPath,
  }
);

export default function middleware(req: NextRequest, event: any) {
  if (isClerkActive) {
    return (liveClerkMiddleware as any)(req, event);
  }
  return fallbackMiddleware(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
