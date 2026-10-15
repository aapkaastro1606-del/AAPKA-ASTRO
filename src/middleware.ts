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
  const hostname = req.nextUrl.hostname;
  if (hostname === "www.aapkaastro.com") {
    const url = req.nextUrl.clone();
    url.hostname = "aapkaastro.com";
    return NextResponse.redirect(url, 308);
  }

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
    // Canonical apex domain redirect: redirect www.aapkaastro.com to aapkaastro.com
    const hostname = req.nextUrl.hostname;
    if (hostname === "www.aapkaastro.com") {
      const url = req.nextUrl.clone();
      url.hostname = "aapkaastro.com";
      return NextResponse.redirect(url, 308);
    }

    const pathname = req.nextUrl.pathname;
    const isProtected =
      isDashboardRoute(req) ||
      isAdminRoute(req) ||
      isAstrologerRoute(req);

    if (isProtected) {
      try {
        const session = await auth();

        if (!session.userId) {
          const signInUrl = new URL(signInPath, req.url);
          signInUrl.searchParams.set("redirect_url", req.url);
          return NextResponse.redirect(signInUrl);
        }

        const sessionClaims = session.sessionClaims as any;
        const email =
          sessionClaims?.email || sessionClaims?.primaryEmailAddress || null;

        // In Clerk Edge Middleware, sessionClaims does not include email unless custom JWT template is configured.
        // If email and role metadata are absent, allow request to proceed to the server page handler
        // where getServerAuthUser() uses Node.js runtime (currentUser() & Neon PostgreSQL) for accurate verification.
        if (!email && !sessionClaims?.metadata?.role && !sessionClaims?.publicMetadata?.role) {
          return NextResponse.next();
        }

        const isOwner = isOwnerEmail(email);

        let rawRole =
          sessionClaims?.metadata?.role ||
          sessionClaims?.publicMetadata?.role ||
          sessionClaims?.unsafeMetadata?.role ||
          "CLIENT";

        // Anti-tamper: metadata claiming OWNER without matching OWNER_EMAIL is disallowed
        if (String(rawRole).toUpperCase() === "OWNER" && !isOwner) {
          rawRole = "CLIENT";
        }

        const userRole: UserRole = isOwner
          ? "OWNER"
          : (String(rawRole).toUpperCase() as UserRole);

        const permissions = isOwner
          ? (STAFF_SECTIONS.map((s) => s.id) as StaffSection[])
          : StaffPermissionService.getPermissionsSync(email || "");

        const access = evaluateRouteAccess(
          pathname,
          userRole,
          true,
          permissions,
          email
        );
        if (!access.allowed) {
          return NextResponse.redirect(new URL(access.redirectUrl, req.url));
        }
      } catch (err: any) {
        console.warn("Clerk authentication verification notice:", err?.message || err);
        // CRITICAL DEFENSE: If auth resolution errors on a protected route, never pass through!
        const signInUrl = new URL(signInPath, req.url);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
      }
    }

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
