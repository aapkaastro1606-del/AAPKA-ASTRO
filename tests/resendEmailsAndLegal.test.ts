import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { BookingEmailService } from "../src/lib/services/bookingEmailService";
import { BookingWorkflowService } from "../src/lib/services/bookingWorkflowService";
import { prisma } from "../src/lib/db/prisma";

describe("Resend Email Workflows & Resilience", () => {
  const testBookingId = `TEST-EMAIL-${Date.now()}`;
  const ownerEmail = "aapkaastro1606@gmail.com";
  const clientEmail = "seeker.test@example.com";

  test("fails loudly and records audit log when RESEND_API_KEY is misconfigured without throwing", async () => {
    // Save original env
    const originalKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    try {
      // 1. Claimed payment to Owner
      const ownerRes = await BookingEmailService.sendOwnerPaymentClaimedAlert({
        bookingId: testBookingId,
        clientName: "Rohan Gupta",
        clientPhone: "+919876543210",
        clientEmail,
        productName: "Astro Consultation",
        amount: 1051,
        utr: "123456789012",
      });

      assert.equal(ownerRes.success, false);
      assert.equal(ownerRes.simulated, true);
      assert.ok(ownerRes.error?.includes("RESEND_API_KEY is not configured"));

      // 2. Confirmed email to user
      const confRes = await BookingEmailService.sendClientBookingConfirmedEmail({
        clientEmail,
        clientName: "Rohan Gupta",
        bookingId: testBookingId,
        productName: "Astro Consultation",
        amount: 1051,
        format: "WhatsApp Call",
      });

      assert.equal(confRes.success, false);
      assert.equal(confRes.simulated, true);

      // 3. Rejected email to user
      const rejRes = await BookingEmailService.sendClientBookingRejectedEmail({
        clientEmail,
        clientName: "Rohan Gupta",
        bookingId: testBookingId,
        productName: "Astro Consultation",
        amount: 1051,
        reason: "UTR not found in bank statement",
      });

      assert.equal(rejRes.success, false);
      assert.equal(rejRes.simulated, true);

      // 4. Scheduled slot-and-link email to user
      const schedRes = await BookingEmailService.sendClientBookingScheduledEmail({
        clientEmail,
        clientName: "Rohan Gupta",
        bookingId: testBookingId,
        productName: "Astro Consultation",
        scheduledSlot: "16-Oct-2026, 04:30 PM IST",
        meetingLink: "https://meet.google.com/abc-defg-hij",
      });

      assert.equal(schedRes.success, false);
      assert.equal(schedRes.simulated, true);

      // 5. Verify AuditLog recorded EMAIL_CONFIG_MISSING
      const auditEntry = await prisma.auditLog.findFirst({
        where: {
          action: "EMAIL_CONFIG_MISSING",
          targetId: testBookingId,
        },
        orderBy: { createdAt: "desc" },
      });

      assert.ok(auditEntry, "Must record EMAIL_CONFIG_MISSING in PostgreSQL AuditLog");
      assert.ok(auditEntry?.notes?.includes("RESEND_API_KEY is not configured"));
    } finally {
      if (originalKey) process.env.RESEND_API_KEY = originalKey;
    }
  });

  test("booking state transitions succeed in PostgreSQL even when emails are misconfigured or fail", async () => {
    // Create a real test user and session in Neon PostgreSQL
    const dynamicPhone = `+919${String(Date.now()).slice(-8)}`;
    const testUser = await prisma.user.create({
      data: {
        clerkId: `test-email-user-${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        name: "Email Test User",
        phone: dynamicPhone,
      },
    });

    const bookingRes = await BookingWorkflowService.createBooking({
      userId: testUser.id,
      clientName: "Email Test User",
      clientPhone: dynamicPhone,
      clientEmail: testUser.email,
      productType: "astro",
      format: "Google Meet",
    });

    const createdBookingId = bookingRes.bookingId;

    try {
      // 1. Claim payment -> triggers sendOwnerPaymentClaimedAlert in background
      const claimRes = await BookingWorkflowService.claimPayment({
        bookingId: createdBookingId,
        utr: "998877665544",
      });
      assert.equal(claimRes.success, true);
      assert.equal(claimRes.bookingStatus, "PAYMENT_CLAIMED");

      // Verify DB updated
      let inDb = await prisma.session.findUnique({ where: { bookingId: createdBookingId } });
      assert.equal(inDb?.bookingStatus, "PAYMENT_CLAIMED");

      // 2. Approve booking -> triggers sendClientBookingConfirmedEmail in background
      const approveRes = await BookingWorkflowService.approveBooking({
        bookingId: createdBookingId,
        actorEmail: ownerEmail,
        bankCreditConfirmed: true,
        verifiedUtr: "998877665544",
      });
      assert.equal(approveRes.success, true);
      assert.equal(approveRes.bookingStatus, "CONFIRMED");

      inDb = await prisma.session.findUnique({ where: { bookingId: createdBookingId } });
      assert.equal(inDb?.bookingStatus, "CONFIRMED");

      // 3. Schedule booking -> triggers sendClientBookingScheduledEmail in background
      const schedRes = await BookingWorkflowService.scheduleBooking({
        bookingId: createdBookingId,
        scheduledSlot: "17-Oct-2026 at 11:00 AM IST",
        meetingLink: "https://meet.google.com/xyz-uvw-rst",
        actorEmail: ownerEmail,
      });
      assert.equal(schedRes.success, true);
      assert.equal(schedRes.bookingStatus, "SCHEDULED");

      inDb = await prisma.session.findUnique({ where: { bookingId: createdBookingId } });
      assert.equal(inDb?.bookingStatus, "SCHEDULED");
      assert.equal(inDb?.scheduledSlot, "17-Oct-2026 at 11:00 AM IST");
    } finally {
      // Clean up test records
      await prisma.session.deleteMany({ where: { clientId: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    }
  });

  test("rejectBooking updates status to REJECTED and dispatches rejection email without failing", async () => {
    const rejectPhone = `+918${String(Date.now()).slice(-8)}`;
    const testUser = await prisma.user.create({
      data: {
        clerkId: `test-reject-user-${Date.now()}`,
        email: `reject-${Date.now()}@example.com`,
        name: "Reject Test User",
        phone: rejectPhone,
      },
    });

    const bookingRes = await BookingWorkflowService.createBooking({
      userId: testUser.id,
      clientName: "Reject Test User",
      clientPhone: rejectPhone,
      clientEmail: testUser.email,
      productType: "astro",
      format: "WhatsApp call",
    });

    const createdBookingId = bookingRes.bookingId;

    try {
      const rejectRes = await BookingWorkflowService.rejectBooking({
        bookingId: createdBookingId,
        reason: "UTR not found in bank records after 24 hours",
        actorEmail: ownerEmail,
      });

      assert.equal(rejectRes.success, true);
      assert.equal(rejectRes.bookingStatus, "REJECTED");
      assert.equal(rejectRes.rejectionReason, "UTR not found in bank records after 24 hours");

      const inDb = await prisma.session.findUnique({ where: { bookingId: createdBookingId } });
      assert.equal(inDb?.bookingStatus, "REJECTED");
      assert.equal(inDb?.rejectionReason, "UTR not found in bank records after 24 hours");
    } finally {
      await prisma.session.deleteMany({ where: { clientId: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    }
  });
});
