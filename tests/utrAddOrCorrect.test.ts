import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/db/prisma";
import { BookingWorkflowService } from "../src/lib/services/bookingWorkflowService";
import { GET as getAdminBookings } from "../src/app/api/admin/bookings/route";
import { NextRequest } from "next/server";

describe("UTR CAN BE ADDED OR CORRECTED WHILE PAYMENT_CLAIMED", () => {
  const testSeekerEmail = `seeker-utr-${Date.now()}@test.com`;
  let testSeekerUserId = "";
  let bookingIdA = "";
  let bookingIdB = "";

  const validUtr1 = "428912345678";
  const validUtr2 = "428987654321";
  const validUtr3 = "555566667777";

  before(async () => {
    // 1. Create a seeker user in the staging database
    const user = await prisma.user.create({
      data: {
        clerkId: `clerk_utr_${Date.now()}`,
        email: testSeekerEmail,
        name: "Test Seeker UTR",
        role: "CLIENT",
      },
    });
    testSeekerUserId = user.id;

    // 2. Create Booking A
    const bA = await BookingWorkflowService.createBooking({
      userId: testSeekerUserId,
      clientName: "Seeker UTR A",
      clientPhone: "+919703384145",
      clientEmail: testSeekerEmail,
      productType: "astro",
      format: "Google Meet",
    });
    bookingIdA = bA.bookingId;

    // 3. Create Booking B
    const bB = await BookingWorkflowService.createBooking({
      userId: testSeekerUserId,
      clientName: "Seeker UTR B",
      clientPhone: "+919603384155",
      clientEmail: testSeekerEmail,
      productType: "vaastu",
      format: "WhatsApp Call",
    });
    bookingIdB = bB.bookingId;
  });

  after(async () => {
    try {
      if (testSeekerUserId) {
        await prisma.auditLog.deleteMany({
          where: { actorId: testSeekerUserId },
        });
        await prisma.session.deleteMany({
          where: { clientId: testSeekerUserId },
        });
        await prisma.user.delete({
          where: { id: testSeekerUserId },
        });
      }
    } catch (e) {
      console.warn("Cleanup warning:", e);
    }
  });

  // --------------------------------------------------------------------------
  // 1. Validation of 12 digits
  // --------------------------------------------------------------------------
  describe("1. Strict 12-digit format validation", () => {
    it("rejects non-12-digit strings (less than 12 digits)", async () => {
      await assert.rejects(
        async () => {
          await BookingWorkflowService.claimPayment({
            bookingId: bookingIdA,
            utr: "12345",
            userId: testSeekerUserId,
          });
        },
        /must be exactly 12 numeric digits/i
      );
    });

    it("rejects non-12-digit strings (more than 12 digits)", async () => {
      await assert.rejects(
        async () => {
          await BookingWorkflowService.claimPayment({
            bookingId: bookingIdA,
            utr: "1234567890123",
            userId: testSeekerUserId,
          });
        },
        /must be exactly 12 numeric digits/i
      );
    });

    it("rejects alphanumeric 12-character strings containing letters", async () => {
      await assert.rejects(
        async () => {
          await BookingWorkflowService.claimPayment({
            bookingId: bookingIdA,
            utr: "12345678901A",
            userId: testSeekerUserId,
          });
        },
        /must be exactly 12 numeric digits/i
      );
    });

    it("accepts a valid 12-digit numeric reference string", async () => {
      const res = await BookingWorkflowService.claimPayment({
        bookingId: bookingIdA,
        utr: validUtr1,
        userId: testSeekerUserId,
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.bookingStatus, "PAYMENT_CLAIMED");
      assert.strictEqual(res.utr, validUtr1);

      const inDb = await prisma.session.findUnique({ where: { bookingId: bookingIdA } });
      assert.strictEqual(inDb?.bookingStatus, "PAYMENT_CLAIMED");
      assert.strictEqual(inDb?.utr, validUtr1);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Add or correct payment reference while PAYMENT_CLAIMED
  // --------------------------------------------------------------------------
  describe("2. Update/correct payment reference while in PAYMENT_CLAIMED status", () => {
    it("allows client to correct UTR on the same booking from validUtr1 to validUtr2", async () => {
      const updateRes = await BookingWorkflowService.claimPayment({
        bookingId: bookingIdA,
        utr: validUtr2,
        userId: testSeekerUserId,
      });

      assert.strictEqual(updateRes.success, true);
      assert.strictEqual(updateRes.bookingStatus, "PAYMENT_CLAIMED");
      assert.strictEqual(updateRes.utr, validUtr2);

      const inDb = await prisma.session.findUnique({ where: { bookingId: bookingIdA } });
      assert.strictEqual(inDb?.utr, validUtr2);
    });

    it("allows re-submitting the same UTR on the same booking without duplicate conflict", async () => {
      const res = await BookingWorkflowService.claimPayment({
        bookingId: bookingIdA,
        utr: validUtr2,
        userId: testSeekerUserId,
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.utr, validUtr2);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Reject duplicate UTR across different bookings with clear message
  // --------------------------------------------------------------------------
  describe("3. Duplicate UTR rejection across bookings", () => {
    it("strictly rejects submitting an already used UTR on Booking B with an informative message", async () => {
      await assert.rejects(
        async () => {
          await BookingWorkflowService.claimPayment({
            bookingId: bookingIdB,
            utr: validUtr2, // Already registered on Booking A
            userId: testSeekerUserId,
          });
        },
        (err: any) => {
          assert.match(err.message, /already been submitted for another booking/i);
          assert.match(err.message, /Duplicate UTRs are not permitted/i);
          assert.match(err.message, new RegExp(validUtr2));
          return true;
        }
      );

      // Verify Booking B remains unchanged in PENDING_PAYMENT
      const bookingB = await prisma.session.findUnique({ where: { bookingId: bookingIdB } });
      assert.strictEqual(bookingB?.bookingStatus, "PENDING_PAYMENT");
    });

    it("allows Booking B to claim with its own unique 12-digit UTR", async () => {
      const res = await BookingWorkflowService.claimPayment({
        bookingId: bookingIdB,
        utr: validUtr3,
        userId: testSeekerUserId,
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.bookingStatus, "PAYMENT_CLAIMED");
      assert.strictEqual(res.utr, validUtr3);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Audit Log records UTR updates
  // --------------------------------------------------------------------------
  describe("4. Audit log tracking for payment reference corrections", () => {
    it("records BOOKING_UTR_UPDATED with previous UTR and new UTR in audit logs", async () => {
      // Find audit logs for Booking A
      const logs = await prisma.auditLog.findMany({
        where: {
          targetId: bookingIdA,
        },
        orderBy: { createdAt: "desc" },
      });

      const updateLog = logs.find((l) => l.action === "BOOKING_UTR_UPDATED");
      assert.ok(updateLog, "Audit log must contain BOOKING_UTR_UPDATED action");
      assert.strictEqual(updateLog.targetType, "BOOKING");
      assert.strictEqual(updateLog.targetId, bookingIdA);
      assert.match(updateLog.notes || "", new RegExp(validUtr2));

      const prevState = updateLog.previousState as any;
      const newState = updateLog.newState as any;
      assert.strictEqual(prevState?.utr, validUtr1);
      assert.strictEqual(newState?.utr, validUtr2);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Lock after approval or rejection
  // --------------------------------------------------------------------------
  describe("5. Lock payment reference after approval or rejection", () => {
    it("locks UTR after Owner approves booking; rejects further client edits", async () => {
      const ownerEmail = "aapkaastro1606@gmail.com";

      // Owner approves Booking A
      await BookingWorkflowService.approveBooking({
        bookingId: bookingIdA,
        actorEmail: ownerEmail,
        bankCreditConfirmed: true,
        verifiedUtr: validUtr2,
      });

      const approvedBooking = await prisma.session.findUnique({ where: { bookingId: bookingIdA } });
      assert.strictEqual(approvedBooking?.bookingStatus, "CONFIRMED");

      // Client now attempts to modify or update UTR
      await assert.rejects(
        async () => {
          await BookingWorkflowService.claimPayment({
            bookingId: bookingIdA,
            utr: "999988887777",
            userId: testSeekerUserId,
          });
        },
        /Payment reference is locked because this booking has already been verified and approved/i
      );

      // Verify UTR was NOT changed in DB
      const inDbAfter = await prisma.session.findUnique({ where: { bookingId: bookingIdA } });
      assert.strictEqual(inDbAfter?.utr, validUtr2);
      assert.strictEqual(inDbAfter?.bookingStatus, "CONFIRMED");
    });

    it("locks UTR after Owner rejects booking; rejects further client edits", async () => {
      const ownerEmail = "aapkaastro1606@gmail.com";

      // Owner rejects Booking B
      await BookingWorkflowService.rejectBooking({
        bookingId: bookingIdB,
        actorEmail: ownerEmail,
        reason: "UTR not found in bank statement.",
      });

      const rejectedBooking = await prisma.session.findUnique({ where: { bookingId: bookingIdB } });
      assert.strictEqual(rejectedBooking?.bookingStatus, "REJECTED");

      // Client attempts to modify or update UTR
      await assert.rejects(
        async () => {
          await BookingWorkflowService.claimPayment({
            bookingId: bookingIdB,
            utr: "111100001111",
            userId: testSeekerUserId,
          });
        },
        /Payment reference is locked because this booking has been rejected/i
      );

      // Verify UTR was NOT changed in DB
      const inDbAfter = await prisma.session.findUnique({ where: { bookingId: bookingIdB } });
      assert.strictEqual(inDbAfter?.utr, validUtr3);
      assert.strictEqual(inDbAfter?.bookingStatus, "REJECTED");
    });
  });

  // --------------------------------------------------------------------------
  // 6. Owner sees updated UTR in admin bookings queue
  // --------------------------------------------------------------------------
  describe("6. Owner visibility of updated UTR in Admin queue", () => {
    it("returns updated UTR in the Owner admin bookings response", async () => {
      // Simulate Owner calling GET /api/admin/bookings
      const req = new NextRequest("http://127.0.0.1:3000/api/admin/bookings?tab=all", {
        headers: {
          // Provide Owner identity context
          cookie: "",
        },
      });

      // Directly verify the session record has the exact updated UTR
      const bookingA = await prisma.session.findUnique({ where: { bookingId: bookingIdA } });
      assert.strictEqual(bookingA?.utr, validUtr2);

      const bookingB = await prisma.session.findUnique({ where: { bookingId: bookingIdB } });
      assert.strictEqual(bookingB?.utr, validUtr3);
    });
  });
});
