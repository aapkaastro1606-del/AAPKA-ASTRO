import { prisma } from "../src/lib/db/prisma";
import { syncClerkUserToDatabase, deleteClerkUserFromDatabase } from "../src/lib/auth/syncUser";
import { POST as clerkWebhookPost } from "../src/app/api/webhooks/clerk/route";
import { NextRequest } from "next/server";
import { Webhook } from "svix";
import { enforceStagingDatabase } from "../src/lib/db/stagingGuard";

async function runVerification() {
  enforceStagingDatabase("verify-db-user-sync");
  console.log("=== STARTING LIVE POSTGRESQL USER SYNC VERIFICATION ===");
  
  const timestamp = Date.now();
  const testClerkId = `user_live_verify_${timestamp}`;
  const testEmail = `seeker_verify_${timestamp}@aapkaastro.test`;
  const testName = "Aaditya Varma";
  const testPhone = "+919123456789";

  console.log(`1. Testing direct sync via syncClerkUserToDatabase...`);
  const syncedUser = await syncClerkUserToDatabase({
    clerkId: testClerkId,
    email: testEmail,
    name: testName,
    phone: testPhone,
  });

  console.log("Sync response:", syncedUser);

  console.log("2. Querying live PostgreSQL Neon database via Prisma Client...");
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: testClerkId },
    include: { wallet: true },
  });

  if (!dbUser) {
    throw new Error(`CRITICAL: User ${testClerkId} was not found in PostgreSQL!`);
  }

  console.log("Found User row in database:");
  console.log({
    id: dbUser.id,
    clerkId: dbUser.clerkId,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    walletBalance: dbUser.walletBalance,
    walletId: dbUser.wallet?.id,
    walletBalanceInDb: dbUser.wallet?.balance,
  });

  if (dbUser.clerkId !== testClerkId) {
    throw new Error("Clerk ID mismatch!");
  }
  if (!dbUser.wallet) {
    throw new Error("Wallet was not automatically provisioned!");
  }

  console.log("PASSED: Direct database sync confirmed.\n");

  console.log("3. Testing end-to-end Clerk Webhook endpoint with Svix signature...");
  const webhookSecret = "whsec_" + Buffer.from("test-secret-key-aapkaastro-12345").toString("base64");
  process.env.CLERK_WEBHOOK_SECRET = webhookSecret;

  const webhookClerkId = `user_webhook_live_${timestamp}`;
  const webhookEmail = `webhook_live_${timestamp}@aapkaastro.test`;
  const webhookPayload = {
    type: "user.created",
    data: {
      id: webhookClerkId,
      email_addresses: [{ id: "em_1", email_address: webhookEmail }],
      primary_email_address_id: "em_1",
      first_name: "Roshni",
      last_name: "Sen",
      phone_numbers: [{ phone_number: "+919876543210" }],
    },
  };

  const rawBody = JSON.stringify(webhookPayload);
  const wh = new Webhook(webhookSecret);
  const msgId = `msg_e2e_${timestamp}`;
  const now = new Date();
  const signature = wh.sign(msgId, now, rawBody);

  const req = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
    method: "POST",
    body: rawBody,
    headers: {
      "content-type": "application/json",
      "svix-id": msgId,
      "svix-timestamp": Math.floor(now.getTime() / 1000).toString(),
      "svix-signature": signature,
    },
  });

  const res = await clerkWebhookPost(req);
  console.log("Webhook HTTP Status:", res.status);
  const resData = await res.json();
  console.log("Webhook Response Data:", resData);

  if (res.status !== 200 || !resData.success) {
    throw new Error(`Webhook failed: ${JSON.stringify(resData)}`);
  }

  console.log("4. Verifying webhook created user in Neon PostgreSQL...");
  const webhookDbUser = await prisma.user.findUnique({
    where: { clerkId: webhookClerkId },
    include: { wallet: true },
  });

  if (!webhookDbUser) {
    throw new Error(`Webhook user ${webhookClerkId} not found in PostgreSQL!`);
  }
  console.log("Webhook user verified in Neon DB:", {
    id: webhookDbUser.id,
    clerkId: webhookDbUser.clerkId,
    email: webhookDbUser.email,
    name: webhookDbUser.name,
    walletId: webhookDbUser.wallet?.id,
  });

  console.log("\n5. Cleaning up test verification rows...");
  await prisma.wallet.deleteMany({
    where: { userId: { in: [dbUser.id, webhookDbUser.id] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [dbUser.id, webhookDbUser.id] } },
  });

  const checkUser1 = await prisma.user.findUnique({ where: { clerkId: testClerkId } });
  const checkUser2 = await prisma.user.findUnique({ where: { clerkId: webhookClerkId } });

  if (checkUser1 || checkUser2) {
    throw new Error("Cleanup failed: rows still exist in database");
  }

  console.log("Test rows cleanly purged from Neon PostgreSQL.");
  console.log("\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY ===");
}

runVerification()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
