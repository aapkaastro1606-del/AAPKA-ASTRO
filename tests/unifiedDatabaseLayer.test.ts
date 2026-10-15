import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/db/prisma";
import { PlatformSettingsService } from "../src/lib/services/platformSettingsService";
import { calculateUserConsultationRate } from "../src/lib/services/consultationDiscountService";
import { KundliService } from "../src/lib/services/kundliService";
import { ClerkWebhookTracker } from "../src/lib/auth/clerkWebhookTracker";
import { ReelsStore } from "../src/lib/store/reelsStore";
import { BlogStore } from "../src/lib/store/blogStore";

test("Unified Database Layer - PlatformSettingsService", async (t) => {
  await t.test("fetches active database pricing with client business defaults", async () => {
    const pricing = await PlatformSettingsService.getPricing();
    assert.ok(pricing, "Pricing record should be returned");
    assert.equal(pricing.flatFirstConsultationFee, 1051, "First Astro Consultation fee must be ₹1,051");
    assert.equal(pricing.flatStandardFee, 2100, "Standard Astro Consultation fee must be ₹2,100");
    assert.equal(pricing.vaastuPromoFee, 15000, "Vaastu Consultation fee must be ₹15,000");
    assert.equal(pricing.kundliPdfFee, 501, "Kundli PDF Report fee must be ₹501");
  });

  await t.test("updates pricing in PostgreSQL platform_settings table", async () => {
    const updated = await PlatformSettingsService.updatePricing({
      discountPercentage: 50,
    });
    assert.equal(updated.discountPercentage, 50);

    const record = await prisma.platformSetting.findUnique({
      where: { id: "singleton_settings" },
    });
    assert.ok(record, "Database platform_settings row must exist");
  });
});

test("Consultation Pricing & Gating Logic", async (t) => {
  await t.test("first-time consultation calculates ₹1,051 (50% off ₹2,100)", async () => {
    const guestRate = await calculateUserConsultationRate(`guest_test_${Date.now()}`, "astro");
    assert.equal(guestRate.effectiveFee, 1051);
    assert.equal(guestRate.baseFee, 2100);
    assert.equal(guestRate.isFirstConsultation, true);
    assert.equal(guestRate.discountAmount, 1049);
  });

  await t.test("Vaastu consultation calculates flat ₹15,000 standing price", async () => {
    const vaastuRate = await calculateUserConsultationRate("any_user", "vaastu");
    assert.equal(vaastuRate.effectiveFee, 15000);
    assert.equal(vaastuRate.baseFee, 25000);
    assert.equal(vaastuRate.productId, "vaastu");
  });
});

test("Free Kundli Leads Capture - Database Persistence", async (t) => {
  await t.test("generateFreeChart captures seeker phone and details into kundli_records", async () => {
    const testPhone = `+9199999${Math.floor(10000 + Math.random() * 90000)}`;
    const testName = "Test Seeker Lead";

    const report = await KundliService.generateFreeChart({
      name: testName,
      gender: "male",
      birthDate: "1992-05-15",
      birthTime: "08:30",
      birthPlace: "Varanasi, Uttar Pradesh",
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 5.5,
      phone: testPhone,
    });

    assert.ok(report, "Free report should be returned");
    assert.equal(report.isFreeTier, true);

    // Verify row was created in Neon PostgreSQL
    const leadRecord = await prisma.kundliRecord.findFirst({
      where: { phone: testPhone },
    });

    assert.ok(leadRecord, "Lead record must exist in PostgreSQL kundli_records table");
    assert.equal(leadRecord.name, testName);
    assert.equal(leadRecord.isFreeChart, true);
    assert.equal(leadRecord.phone, testPhone);

    // Clean up test lead
    await prisma.kundliRecord.delete({ where: { id: leadRecord.id } });
  });
});

test("Clerk Webhook Tracker - Database Logging", async (t) => {
  await t.test("records webhook events directly to clerk_webhook_events table", async () => {
    const eventId = `evt_test_${Date.now()}`;
    await ClerkWebhookTracker.recordSuccess("user.created", eventId, { test: true });

    const record = await prisma.clerkWebhookEvent.findFirst({
      where: { eventId },
    });
    assert.ok(record, "Should find recorded webhook in database");
    assert.equal(record.eventType, "user.created");
    assert.equal(record.status, "SUCCESS");

    const latest = await ClerkWebhookTracker.getLastWebhook();
    assert.ok(latest, "Should return latest webhook record");
    assert.ok(latest.eventType, "Latest record must have an eventType");

    // Clean up test event
    if (record?.id) {
      await prisma.clerkWebhookEvent.delete({ where: { id: record.id } }).catch(() => {});
    }
  });
});

test("Reels & Blog Database Data Layer", async (t) => {
  await t.test("ReelsStore.getAllReelsAsync seeds and queries instagram_media table", async () => {
    const reels = await ReelsStore.getAllReelsAsync();
    assert.ok(reels.length > 0, "Should return curated reels from database");

    const dbCount = await prisma.instagramMedia.count();
    assert.ok(dbCount > 0, "instagram_media table in PostgreSQL should contain rows");
  });

  await t.test("BlogStore.getAllPostsAsync seeds and queries blog_posts table", async () => {
    const posts = await BlogStore.getAllPostsAsync();
    assert.ok(posts.length > 0, "Should return blog posts from database");

    const dbCount = await prisma.blogPost.count();
    assert.ok(dbCount > 0, "blog_posts table in PostgreSQL should contain rows");
  });
});
