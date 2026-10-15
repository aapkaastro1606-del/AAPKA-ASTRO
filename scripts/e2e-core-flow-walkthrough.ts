import { prisma } from "../src/lib/db/prisma";
import { syncClerkUserToDatabase } from "../src/lib/auth/syncUser";
import { POST as clerkWebhookPost } from "../src/app/api/webhooks/clerk/route";
import { LiveQueueService } from "../src/lib/redis/queue";
import { ClientAccountStore } from "../src/lib/store/clientAccountStore";
import { NextRequest } from "next/server";
import { Webhook } from "svix";
import { enforceStagingDatabase } from "../src/lib/db/stagingGuard";

async function executeFullCoreFlowWalkthrough() {
  enforceStagingDatabase("e2e-core-flow-walkthrough");
  console.log("\n================================================================================");
  console.log("   AAPKA ASTRO — FULL CORE-FLOW VERIFICATION WALKTHROUGH");
  console.log("================================================================================\n");

  const results: Record<string, any> = {};
  const createdUserIds: string[] = [];

  const svixSecret = "whsec_" + Buffer.from("walkthrough-test-secret-key-123456").toString("base64");
  process.env.CLERK_WEBHOOK_SECRET = svixSecret;
  const wh = new Webhook(svixSecret);

  // ------------------------------------------------------------------------------
  // STEP 1: Sign up as brand-new user (email/password)
  // ------------------------------------------------------------------------------
  console.log("▶ [STEP 1] Testing Sign-up as brand-new user (Email / Password)...");
  const ts1 = Date.now();
  const emailUserClerkId = `user_clerk_email_${ts1}`;
  const emailUserEmail = `vikram.singhania.${ts1}@gmail.com`;
  const emailUserName = "Vikram Singhania";
  const emailUserPhone = `+919811${String(ts1).slice(-6)}`;

  const emailWebhookPayload = {
    type: "user.created",
    data: {
      id: emailUserClerkId,
      email_addresses: [{ id: "em_email_1", email_address: emailUserEmail }],
      primary_email_address_id: "em_email_1",
      first_name: "Vikram",
      last_name: "Singhania",
      phone_numbers: [{ phone_number: emailUserPhone }],
    },
  };

  const rawBody1 = JSON.stringify(emailWebhookPayload);
  const msgId1 = `msg_email_${ts1}`;
  const date1 = new Date();
  const sig1 = wh.sign(msgId1, date1, rawBody1);

  const req1 = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
    method: "POST",
    body: rawBody1,
    headers: {
      "content-type": "application/json",
      "svix-id": msgId1,
      "svix-timestamp": Math.floor(date1.getTime() / 1000).toString(),
      "svix-signature": sig1,
    },
  });

  const res1 = await clerkWebhookPost(req1);
  const data1 = await res1.json();
  console.log("  Webhook Status:", res1.status, "| Payload Response:", data1);

  if (res1.status !== 200 || !data1.success) {
    throw new Error(`Step 1 failed: Webhook did not succeed (${JSON.stringify(data1)})`);
  }

  // Confirm row exists in Neon PostgreSQL
  const dbUser1 = await prisma.user.findUnique({
    where: { clerkId: emailUserClerkId },
    include: { wallet: true },
  });

  if (!dbUser1) {
    throw new Error(`Step 1 failed: User record for ${emailUserClerkId} does not exist in Neon DB!`);
  }
  createdUserIds.push(dbUser1.id);

  console.log("  ✔ PostgreSQL User Record Confirmed in Neon:", {
    id: dbUser1.id,
    clerkId: dbUser1.clerkId,
    email: dbUser1.email,
    name: dbUser1.name,
    role: dbUser1.role,
    walletBalance: dbUser1.walletBalance,
    hasWalletRow: !!dbUser1.wallet,
    walletInitialBalance: dbUser1.wallet?.balance,
  });

  if (dbUser1.walletBalance !== 0 || dbUser1.wallet?.balance !== 0) {
    throw new Error(`Step 1 failed: Default wallet balance is not 0 (got user:${dbUser1.walletBalance}, wallet:${dbUser1.wallet?.balance})`);
  }
  if (dbUser1.role !== "CLIENT") {
    throw new Error(`Step 1 failed: Expected role CLIENT, got ${dbUser1.role}`);
  }

  results.step1 = {
    status: "PASSED",
    clerkId: dbUser1.clerkId,
    dbId: dbUser1.id,
    email: dbUser1.email,
    role: dbUser1.role,
    walletBalance: dbUser1.wallet?.balance,
  };
  console.log("  ✔ Step 1 Passed: Brand-new email/password user provisioned with real DB row.\n");

  // ------------------------------------------------------------------------------
  // STEP 2: Sign up as brand-new user via Google OAuth
  // ------------------------------------------------------------------------------
  console.log("▶ [STEP 2] Testing Sign-up as brand-new user (Google OAuth)...");
  const ts2 = Date.now();
  const oauthClerkId = `user_clerk_google_oauth_${ts2}`;
  const oauthEmail = `ananya.desai.${ts2}@gmail.com`;
  const oauthName = "Ananya Desai";
  const oauthImageUrl = `https://lh3.googleusercontent.com/a/mock_oauth_avatar_${ts2}`;

  const oauthWebhookPayload = {
    type: "user.created",
    data: {
      id: oauthClerkId,
      email_addresses: [{ id: "em_oauth_1", email_address: oauthEmail }],
      primary_email_address_id: "em_oauth_1",
      first_name: "Ananya",
      last_name: "Desai",
      image_url: oauthImageUrl,
    },
  };

  const rawBody2 = JSON.stringify(oauthWebhookPayload);
  const msgId2 = `msg_oauth_${ts2}`;
  const date2 = new Date();
  const sig2 = wh.sign(msgId2, date2, rawBody2);

  const req2 = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
    method: "POST",
    body: rawBody2,
    headers: {
      "content-type": "application/json",
      "svix-id": msgId2,
      "svix-timestamp": Math.floor(date2.getTime() / 1000).toString(),
      "svix-signature": sig2,
    },
  });

  const res2 = await clerkWebhookPost(req2);
  const data2 = await res2.json();
  console.log("  Webhook Status:", res2.status, "| Payload Response:", data2);

  if (res2.status !== 200 || !data2.success) {
    throw new Error(`Step 2 failed: Google OAuth webhook did not succeed (${JSON.stringify(data2)})`);
  }

  const dbUser2 = await prisma.user.findUnique({
    where: { clerkId: oauthClerkId },
    include: { wallet: true },
  });

  if (!dbUser2) {
    throw new Error(`Step 2 failed: User record for ${oauthClerkId} does not exist in Neon DB!`);
  }
  createdUserIds.push(dbUser2.id);

  console.log("  ✔ PostgreSQL Google OAuth User Record Confirmed:", {
    id: dbUser2.id,
    clerkId: dbUser2.clerkId,
    email: dbUser2.email,
    name: dbUser2.name,
    role: dbUser2.role,
    walletBalance: dbUser2.walletBalance,
    hasWalletRow: !!dbUser2.wallet,
  });

  results.step2 = {
    status: "PASSED",
    clerkId: dbUser2.clerkId,
    dbId: dbUser2.id,
    email: dbUser2.email,
    role: dbUser2.role,
    walletBalance: dbUser2.wallet?.balance,
  };
  console.log("  ✔ Step 2 Passed: Google OAuth user provisioned with real DB row.\n");

  // ------------------------------------------------------------------------------
  // STEP 3: Sign out, sign back in (Data Persistence Check)
  // ------------------------------------------------------------------------------
  console.log("▶ [STEP 3] Testing Sign out, sign back in (Data Persistence Check)...");
  // 3a. Add persistent user data in database: recharge wallet to ₹500 and create a saved Kundli record
  console.log("  3a. Adding persistent wallet balance (₹500) and saved Janam Kundli record...");
  await prisma.user.update({
    where: { id: dbUser1.id },
    data: { walletBalance: 500.0 },
  });
  if (dbUser1.wallet) {
    await prisma.wallet.update({
      where: { id: dbUser1.wallet.id },
      data: { balance: 500.0 },
    });
  }

  const savedKundli = await prisma.kundliRecord.create({
    data: {
      userId: dbUser1.id,
      name: "Vikram S.",
      gender: "male",
      dob: new Date("1995-10-24T14:35:00.000Z"),
      timeOfBirth: "14:35",
      placeOfBirth: "New Delhi",
      chartDataJson: { lagna: "Aquarius", rashi: "Libra", nakshatra: "Swati" },
      isFreeChart: true,
    },
  });

  console.log("  Created Kundli record ID:", savedKundli.id);

  // 3b. Simulate Sign-Out: Session terminated
  console.log("  3b. Simulating Sign-Out (Session terminated)...");

  // 3c. Simulate Sign Back In: Re-authenticating with same clerkId
  console.log("  3c. Simulating Sign-Back-In (Re-authenticating as", emailUserClerkId, ")...");
  const reauthenticatedUser = await syncClerkUserToDatabase({
    clerkId: emailUserClerkId,
    email: emailUserEmail,
    name: emailUserName,
  });

  const refreshedDbUser = await prisma.user.findUnique({
    where: { clerkId: emailUserClerkId },
    include: { wallet: true, kundliRecords: true },
  });

  if (!refreshedDbUser) {
    throw new Error("Step 3 failed: User not found upon re-login");
  }

  console.log("  Retrieved persistent state upon re-login:", {
    clerkId: refreshedDbUser.clerkId,
    email: refreshedDbUser.email,
    persistedWalletBalance: refreshedDbUser.wallet?.balance,
    savedKundlisCount: refreshedDbUser.kundliRecords.length,
    firstKundliChart: refreshedDbUser.kundliRecords[0]?.chartDataJson,
  });

  if (refreshedDbUser.wallet?.balance !== 500.0) {
    throw new Error(`Step 3 failed: Expected persisted balance 500.0, got ${refreshedDbUser.wallet?.balance}`);
  }
  if (refreshedDbUser.kundliRecords.length !== 1) {
    throw new Error(`Step 3 failed: Saved Kundli was lost on re-login!`);
  }

  results.step3 = {
    status: "PASSED",
    persistedWalletBalance: refreshedDbUser.wallet?.balance,
    kundliCount: refreshedDbUser.kundliRecords.length,
  };
  console.log("  ✔ Step 3 Passed: User data persists across sign out and sign in (not empty/reset).\n");

  // ------------------------------------------------------------------------------
  // STEP 4: Aapka Astro Fresh Sign-Up Default Wallet & Consultation Request
  // ------------------------------------------------------------------------------
  console.log("▶ [STEP 4] Testing Fresh Sign-Up Default Wallet & Consultation Initiation...");
  // Confirm fresh OAuth user has exactly ₹0.0 wallet balance
  const freshOAuthUser = await prisma.user.findUnique({
    where: { clerkId: oauthClerkId },
    include: { wallet: true },
  });

  if (!freshOAuthUser || freshOAuthUser.wallet?.balance !== 0.0) {
    throw new Error("Step 4 failed: Fresh user wallet balance is not 0.0");
  }
  console.log("  ✔ Verified fresh user sees correct initial wallet balance: ₹0.0");

  // Initiate consultation queue request
  console.log("  Initiating consultation request into LiveQueueService...");
  const queueItem = await LiveQueueService.enqueue({
    userId: freshOAuthUser.id,
    userName: freshOAuthUser.name || "Ananya Desai",
    userIdentifier: freshOAuthUser.email || oauthEmail,
    userPhone: "+919876543210",
    consultationType: "chat",
    concern: "Career breakthrough timing and career transition in 2026",
    birthDetails: {
      name: "Ananya Desai",
      gender: "female",
      birthDate: "1997-08-18",
      birthTime: "09:15",
      birthPlace: "Mumbai, Maharashtra",
      latitude: 19.076,
      longitude: 72.8777,
      timezone: 5.5,
    },
  });

  console.log("  Queue Admission Result:", queueItem);

  if (!queueItem || !queueItem.inQueue) {
    throw new Error("Step 4 failed: Could not enqueue consultation request");
  }

  // Check position in queue
  const queuePos = await LiveQueueService.getPosition(freshOAuthUser.id);
  console.log("  Queue Position Status:", queuePos);

  if (!queuePos.inQueue) {
    throw new Error("Step 4 failed: User is not marked inQueue");
  }

  // Cleanly leave queue
  await LiveQueueService.leaveQueue(freshOAuthUser.id);
  const queuePosAfter = await LiveQueueService.getPosition(freshOAuthUser.id);
  console.log("  Queue status after exit:", queuePosAfter);

  results.step4 = {
    status: "PASSED",
    initialWalletBalance: freshOAuthUser.wallet?.balance,
    queuePosition: queueItem.position,
    queueWaitMins: queueItem.estimatedWaitMinutes,
  };
  console.log("  ✔ Step 4 Passed: Consultation request initiated and queued successfully.\n");

  // ------------------------------------------------------------------------------
  // STEP 5: Confirm Zero Mock/Hardcoded User State
  // ------------------------------------------------------------------------------
  console.log("▶ [STEP 5] Verifying zero mock/hardcoded user state...");
  const initialKundlis = ClientAccountStore.getSavedKundlis();
  const initialHistory = ClientAccountStore.getConsultationHistory();

  console.log("  ClientAccountStore.getSavedKundlis() length:", initialKundlis.length);
  console.log("  ClientAccountStore.getConsultationHistory() length:", initialHistory.length);

  if (initialKundlis.length !== 0) {
    throw new Error(`Step 5 failed: Found hardcoded saved Kundlis: ${JSON.stringify(initialKundlis)}`);
  }
  if (initialHistory.length !== 0) {
    throw new Error(`Step 5 failed: Found hardcoded consultation history: ${JSON.stringify(initialHistory)}`);
  }

  // Check database users are not mock IDs
  const allTestUsers = await prisma.user.findMany({
    where: { id: { in: createdUserIds } },
  });

  for (const u of allTestUsers) {
    if (u.id.includes("mock") || u.clerkId?.includes("aarav") || u.name?.includes("Aarav Sharma")) {
      throw new Error(`Step 5 failed: Discovered mock user artifact: ${JSON.stringify(u)}`);
    }
  }

  results.step5 = {
    status: "PASSED",
    mockKundlisFound: initialKundlis.length,
    mockHistoryFound: initialHistory.length,
    usersChecked: allTestUsers.length,
  };
  console.log("  ✔ Step 5 Passed: Zero mock/hardcoded user fallbacks or remnants found.\n");

  // ------------------------------------------------------------------------------
  // CLEANUP TEST USERS FROM NEON POSTGRESQL
  // ------------------------------------------------------------------------------
  console.log("▶ Cleaning up test records from live PostgreSQL database...");
  await prisma.kundliRecord.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.wallet.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  console.log("  ✔ Database cleaned up completely.\n");

  console.log("================================================================================");
  console.log("   ALL 5 CORE-FLOW WALKTHROUGH CHECKS COMPLETED SUCCESSFULLY!");
  console.log("================================================================================\n");

  console.log("Summary Report:", JSON.stringify(results, null, 2));
}

executeFullCoreFlowWalkthrough()
  .catch((err) => {
    console.error("FATAL: Walkthrough failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
