import { prisma } from "@/lib/db/prisma";
import { PlatformSettingsService } from "./platformSettingsService";
import { AuditLogService } from "./auditLogService";
import { BookingEmailService } from "./bookingEmailService";
import { isOwnerEmail } from "@/lib/auth/staffPermissions";

export type BookingWorkflowStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_CLAIMED"
  | "CONFIRMED"
  | "SCHEDULED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED";

export interface CreateBookingParams {
  userId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  productType: "astro" | "vaastu" | "kundli_pdf";
  format: "WhatsApp call" | "Google Meet" | "Voice Call" | "Video Call" | "Live Chat";
  preferredDay?: string;
  preferredTimeWindow?: string;
  topic?: string;
  intakeDetails?: {
    birthDetails?: {
      name?: string;
      gender?: string;
      dob?: string;
      timeOfBirth?: string;
      placeOfBirth?: string;
    } | null;
    propertyDetails?: {
      propertyType?: string;
      city?: string;
      areaSqFt?: string | number;
      facing?: string;
    } | null;
    concerns?: string;
    kundliId?: string;
  };
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class BookingWorkflowService {
  /**
   * Evaluates whether an Astro consultation is eligible for the first-time ₹1,051 rate.
   * Defined as: the user has NO confirmed, scheduled, or completed Astro consultations.
   */
  static async checkFirstTimeAstroEligibility(userId: string): Promise<boolean> {
    if (!prisma || !prisma.session) return false;

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { clerkId: userId }],
      },
      select: { id: true },
    });
    const targetUserId = dbUser ? dbUser.id : userId;

    const confirmedCount = await prisma.session.count({
      where: {
        clientId: targetUserId,
        productType: "astro",
        bookingStatus: {
          in: ["CONFIRMED", "SCHEDULED", "COMPLETED"],
        },
      },
    });

    return confirmedCount === 0;
  }

  /**
   * Checks if user currently has an open Astro booking in progress.
   * Only ONE open Astro booking is permitted at a time.
   */
  static async hasOpenAstroBooking(userId: string): Promise<{ hasOpen: boolean; openBookingId?: string }> {
    if (!prisma || !prisma.session) return { hasOpen: false };

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { clerkId: userId }],
      },
      select: { id: true },
    });
    const targetUserId = dbUser ? dbUser.id : userId;

    const openBooking = await prisma.session.findFirst({
      where: {
        clientId: targetUserId,
        productType: "astro",
        bookingStatus: {
          in: ["PENDING_PAYMENT", "PAYMENT_CLAIMED", "CONFIRMED", "SCHEDULED"],
        },
      },
      select: { bookingId: true },
    });

    if (openBooking && openBooking.bookingId) {
      return { hasOpen: true, openBookingId: openBooking.bookingId };
    }
    return { hasOpen: false };
  }

  /**
   * Creates a new booking record with server-locked pricing and dynamic UPI QR generation.
   */
  static async createBooking(params: CreateBookingParams) {
    if (!params.userId || params.userId === "guest") {
      throw new Error("Authentication required. Please log in to book a consultation.");
    }

    if (!params.clientPhone?.trim()) {
      throw new Error("A valid phone number is required to coordinate your consultation.");
    }

    // 1. Resolve database user
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: params.userId },
          { clerkId: params.userId },
          ...(params.clientEmail ? [{ email: params.clientEmail }] : []),
        ],
      },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: params.userId,
          identifier: params.clientEmail || params.clientPhone,
          name: params.clientName,
          phone: params.clientPhone,
          email: params.clientEmail || null,
          role: "CLIENT",
          walletBalance: 0,
        },
      });
    }

    // 2. Enforce single open Astro booking rule
    if (params.productType === "astro") {
      const openCheck = await this.hasOpenAstroBooking(dbUser.id);
      if (openCheck.hasOpen) {
        throw new Error(
          `You already have an active Astro consultation booking in progress (${openCheck.openBookingId}). Please complete or cancel it before initiating a new booking.`
        );
      }
    }

    // 3. Server-side Pricing Enforcement
    const pricing = await PlatformSettingsService.getPricing();
    const paymentSettings = await PlatformSettingsService.getPaymentSettings();

    let lockedAmount = 0;
    let isFirstTimeAstro = false;
    let serviceName = "Astro Consultation";

    if (params.productType === "astro") {
      isFirstTimeAstro = await this.checkFirstTimeAstroEligibility(dbUser.id);
      lockedAmount = isFirstTimeAstro
        ? pricing.flatFirstConsultationFee || 1051
        : pricing.flatStandardFee || 2100;
      serviceName = isFirstTimeAstro
        ? "1-on-1 Vedic Astro Consultation (First-Time 50% Off)"
        : "1-on-1 Vedic Astro Consultation (Standard Rate)";
    } else if (params.productType === "vaastu") {
      lockedAmount = pricing.vaastuPromoFee || 15000;
      isFirstTimeAstro = false;
      serviceName = "Comprehensive Devta & Energy Vaastu Audit";
    } else if (params.productType === "kundli_pdf") {
      lockedAmount = pricing.kundliPdfFee || 501;
      isFirstTimeAstro = false;
      serviceName = "Kundli Full Multi-Page PDF Dossier";
    }

    // 4. Expiry calculation (default 2 days for unpaid bookings)
    const expiryDays = paymentSettings.unpaidExpiryDays || 2;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // 5. Unique booking reference
    const prefix = params.productType === "vaastu" ? "VAASTU" : params.productType === "kundli_pdf" ? "KUNDLI" : "ASTRO";
    const bookingRef = `${prefix}-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;

    // 6. Generate standard Indian UPI Intent link
    const upiPayLink = `upi://pay?pa=${paymentSettings.upiId}&pn=${encodeURIComponent(
      paymentSettings.payeeName
    )}&am=${lockedAmount}&cu=INR&tr=${bookingRef}&tn=${encodeURIComponent(`Booking ${bookingRef}`)}`;

    // 7. Persist session booking in PostgreSQL
    const session = await prisma.session.create({
      data: {
        bookingId: bookingRef,
        clientId: dbUser.id,
        userName: params.clientName,
        userPhone: params.clientPhone,
        userEmail: params.clientEmail || null,
        productType: params.productType,
        format: params.format,
        concern: params.topic || params.intakeDetails?.concerns || serviceName,
        totalCost: lockedAmount,
        lockedAmount: lockedAmount,
        isFirstTimeAstro: isFirstTimeAstro,
        bookingStatus: "PENDING_PAYMENT",
        paymentStatus: "AWAITING_VERIFICATION",
        paymentMethod: "UPI_QR",
        preferredDay: params.preferredDay || "Earliest Available",
        preferredTimeWindow: params.preferredTimeWindow || "Morning",
        preferredSlot: `${params.preferredDay || "Earliest"} (${params.preferredTimeWindow || "Morning"})`,
        intakeDetails: params.intakeDetails as any,
        expiresAt: expiresAt,
        type: params.format.includes("Video") ? "VIDEO" : params.format.includes("Chat") ? "CHAT" : "VOICE",
      },
    });

    // 8. Audit log booking creation
    await AuditLogService.log({
      action: "BOOKING_CREATED",
      actorId: dbUser.id,
      actorEmail: params.clientEmail || dbUser.email,
      targetId: bookingRef,
      targetType: "BOOKING",
      newState: {
        bookingId: bookingRef,
        amount: lockedAmount,
        isFirstTimeAstro,
        productType: params.productType,
      },
      notes: `Booking initialized for ${params.clientName} (₹${lockedAmount}, FirstTime=${isFirstTimeAstro})`,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return {
      success: true,
      bookingId: bookingRef,
      sessionId: session.id,
      amount: lockedAmount,
      lockedAmount: lockedAmount,
      bookingStatus: "PENDING_PAYMENT" as const,
      isFirstTimeAstro,
      serviceName,
      upiPayLink,
      paymentSettings: {
        upiId: paymentSettings.upiId,
        payeeName: paymentSettings.payeeName,
        qrImageUrl: paymentSettings.qrImageUrl || null,
        whatsappNumber: paymentSettings.whatsappNumber,
      },
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * User clicks "I have paid", records optional UTR, sets PAYMENT_CLAIMED,
   * generates prefilled WhatsApp text, and emails the Site Owner.
   */
  static async claimPayment(
    bookingIdOrParams:
      | string
      | {
          bookingId: string;
          utr?: string | null;
          userId?: string;
          ipAddress?: string | null;
          userAgent?: string | null;
        },
    utrArg?: string
  ) {
    let bookingId: string;
    let utr: string | null | undefined;
    let userId: string | undefined;
    let ipAddress: string | null | undefined;
    let userAgent: string | null | undefined;

    if (typeof bookingIdOrParams === "string") {
      bookingId = bookingIdOrParams.trim();
      utr = utrArg?.trim() || null;
    } else {
      bookingId = (bookingIdOrParams.bookingId || "").trim();
      utr = bookingIdOrParams.utr?.trim() || null;
      userId = bookingIdOrParams.userId;
      ipAddress = bookingIdOrParams.ipAddress;
      userAgent = bookingIdOrParams.userAgent;
    }

    if (!bookingId) {
      throw new Error("Booking reference ID is required.");
    }

    const booking = await prisma.session.findUnique({
      where: { bookingId },
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found.`);
    }

    if (booking.bookingStatus === "EXPIRED") {
      throw new Error("This booking has expired. Please create a new booking.");
    }

    const paymentSettings = await PlatformSettingsService.getPaymentSettings();
    const cleanUtr = utr?.trim() || null;

    // Update status to PAYMENT_CLAIMED
    const updated = await prisma.session.update({
      where: { id: booking.id },
      data: {
        bookingStatus: "PAYMENT_CLAIMED",
        paymentStatus: "AWAITING_VERIFICATION",
        utr: cleanUtr,
      },
    });

    // 1. Audit log payment claim
    await AuditLogService.log({
      action: "PAYMENT_CLAIMED",
      actorId: userId || booking.clientId,
      targetId: booking.bookingId || booking.id,
      targetType: "BOOKING",
      newState: { utr: cleanUtr, bookingStatus: "PAYMENT_CLAIMED" },
      notes: `Payment claimed by user. UTR=${cleanUtr || "Not provided"}`,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    // 2. Email alert to Owner (background)
    const productName =
      booking.productType === "vaastu"
        ? "Vaastu Consultation"
        : booking.productType === "kundli_pdf"
        ? "Kundli PDF Report"
        : "Astro Consultation";

    BookingEmailService.sendOwnerPaymentClaimedAlert({
      bookingId: booking.bookingId || "N/A",
      clientName: booking.userName || "Seeker",
      clientPhone: booking.userPhone || "",
      clientEmail: booking.userEmail,
      productName,
      amount: booking.lockedAmount || booking.totalCost,
      utr: cleanUtr,
    }).catch((e) => console.warn("Failed to alert owner of claimed payment:", e));

    // 3. Construct WhatsApp prefilled message
    const waNumber = (paymentSettings.whatsappNumber || "919311215564").replace(/[^0-9]/g, "");
    const waText = `Pranam Acharya Ji,\n\nI have submitted my UPI payment for verification.\n\n• Booking ID: ${booking.bookingId}\n• Client: ${booking.userName}\n• Service: ${productName}\n• Amount: ₹${(booking.lockedAmount || booking.totalCost).toLocaleString("en-IN")}\n• UTR / Txn Ref: ${cleanUtr || "Attached in screenshot"}\n\nPlease find attached my payment screenshot for bank verification.`;

    const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

    return {
      success: true,
      bookingStatus: "PAYMENT_CLAIMED",
      utr: cleanUtr,
      whatsappUrl,
      whatsappProofLink: whatsappUrl,
      whatsappNumber: paymentSettings.whatsappNumber,
      message: "Payment received for verification. Verification typically occurs during business hours.",
    };
  }

  /**
   * Owner approves booking upon verifying bank credit.
   * Mandates bankCreditConfirmed checkbox, re-checks first-time eligibility,
   * blocks duplicate UTRs, and logs the action.
   */
  static async approveBooking(params: {
    bookingId: string;
    actorEmail: string;
    actorId?: string;
    bankCreditConfirmed: boolean;
    verifiedUtr?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    if (!isOwnerEmail(params.actorEmail)) {
      throw new Error("Unauthorized: Only the site Owner may verify and approve payments.");
    }

    if (!params.bankCreditConfirmed) {
      throw new Error(
        'You must check "I have confirmed this amount is credited in my bank or UPI app and the reference matches."'
      );
    }

    const booking = await prisma.session.findUnique({
      where: { bookingId: params.bookingId },
    });

    if (!booking) {
      throw new Error(`Booking ${params.bookingId} not found.`);
    }

    // Duplicate UTR check across all previously confirmed/scheduled/completed bookings
    const targetUtr = params.verifiedUtr?.trim() || booking.utr;
    if (targetUtr) {
      const duplicate = await prisma.session.findFirst({
        where: {
          utr: targetUtr,
          id: { not: booking.id },
          bookingStatus: { in: ["CONFIRMED", "SCHEDULED", "COMPLETED"] },
        },
      });

      if (duplicate) {
        throw new Error(
          `Duplicate UTR Blocked: The UTR "${targetUtr}" is already used and verified for booking ${duplicate.bookingId}. A single bank transaction cannot be credited twice.`
        );
      }
    }

    // Re-check first-time eligibility if first-time discount was locked
    let firstTimeConflictWarning: string | null = null;
    if (booking.isFirstTimeAstro && booking.productType === "astro") {
      const previousConfirmedCount = await prisma.session.count({
        where: {
          clientId: booking.clientId,
          productType: "astro",
          id: { not: booking.id },
          bookingStatus: { in: ["CONFIRMED", "SCHEDULED", "COMPLETED"] },
        },
      });

      if (previousConfirmedCount > 0) {
        firstTimeConflictWarning =
          "Note: This user has another confirmed consultation in the database since this booking was initiated.";
      }
    }

    // Update booking status
    const approved = await prisma.session.update({
      where: { id: booking.id },
      data: {
        bookingStatus: "CONFIRMED",
        paymentStatus: "PAID",
        utr: targetUtr || booking.utr,
        bankCreditConfirmed: true,
        approvedAt: new Date(),
        approvedBy: params.actorEmail,
      },
    });

    // Audit Log
    await AuditLogService.log({
      action: "BOOKING_APPROVED",
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      targetId: booking.bookingId || booking.id,
      targetType: "BOOKING",
      previousState: { bookingStatus: booking.bookingStatus },
      newState: { bookingStatus: "CONFIRMED", approvedBy: params.actorEmail },
      notes: `Bank credit confirmed and approved by Owner (${params.actorEmail}). UTR=${targetUtr || "None"}. ${firstTimeConflictWarning || ""}`,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // Dispatch confirmation email to client (background, non-blocking)
    if (booking.userEmail) {
      const productName =
        booking.productType === "vaastu"
          ? "Vaastu Consultation"
          : booking.productType === "kundli_pdf"
          ? "Kundli PDF Report"
          : "Astro Consultation";

      BookingEmailService.sendClientBookingConfirmedEmail({
        clientEmail: booking.userEmail,
        clientName: booking.userName || "Seeker",
        clientPhone: booking.userPhone || "",
        bookingId: booking.bookingId || "N/A",
        productName,
        amount: booking.lockedAmount || booking.totalCost,
        format: booking.format || "WhatsApp Call",
      }).catch((e) => console.error("[BookingWorkflow] Failed to dispatch confirmed email to user:", e));
    }

    return {
      success: true,
      bookingStatus: "CONFIRMED",
      paymentStatus: "PAID",
      bankCreditConfirmed: true,
      approvedBy: params.actorEmail,
      firstTimeConflictWarning,
    };
  }

  /**
   * Owner assigns confirmed time slot and meeting link (Google Meet URL or WhatsApp call).
   * Dispatches email to seeker and provides prefilled WhatsApp text for the Owner.
   */
  static async scheduleBooking(params: {
    bookingId: string;
    scheduledSlot: string;
    meetingLink: string;
    actorEmail: string;
    actorId?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    if (!isOwnerEmail(params.actorEmail)) {
      throw new Error("Access Denied: Only the site Owner may schedule consultation slots.");
    }

    if (!params.scheduledSlot?.trim() || !params.meetingLink?.trim()) {
      throw new Error("Both a scheduled time slot and meeting link/format are required.");
    }

    const booking = await prisma.session.findUnique({
      where: { bookingId: params.bookingId },
    });

    if (!booking) {
      throw new Error(`Booking ${params.bookingId} not found.`);
    }

    const updated = await prisma.session.update({
      where: { id: booking.id },
      data: {
        bookingStatus: "SCHEDULED",
        scheduledSlot: params.scheduledSlot,
        meetingLink: params.meetingLink,
        status: "WAITING",
      },
    });

    // 1. Audit Log
    await AuditLogService.log({
      action: "BOOKING_SCHEDULED",
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      targetId: booking.bookingId || booking.id,
      targetType: "BOOKING",
      newState: {
        bookingStatus: "SCHEDULED",
        scheduledSlot: params.scheduledSlot,
        meetingLink: params.meetingLink,
      },
      notes: `Scheduled by Owner for ${params.scheduledSlot} via ${params.meetingLink}`,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // 2. Email user (background)
    const productName =
      booking.productType === "vaastu"
        ? "Vaastu Consultation"
        : booking.productType === "kundli_pdf"
        ? "Kundli PDF Report"
        : "Astro Consultation";

    BookingEmailService.sendClientBookingScheduledEmail({
      clientEmail: booking.userEmail,
      clientName: booking.userName || "Seeker",
      bookingId: booking.bookingId || "N/A",
      productName,
      scheduledSlot: params.scheduledSlot,
      meetingLink: params.meetingLink,
    }).catch((e) => console.warn("Failed to dispatch scheduling email to user:", e));

    // 3. Generate prefilled WhatsApp message for Owner to send client
    const cleanPhone = (booking.userPhone || "").replace(/[^0-9]/g, "");
    const waText = `Pranam ${booking.userName},\n\nYour consultation with Acharya Niraj Kumar has been confirmed and scheduled.\n\n• Ref ID: ${booking.bookingId}\n• Service: ${productName}\n• Confirmed Time: ${params.scheduledSlot}\n• Format/Link: ${params.meetingLink}\n\nPlease be prepared 5 minutes before the time.`;
    const messageUserWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;

    return {
      success: true,
      bookingStatus: "SCHEDULED",
      scheduledSlot: params.scheduledSlot,
      meetingLink: params.meetingLink,
      messageUserWaUrl,
      ownerWhatsAppLink: messageUserWaUrl,
    };
  }

  /**
   * Owner marks consultation completed.
   */
  static async completeBooking(params: {
    bookingId: string;
    actorEmail: string;
    actorId?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    if (!isOwnerEmail(params.actorEmail)) {
      throw new Error("Access Denied: Only the site Owner may mark consultations completed.");
    }

    const booking = await prisma.session.findUnique({
      where: { bookingId: params.bookingId },
    });

    if (!booking) {
      throw new Error(`Booking ${params.bookingId} not found.`);
    }

    await prisma.session.update({
      where: { id: booking.id },
      data: {
        bookingStatus: "COMPLETED",
        status: "COMPLETED",
        endTime: new Date(),
      },
    });

    await AuditLogService.log({
      action: "BOOKING_COMPLETED",
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      targetId: booking.bookingId || booking.id,
      targetType: "BOOKING",
      notes: "Marked completed by Owner",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return { success: true, bookingStatus: "COMPLETED" };
  }

  /**
   * Owner rejects booking with mandatory reason.
   */
  static async rejectBooking(params: {
    bookingId: string;
    reason: string;
    actorEmail: string;
    actorId?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    if (!isOwnerEmail(params.actorEmail)) {
      throw new Error("Access Denied: Only the site Owner may reject bookings.");
    }

    if (!params.reason?.trim()) {
      throw new Error("A clear rejection reason is mandatory.");
    }

    const booking = await prisma.session.findUnique({
      where: { bookingId: params.bookingId },
    });

    if (!booking) {
      throw new Error(`Booking ${params.bookingId} not found.`);
    }

    await prisma.session.update({
      where: { id: booking.id },
      data: {
        bookingStatus: "REJECTED",
        rejectionReason: params.reason.trim(),
      },
    });

    await AuditLogService.log({
      action: "BOOKING_REJECTED",
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      targetId: booking.bookingId || booking.id,
      targetType: "BOOKING",
      notes: `Rejected by Owner. Reason: ${params.reason}`,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // Dispatch rejection notice email to client (background, non-blocking)
    if (booking.userEmail) {
      const productName =
        booking.productType === "vaastu"
          ? "Vaastu Consultation"
          : booking.productType === "kundli_pdf"
          ? "Kundli PDF Report"
          : "Astro Consultation";

      BookingEmailService.sendClientBookingRejectedEmail({
        clientEmail: booking.userEmail,
        clientName: booking.userName || "Seeker",
        bookingId: booking.bookingId || "N/A",
        productName,
        amount: booking.lockedAmount || booking.totalCost,
        reason: params.reason.trim(),
      }).catch((e) => console.error("[BookingWorkflow] Failed to dispatch rejection email to user:", e));
    }

    return {
      success: true,
      bookingStatus: "REJECTED",
      rejectionReason: params.reason.trim(),
    };
  }

  /**
   * Owner marks booking refunded.
   */
  static async refundBooking(params: {
    bookingId: string;
    notes?: string;
    actorEmail: string;
    actorId?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    if (!isOwnerEmail(params.actorEmail)) {
      throw new Error("Access Denied: Only the site Owner may record refunds.");
    }

    const booking = await prisma.session.findUnique({
      where: { bookingId: params.bookingId },
    });

    if (!booking) {
      throw new Error(`Booking ${params.bookingId} not found.`);
    }

    await prisma.session.update({
      where: { id: booking.id },
      data: {
        bookingStatus: "CANCELLED",
        refundedAt: new Date(),
        refundNotes: params.notes || "Refunded by Owner directly via UPI",
      },
    });

    await AuditLogService.log({
      action: "BOOKING_REFUNDED",
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      targetId: booking.bookingId || booking.id,
      targetType: "BOOKING",
      notes: `Marked refunded by Owner. Notes: ${params.notes || "None"}`,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return { success: true, bookingStatus: "CANCELLED" };
  }

  /**
   * Allows a seeker or operator to cancel a pending unpaid booking so the user can re-book.
   */
  static async cancelBooking(bookingId: string, reason?: string) {
    if (!prisma || !prisma.session) throw new Error("Database service unavailable.");

    const booking = await prisma.session.findUnique({
      where: { bookingId },
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found.`);
    }

    if (!["PENDING_PAYMENT", "PAYMENT_CLAIMED"].includes(booking.bookingStatus)) {
      throw new Error(`Only pending bookings can be cancelled. Current status is ${booking.bookingStatus}.`);
    }

    await prisma.session.update({
      where: { id: booking.id },
      data: {
        bookingStatus: "CANCELLED",
        rejectionReason: reason || "Cancelled by seeker",
      },
    });

    return { success: true, bookingStatus: "CANCELLED" };
  }

  /**
   * Auto-expire unpaid bookings past their expiration deadline.
   */
  static async expireUnpaidBookings(): Promise<number> {
    if (!prisma || !prisma.session) return 0;

    const expired = await prisma.session.updateMany({
      where: {
        bookingStatus: "PENDING_PAYMENT",
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        bookingStatus: "EXPIRED",
      },
    });

    return expired.count;
  }
}
