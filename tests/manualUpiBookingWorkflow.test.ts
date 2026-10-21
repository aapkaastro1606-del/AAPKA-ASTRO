import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { BookingWorkflowService } from "../src/lib/services/bookingWorkflowService";
import { PlatformSettingsService } from "../src/lib/services/platformSettingsService";
import { prisma } from "../src/lib/db/prisma";
import { isOwnerEmail } from "../src/lib/auth/staffPermissions";

describe("Manual UPI Booking Workflow Suite", { concurrency: 1 }, () => {
  const testUserId = `test-user-${Date.now()}`;
  let firstAstroBookingId: string = "";
  let secondAstroBookingId: string = "";
  let vaastuBookingId: string = "";
  let kundliPdfBookingId: string = "";
  const mockUtr1 = "4289" + String(Date.now()).slice(-8);
  const mockUtr2 = "5289" + String(Date.now() + 500).slice(-8);

  before(async () => {
    // Ensure clean state for test user if exists
    try {
      await prisma.session.deleteMany({
        where: { userEmail: `test-${testUserId}@aapkaastro.com` },
      });
      await prisma.user.deleteMany({
        where: { clerkId: testUserId },
      });
    } catch {}
  });

  after(async () => {
    // Clean up created test sessions
    try {
      await prisma.auditLog.deleteMany({
        where: { actorEmail: { contains: "test" } },
      });
      await prisma.session.deleteMany({
        where: { userEmail: `test-${testUserId}@aapkaastro.com` },
      });
      await prisma.user.deleteMany({
        where: { clerkId: testUserId },
      });
    } catch {}
  });

  test("1. First-time Astro Consultation locks at discounted ₹1,051 rate", async () => {
    const isFirst = await BookingWorkflowService.checkFirstTimeAstroEligibility(testUserId);
    assert.strictEqual(isFirst, true, "New user must be eligible for first-time Astro discount");

    const result = await BookingWorkflowService.createBooking({
      userId: testUserId,
      clientName: "Rahul Sharma",
      clientPhone: "+91 98765 43210",
      clientEmail: `test-${testUserId}@aapkaastro.com`,
      productType: "astro",
      format: "Google Meet",
      preferredDay: "Tomorrow",
      preferredTimeWindow: "Evening (5 PM - 8 PM)",
      topic: "Career guidance and promotion timings",
      intakeDetails: {
        birthDetails: {
          name: "Rahul Sharma",
          gender: "male",
          dob: "1994-06-15",
          timeOfBirth: "10:30",
          placeOfBirth: "Jaipur, Rajasthan",
        },
      },
    });

    assert.ok(result.bookingId.startsWith("ASTRO-"), "Booking reference must start with ASTRO-");
    assert.strictEqual(result.lockedAmount, 1051, "First-time Astro consultation must lock at ₹1,051");
    assert.strictEqual(result.isFirstTimeAstro, true, "isFirstTimeAstro flag must be true");
    assert.strictEqual(result.bookingStatus, "PENDING_PAYMENT");
    assert.ok(result.upiPayLink.includes("am=1051"), "UPI link must contain amount 1051");
    assert.ok(result.upiPayLink.includes(result.bookingId), "UPI link must contain booking reference");

    firstAstroBookingId = result.bookingId;
  });

  test("2. Server strictly enforces single open Astro booking constraint", async () => {
    const openCheck = await BookingWorkflowService.hasOpenAstroBooking(testUserId);
    assert.strictEqual(openCheck.hasOpen, true, "User should have an open Astro booking");
    assert.strictEqual(openCheck.openBookingId, firstAstroBookingId);

    // Attempting to create a second open Astro booking must throw an error
    await assert.rejects(
      async () => {
        await BookingWorkflowService.createBooking({
          userId: testUserId,
          clientName: "Rahul Sharma",
          clientPhone: "+91 98765 43210",
          clientEmail: `test-${testUserId}@aapkaastro.com`,
          productType: "astro",
          format: "WhatsApp call",
        });
      },
      /already have an active Astro consultation booking in progress/i,
      "Must reject initiating a second open Astro booking"
    );
  });

  test("3. Seeker clicking 'I have paid' sets PAYMENT_CLAIMED and records UTR", async () => {
    const claimRes = await BookingWorkflowService.claimPayment(firstAstroBookingId, mockUtr1);

    assert.strictEqual(claimRes.bookingStatus, "PAYMENT_CLAIMED");
    assert.strictEqual(claimRes.utr, mockUtr1);
    assert.ok(claimRes.whatsappProofLink.includes(mockUtr1), "WhatsApp proof link must include UTR");
    assert.ok(claimRes.whatsappProofLink.includes(firstAstroBookingId), "WhatsApp proof link must include booking reference");

    // Verify database row
    const dbBooking = await prisma.session.findUnique({
      where: { bookingId: firstAstroBookingId },
    });
    assert.strictEqual(dbBooking?.bookingStatus, "PAYMENT_CLAIMED");
    assert.strictEqual(dbBooking?.utr, mockUtr1);
  });

  test("4. Owner approval requires bankCreditConfirmed checkbox and owner privileges", async () => {
    const ownerEmail = "aapkaastro1606@gmail.com";
    assert.strictEqual(isOwnerEmail(ownerEmail), true, "aapkaastro1606@gmail.com must be identified as Owner");
    assert.strictEqual(isOwnerEmail("intruder@example.com"), false, "Non-owner email must be false");

    // Non-owner should be rejected
    await assert.rejects(
      async () => {
        await BookingWorkflowService.approveBooking({
          bookingId: firstAstroBookingId,
          actorEmail: "intruder@example.com",
          bankCreditConfirmed: true,
        });
      },
      /Unauthorized.*Owner/i,
      "Non-owners must be blocked from approving bookings"
    );

    // Approval without bank confirmation checkbox must be rejected
    await assert.rejects(
      async () => {
        await BookingWorkflowService.approveBooking({
          bookingId: firstAstroBookingId,
          actorEmail: ownerEmail,
          bankCreditConfirmed: false,
        });
      },
      /confirmed this amount is credited in my bank/i,
      "Approval must mandate bank confirmation checkbox"
    );

    // Legitimate owner approval
    const approved = await BookingWorkflowService.approveBooking({
      bookingId: firstAstroBookingId,
      actorEmail: ownerEmail,
      bankCreditConfirmed: true,
      verifiedUtr: mockUtr1,
    });

    assert.strictEqual(approved.bookingStatus, "CONFIRMED");
    assert.strictEqual(approved.paymentStatus, "PAID");
    assert.strictEqual(approved.bankCreditConfirmed, true);
    assert.strictEqual(approved.approvedBy, ownerEmail);

    // Check AuditLog table has recorded the approval
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: "BOOKING_APPROVED",
        targetId: firstAstroBookingId,
      },
    });
    assert.ok(audit, "Approval must produce an AuditLog entry in PostgreSQL");
    assert.strictEqual(audit.actorEmail, ownerEmail);
  });

  test("5. Owner schedules consultation slot & meeting link", async () => {
    const ownerEmail = "aapkaastro1606@gmail.com";
    const scheduledSlot = "18 Oct 2026 at 4:00 PM IST";
    const meetingLink = "https://meet.google.com/xyz-abcd-efg";

    const scheduled = await BookingWorkflowService.scheduleBooking({
      bookingId: firstAstroBookingId,
      actorEmail: ownerEmail,
      scheduledSlot,
      meetingLink,
    });

    assert.strictEqual(scheduled.bookingStatus, "SCHEDULED");
    assert.strictEqual(scheduled.scheduledSlot, scheduledSlot);
    assert.strictEqual(scheduled.meetingLink, meetingLink);
    assert.ok(scheduled.ownerWhatsAppLink.includes("meet.google.com"), "Pre-filled text must contain meeting link");

    // Mark completed to free up slot
    const completed = await BookingWorkflowService.completeBooking({
      bookingId: firstAstroBookingId,
      actorEmail: ownerEmail,
    });
    assert.strictEqual(completed.bookingStatus, "COMPLETED");
  });

  test("6. Subsequent Astro Consultation locks at standard ₹2,100 rate (no repeat discount)", async () => {
    // User now has 1 completed consultation
    const isFirst = await BookingWorkflowService.checkFirstTimeAstroEligibility(testUserId);
    assert.strictEqual(isFirst, false, "User with prior completed consultation must NOT get first-time discount");

    const result2 = await BookingWorkflowService.createBooking({
      userId: testUserId,
      clientName: "Rahul Sharma",
      clientPhone: "+91 98765 43210",
      clientEmail: `test-${testUserId}@aapkaastro.com`,
      productType: "astro",
      format: "WhatsApp call",
      topic: "Follow-up transit review",
    });

    assert.strictEqual(result2.lockedAmount, 2100, "Subsequent Astro consultation must lock at ₹2,100");
    assert.strictEqual(result2.isFirstTimeAstro, false, "isFirstTimeAstro must be false");
    assert.ok(result2.upiPayLink.includes("am=2100"), "UPI link must contain amount 2100");

    secondAstroBookingId = result2.bookingId;
  });

  test("7. Duplicate UTR check blocks claim and approval if another booking used same transaction ID", async () => {
    const ownerEmail = "aapkaastro1606@gmail.com";

    // 1. Attempting to claim second booking with duplicate UTR must be blocked at submission
    await assert.rejects(
      async () => {
        await BookingWorkflowService.claimPayment(secondAstroBookingId, mockUtr1);
      },
      /Duplicate UTRs are not permitted/i,
      "Duplicate UTR must be blocked on claim payment"
    );

    // Set to claimed for approval test
    await prisma.session.update({
      where: { bookingId: secondAstroBookingId },
      data: { bookingStatus: "PAYMENT_CLAIMED", utr: mockUtr1 },
    });

    // 2. Attempting to approve booking with an already-used UTR must be blocked at approval
    await assert.rejects(
      async () => {
        await BookingWorkflowService.approveBooking({
          bookingId: secondAstroBookingId,
          actorEmail: ownerEmail,
          bankCreditConfirmed: true,
          verifiedUtr: mockUtr1,
        });
      },
      /already used and verified for booking/i,
      "Duplicate UTR must be strictly rejected on approval"
    );

    // Reject second booking with reason
    const rejected = await BookingWorkflowService.rejectBooking({
      bookingId: secondAstroBookingId,
      actorEmail: ownerEmail,
      reason: "Duplicate bank transaction reference submitted.",
    });
    assert.strictEqual(rejected.bookingStatus, "REJECTED");
    assert.strictEqual(rejected.rejectionReason, "Duplicate bank transaction reference submitted.");
  });

  test("8. Vaastu Consultation locks at flat promo ₹15,000 rate", async () => {
    const vaastu = await BookingWorkflowService.createBooking({
      userId: testUserId,
      clientName: "Rahul Sharma",
      clientPhone: "+91 98765 43210",
      clientEmail: `test-${testUserId}@aapkaastro.com`,
      productType: "vaastu",
      format: "Google Meet",
      topic: "New 3BHK flat energy alignment and entrance facing",
      intakeDetails: {
        propertyDetails: {
          propertyType: "Apartment",
          city: "Gurugram",
          areaSqFt: "1850",
          facing: "North-East",
        },
      },
    });

    assert.ok(vaastu.bookingId.startsWith("VAASTU-"));
    assert.strictEqual(vaastu.lockedAmount, 15000, "Vaastu consultation must lock at ₹15,000");
    assert.strictEqual(vaastu.isFirstTimeAstro, false);
    assert.ok(vaastu.upiPayLink.includes("am=15000"));
    vaastuBookingId = vaastu.bookingId;
  });

  test("9. Kundli PDF Order locks at flat ₹501 rate", async () => {
    const pdfBooking = await BookingWorkflowService.createBooking({
      userId: testUserId,
      clientName: "Rahul Sharma",
      clientPhone: "+91 98765 43210",
      clientEmail: `test-${testUserId}@aapkaastro.com`,
      productType: "kundli_pdf",
      format: "WhatsApp call",
      topic: "Full Janam Kundli Multi-Page Dossier",
    });

    assert.ok(pdfBooking.bookingId.startsWith("KUNDLI-"));
    assert.strictEqual(pdfBooking.lockedAmount, 501, "Kundli PDF dossier must lock at ₹501");
    assert.ok(pdfBooking.upiPayLink.includes("am=501"));
    kundliPdfBookingId = pdfBooking.bookingId;
  });

  test("10. Payment settings update requires Owner role and generates audit log", async () => {
    const ownerEmail = "aapkaastro1606@gmail.com";

    // Non-owner rejected
    await assert.rejects(
      async () => {
        await PlatformSettingsService.updatePaymentSettings(
          { upiId: "hacked@upi" },
          "hacker@fake.com"
        );
      },
      /Unauthorized/i
    );

    // Owner successfully updates settings
    const updated = await PlatformSettingsService.updatePaymentSettings(
      {
        upiId: "9311215564@okbizaxis",
        payeeName: "Aapka Astro Official",
        whatsappNumber: "+91 93112 15564",
        whatsappConfirmed: true,
        unpaidExpiryDays: 3,
      },
      ownerEmail
    );

    assert.strictEqual(updated.payeeName, "Aapka Astro Official");
    assert.strictEqual(updated.whatsappConfirmed, true);
    assert.strictEqual(updated.unpaidExpiryDays, 3);

    // Audit log verification
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: "PAYMENT_SETTINGS_UPDATED",
        actorEmail: ownerEmail,
      },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(audit, "Must log payment settings modification to AuditLog");
  });
});
