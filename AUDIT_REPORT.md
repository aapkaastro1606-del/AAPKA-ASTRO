# AAPKA ASTRO — Live Production Architecture & Database Audit Report

**Date of Audit**: October 15, 2026  
**Audited Target**: `https://aapkaastro.com/` (Next.js 16.3.5 Turbopack on Vercel)  
**Database**: Neon Serverless PostgreSQL (`neondb` on AWS us-east-2)  
**Auth**: Clerk Core 3  
**Auditor**: Antigravity Autonomous Engineering Agent  

---

## Executive Summary

An exhaustive audit of the codebase, live Neon PostgreSQL database, server runtime stores, and authentication flows was conducted to ascertain why production reports indicate missing data, unpersisted users, and database disconnections.

### Key Audit Findings:
1. **Database Reachability vs. Table Schema**: The Neon PostgreSQL database is **reachable and responsive** (774ms ping latency, PostgreSQL 18.6). However, the tables were pushed via `db push` or manual scripts in the past. **Prisma migrations have NEVER been formally applied to production** — the `_prisma_migrations` tracking table does not exist in the database (`relation "_prisma_migrations" does not exist`).
2. **Vercel Build Command Drift**: The build command in `package.json` is simply `"build": "next build"`. **Vercel does not execute `prisma migrate deploy` before `next build`**, and `DIRECT_URL` is completely omitted from `.env.local` and Vercel build pipelines.
3. **Data Loss on Redeploy (The Memory/localStorage Trap)**:
   - **Bookings / Consultations**: Live in **client-side `localStorage` (`aapka_astro_confirmed_bookings`, `aapka_active_booking`)** and an in-memory array (`memoryConsultations` in `ClientAccountStore`). **Zero bookings exist in PostgreSQL** (`SELECT count(*) FROM "sessions"` returns `0`). Bookings made by clients are trapped in the client's own browser and completely invisible to the client/astrologer.
   - **Payments**: Previously wired to mock/test IDs; `SELECT count(*) FROM "wallet_transactions"` returns `0`.
   - **Blog Posts**: Live in an in-memory array (`memoryBlogPosts` in `src/lib/store/blogStore.ts`) initialized from static text. Any edits or additions made in the admin panel vanish on cold start or redeploy (`SELECT count(*) FROM "blog_posts"` returns `0`).
   - **Reels & Curation Settings**: Stored in client-side `localStorage` (`aapka_curated_reels`) and `DEFAULT_FEATURED_REELS` static file. `SELECT count(*) FROM "instagram_media"` returns `0`.
   - **Pricing Settings**: Stored in a Node process in-memory object (`memoryPricing` in `src/lib/store/adminStore.ts`). When an admin updates prices, they reset back to static defaults on redeploy.
   - **Reviews**: In-memory array (`memoryReviews`). `SELECT count(*) FROM "reviews"` returns `0`.
   - **Free Kundli Leads**: Free Kundli generation in `src/app/api/kundli/calculate/route.ts` **never saves user details to the database** unless `action === "save"` is explicitly dispatched by an already logged-in user. All free seekers are dropped without creating a lead.
4. **Clerk Authentication Drift**:
   - The environment is running on **development / test keys** (`pk_test_...` / `sk_test_...`), not live production keys (`pk_live_...`).
   - `CLERK_WEBHOOK_SECRET` is **not configured** in `.env` or `.env.local`.
   - Not a single real visitor signup exists in the database. The 5 user rows in PostgreSQL are mock test identities seeded on September 26, 2026.

---

## 1. Data Type Audit: Where Does Data Actually Live?

The table below catalogs every core data type in the application, its storage mechanism, file citations, and live Neon PostgreSQL row count:

| Data Type | Intended DB Model | Actual Storage Location | Evidence & File Location | Neon DB Row Count | Survives Redeploy? | Visible to Client? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Users** | `User` | **Hybrid** (PostgreSQL when synced, but falls back to mock object on DB error) | `src/lib/auth/syncUser.ts:150` (`local_${clerkId}`); `src/lib/auth/serverAuth.ts:217` | **5** (All seeded mock users from Sept 26) | Yes (for the 5 test rows) | Partially |
| **Bookings** (Sessions) | `Session` | **localStorage & In-Memory** | `src/lib/store/clientAccountStore.ts:161` (`localStorage.getItem("aapka_active_booking")`); `src/lib/store/astrologerStore.ts:155` (`aapka_astro_confirmed_bookings`); `memoryConsultations` array | **0** (`sessions` table is empty) | **NO** (Trapped in visitor browser) | **NO** (Client cannot see bookings made on another device) |
| **Payments** | `WalletTransaction` | **In-Memory & localStorage** (DB write attempted on payment verify) | `src/app/api/payments/verify/route.ts:74`; `src/lib/store/astrologerStore.ts:154` (`aapka_astro_user_wallet`) | **0** (`wallet_transactions` table is empty) | **NO** | **NO** |
| **Saved Kundlis** | `KundliRecord` | **In-Memory** (`ClientAccountStore`) + conditional DB write if signed in | `src/lib/store/clientAccountStore.ts:78` (`let memorySavedKundlis = []`); `src/lib/services/kundliService.ts:189` (drops guests) | **1** (Single test chart from Sept 26) | **NO** for guest Kundlis | **NO** |
| **Reviews** | `Review` | **In-Memory Array** | `src/lib/store/clientAccountStore.ts:82` (`let memoryReviews: ClientReview[] = []`). `prisma.review` is never invoked in the codebase. | **0** (`reviews` table is empty) | **NO** (Wiped on container restart) | **NO** |
| **Blog Posts** | `BlogPost` | **In-Memory Array & Static Config** | `src/lib/store/blogStore.ts:151` (`let memoryBlogPosts = [...INITIAL_BLOG_POSTS]`). `prisma.blogPost` is never invoked. | **0** (`blog_posts` table is empty) | **NO** (Edits wiped on restart) | **NO** |
| **Reel Settings** | `InstagramMedia` | **localStorage & Static Config** | `src/lib/store/reelsStore.ts:12` (`let memoryReels = [...DEFAULT_FEATURED_REELS]`); `src/config/featuredReels.ts` | **0** (`instagram_media` table is empty) | **NO** (Curated orders wiped on restart) | **NO** |
| **Popup Settings** | *None* | **Static Code & Cookie / localStorage** | `src/components/home/WelcomeConsultationModal.tsx:12` (`aapka_welcome_modal_dismissed`, cookie `aapka_welcome_seen`); content hardcoded | *N/A* (No table) | Cookie/storage survives in user browser | Client cannot toggle remotely |
| **Prices** | *None* | **In-Memory Object & Static Config** | `src/lib/store/adminStore.ts:49` (`let memoryPricing = { ... }`); `src/config/placeholderContent.ts:142` | *N/A* (No table) | **NO** (Admin price updates reset on deploy) | **NO** |
| **Panchang Cache** | `PanchangEntry` | **PostgreSQL (Neon) + Drik Ganita Astronomy Engine** | `src/lib/services/panchangService.ts:192` (`prisma.panchangEntry.upsert`); fallback to `astronomy-engine` | **9** rows | **YES** (Calculated & upserted) | **YES** |
| **Staff Permissions** | `StaffPermission` | **PostgreSQL (Neon) + In-Memory Fallback** | `src/lib/auth/staffPermissions.ts:323` (`prisma.staffPermission.findMany`); `memoryGrants` | **462** rows (Seeded during tests) | **YES** | **YES** |

---

## 2. Production Database & Migration Audit

### 2.1 Database Connection Verification
Direct query test against the configured `DATABASE_URL` (`ep-restless-wildflower-b4r94suj-pooler.c-6.us-east-2.aws.neon.tech`):
```sql
SELECT current_database(), current_user, version();
```
**Result**:
- **Connection**: Successful
- **Database**: `neondb`
- **User**: `neondb_owner`
- **Version**: `PostgreSQL 18.6 (c021049) on aarch64-unknown-linux-gnu`
- **Latency**: ~774ms (via pgbouncer pooler endpoint)

### 2.2 Have Migrations Been Applied to Production?
**Verdict**: **NO.**
Evidence:
```sql
SELECT * FROM "_prisma_migrations";
```
**Error Output**:
```
Raw query failed. Code: 42P01. Message: relation "_prisma_migrations" does not exist.
```
The Prisma migrations tracking table does not exist. The application tables in Neon PostgreSQL were pushed using `prisma db push` or raw DDL in a development session. Because `_prisma_migrations` is absent, standard Prisma deployment commands will fail unless the baseline migration is resolved.

### 2.3 Does Vercel Build Run `prisma migrate deploy` with `DIRECT_URL`?
**Verdict**: **NO.**
Evidence from [`package.json`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/package.json):
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "postinstall": "prisma generate"
}
```
And from [`vercel.json`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/vercel.json):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [ ... ]
}
```
1. Vercel deployment executes `npm run build` which invokes only `next build`.
2. `prisma migrate deploy` is never called during CI/CD.
3. `DIRECT_URL` (direct non-pooled port 5432, required by Prisma Migrate to avoid PgBouncer transaction-pooling errors) is defined in `.env` but **is completely absent from `.env.local`**. If Vercel environment variables do not explicitly include `DIRECT_URL`, migrations cannot be executed even if commanded.

---

## 3. Real User Sign-ups & Clerk Webhook Audit

### 3.1 Does a Real Sign-up Create a User Row?
**Verdict**: **NO in production practice.**
Evidence from Neon PostgreSQL `users` table:
```json
[
  { "id": "cmui3el2p0000vv2chckal7yw", "clerk_id": "user_test_seeker_9988", "name": "Priya Sharma", "created_at": "2026-09-26T07:53:10.705Z" },
  { "id": "cmui1q59f0002vv9k5nzuhp0n", "clerk_id": "user_test_owner_001", "name": "Anmol Garg", "created_at": "2026-09-26T07:06:10.851Z" },
  { "id": "cmui3n7v70002vvegtdhwb7le", "clerk_id": "user_clerk_google_oauth_1790409592875", "name": "Ananya Desai", "created_at": "2026-09-26T07:59:53.491Z" },
  { "id": "cmui3n4k20000vveg79p9p13f", "clerk_id": "user_clerk_email_1790409584656", "name": "Vikram Singhania", "created_at": "2026-09-26T07:59:49.202Z" },
  { "id": "cmui32lz40000vv3op9d5ivep", "clerk_id": "user_clerk_svix_test_01", "name": "Arjun Kapoor", "created_at": "2026-09-26T07:43:52.000Z" }
]
```
- Total users in database: **5**
- Last user created: **September 26, 2026**.
- Zero real visitor accounts have been persisted since launch.

### 3.2 Is the Clerk Webhook Configured & Receiving Events?
**Verdict**: **NO.**
Evidence:
1. `CLERK_WEBHOOK_SECRET` is **undefined** in `.env` and `.env.local`.
2. In [`src/app/api/webhooks/clerk/route.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/app/api/webhooks/clerk/route.ts), while the handler gracefully accepts requests when secret is missing, Clerk has no webhook endpoint configured in the Clerk Dashboard pointing to `https://aapkaastro.com/api/webhooks/clerk`.
3. In [`src/lib/auth/syncUser.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/auth/syncUser.ts):
```ts
let isDbReachable = true;
// ...
if (err?.message?.includes("connect") || err?.message?.includes("Environment variable")) {
  isDbReachable = false;
}
// ...
return {
  id: `local_${userData.clerkId}`,
  clerkId: userData.clerkId,
  // ...
};
```
If a single timeout or connection blip occurs in a serverless function, `isDbReachable` latches to `false`, silently returning mock objects (`local_...`) instead of writing to Postgres.

### 3.3 Is the Production Clerk Instance on Live Keys?
**Verdict**: **NO. It is on Development / Test Keys.**
Evidence:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: starts with `pk_test_...`
- `CLERK_SECRET_KEY`: starts with `sk_test_...`
- Browser runtime logs:
```
[browser] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production.
```
Clerk development instances have aggressive rate limits, ephemeral cookies, and do not handle custom domain session verification reliably across mobile browsers.

---

## 4. Free Kundli Leads Audit

**Client Requirement**: *"Free Kundli leads: the client wants the details of everyone who generates a free Kundli."*

**Actual Code Implementation** ([`src/app/api/kundli/calculate/route.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/app/api/kundli/calculate/route.ts) & [`src/lib/services/kundliService.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/lib/services/kundliService.ts)):
```ts
// src/app/api/kundli/calculate/route.ts
if (action === "save") {
  const saveResult = await KundliService.saveKundli(input, chartData, userId);
  return NextResponse.json({ success: true, ...saveResult });
}
const freeReport = await KundliService.generateFreeChart(input);
return NextResponse.json({ success: true, report: freeReport });
```
```ts
// src/lib/services/kundliService.ts
public static async saveKundli(input, chartData, userId) {
  if (!userId || userId === "guest") {
    return { saved: false, requiresSignup: true };
  }
  // saves only if signed in
}
```
**Findings**:
1. When visitors generate a free Kundli on `/kundli-generator`, the front-end requests `/api/kundli/calculate` without `action: "save"`.
2. Even if `action: "save"` is passed, `KundliService.saveKundli` explicitly **rejects and drops any user without an authenticated `userId`**.
3. **Result**: 100% of free Kundli generation leads are lost immediately upon chart display. The seeker name, date of birth, time of birth, phone number, and birth city are never written to PostgreSQL.

---

## 5. Built Deliverables: Health Check & Owner Diagnostics

### 5.1 Minimal Public Health Endpoint (`/api/health`)
- **File**: [`src/app/api/health/route.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/app/api/health/route.ts)
- **Security**: Publicly accessible, strictly minimal. Performs `SELECT 1` ping.
- **Data Protection**: Zero schema details, zero table names, zero environment variables, zero secrets.
- **HTTP Status**:
  - `200 OK` when Neon PostgreSQL is connected.
  - `503 Service Unavailable` if database connection drops.
- **Output Sample**:
```json
{
  "status": "healthy",
  "database": "connected",
  "latencyMs": 774,
  "timestamp": "2026-10-15T03:56:08.798Z"
}
```

### 5.2 Owner-Only Diagnostics API (`/api/admin/diagnostics`)
- **File**: [`src/app/api/admin/diagnostics/route.ts`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/app/api/admin/diagnostics/route.ts)
- **Access Control**: Strictly gated to `isOwner` (`anmol@aapkaastro.com` or role `OWNER`). Unauthenticated callers receive `403 Forbidden`.
- **Payload Contents**:
  1. `database`: Reachability (`true`), ping latency, database name (`neondb`), version, and masked Neon host.
  2. `migrations`: `tableExists` boolean, applied migration count, and exact drift error.
  3. `tables`: Live row counts for all 12 key tables in Neon PostgreSQL.
  4. `clerk`: Key mode (`TEST` vs `LIVE`), key prefixes only (never secrets), webhook secret status.
  5. `lastWebhookReceived`: Real-time tracking of last received Clerk webhook event.
  6. `envChecklist`: Array of required environment variables with `isSet: true/false` booleans.

### 5.3 Owner-Only Diagnostics Console Page (`/admin/diagnostics`)
- **Page Route**: [`src/app/admin/diagnostics/page.tsx`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/app/admin/diagnostics/page.tsx)
- **Client Component**: [`src/app/admin/diagnostics/DiagnosticsClient.tsx`](file:///c:/Users/anmol/OneDrive/Desktop/AAPKA%20ASTRO/src/app/admin/diagnostics/DiagnosticsClient.tsx)
- **Features**:
  - Real-time probe button with animated status indicators.
  - Color-coded diagnostic cards for Database, Migrations, and Clerk.
  - Live table counts grid highlighting 0-row tables.
  - Environment variable configuration checklist.
  - One-click access integrated into the Staff & Admin headers.

---

## 6. Actionable Remediation Plan

To transition the site from its current in-memory / localStorage state to a production database architecture, the following remediation steps must be executed:

1. **Database Schema & Migrations**:
   - Baseline the existing Neon PostgreSQL schema or mark migration `20260923000000_init` as resolved via `prisma migrate resolve --applied 20260923000000_init`.
   - Update `package.json` build command to:
     ```json
     "build": "prisma migrate deploy && next build"
     ```
   - Add `DIRECT_URL` to Vercel production environment variables.
2. **Eliminate In-Memory & localStorage Traps**:
   - Migrate `ClientAccountStore` and `AstrologerStateStore` bookings to query and insert directly into PostgreSQL `Session` and `WalletTransaction` tables via server routes.
   - Migrate `BlogStore` to read/write `BlogPost` in PostgreSQL.
   - Migrate `ReelsStore` to read/write `InstagramMedia` in PostgreSQL.
   - Create a persistent `PlatformSettings` or `PricingConfig` table in PostgreSQL so admin price adjustments survive deployments.
3. **Capture Free Kundli Leads**:
   - Update `/api/kundli/calculate` to immediately upsert or insert a lead record into `KundliRecord` with seeker contact information (name, phone, birth details), regardless of whether the seeker is signed in.
4. **UPI QR & Manual WhatsApp Payment Workflow**:
   - Complete removal of third-party payment gateways in favor of direct zero-fee UPI QR.
   - Render the static UPI QR code with amount pre-filled (`₹1,051` for first Astro consultation, `₹2,100` for returning, `₹15,000` for Vaastu, `₹501` for Kundli PDF).
   - Display client WhatsApp action button (`+91 93112 15564`) for payment screenshot submission.
5. **Clerk Production Upgrade**:
   - Switch Clerk keys in Vercel to production live keys (`pk_live_...` / `sk_live_...`).
   - Configure webhook endpoint `https://aapkaastro.com/api/webhooks/clerk` in Clerk Dashboard and set `CLERK_WEBHOOK_SECRET`.

---

## 7. Implementation Deliverables & Production Hardening

### 7.1 Manual UPI Booking Workflow & QR Configuration
- **Prisma Migration**: `20261015020000_manual_upi_booking_workflow` applied to Neon PostgreSQL.
- **Official Merchant UPI Account**:
  - Payee Name: `Aapka Astro Official`
  - UPI ID: `9311215564@okbizaxis`
  - WhatsApp Verification Desk: `+91 93112 15564`
- **Dynamic UPI Link**: Formats direct deep-links (`upi://pay?pa=9311215564@okbizaxis&pn=Aapka%20Astro%20Official&am={amount}&tn={bookingRef}`) rendering instant scannable QR with amount and reference locked without unsigned dynamic 'tr' parameter.
- **Workflow State Machine**: `PENDING_PAYMENT` → `PAYMENT_CLAIMED` (with optional UTR & auto WhatsApp handoff) → `CONFIRMED` (Owner verifies bank credit) → `SCHEDULED` (Owner assigns time slot & Google Meet/WhatsApp link) → `COMPLETED` / `REFUNDED` / `REJECTED` / `EXPIRED`.
- **Pricing Enforcement**:
  - First Astro Consultation: **₹1,051** (50% off base ₹2,100).
  - Returning Astro Consultation: **₹2,100**.
  - Vaastu Consultation: Flat **₹15,000**.
  - Kundli Full PDF Report: Flat **₹501**.
- **Owner Verification Queue**: Live at `/admin/bookings` with UTR duplicate prevention and audit logging.

### 7.2 Free Kundli Lead Capture & DPDP Compliance
- **Prisma Migration**: `20261015030000_free_kundli_lead_capture` applied to Neon PostgreSQL.
- **Lead Capture Form (`KundliForm.tsx`)**:
  - Mandatory Fields: Full Name, WhatsApp / Mobile phone number, Date of Birth, Time of Birth, Place of Birth.
  - Optional Field: Email address.
  - Mandatory Unticked Consent Checkbox: *"I agree to be contacted about consultations and services, and I can withdraw consent any time."* with direct anchor to `/privacy-policy#kundli-leads`. Chart calculation is strictly blocked without consent.
  - Anti-Spam: Invisible honeypot field (`website_hp`), form submission velocity check (> 1.2s required), and IP rate limiting.
  - Zero Automated Marketing: Strictly coordinates manual inquiries from Acharya Ji's sanctum desk.
- **Deduplication**: Automatically upserts by phone number to prevent duplicate spam rows while updating birth coordinates and consent timestamps.
- **Owner-Only Leads Console (`/admin/leads`)**:
  - Search across name, phone, email, place.
  - Date range filtering.
  - Direct WhatsApp outreach buttons with prefilled Vedic greetings.
  - RFC 4180 CSV export with mandatory `AuditLog` logging of exporter email and timestamp.
  - Seeker Right to Erasure (Delete on Request) with audit trail logging.
- **Privacy Policy**: Section 5 added with explicit details on collection, retention, and erasure rights (marked "Pending Lawyer Review").

### 7.3 Automated Test Verification Summary
1. `tests/manualUpiBookingWorkflow.test.ts`: **10/10 PASSING**
2. `tests/kundliLeadCapture.test.ts`: **7/7 PASSING**
3. `tests/kundliPdfOrder.test.ts`: **5/5 PASSING**
4. `tests/diagnosticsAndHealth.test.ts`: **3/3 PASSING**
5. `tests/unifiedDatabaseLayer.test.ts`: **13/13 PASSING**
6. Production Build (`npm run build`): **97/97 pages static & dynamic compiled cleanly with 0 TypeScript errors.**

