import { prisma } from "../src/lib/db/prisma";

export interface CandidateUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  clerkId: string | null;
  createdAt: string;
  reason: string;
  sessions: { id: string; bookingId: string | null; status: string; amount: number }[];
  wallets: { id: string; balance: number }[];
  kundliRecords: { id: string; name: string }[];
  kundliLeads: { id: string; name: string }[];
}

export const PROTECTED_EMAILS = [
  "aapkaastro1606@gmail.com",
];

export function isTestEmail(email: string | null): string | null {
  if (!email) return null;
  const lower = email.trim().toLowerCase();

  if (PROTECTED_EMAILS.includes(lower)) {
    return null; // NEVER DELETE
  }

  if (lower === "anmol@aapkaastro.com" || lower.includes("anmol@")) {
    return "Fake / Non-existent Owner Address (anmol@...)";
  }

  if (lower.startsWith("seeker.live.") || lower.includes(".live.proof.")) {
    return "Verification script test seeker (seeker.live.*)";
  }

  if (lower.startsWith("svix_test@") || lower.includes("svix_test")) {
    return "Svix webhook test user (svix_test@...)";
  }

  if (lower.endsWith("@example.com") || lower.includes("test-") || lower.includes("reject-")) {
    return "Mock / Example test user (*@example.com)";
  }

  if (lower.includes(".singhania.") || lower.includes(".desai.")) {
    return "Hardcoded seed test user";
  }

  if (lower === "newseeker@gmail.com") {
    return "Sync test seeker (newseeker@gmail.com)";
  }

  return null;
}

export function isTestName(name: string | null): string | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (lower.includes("email test user")) return "Test User ('Email Test User')";
  if (lower.includes("reject test user")) return "Test User ('Reject Test User')";
  if (lower.includes("rogue claiming owner")) return "Test User ('Rogue Claiming Owner')";
  return null;
}

export async function runDryRunAudit(options: { keepEmails?: string[] } = {}) {
  const keepList = [...PROTECTED_EMAILS, ...(options.keepEmails || []).map((e) => e.toLowerCase().trim())];

  const allUsers = await prisma.user.findMany({
    include: {
      wallet: true,
      walletTransactions: true,
      clientSessions: true,
      kundliRecords: true,
      kundliLeads: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const candidatesToDelete: CandidateUser[] = [];
  const usersToKeep: any[] = [];
  const needsReview: any[] = [];

  for (const u of allUsers) {
    const emailLower = u.email?.toLowerCase().trim() || "";

    if (keepList.includes(emailLower)) {
      usersToKeep.push({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        reason: emailLower === "aapkaastro1606@gmail.com" ? "PROTECTED OWNER" : "Marked Keep by Developer",
      });
      continue;
    }

    const emailReason = isTestEmail(u.email);
    const nameReason = isTestName(u.name);

    if (emailReason || nameReason) {
      candidatesToDelete.push({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        clerkId: u.clerkId,
        createdAt: u.createdAt.toISOString(),
        reason: emailReason || nameReason || "Test Pattern",
        sessions: u.clientSessions.map((s) => ({
          id: s.id,
          bookingId: s.bookingId,
          status: s.bookingStatus,
          amount: s.lockedAmount,
        })),
        wallets: u.wallet ? [{ id: u.wallet.id, balance: u.wallet.balance }] : [],
        kundliRecords: u.kundliRecords.map((k) => ({ id: k.id, name: k.name })),
        kundliLeads: u.kundliLeads.map((l) => ({ id: l.id, name: l.name })),
      });
    } else {
      needsReview.push({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        sessionsCount: u.clientSessions.length,
        createdAt: u.createdAt.toISOString(),
      });
    }
  }

  // Also check for any orphaned sessions belonging to test patterns
  const existingUserIds = allUsers.map((u) => u.id);
  const orphanedSessions = await prisma.session.findMany({
    where: {
      clientId: { notIn: existingUserIds },
    },
  });

  return {
    totalUsers: allUsers.length,
    candidatesToDelete,
    usersToKeep,
    needsReview,
    orphanedSessions,
  };
}

async function main() {
  const { assertStagingEnvironment } = require("./guard");
  assertStagingEnvironment("db_cleanup.ts");

  const isDryRun = !process.argv.includes("--execute");
  console.log("================================================================================");
  console.log(`AAPKA ASTRO - DATABASE CLEANUP AUDIT ${isDryRun ? "[DRY RUN ONLY]" : "[EXECUTE MODE]"}`);
  console.log("================================================================================\n");

  const audit = await runDryRunAudit();

  console.log(`Audited ${audit.totalUsers} total users in database.\n`);

  console.log("--------------------------------------------------------------------------------");
  console.log("1. USERS TO KEEP (NEVER DELETED):");
  console.log("--------------------------------------------------------------------------------");
  for (const u of audit.usersToKeep) {
    console.log(`  [KEEP] ${u.email} | Name: ${u.name || "N/A"} | Role: ${u.role} (${u.reason})`);
  }

  console.log("\n--------------------------------------------------------------------------------");
  console.log("2. CANDIDATES PROPOSED FOR DELETION (TEST PATTERNS & DEPENDENCIES):");
  console.log("--------------------------------------------------------------------------------");
  let totalSessions = 0;
  let totalWallets = 0;
  let totalLeads = 0;
  let totalKundlis = 0;

  for (const c of audit.candidatesToDelete) {
    totalSessions += c.sessions.length;
    totalWallets += c.wallets.length;
    totalLeads += c.kundliLeads.length;
    totalKundlis += c.kundliRecords.length;

    console.log(`\n  * User ID: ${c.id}`);
    console.log(`    Email:    ${c.email}`);
    console.log(`    Name:     ${c.name || "N/A"}`);
    console.log(`    Role:     ${c.role}`);
    console.log(`    Reason:   ${c.reason}`);
    console.log(`    Created:  ${c.createdAt}`);
    if (c.sessions.length > 0) {
      console.log(`    Dependent Bookings (${c.sessions.length}):`);
      for (const s of c.sessions) {
        console.log(`      - Booking ID: ${s.bookingId || s.id} | Status: ${s.status} | Amount: Rs.${s.amount}`);
      }
    }
    if (c.wallets.length > 0) {
      console.log(`    Dependent Wallets: ${c.wallets.map((w) => `${w.id} (Balance: ${w.balance})`).join(", ")}`);
    }
    if (c.kundliLeads.length > 0) {
      console.log(`    Dependent Kundli Leads: ${c.kundliLeads.map((l) => `${l.id} (${l.name})`).join(", ")}`);
    }
    if (c.kundliRecords.length > 0) {
      console.log(`    Dependent Kundli Records: ${c.kundliRecords.map((k) => `${k.id} (${k.name})`).join(", ")}`);
    }
  }

  if (audit.needsReview.length > 0) {
    console.log("\n--------------------------------------------------------------------------------");
    console.log("3. ACCOUNTS NEEDING DEVELOPER REVIEW (NEITHER OWNER NOR OBVIOUS TEST PATTERN):");
    console.log("--------------------------------------------------------------------------------");
    for (const nr of audit.needsReview) {
      console.log(`  [REVIEW] ${nr.email} | Name: ${nr.name || "N/A"} | Role: ${nr.role} | Bookings: ${nr.sessionsCount} | Created: ${nr.createdAt}`);
    }
  }

  console.log("\n================================================================================");
  console.log("SUMMARY OF PROPOSED DELETIONS:");
  console.log("================================================================================");
  console.log(`Users to Delete:            ${audit.candidatesToDelete.length}`);
  console.log(`Sessions/Bookings to Delete: ${totalSessions + audit.orphanedSessions.length}`);
  console.log(`Wallets to Delete:          ${totalWallets}`);
  console.log(`Kundli Leads to Delete:     ${totalLeads}`);
  console.log(`Kundli Records to Delete:   ${totalKundlis}`);
  console.log(`Users Kept (Protected):     ${audit.usersToKeep.length}`);
  console.log(`Users Needing Review:       ${audit.needsReview.length}`);
  console.log("================================================================================\n");

  if (isDryRun) {
    console.log(">>> DRY RUN COMPLETE: 0 ROWS WERE DELETED.");
    console.log(">>> To execute after review, run: npx tsx scripts/db_cleanup.ts --execute --confirm-delete");
  } else {
    if (!process.argv.includes("--confirm-delete")) {
      console.error("FATAL: Execution requires explicit --confirm-delete flag.");
      process.exit(1);
    }
    console.log("Execution requested. Proceeding with deletion...");
    for (const c of audit.candidatesToDelete) {
      // 1. Delete dependent sessions
      if (c.sessions.length > 0) {
        await prisma.session.deleteMany({ where: { clientId: c.id } });
      }
      // 2. Delete dependent wallets & transactions
      if (c.wallets.length > 0) {
        await prisma.walletTransaction.deleteMany({ where: { userId: c.id } });
        await prisma.wallet.deleteMany({ where: { userId: c.id } });
      }
      // 3. Delete dependent kundli records & leads
      if (c.kundliRecords.length > 0) {
        await prisma.kundliRecord.deleteMany({ where: { userId: c.id } });
      }
      if (c.kundliLeads.length > 0) {
        await prisma.kundliLead.deleteMany({ where: { userId: c.id } });
      }
      // 4. Delete user
      await prisma.user.delete({ where: { id: c.id } });
      console.log(`Deleted user ${c.email} (${c.id}) and all dependent rows.`);
    }
    console.log("Database cleanup execution completed successfully.");
  }
}

if (require.main === module) {
  main().catch(console.error).finally(() => prisma.$disconnect());
}
