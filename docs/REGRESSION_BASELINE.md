# Baseline Regression Audit — Aapka Astro

**Date:** 2026-10-20  
**Branch:** `production-readiness-fixes`  
**Base Commit:** `2a93698`  
**Command:** `npm run verify`  
**Outcome:** **100% PASSED** (All 5 stages passing: ESLint, TypeScript compiler `tsc --noEmit`, 140 automated test suites with 600 tests passing, `next build` static & dynamic route compilation, and live smoke test suite on port 3099).

---

## 1. Verified Working Flows & Verification Method

| Flow / Feature Category | Description | How Verified | Status |
| :--- | :--- | :--- | :--- |
| **Public Landing & Brand Pages** | `/`, `/about`, `/services`, `/services/[slug]`, `/vastu`, `/contact`, `/reels`, `/zodiac-signs` | `npm run verify` Stage 5 smoke tests (`200 OK`) + automated tests | ✅ Verified |
| **Astrology Tools & Calculators** | Panchang, Horoscope, Kundli matching, Kundli generator, Numerology, Flames, Moon sign | `tests/kundliLeadCapture.test.ts`, `tests/verificationDeliverables.test.ts` | ✅ Verified |
| **Bilingual Support (Hindi/English)** | `/hi/panchang`, `/hi/horoscope`, Hindi toggles on calculators and Content Studio | `tests/verificationDeliverables.test.ts` (Devanagari ratio >98%) | ✅ Verified |
| **Legal & Compliance Pages** | `/terms`, `/privacy-policy`, `/refund-policy`, `/disclaimer`, `/pricing-policy` | Stage 5 smoke tests (`200 OK`) + `tests/walletReferenceAudit.test.ts` | ✅ Verified |
| **AI Assistant / Chatbot** | Circuit breaker, Gemini/OpenAI provider error handling, unanswered query logging & PII mask | `tests/assistantEvaluationSuite.test.ts`, `tests/chatbotResilience.test.ts` | ✅ Verified |
| **Consultation & Booking Flow** | Consultation intake form, UPI QR generation, UTR submission, status polling | `tests/manualUpiBookingWorkflow.test.ts`, `tests/postPaymentHandoff.test.ts` | ✅ Verified |
| **Authentication & RBAC** | Clerk auth integration, JIT user sync, session cookies fallback, owner privilege checks | `tests/userSyncAndRoleSecurity.test.ts`, `tests/rbacSecurity.test.ts` | ✅ Verified |
| **Admin Hub & Desk Routes** | `/admin`, `/admin/bookings`, `/admin/leads`, `/admin/content`, `/admin/pricing`, `/admin/diagnostics` | `tests/adminAccessAndNavSecurity.test.ts`, `tests/contentStudioAndAdminHome.test.ts` | ✅ Verified |
| **Media Library & R2 Storage** | Direct browser upload, Cloudflare R2 bucket integration, metadata & usage tracking | `tests/mediaLibraryAndStorage.test.ts` | ✅ Verified |
| **Content Studio & Revisions** | Hero banner, FAQs, testimonials, contacts, draft/publish revisions & rollback | `tests/contentModelAndRevisions.test.ts`, `tests/contentEditingExperience.test.ts` | ✅ Verified |

---

## 2. Issues Targeted for Production Readiness Fixes

1. **Admin Bookings API Authentication Desynchronization**:
   - `src/app/api/admin/bookings/route.ts` used `getAuthFromRequest(req)` (which only checked mock cookies) instead of recognizing live Clerk server sessions and client Bearer tokens.
   - Result: Owner visiting `/admin/bookings` got `403 Unauthorized: Owner privilege required.`, which caused the desk to render empty counters `(0)` and "Queue is Up to Date" despite active pending bookings.
   - Also search and fix this pattern across all admin endpoints (`/api/admin/payment-settings`, `/api/admin/leads`, `/api/admin/content`, `/api/admin/media`, `/api/admin/pricing`, `/api/admin/staff`, `/api/admin/team`, `/api/admin/audit`).
2. **Bookings Queue Client Bearer Header Injection**:
   - `src/app/admin/bookings/BookingsQueueClient.tsx` did not pass the Clerk auth token in headers (`Authorization: Bearer <token>`) during fetch operations.
3. **Optimistic Status Mutation Contradiction**:
   - `src/app/consult/page.tsx` marked `booking.status = "CONFIRMED"` prematurely in `ClientAccountStore` before payment was claimed or approved by the bank desk.
4. **Resilient Seeker UTR Submission**:
   - When seekers submit payment without a UTR, provide an in-place action to attach/update their bank transaction reference directly from `/account/consult`.
