import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { syncClerkUserToDatabase, deleteClerkUserFromDatabase } from "../src/lib/auth/syncUser";
import { POST as clerkWebhookPost } from "../src/app/api/webhooks/clerk/route";
import { NextRequest } from "next/server";
import { Webhook } from "svix";
import { prisma } from "../src/lib/db/prisma";
import { isOwnerEmail } from "../src/lib/auth/staffPermissions";

describe("User Sync, Webhook Idempotency, and Computed Role Security", () => {
  const originalOwnerEmail = process.env.OWNER_EMAIL;
  const originalWebhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.OWNER_EMAIL = "aapkaastro1606@gmail.com";
    process.env.CLERK_WEBHOOK_SECRET = originalWebhookSecret;
  });

  it("proves OWNER role is strictly computed for OWNER_EMAIL and case-insensitive", () => {
    assert.equal(isOwnerEmail("aapkaastro1606@gmail.com"), true);
    assert.equal(isOwnerEmail("AAPKAASTRO1606@GMAIL.COM"), true);
    assert.equal(isOwnerEmail("  aapkaastro1606@gmail.com  "), true);

    // Non-owner emails
    assert.equal(isOwnerEmail("anmol@aapkaastro.com"), false);
    assert.equal(isOwnerEmail("attacker@gmail.com"), false);
    assert.equal(isOwnerEmail("admin@aapkaastro.com"), false);
    assert.equal(isOwnerEmail(null), false);
    assert.equal(isOwnerEmail(undefined), false);
  });

  it("syncClerkUserToDatabase provisions an idempotent user keyed by clerkId", async () => {
    const testClerkId = `test_clerk_${Date.now()}`;
    const testEmail = `seeker_${Date.now()}@example.com`;

    // First call: creates user
    const user1 = await syncClerkUserToDatabase({
      clerkId: testClerkId,
      email: testEmail,
      name: "Test Seeker",
      phone: "+919999911111",
    });

    assert.ok(user1);
    assert.equal(user1.clerkId, testClerkId);
    assert.equal(user1.email, testEmail);
    assert.equal(user1.role, "CLIENT");

    // Second call with same clerkId: updates user idempotently without duplicate error
    const user2 = await syncClerkUserToDatabase({
      clerkId: testClerkId,
      email: testEmail,
      name: "Test Seeker Updated",
    });

    assert.ok(user2);
    assert.equal(user2.clerkId, testClerkId);
    assert.equal(user2.name, "Test Seeker Updated");
  });

  it("links to an existing user with the same email instead of creating a duplicate row", async () => {
    const sharedEmail = `preexisting_${Date.now()}@example.com`;
    const newClerkId = `clerk_link_${Date.now()}`;

    // 1. Simulate a pre-existing user in DB (e.g., from intake, booking, or offline signup)
    if (prisma?.user) {
      const preExisting = await prisma.user.create({
        data: {
          identifier: sharedEmail,
          email: sharedEmail,
          name: "Original Pre-existing User",
          role: "CLIENT",
          walletBalance: 25.0,
          wallet: {
            create: { balance: 25.0 },
          },
        },
        include: { wallet: true },
      });

      assert.ok(preExisting);
      assert.equal(preExisting.clerkId, null);

      // 2. Now user signs in with Clerk with the same email
      const linked = await syncClerkUserToDatabase({
        clerkId: newClerkId,
        email: sharedEmail,
        name: "Signed In Via Clerk",
      });

      assert.ok(linked);
      assert.equal(linked.id, preExisting.id, "Must link to the existing database user row ID");
      assert.equal(linked.clerkId, newClerkId, "Must update clerkId on the existing record");
      assert.equal(linked.email, sharedEmail);

      // Clean up
      await prisma.user.delete({ where: { id: preExisting.id } }).catch(() => {});
    }
  });

  it("demotes any database user claiming OWNER whose email is not OWNER_EMAIL, and logs anomaly", async () => {
    const rogueEmail = `rogue_${Date.now()}@example.com`;
    const rogueClerkId = `clerk_rogue_${Date.now()}`;

    // 1. Simulate a row that somehow had role OWNER in database
    if (prisma?.user) {
      const rogueRow = await prisma.user.create({
        data: {
          clerkId: rogueClerkId,
          identifier: rogueEmail,
          email: rogueEmail,
          name: "Rogue Claiming Owner",
          role: "OWNER",
        },
      });

      // Intercept console.warn
      const warnings: string[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        warnings.push(args.join(" "));
        originalWarn(...args);
      };

      try {
        // 2. Syncing user must compute role as CLIENT, not trust OWNER from database
        const synced = await syncClerkUserToDatabase({
          clerkId: rogueClerkId,
          email: rogueEmail,
          name: "Rogue Updated",
        });

        assert.ok(synced);
        assert.equal(synced.role, "CLIENT", "Must demote to CLIENT because email != OWNER_EMAIL");

        const anomalyWarning = warnings.find((w) => w.includes("[SECURITY ANOMALY]"));
        assert.ok(anomalyWarning, "Must log security anomaly when database role OWNER does not match OWNER_EMAIL");
      } finally {
        console.warn = originalWarn;
        await prisma.user.delete({ where: { id: rogueRow.id } }).catch(() => {});
      }
    }
  });

  it("webhook endpoint /api/webhooks/clerk processes user.created, user.updated, and user.deleted", async () => {
    delete process.env.CLERK_WEBHOOK_SECRET;

    const testWebhookId = `wh_user_${Date.now()}`;
    const testWebhookEmail = `wh_seeker_${Date.now()}@example.com`;

    // 1. user.created
    const createReq = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body: JSON.stringify({
        type: "user.created",
        data: {
          id: testWebhookId,
          email_addresses: [{ id: "em_1", email_address: testWebhookEmail }],
          primary_email_address_id: "em_1",
          first_name: "Webhook",
          last_name: "Tester",
        },
      }),
    });

    const createRes = await clerkWebhookPost(createReq);
    assert.equal(createRes.status, 200);
    const createData = await createRes.json();
    assert.equal(createData.success, true);
    assert.equal(createData.event, "user.created");

    // 2. user.updated (idempotent update)
    const updateReq = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body: JSON.stringify({
        type: "user.updated",
        data: {
          id: testWebhookId,
          email_addresses: [{ id: "em_1", email_address: testWebhookEmail }],
          primary_email_address_id: "em_1",
          first_name: "Webhook",
          last_name: "Tester-Singh",
        },
      }),
    });

    const updateRes = await clerkWebhookPost(updateReq);
    assert.equal(updateRes.status, 200);

    // 3. user.deleted
    const deleteReq = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body: JSON.stringify({
        type: "user.deleted",
        data: {
          id: testWebhookId,
        },
      }),
    });

    const deleteRes = await clerkWebhookPost(deleteReq);
    assert.equal(deleteRes.status, 200);
    const deleteData = await deleteRes.json();
    assert.equal(deleteData.success, true);
    assert.equal(deleteData.message, "User deleted");
  });

  it("verifies Svix signatures on webhook when CLERK_WEBHOOK_SECRET is present", async () => {
    const secret = "whsec_abcdef1234567890abcdef1234567890";
    process.env.CLERK_WEBHOOK_SECRET = secret;

    const body = JSON.stringify({
      type: "user.created",
      data: {
        id: "user_svix_test_456",
        email_addresses: [{ id: "em_1", email_address: "svix_test@example.com" }],
        primary_email_address_id: "em_1",
      },
    });

    // Genuine Svix signature
    const wh = new Webhook(secret);
    const msgId = "msg_svix_test_456";
    const timestamp = new Date();
    const signature = wh.sign(msgId, timestamp, body);

    const validReq = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body,
      headers: {
        "content-type": "application/json",
        "svix-id": msgId,
        "svix-timestamp": Math.floor(timestamp.getTime() / 1000).toString(),
        "svix-signature": signature,
      },
    });

    const validRes = await clerkWebhookPost(validReq);
    assert.equal(validRes.status, 200);

    // Bad signature -> 400
    const badReq = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body,
      headers: {
        "content-type": "application/json",
        "svix-id": msgId,
        "svix-timestamp": Math.floor(timestamp.getTime() / 1000).toString(),
        "svix-signature": "v1,forged_signature_123",
      },
    });

    const badRes = await clerkWebhookPost(badReq);
    assert.equal(badRes.status, 400);
  });
});
