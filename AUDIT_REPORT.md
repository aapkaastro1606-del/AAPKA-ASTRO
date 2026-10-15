# System Diagnostics & Architectural Audit Report

**Date:** 2026-10-15  
**Domain Audited:** `https://www.aapkaastro.com`  
**Database Target:** Neon Serverless PostgreSQL (`ep-restless-wildflower-b4r94suj...`)  
**Designated Platform Owner:** `aapkaastro1606@gmail.com` (from `OWNER_EMAIL`)

---

## 1. Executive Verdict

> [!CAUTION]
> **STOPPING RULE TRIGGERED: Clerk production not configured**
>
> Probing the live domain `https://www.aapkaastro.com` proves with 100% certainty that the production site is running a **Clerk Development/Test instance** (`pk_test_...` pointing to `profound-cicada-9694.clerk.accounts.dev`).
>
> Because development instances issue session cookies scoped to `clerk.accounts.dev`, modern web browsers (Chrome, Safari, Edge) treat them as cross-site third-party cookies on `www.aapkaastro.com` and block them during navigation. As a result:
> - The browser JavaScript SDK holds the session token in memory and reports the user is signed in.
> - Server components and route handlers receive no session cookies and evaluate `auth().userId === null`.
> - Navigating to `/admin/bookings` triggers an infinite redirect bounce between `/login?redirect_url=/admin/bookings` and the "Signed In Successfully" interstitial.
>
> **Per specification: No code workarounds are permitted. The production environment must be configured with real Clerk production keys and custom DNS CNAME records.**

---

## 2. Runtime Environment & Clerk Audit

| Probe Point | Live Production State | Local Environment State | Status |
| :--- | :--- | :--- | :--- |
| **Clerk Key Mode** | `TEST` (prefix `pk_test_...`) | `TEST` (prefix `pk_test_...`) | ⚠️ **MISCONFIGURED ON LIVE DOMAIN** |
| **Publishable Key Prefix** | `pk_test_cHJv...` | `pk_test_cHJv...` | Decodes to `profound-cicada-9694.clerk.accounts.dev$` |
| **CLERK_SECRET_KEY** | Present (`true`) | Present (`true`, prefix `sk_test_...`) | Development secret key |
| **CLERK_WEBHOOK_SECRET**| Configured in DB tracker | Configured (`true`, prefix `whsec_...`) | Active |
| **OWNER_EMAIL** | Set to `aapkaastro1606@gmail.com` | Set to `aapkaastro1606@gmail.com` | ✅ Verified |
| **Satellite Variables** | `NEXT_PUBLIC_CLERK_IS_SATELLITE=false`<br>`NEXT_PUBLIC_CLERK_DOMAIN="aapkaastro.com"` | Same | ⚠️ Must be removed completely |

### Satellite Domain Removal Requirement
Clerk's Free plan does not support satellite domains. Aapka Astro uses its own independent Clerk application. All satellite variables (`NEXT_PUBLIC_CLERK_IS_SATELLITE`, `NEXT_PUBLIC_CLERK_DOMAIN`, cross-domain `SIGN_IN_URL`) must be completely unset in Vercel project settings and local `.env` files.

---

## 3. Server Session Recognition & Cookie Audit

- **Server `auth()` Recognition:** `false` (`userId: null` on server component execution over `www.aapkaastro.com`).
- **Host Received:** `www.aapkaastro.com` (classified as `www` host type).
- **Cookies Received by Next.js Server Components:**
  - `__client_uat` (Clerk client Unix authentication timestamp)
  - `aapka_astro_session` (Internal fallback session marker)
  - `aapka_astro_role` (Internal fallback role marker)
  - `__session` (Absent or partitioned by browser due to third-party `accounts.dev` domain origin).
- **Consequence:** Because `__session` is blocked cross-site, `auth()` returns null on server-rendered layouts and server actions.

---

## 4. Database Audit (Neon PostgreSQL)

- **Database Reachability:** Connected (Ping `SELECT 1` succeeded, latency: 863 ms).
- **Target Schema:** PostgreSQL public schema on Neon serverless (`neondb`).
- **Total User Count:** `13` rows in `users` table.
- **Current Owner User Row:**
  - Email: `aapkaastro1606@gmail.com`
  - Database ID: `cmui1q59f0002vv9k5nzuhp0n`
  - Role: `OWNER`
  - Clerk ID: `user_test_owner_001` (placeholder created by early test scripts; NOT linked to a real Clerk production account).
- **Last 5 Sign-ups in Database (Masked Emails):**
  1. `s***3@aapkaastro.com` — Role: `CLIENT` — Clerk ID: `user_live_...` — 2026-10-15T07:30:28Z
  2. `s***1@aapkaastro.com` — Role: `CLIENT` — Clerk ID: `user_live_...` — 2026-10-15T07:28:54Z
  3. `s***0@aapkaastro.com` — Role: `CLIENT` — Clerk ID: `user_live_...` — 2026-10-15T07:28:11Z
  4. `s***2@aapkaastro.com` — Role: `CLIENT` — Clerk ID: `user_live_...` — 2026-10-15T07:27:13Z
  5. `s***1@aapkaastro.com` — Role: `CLIENT` — Clerk ID: `user_live_...` — 2026-10-15T07:23:59Z
- **Last Clerk Webhook Events in Database:**
  - `user.deleted` — Status: `SUCCESS` — 2026-10-15T11:16:00Z
  - `user.updated` — Status: `SUCCESS` — 2026-10-15T11:15:59Z
  - `user.created` — Status: `SUCCESS` — 2026-10-15T11:15:57Z

---

## 5. Next.js 16 Middleware & Convention Audit

- **Executed File:** `src/middleware.ts` is currently executed by Next.js 16.3.5.
- **Convention Deprecation Warning:** Turbopack generates the warning:
  `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.`
- **Handler Execution:** `clerkMiddleware` from `@clerk/nextjs/server` runs as the primary handler when Clerk is active.
- **Route Matcher Coverage Verification:**
  ```ts
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ]
  ```
  - `/admin` → **COVERED** (matches negative lookahead for non-static assets).
  - `/account` → **COVERED** (matches negative lookahead).
  - `/login` → **COVERED** (matches negative lookahead).
  - `/api` → **COVERED** (matches `/(api|trpc)(.*)`).
  - `/__clerk` → **COVERED** (matches `/__clerk/:path*`).

---

## 6. Audit of All Code Paths Assigning the OWNER Role

1. **Environment Configuration:**
   - `OWNER_EMAIL`: Primary source of truth. Parsed by `src/lib/auth/staffPermissions.ts` via `isOwnerEmail()`. Case-insensitive match against `aapkaastro1606@gmail.com`.
   - `NEXT_PUBLIC_OWNER_EMAIL`: Client-side fallback.
2. **Server Auth & Anti-Tamper Enforcement:**
   - `src/lib/auth/serverAuth.ts`:
     - `getAuthFromRequest()` (lines 135-142): Strictly resets `role` to `CLIENT` if a non-matching email attempts to claim `role === "OWNER"`.
     - `getServerAuthUser()` (lines 222-225): Disallows Clerk metadata claiming `OWNER` without matching `isOwnerEmail(email)`.
     - When `isOwnerEmail(email)` matches, unconditionally elevates role to `OWNER` and calls `StaffPermissionService.ensureOwnerRoleInDatabase(email)`.
3. **Database Column & Enum:**
   - Table: `users`
   - Column: `role`
   - Enum: `UserRole` with values `['CLIENT', 'ASTROLOGER', 'ADMIN', 'OWNER']`.
4. **User Sync Pipeline:**
   - `src/lib/auth/syncUser.ts`: Evaluates `isOwnerEmail(normalizedEmail)` upon every Clerk sign-up or session sync. If true, writes `role: "OWNER"` directly into the PostgreSQL `users` table.
5. **Staff Permission Engine:**
   - `src/lib/auth/staffPermissions.ts`:
     - `ensureOwnerRoleInDatabase(email)`: Auto-promotes user record in database.
     - `hasStaffSectionAccess()`: Grants unconditional `MANAGE` access to all sections for `OWNER`.
     - Section management console (`/admin/staff` and `/admin/team`) strictly blocks non-owners even if their role is `ADMIN`.
6. **Test Seeds & Verification Fixtures:**
   - `tests/sectionEnforcement.test.ts`: Seeds mock user `usr_owner_official` with role `OWNER`.
   - `tests/staffPermissions.test.ts`: Mocks `usr_owner_001` with role `OWNER`.
   - `tests/teamAccess.test.ts`: Mocks `usr_owner_001` with role `OWNER`.

---

## 7. Audit of All Scripts Under `/scripts`

| Script Path | Purpose | Database Target |
| :--- | :--- | :--- |
| `scripts/audit_db_enums.js` | Inspects PostgreSQL schema enums (`UserRole`, `ConsultationStatus`) | **Neon PostgreSQL** via `DATABASE_URL` |
| `scripts/build.js` | Custom build wrapper running Prisma client generation and Next.js build | **Neon PostgreSQL** (`DATABASE_URL` / `DIRECT_URL`) |
| `scripts/e2e-core-flow-walkthrough.ts` | End-to-end integration walkthrough | **Neon PostgreSQL** via `@/lib/db/prisma` |
| `scripts/generate_icons.mjs` | Generates PWA and site icons | *None (File system only)* |
| `scripts/generate_proof_report.ts` | Verification proof report generator | **Neon PostgreSQL** via `@/lib/db/prisma` |
| `scripts/verify-db-user-sync.ts` | Validates Clerk to Neon database synchronization | **Neon PostgreSQL** via `@/lib/db/prisma` |
| `scripts/verify-neon-connection.ts` | Tests pooled vs unpooled Neon connection latency | **Neon PostgreSQL** via `DATABASE_URL` |

*Every script in `/scripts` that interacts with a database exclusively targets the configured Neon PostgreSQL database.*

---

## 8. Public Health & Diagnostics Endpoints Verification

1. **Public Health Check (`/api/health`):**
   - **Method:** `GET`
   - **Access:** Public
   - **Payload Format:**
     ```json
     {
       "status": "healthy",
       "database": "connected",
       "latencyMs": 863,
       "timestamp": "2026-10-15T14:47:51.090Z"
     }
     ```
   - **Data Leakage Check:** Zero schema, table names, environment strings, or stack traces are returned. If the database disconnects, it returns `{ "status": "unhealthy", "database": "disconnected", "latencyMs": 0, "timestamp": "..." }` with HTTP 503.
2. **Owner-Only System Diagnostics (`/admin/diagnostics` & `/api/admin/diagnostics`):**
   - **Access:** Strictly restricted to `aapkaastro1606@gmail.com`.
   - **Authorization:** Checks server session `auth()`, cookie auth, and Bearer token from Clerk client SDK.
   - **Live Probe:** Reports runtime Clerk key mode, server session recognition, received cookie names, apex vs www host, current user database row presence, total user count, last 5 sign-ups (masked), last webhook, environment checklist, and satellite variable audit.
   - **Secrets Safety:** Never prints secrets or full keys (only prefixes like `pk_test_...` and boolean true/false).
