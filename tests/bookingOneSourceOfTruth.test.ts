import test, { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/db/prisma";
import { BookingWorkflowService } from "../src/lib/services/bookingWorkflowService";
import {
  canTransitionBooking,
  assertBookingTransition,
  BOOKING_STATUS_LABELS,
  BookingStatus,
} from "../src/lib/booking/bookingStateMachine";
import { ClientAccountStore } from "../src/lib/store/clientAccountStore";

describe("BOOKINGS: ONE SOURCE OF TRUTH", () => {
  const testSeekerEmail = `test.seeker.${Date.now()}@example.com`;
  const ownerEmail = "aapkaastro1606@gmail.com";
  let createdUser: any;
  let testBookingRef: string;

  before(async () => {
    // Clean up any stale records from previous runs
    await prisma.session.deleteMany({
      where: { userEmail: testSeekerEmail },
    });
    await prisma.user.deleteMany({
      where: {
        OR: [{ email: testSeekerEmail }, { phone: "+919876543210" }],
      },
    });

    // Ensure test user exists in PostgreSQL
    createdUser = await prisma.user.create({
      data: {
        clerkId: `clerk_test_${Date.now()}`,
        identifier: testSeekerEmail,
        name: "Test Seeker One Truth",
        email: testSeekerEmail,
        phone: `+9198${Date.now().toString().slice(-8)}`,
        role: "CLIENT",
      },
    });
  });

  after(async () => {
    // Clean up test sessions and user
    if (createdUser?.id) {
      await prisma.session.deleteMany({
        where: { clientId: createdUser.id },
      });
      await prisma.user.delete({
        where: { id: createdUser.id },
      });
    }
  });

  describe("1. State Machine Definition & Transition Enforcement", () => {
    it("defines canonical state machine labels with consistent naming", () => {
      assert.equal(BOOKING_STATUS_LABELS.PENDING_PAYMENT, "Awaiting Seeker Payment");
      assert.equal(BOOKING_STATUS_LABELS.PAYMENT_CLAIMED, "Needs Verification");
      assert.equal(BOOKING_STATUS_LABELS.CONFIRMED, "Confirmed (Ready to Schedule)");
      assert.equal(BOOKING_STATUS_LABELS.SCHEDULED, "Scheduled");
      assert.equal(BOOKING_STATUS_LABELS.COMPLETED, "Completed");
      assert.equal(BOOKING_STATUS_LABELS.REJECTED, "Rejected");
      assert.equal(BOOKING_STATUS_LABELS.CANCELLED, "Cancelled");
      assert.equal(BOOKING_STATUS_LABELS.EXPIRED, "Expired");
    });

    it("allows valid forward lifecycle transitions", () => {
      // PENDING_PAYMENT -> PAYMENT_CLAIMED via CLAIM_PAYMENT
      assert.equal(
        assertBookingTransition("PENDING_PAYMENT", "CLAIM_PAYMENT", "CLIENT"),
        "PAYMENT_CLAIMED"
      );

      // PAYMENT_CLAIMED -> PAYMENT_CLAIMED via UPDATE_UTR
      assert.equal(
        assertBookingTransition("PAYMENT_CLAIMED", "UPDATE_UTR", "CLIENT"),
        "PAYMENT_CLAIMED"
      );

      // PAYMENT_CLAIMED -> CONFIRMED via OWNER_APPROVE
      assert.equal(
        assertBookingTransition("PAYMENT_CLAIMED", "OWNER_APPROVE", "OWNER"),
        "CONFIRMED"
      );

      // CONFIRMED -> SCHEDULED via OWNER_SCHEDULE
      assert.equal(
        assertBookingTransition("CONFIRMED", "OWNER_SCHEDULE", "OWNER"),
        "SCHEDULED"
      );

      // SCHEDULED -> COMPLETED via OWNER_COMPLETE
      assert.equal(
        assertBookingTransition("SCHEDULED", "OWNER_COMPLETE", "OWNER"),
        "COMPLETED"
      );
    });

    it("strictly rejects client cancellation after payment is claimed or confirmed", () => {
      // Client CAN cancel while PENDING_PAYMENT
      assert.equal(
        assertBookingTransition("PENDING_PAYMENT", "CLIENT_CANCEL", "CLIENT"),
        "CANCELLED"
      );

      // Client CANNOT cancel once PAYMENT_CLAIMED
      const claimCancelCheck = canTransitionBooking("PAYMENT_CLAIMED", "CLIENT_CANCEL", "CLIENT");
      assert.equal(claimCancelCheck.allowed, false);
      assert.ok(claimCancelCheck.reason?.includes("Only bookings in PENDING_PAYMENT state can be cancelled by the client"));

      assert.throws(() => {
        assertBookingTransition("PAYMENT_CLAIMED", "CLIENT_CANCEL", "CLIENT");
      }, /Only bookings in PENDING_PAYMENT state can be cancelled by the client/);

      // Client CANNOT cancel once CONFIRMED
      const confirmedCancelCheck = canTransitionBooking("CONFIRMED", "CLIENT_CANCEL", "CLIENT");
      assert.equal(confirmedCancelCheck.allowed, false);
      assert.throws(() => {
        assertBookingTransition("CONFIRMED", "CLIENT_CANCEL", "CLIENT");
      }, /Only bookings in PENDING_PAYMENT state can be cancelled by the client/);
    });

    it("strictly rejects illegal transition jumps", () => {
      // Cannot schedule or complete directly from PENDING_PAYMENT
      assert.equal(
        canTransitionBooking("PENDING_PAYMENT", "OWNER_SCHEDULE", "OWNER").allowed,
        false
      );
      assert.equal(
        canTransitionBooking("PENDING_PAYMENT", "OWNER_COMPLETE", "OWNER").allowed,
        false
      );

      // Cannot schedule directly from PAYMENT_CLAIMED before bank credit approval
      assert.equal(
        canTransitionBooking("PAYMENT_CLAIMED", "OWNER_SCHEDULE", "OWNER").allowed,
        false
      );

      // Non-owner (client) cannot approve or schedule
      assert.equal(
        canTransitionBooking("PAYMENT_CLAIMED", "OWNER_APPROVE", "CLIENT").allowed,
        false
      );
      assert.equal(
        canTransitionBooking("CONFIRMED", "OWNER_SCHEDULE", "CLIENT").allowed,
        false
      );

      // Terminal COMPLETED bookings cannot be cancelled or re-approved
      assert.equal(
        canTransitionBooking("COMPLETED", "OWNER_CANCEL", "OWNER").allowed,
        false
      );
      assert.equal(
        canTransitionBooking("COMPLETED", "OWNER_APPROVE", "OWNER").allowed,
        false
      );
    });
  });

  describe("2. Database Lifecycle: Create, Claim, Owner Queue, and Status Synchronization", () => {
    it("creates the booking with a server-generated reference in PENDING_PAYMENT status", async () => {
      const result = await BookingWorkflowService.createBooking({
        userId: createdUser.id,
        clientName: "Test Seeker One Truth",
        clientPhone: "+919876543210",
        clientEmail: testSeekerEmail,
        productType: "astro",
        format: "WhatsApp call",
        topic: "Career and Marriage Timing",
      });

      assert.ok(result.success);
      assert.ok(result.bookingId.startsWith("ASTRO-"), "Reference must follow server format ASTRO-...");
      assert.equal(result.bookingStatus, "PENDING_PAYMENT");
      testBookingRef = result.bookingId;

      // Verify PostgreSQL database state directly
      const session = await prisma.session.findUnique({
        where: { bookingId: testBookingRef },
      });
      assert.ok(session);
      assert.equal(session.bookingStatus, "PENDING_PAYMENT");
      assert.equal(session.paymentStatus, "AWAITING_VERIFICATION");
    });

    it("client claims payment with UTR; transitions to PAYMENT_CLAIMED", async () => {
      const claimResult = await BookingWorkflowService.claimPayment({
        bookingId: testBookingRef,
        utr: "123456789012",
        userId: createdUser.id,
      });

      assert.ok(claimResult.success);
      assert.equal(claimResult.bookingStatus, "PAYMENT_CLAIMED");
      assert.equal(claimResult.utr, "123456789012");

      const session = await prisma.session.findUnique({
        where: { bookingId: testBookingRef },
      });
      assert.ok(session);
      assert.equal(session.bookingStatus, "PAYMENT_CLAIMED");
      assert.equal(session.utr, "123456789012");
    });

    it("booking appears in Owner queue under 'Needs Verification' with matching status", async () => {
      // Query database matching Owner queue query
      const claimedBookings = await prisma.session.findMany({
        where: { bookingStatus: "PAYMENT_CLAIMED" },
      });

      const foundInClaimed = claimedBookings.some((b) => b.bookingId === testBookingRef);
      assert.ok(foundInClaimed, "Claimed booking must appear in Owner queue under PAYMENT_CLAIMED (Needs Verification)");

      const session = await prisma.session.findUnique({
        where: { bookingId: testBookingRef },
      });
      assert.ok(session);
      // Both seeker and Owner observe PAYMENT_CLAIMED
      assert.equal(session.bookingStatus, "PAYMENT_CLAIMED");
    });

    it("rejects client cancellation once in PAYMENT_CLAIMED state", async () => {
      await assert.rejects(
        async () => {
          await BookingWorkflowService.cancelBooking({
            bookingId: testBookingRef,
            actorRole: "CLIENT",
          });
        },
        /Only bookings in PENDING_PAYMENT state can be cancelled by the client/
      );

      // Verify status was not corrupted
      const session = await prisma.session.findUnique({
        where: { bookingId: testBookingRef },
      });
      assert.equal(session?.bookingStatus, "PAYMENT_CLAIMED");
    });

    it("Owner confirms bank credit and approves booking; transitions to CONFIRMED", async () => {
      const approveResult = await BookingWorkflowService.approveBooking({
        bookingId: testBookingRef,
        actorEmail: ownerEmail,
        bankCreditConfirmed: true,
      });

      assert.ok(approveResult.success);
      assert.equal(approveResult.bookingStatus, "CONFIRMED");

      const session = await prisma.session.findUnique({
        where: { bookingId: testBookingRef },
      });
      assert.equal(session?.bookingStatus, "CONFIRMED");
      assert.equal(session?.paymentStatus, "PAID");
    });

    it("Owner schedules consultation slot and meeting link; transitions to SCHEDULED", async () => {
      const schedResult = await BookingWorkflowService.scheduleBooking({
        bookingId: testBookingRef,
        scheduledSlot: "Tomorrow at 11:00 AM IST",
        meetingLink: "https://meet.google.com/test-astro-meet",
        actorEmail: ownerEmail,
      });

      assert.ok(schedResult.success);
      assert.equal(schedResult.bookingStatus, "SCHEDULED");

      const session = await prisma.session.findUnique({
        where: { bookingId: testBookingRef },
      });
      assert.equal(session?.bookingStatus, "SCHEDULED");
      assert.equal(session?.scheduledSlot, "Tomorrow at 11:00 AM IST");
      assert.equal(session?.meetingLink, "https://meet.google.com/test-astro-meet");
    });

    it("Owner completes consultation; transitions to COMPLETED", async () => {
      const compResult = await BookingWorkflowService.completeBooking({
        bookingId: testBookingRef,
        actorEmail: ownerEmail,
      });

      assert.ok(compResult.success);
      assert.equal(compResult.bookingStatus, "COMPLETED");

      const session = await prisma.session.findUnique({
        where: { bookingId: testBookingRef },
      });
      assert.equal(session?.bookingStatus, "COMPLETED");
    });
  });

  describe("3. ClientAccountStore Deprecation & Zero Browser Status Storage", () => {
    it("ClientAccountStore.getActiveBooking always returns null and purges localStorage", () => {
      const active = ClientAccountStore.getActiveBooking();
      assert.equal(active, null, "Browser storage must NEVER serve active booking state");
    });
  });
});
