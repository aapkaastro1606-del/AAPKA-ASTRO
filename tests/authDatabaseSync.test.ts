import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { getClerkPublishableKey, DEFAULT_CLERK_PUBLISHABLE_KEY, isClerkConfigured } from "../src/lib/auth/clerkConfig";
import { ClientAccountStore } from "../src/lib/store/clientAccountStore";
import { syncClerkUserToDatabase } from "../src/lib/auth/syncUser";
import { POST as clerkWebhookPost } from "../src/app/api/webhooks/clerk/route";
import { NextRequest } from "next/server";
import { Webhook } from "svix";

describe("Clerk Key Resolution & Cross-Domain Safety", () => {
  const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
  });

  it("returns DEFAULT_CLERK_PUBLISHABLE_KEY when env is undefined or empty", () => {
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const key = getClerkPublishableKey();
    assert.equal(key, DEFAULT_CLERK_PUBLISHABLE_KEY);
  });

  it("filters out viar.in live key on non-viar hosts to prevent Clerk domain mismatch crashes", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_live_Y2xlcmsudmlhci5pbiQ";
    const key = getClerkPublishableKey();
    assert.equal(key, DEFAULT_CLERK_PUBLISHABLE_KEY);
    assert.notEqual(key, "pk_live_Y2xlcmsudmlhci5pbiQ");
  });

  it("filters out dummy placeholders like pk_test_placeholder", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_placeholder";
    const key = getClerkPublishableKey();
    assert.equal(key, DEFAULT_CLERK_PUBLISHABLE_KEY);
  });

  it("preserves valid custom test keys", () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_custom_valid_key_123";
    const key = getClerkPublishableKey();
    assert.equal(key, "pk_test_custom_valid_key_123");
  });

  it("confirms isClerkConfigured returns true with resolved key", () => {
    assert.equal(isClerkConfigured(), true);
  });
});

describe("Client Account Store - Clean User State (No Hardcoded Mock User)", () => {
  it("ensures initial saved kundlis list is empty for new users (no hardcoded Aarav Sharma)", () => {
    const kundlis = ClientAccountStore.getSavedKundlis();
    assert.equal(Array.isArray(kundlis), true);
    assert.equal(kundlis.length, 0, "New users should not see hardcoded mock Kundlis");
  });

  it("ensures initial consultation history is empty for new users", () => {
    const history = ClientAccountStore.getConsultationHistory();
    assert.equal(Array.isArray(history), true);
    assert.equal(history.length, 0, "New users should not see hardcoded mock past consultations");
  });

  it("allows newly created kundlis to be added and retrieved accurately", () => {
    ClientAccountStore.addSavedKundli({
      name: "Rohan Verma",
      relation: "Self",
      birthDate: "1998-05-15",
      birthTime: "10:30",
      birthPlace: "Mumbai",
      gender: "Male",
      lagna: "Leo",
      rashi: "Scorpio",
      nakshatra: "Anuradha",
    });

    const updated = ClientAccountStore.getSavedKundlis();
    assert.equal(updated.length, 1);
    assert.equal(updated[0].name, "Rohan Verma");

    // Clean up for other tests
    ClientAccountStore.deleteSavedKundli(updated[0].id);
    assert.equal(ClientAccountStore.getSavedKundlis().length, 0);
  });
});

describe("User Database Synchronization Engine", () => {
  it("provisions a synchronized user record for a standard seeker", async () => {
    const mockClerkUser = {
      clerkId: "user_test_seeker_9988",
      email: "newseeker@gmail.com",
      name: "Priya Sharma",
      phone: "+919876543210",
    };

    const synced = await syncClerkUserToDatabase(mockClerkUser);
    assert.ok(synced);
    assert.equal(synced.clerkId, "user_test_seeker_9988");
    assert.equal(synced.email, "newseeker@gmail.com");
    assert.equal(synced.role, "CLIENT");
  });

  it("recognizes owner email and provisions user with OWNER role", async () => {
    const mockOwnerUser = {
      clerkId: "user_test_owner_001",
      email: "aapkaastro1606@gmail.com",
      name: "Aapka Astro Admin",
    };

    const synced = await syncClerkUserToDatabase(mockOwnerUser);
    assert.ok(synced);
    assert.equal(synced.clerkId, "user_test_owner_001");
    assert.equal(synced.role, "OWNER");
  });
});

describe("Clerk Webhook Lifecycle Endpoint (/api/webhooks/clerk)", () => {
  const originalSecret = process.env.CLERK_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.CLERK_WEBHOOK_SECRET = originalSecret;
  });

  it("returns 400 for empty or invalid webhook payload", async () => {
    delete process.env.CLERK_WEBHOOK_SECRET;
    const req = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await clerkWebhookPost(req);
    assert.equal(res.status, 400);
  });

  it("processes user.created event and returns 200 OK with success flag (unsigned dev mode)", async () => {
    delete process.env.CLERK_WEBHOOK_SECRET;
    const payload = {
      type: "user.created",
      data: {
        id: "user_clerk_webhook_12345",
        email_addresses: [
          {
            id: "email_1",
            email_address: "webhookseeker@gmail.com",
          },
        ],
        primary_email_address_id: "email_1",
        first_name: "Kavita",
        last_name: "Patel",
        phone_numbers: [{ phone_number: "+919998887776" }],
      },
    };

    const req = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await clerkWebhookPost(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.event, "user.created");
    assert.ok(data.userId);
  });

  it("enforces Svix signature verification when CLERK_WEBHOOK_SECRET is configured", async () => {
    const testSecret = "whsec_52eZfC6s2f07d2Yg33Y1Z7k4n5o6p7q8";
    process.env.CLERK_WEBHOOK_SECRET = testSecret;

    const payload = {
      type: "user.created",
      data: {
        id: "user_clerk_svix_test_01",
        email_addresses: [{ id: "em_1", email_address: "svix_test@aapkaastro.com" }],
        primary_email_address_id: "em_1",
        first_name: "Arjun",
        last_name: "Kapoor",
      },
    };
    const rawBody = JSON.stringify(payload);

    // 1. Missing svix headers -> 400
    const reqMissingHeaders = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body: rawBody,
    });
    const resMissing = await clerkWebhookPost(reqMissingHeaders);
    assert.equal(resMissing.status, 400);

    // 2. Tampered signature -> 400
    const reqBadSig = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body: rawBody,
      headers: {
        "content-type": "application/json",
        "svix-id": "msg_001",
        "svix-timestamp": Math.floor(Date.now() / 1000).toString(),
        "svix-signature": "v1,tampered_signature_1234567890",
      },
    });
    const resBadSig = await clerkWebhookPost(reqBadSig);
    assert.equal(resBadSig.status, 400);

    // 3. Genuine signed payload using Svix -> 200 OK
    const wh = new Webhook(testSecret);
    const msgId = "msg_valid_001";
    const now = new Date();
    const signature = wh.sign(msgId, now, rawBody);

    const reqValid = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body: rawBody,
      headers: {
        "content-type": "application/json",
        "svix-id": msgId,
        "svix-timestamp": Math.floor(now.getTime() / 1000).toString(),
        "svix-signature": signature,
      },
    });
    const resValid = await clerkWebhookPost(reqValid);
    assert.equal(resValid.status, 200);
    const validData = await resValid.json();
    assert.equal(validData.success, true);
    assert.equal(validData.event, "user.created");
  });

  it("handles user.updated and user.deleted events accurately", async () => {
    delete process.env.CLERK_WEBHOOK_SECRET;

    // user.updated
    const updateReq = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body: JSON.stringify({
        type: "user.updated",
        data: {
          id: "user_clerk_webhook_12345",
          email_addresses: [{ id: "em_1", email_address: "webhookseeker@gmail.com" }],
          primary_email_address_id: "em_1",
          first_name: "Kavita",
          last_name: "Patel-Singh",
          phone_numbers: [{ phone_number: "+919876543210" }],
        },
      }),
    });
    const updateRes = await clerkWebhookPost(updateReq);
    assert.equal(updateRes.status, 200);

    // user.deleted
    const deleteReq = new NextRequest("http://localhost:3000/api/webhooks/clerk", {
      method: "POST",
      body: JSON.stringify({
        type: "user.deleted",
        data: {
          id: "user_clerk_webhook_12345",
        },
      }),
    });
    const deleteRes = await clerkWebhookPost(deleteReq);
    assert.equal(deleteRes.status, 200);
    const deleteData = await deleteRes.json();
    assert.equal(deleteData.success, true);
    assert.equal(deleteData.message, "User deleted");
  });
});
