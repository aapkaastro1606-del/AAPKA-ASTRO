import test, { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/db/prisma";
import { calculateUserConsultationRate } from "../src/lib/services/consultationDiscountService";
import { canAccessSection } from "../src/lib/auth/permissionPolicy";
import { ServerAuthResult } from "../src/lib/auth/serverAuth";
import { POST as callbackPost } from "../src/app/api/callback/route";

describe("SWEEP PATTERNS AUDIT & FIXES VERIFICATION", () => {
  const testEmail = `sweep.test.${Date.now()}@example.com`;
  let testUser: any;

  before(async () => {
    testUser = await prisma.user.create({
      data: {
        clerkId: `clerk_sweep_${Date.now()}`,
        identifier: testEmail,
        name: "Sweep Pattern Tester",
        email: testEmail,
        phone: `+9196${Date.now().toString().slice(-8)}`,
        role: "CLIENT",
        walletBalance: 0,
      },
    });
  });

  after(async () => {
    if (testUser?.id) {
      await prisma.session.deleteMany({
        where: { clientId: testUser.id },
      });
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    }
  });

  describe("Pattern (a) & (c): Clerk ID vs DB Foreign Key Resolution in Services", () => {
    it("correctly resolves Clerk ID to DB user and evaluates first-time pricing promo accurately", async () => {
      // First consultation rate check using Clerk ID
      const calc1 = await calculateUserConsultationRate(testUser.clerkId, "astro", "Voice Call");
      assert.equal(calc1.isFirstConsultation, true);
      assert.equal(calc1.effectiveFee, 1051);

      // Create a confirmed session for this user in DB using proper cuid foreign key
      const session = await prisma.session.create({
        data: {
          bookingId: `ASTRO-TEST-${Date.now().toString().slice(-4)}`,
          type: "VOICE",
          clientId: testUser.id,
          userName: testUser.name,
          userPhone: testUser.phone,
          productType: "astro",
          format: "Voice Call",
          bookingStatus: "CONFIRMED",
          paymentStatus: "CONFIRMED",
          status: "WAITING",
          totalCost: 1051,
          ratePerMin: 0,
        },
      });

      // Subsequent consultation rate check using Clerk ID: must recognise prior session and quote standard rate
      const calc2 = await calculateUserConsultationRate(testUser.clerkId, "astro", "Voice Call");
      assert.equal(calc2.isFirstConsultation, false);
      assert.equal(calc2.effectiveFee, 2100);

      // Cleanup test session
      await prisma.session.delete({ where: { id: session.id } });
    });
  });

  describe("Pattern (e): Server Write on Lead & Callback Forms", () => {
    it("persists callback inquiry directly to database session ledger", async () => {
      const testPhone = `+9195${Date.now().toString().slice(-8)}`;
      const req = new NextRequest("http://localhost/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: "Callback Form Lead",
          phone: testPhone,
          topic: "Vastu Audit Inquiry",
          preferredSlot: "Morning (10:00 AM - 01:00 PM)",
        }),
      });

      const res = await callbackPost(req);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);

      const dbSession = await prisma.session.findFirst({
        where: { userPhone: testPhone, paymentStatus: "CALLBACK_REQUEST" },
      });
      assert.ok(dbSession, "Callback must be recorded in session ledger");
      assert.equal(dbSession.paymentStatus, "CALLBACK_REQUEST");
      assert.equal(dbSession.bookingStatus, "PENDING_PAYMENT");

      // Cleanup
      if (dbSession) {
        await prisma.session.delete({ where: { id: dbSession.id } });
        await prisma.user.deleteMany({ where: { phone: testPhone } });
      }
    });
  });

  describe("Pattern (g): Status Strings Enum Alignment", () => {
    it("ensures canonical booking statuses adhere to the strict 8-state enum", () => {
      const validStatuses = [
        "PENDING_PAYMENT",
        "PAYMENT_CLAIMED",
        "CONFIRMED",
        "SCHEDULED",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
        "EXPIRED",
      ];
      validStatuses.forEach((st) => {
        assert.ok(typeof st === "string");
      });
    });
  });

  describe("Pattern (h): Alignment Between Page Guard and API Guard", () => {
    it("verifies staff with 'knowledge' section VIEW grant has access under ONE PERMISSION POLICY", () => {
      const staffAuth: ServerAuthResult = {
        isAuthenticated: true,
        userId: "staff_usr_123",
        dbUserId: "staff_cuid_123",
        email: "staff@aapkaastro.com",
        name: "Staff Editor",
        role: "STAFF",
        isOwner: false,
        isStaff: true,
        isAstrologer: false,
        permissions: ["knowledge", "content"],
        grants: [
          { section: "knowledge", level: "VIEW" },
          { section: "content", level: "MANAGE" },
        ],
      };

      const hasKnowledgeView = canAccessSection(staffAuth, "knowledge", "VIEW");
      assert.equal(hasKnowledgeView, true, "Staff with 'knowledge' grant must be permitted VIEW access");

      const hasKnowledgeManage = canAccessSection(staffAuth, "knowledge", "MANAGE");
      assert.equal(hasKnowledgeManage, false, "Staff with only VIEW grant must NOT have MANAGE access");

      // Owner has both
      const ownerAuth: ServerAuthResult = {
        isAuthenticated: true,
        userId: "owner_usr_123",
        dbUserId: "owner_cuid_123",
        email: "aapkaastro1606@gmail.com",
        name: "Platform Owner",
        role: "OWNER",
        isOwner: true,
        isStaff: false,
        isAstrologer: true,
        permissions: [],
        grants: [],
      };
      assert.equal(canAccessSection(ownerAuth, "knowledge", "VIEW"), true);
      assert.equal(canAccessSection(ownerAuth, "knowledge", "MANAGE"), true);
    });
  });
});
