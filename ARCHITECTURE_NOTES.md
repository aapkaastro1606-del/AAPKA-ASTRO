# Architecture Notes: Clerk Authentication vs. PostgreSQL Database

> [!IMPORTANT]
> **CRITICAL ARCHITECTURAL DISTINCTION**:  
> **Clerk handles user identity and login ONLY** and operates 100% independently of this application's database.  
> **All application-specific data** (wallet balances, consultation history, staff permissions, remedy notes, Kundli charts) lives exclusively in this app's own **PostgreSQL database (Neon)**.  
> App data **will not function correctly in production, and test data created during development will not persist**, until a real production database is connected.

---

## 1. The Two Completely Separate Systems

A common misunderstanding during development and testing is assuming that "login is broken" when database records fail to save, or conversely assuming that setting up Clerk automatically provisions database storage for the app. 

Aapka Astro uses two distinct, decoupled systems:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AAPKA ASTRO PLATFORM                             │
└──────────────────────┬───────────────────────────────┬──────────────────────┘
                       │                               │
                       ▼                               ▼
       ┌───────────────────────────────┐ ┌────────────────────────────────────┐
       │     CLERK AUTHENTICATION      │ │     POSTGRESQL DATABASE (NEON)     │
       │    (Identity & Login Only)    │ │      (All Application Data)        │
       ├───────────────────────────────┤ ├────────────────────────────────────┤
       │ • User sign-up & sign-in      │ │ • Seeker wallet balances (₹)       │
       │ • Google OAuth / Email OTP    │ │ • Direct UPI payment transactions  │
       │ • Passwords & session tokens  │ │ • Consultation history & minutes   │
       │ • Email address verification  │ │ • Prescribed remedies & notes      │
       │ • Multi-factor authentication │ │ • Per-section staff permissions    │
       │ • Session claims & JWTs       │ │ • Saved Janam Kundli charts        │
       │                               │ │ • Panchang cache & evergreen data  │
       └───────────────────────────────┘ └────────────────────────────────────┘
                       │                               │
                       │ Returns: { userId, email }    │ Reads/Writes SQL via Prisma
                       ▼                               ▼
       ┌──────────────────────────────────────────────────────────────────────┐
       │                   Next.js App Router Application                     │
       └──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Why Confusion Occurred During Testing

During testing without a live PostgreSQL database running:
1. **Login succeeds**: A user logs in with Clerk via Google or Email OTP. Clerk authenticates them and issues a valid session token.
2. **App data fails or resets**: When the user navigates to their wallet, checks past consultations, or an admin assigns staff permissions, the application queries PostgreSQL via Prisma (`localhost:5432` or `DATABASE_URL`).
3. **If the database is unreachable**:
   - In local development, the application falls back to temporary in-memory stores so the UI doesn't hard-crash.
   - However, **in-memory data never persists**. As soon as the server restarts or a new serverless function spin-up occurs on Vercel, the data disappears.
   - This led testers to believe "login isn't working" or "authentication is corrupted," when in reality **authentication succeeded perfectly** — only the relational database connection was missing.

---

## 3. What Lives in Clerk vs. What Lives in PostgreSQL

| Feature / Data Entity | Where It Lives | Managed By | Dependency on Database? |
| :--- | :--- | :--- | :--- |
| User password & login credentials | **Clerk** | Clerk Auth Cloud | **No**. Works even if database is offline. |
| Google OAuth tokens & verification | **Clerk** | Clerk Auth Cloud | **No**. |
| User email & phone identity | **Clerk** | Clerk Auth Cloud | **No**. |
| Active session JWT cookies | **Clerk** | Clerk Auth Cloud | **No**. |
| **Seeker wallet balance (₹)** | **PostgreSQL** (`User.walletBalance`) | App Prisma Engine | **Yes**. Requires live database to persist. |
| **Direct UPI payment transactions** | **PostgreSQL** (`WalletTransaction` table) | App Prisma Engine | **Yes**. Requires live database to record receipts. |
| **Consultation session history** | **PostgreSQL** (`Consultation` table) | App Prisma Engine | **Yes**. Requires live database to retain history. |
| **Astrologer remedies & notes** | **PostgreSQL** (`Consultation.remedy`) | App Prisma Engine | **Yes**. Requires live database to deliver to client. |
| **Per-section staff permissions** | **PostgreSQL** (`StaffPermission` table) | App Prisma Engine | **Yes**. Stored in app's free DB (avoids paid Clerk orgs). |
| **Saved Janam Kundli charts** | **PostgreSQL** (`KundliProfile` table) | App Prisma Engine | **Yes**. Requires live database to save chart inputs. |
| **Client reviews & ratings** | **PostgreSQL** (`Review` table) | App Prisma Engine | **Yes**. Requires live database to store ratings. |

---

## 4. Why We Designed It This Way (Zero Recurring Cost)

1. **Clerk Organizations Were Avoided Intentionally**:
   - Clerk offers internal roles/permissions, but gates custom RBAC behind paid tiers (\$99+/mo + add-ons).
   - To keep recurring fixed costs at **\$0.00/month**, we keep Clerk on its generous free tier (handling authentication only) and store our own staff permissions, wallet balances, and consultation data in our own PostgreSQL database.
2. **Neon Serverless PostgreSQL (\$0/mo)**:
   - Neon provides 3 GiB of free relational storage with automatic scale-to-zero when idle, resuming in `<500ms` on the next query.
   - Images and consultation video/audio are routed to Cloudflare R2 / Stream, ensuring database storage remains well under free tier limits for thousands of active seekers.

---

## 5. Summary for Go-Live

- **Clerk handles authentication only**. Do not look in Clerk's dashboard for wallet balances, consultation logs, or employee section grants.
- **PostgreSQL (Neon) stores all app business data**.
- Until the production Neon PostgreSQL database is provisioned and its connection string (`DATABASE_URL`) is added to Vercel, app data will operate in fallback mode and will not persist across requests.
- Once `DATABASE_URL` is set and migrations are applied (`npx prisma migrate deploy`), the entire platform is 100% persistent and ready for real seekers.
