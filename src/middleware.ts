import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { isClerkConfigured, getClerkPublishableKey } from "@/lib/auth/clerkConfig";
import { evaluateRouteAccess } from "@/lib/auth/roles";
import { getAuthFromRequest } from "@/lib/auth/serverAuth";
import { validateRedirectUrl } from "@/lib/auth/redirectValidation";

const isAccountRoute = createRouteMatcher(["/account(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAstrologerRoute = createRouteMatcher(["/astrologer(.*)"]);

const isClerkActive = isClerkConfigured();

/**
 * Fallback middleware when Clerk credentials are unconfigured or in local preview.
 * Strictly enforces RBAC against session cookies.
 */
function fallbackMiddleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isProtected =
    isAccountRoute(req) ||
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
      const validRedirect = validateRedirectUrl(access.redirectUrl);
      return NextResponse.redirect(new URL(validRedirect, req.url));
    }
  }

  return NextResponse.next();
}

/**
 * Standard Clerk Middleware with Server-Side Route Protection.
 * Protects /account/*, /admin/*, /dashboard/*, and /astrologer/* at the edge.
 */
const liveClerkMiddleware = clerkMiddleware(
  async (auth, req) => {
    const pathname = req.nextUrl.pathname;
    const isProtected =
      isAccountRoute(req) ||
      isAdminRoute(req) ||
      isDashboardRoute(req) ||
      isAstrologerRoute(req);

    if (isProtected) {
      const session = await auth();
      if (!session || !session.userId) {
        const rawTarget = pathname + (req.nextUrl.search || "");
        const validRedirect = validateRedirectUrl(rawTarget);
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect_url", validRedirect);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  },
  {
    publishableKey: getClerkPublishableKey(),
    signInUrl: "/login",
    signUpUrl: "/signup",
  }
);

export default function middleware(req: NextRequest, event: any) {
  // 1. Canonical Host Enforcement: apex (aapkaastro.com) -> canonical (www.aapkaastro.com) via 308
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  if (host === "aapkaastro.com") {
    const canonicalUrl = req.nextUrl.clone();
    canonicalUrl.protocol = "https:";
    canonicalUrl.host = "www.aapkaastro.com";
    canonicalUrl.port = "";
    return NextResponse.redirect(canonicalUrl, 308);
  }

  // 2. Delegate to appropriate authentication middleware
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
