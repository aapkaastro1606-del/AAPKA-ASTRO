# Release Safety, Deployment & Incident Response Guide

**Platform:** Aapka Astro (`https://www.aapkaastro.com`)  
**Production Runtime:** Vercel Serverless (Next.js 16)  
**Database:** Neon Serverless PostgreSQL (`ep-restless-wildflower-b4r94suj`)  
**Staging Database:** Neon Staging Branch (`ep-summer-grass-b4twg911`)  
**Authentication:** Clerk Production Instance (`clerk.aapkaastro.com`)  

---

## 1. Release Workflow & Branch Strategy

All production updates follow a strict 5-stage release gate to guarantee zero regressions, zero data loss, and uninterrupted service.

```
Feature / Hardening Branch  ──▶  npm run verify (Local Gate)  ──▶  Push to Branch
                                                                        │
Production (main)  ◀──  PR Review & Merge  ◀──  Vercel Preview Build ───┘
```

### Stage 1: Dedicated Branch
* **NEVER push directly to `main`.** Production auto-deploys from the `main` branch.
* Always create a dedicated branch:
  ```bash
  git checkout -b go-live-hardening
  # or: git checkout -b feat/your-feature-name
  ```

### Stage 2: Mandatory Local Verification Gate (`npm run verify`)
Before pushing any commit, execute the release verification suite:
```bash
npm run verify
```
This runs 5 sequential safety stages:
1. **Linting**: `eslint src/ --max-warnings=1000` (Catches syntax, unused variables, and style regressions).
2. **Typechecking**: `tsc --noEmit` (Guarantees zero TypeScript compilation errors).
3. **Automated Unit & Integration Tests**: `tsx --env-file=.env.test --test tests/**/*.test.ts` (Executes all test suites in staging isolation).
4. **Next.js Production Build**: `next build` (Verifies static site generation and bundle compilation).
5. **Live Smoke Tests (`next start`)**: Spawns the production build on an isolated port and tests:
   * Key routes return `200 OK`: `/`, `/about`, `/services`, `/consult`, `/contact`, `/sitemap.xml`, `/robots.txt`.
   * Legal routes return `200 OK`: `/privacy-policy`, `/terms`, `/disclaimer`, `/pricing-policy`, `/refund-policy`.
   * Unauthenticated `/admin` navigation correctly redirects to `/login`.
   * Shallow `/api/health` returns `200 OK` with `status: "healthy"` and zero database wakeups.

> [!CAUTION]
> If any step of `npm run verify` fails, **DO NOT PUSH**. Fix the error locally and rerun.

### Stage 3: Push & Pull Request
Push your branch to GitHub and create a Pull Request against `main`:
```bash
git push -u origin <branch-name>
```
* Every migration added must be listed in the PR description.
* GitHub Actions CI (`.github/workflows/ci.yml`) will automatically run the same verification suite on GitHub runners.

### Stage 4: Vercel Preview Testing
* Vercel builds a dedicated Preview Deployment URL for the pull request.
* Verify key functionality on the preview:
  1. Login with `aapkaastro1606@gmail.com` -> Admin Desk navigation appears.
  2. Visit `/consult` -> UPI QR renders correctly with dynamic reference.
  3. Floating Assistant -> Button renders in compact circular style and answers accurately.

### Stage 5: Peer Review & Merge
Once checks pass and changes are approved, merge the Pull Request to `main`. Vercel automatically deploys the update to Production.

---

## 2. Instant Rollback Procedure

If a regression or unforeseen issue occurs in production, follow this zero-downtime rollback procedure:

### Fast Rollback: Vercel "Promote to Production" (Recommended: < 10 seconds)
1. Open the [Vercel Dashboard](https://vercel.com/) and go to the **AAPKA ASTRO** project.
2. Click the **Deployments** tab.
3. Locate the last known good production deployment.
4. Click the three dots menu (**`•••`**) next to that deployment.
5. Select **"Promote to Production"**.
6. Vercel instantly switches 100% of live traffic to the previous deployment. Zero rebuild required.

### Codebase Rollback (Git Sync)
After promoting the previous deployment in Vercel, revert the commit in Git to keep `main` in sync:
```bash
git checkout main
git pull origin main
git revert <faulty-commit-sha>
npm run verify
git push origin main
```

---

## 3. Database Migration & Safety Rules

The production database is hosted on **Neon Serverless PostgreSQL**. Because serverless instances sleep when idle and handle live transactions, strict rules apply:

### Rule 1: Strictly Additive & Backwards-Compatible
* **Never drop columns, rename columns, or drop tables** during an active release pass.
* New columns must be either `NULLABLE` or have a safe `DEFAULT` value.
* Migrations must use idempotent SQL (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).

### Rule 2: Neon Staging Isolation
* **Never run migrations or tests directly against production.**
* Local tests and scripts run exclusively against the staging connection string:
  ```env
  DATABASE_URL="postgresql://...ep-summer-grass-b4twg911-pooler.../neondb"
  IS_STAGING_ENVIRONMENT="true"
  ALLOW_STAGING_SCRIPTS="true"
  ```
* All scripts in `/scripts` enforce `assertStagingEnvironment()`, which aborts if pointed to the production database (`ep-restless-wildflower-b4r94suj`).

### Rule 3: Forbid Destructive Prisma Commands
* Commands `prisma db push` and `prisma migrate reset` are strictly forbidden on production.
* If required on staging, use the guarded scripts:
  ```bash
  npm run prisma:db-push   # Guarded: executes only on verified staging
  npm run prisma:reset     # Guarded: executes only on verified staging
  ```
* Production migrations are deployed exclusively via `npx prisma migrate deploy` in the build pipeline (`scripts/build.js`).

---

## 4. Incident Response Checklist

Follow this checklist whenever an alert or anomaly is detected:

### Step 1: Severity Assessment
| Severity | Impact | Action Required |
| :--- | :--- | :--- |
| **Sev-1 (Critical)** | Core site down, consultation booking broken, auth failing globally. | Immediate rollback via Vercel "Promote to Production". |
| **Sev-2 (Degraded)** | AI assistant unresponsive, background cron delayed, email delivery issue. | Investigate logs; apply fallback flags without rollback. |

### Step 2: Immediate Mitigation (Safe Fallbacks)
* **If AI Assistant fails or rate-limits**:
  Set `CHATBOT_ENABLE_FALLBACK="true"` in Vercel to route queries to the built-in deterministic engine at \$0 cost.
* **If Resend Email fails**:
  `BookingEmailService` is designed to fail loudly in logs without rolling back booking transactions. Bookings remain safely recorded in PostgreSQL `/admin/bookings`.
* **If Clerk session mismatch occurs**:
  Seekers and Admin can use `/api/auth/sync` or sign out and sign in directly on `www.aapkaastro.com/login`.

### Step 3: Diagnostic Probing
1. **Shallow Health Check**:
   ```bash
   curl -I https://www.aapkaastro.com/api/health
   # Returns HTTP 200 without waking up Neon database
   ```
2. **Deep Health Check (Authorized)**:
   ```bash
   curl -H "Authorization: Bearer <CRON_SECRET>" "https://www.aapkaastro.com/api/health?deep=1"
   # Returns DB latency, migration count, and provider status
   ```
3. **Owner System Diagnostics**:
   Log in as `aapkaastro1606@gmail.com` and open:
   `https://www.aapkaastro.com/admin/diagnostics`

### Step 4: Log Inspection
* **Vercel Runtime Logs**: Check Vercel Dashboard > Logs for unhandled exceptions.
* **Audit Logs in PostgreSQL**: Query the `audit_logs` table for recent payment setting modifications or booking status changes.
* **Clerk Webhook Logs**: Check Clerk Dashboard > Developers > Webhooks > Endpoint Logs for failed delivery attempts.

### Step 5: Post-Incident Resolution
1. Create a fix branch (`fix/incident-YYYY-MM-DD`).
2. Add regression tests in `tests/`.
3. Verify with `npm run verify`.
4. Merge and deploy.
