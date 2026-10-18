/**
 * ============================================================================
 * BOOKING EMAIL DISPATCH SERVICE (RESEND)
 * ============================================================================
 * Dispatches transactional notifications for manual UPI booking workflows:
 * 1. Claimed Payment (to Owner)
 * 2. Booking Confirmed (to User)
 * 3. Booking Rejected (to User)
 * 4. Slot & Meeting Link Scheduled (to User)
 * 5. Payment Settings Modification Alert (to Owner)
 *
 * RESILIENCE CONTRACT:
 * - Fails loudly with descriptive error logging & AuditLog entries when
 *   RESEND_API_KEY is unconfigured or when Resend returns an error.
 * - NEVER throws an uncaught error to callers. A booking state transition in
 *   PostgreSQL will NEVER be rolled back or lost because an email failed.
 * ============================================================================
 */

import { AuditLogService } from "./auditLogService";
import { getOwnerEmails } from "@/lib/auth/staffPermissions";
import { isEmailEnabled } from "@/lib/utils/resilience";

export interface BookingConfirmationEmailParams {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  phone: string;
  productName: string;
  productId: "astro" | "vaastu";
  amountPaid: number;
  format: string;
  orderId?: string;
  paymentId?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  propertyType?: string;
  propertyLocation?: string;
  topic?: string;
}

export interface DispatchEmailResult {
  success: boolean;
  simulated: boolean;
  error?: string;
}

export class BookingEmailService {
  private static readonly SANCTUM_PHONE = "919311215564";
  private static readonly SANCTUM_PHONE_DISPLAY = "+91 93112 15564";
  private static readonly SUPPORT_EMAIL = "contact@aapkaastro.com";
  private static readonly WEBSITE_URL = "https://aapkaastro.com";

  /**
   * Persists email delivery status on the booking so admin view can show "email failed"
   */
  public static async recordEmailStatus(
    bookingId: string | undefined,
    status: "DELIVERED" | "FAILED" | "SIMULATED",
    errorMsg?: string
  ): Promise<void> {
    if (!bookingId || bookingId === "N/A") return;
    try {
      const { prisma } = await import("@/lib/db/prisma");
      if (!prisma || !prisma.session) return;

      const existing = await prisma.session.findFirst({
        where: { bookingId },
        select: { id: true, notes: true, intakeDetails: true },
      });
      if (!existing) return;

      const updatedIntake =
        typeof existing.intakeDetails === "object" && existing.intakeDetails !== null
          ? {
              ...(existing.intakeDetails as Record<string, any>),
              emailStatus: status,
              emailError: errorMsg || null,
            }
          : { emailStatus: status, emailError: errorMsg || null };

      const notesTag = status === "FAILED" ? `\n[EMAIL_FAILED]: ${errorMsg || "Delivery failed"}` : "";

      await prisma.session.update({
        where: { id: existing.id },
        data: {
          intakeDetails: updatedIntake,
          notes: existing.notes ? `${existing.notes}${notesTag}` : notesTag,
        },
      });
    } catch (e) {
      console.warn(`[BookingEmailService] Could not update session emailStatus for ${bookingId}:`, e);
    }
  }

  /**
   * Generates the prefilled WhatsApp coordination link
   */
  public static getWhatsAppCoordinationLink(params: {
    bookingId: string;
    clientName: string;
    productName: string;
  }): string {
    const text = `Pranam Acharya Ji, I have confirmed my booking for ${params.productName} (Booking ID: ${params.bookingId}). Client: ${params.clientName}. I would like to coordinate the exact time and whether we connect via WhatsApp call or Google Meet.`;
    return `https://wa.me/${this.SANCTUM_PHONE}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Core dispatcher that handles communication with Resend API.
   * Enforces loud failure logging, kill switch compliance, timeouts, and never-throw resilience.
   */
  private static async dispatchResendEmail(params: {
    to: string | string[];
    subject: string;
    html: string;
    text: string;
    templateName: string;
    bookingId?: string;
  }): Promise<DispatchEmailResult> {
    const toList = Array.isArray(params.to)
      ? params.to.map((e) => e.trim()).filter(Boolean)
      : [params.to.trim()];
    const toDisplay = toList.join(", ");

    if (toList.length === 0) {
      console.warn(`[BookingEmailService] No recipient address provided for template '${params.templateName}'. Skipping dispatch.`);
      await this.recordEmailStatus(params.bookingId, "FAILED", "No recipient address provided");
      return { success: false, simulated: true, error: "No recipient address provided." };
    }

    // 1. Kill Switch Check (EMAIL_ENABLED — default safe: false on Preview)
    if (!isEmailEnabled()) {
      const msg = `[EMAIL_KILL_SWITCH] Email dispatch is disabled (EMAIL_ENABLED=false or Preview isolation active). Skipping live delivery for template '${params.templateName}' to ${toDisplay}.`;
      console.info(msg);

      await this.recordEmailStatus(params.bookingId, "SIMULATED", "Email skipped via kill switch or preview isolation");

      await AuditLogService.log({
        action: "EMAIL_SKIPPED_KILL_SWITCH",
        actorEmail: "system@aapkaastro.com",
        targetId: params.bookingId || null,
        targetType: "EMAIL",
        notes: msg,
      }).catch(() => {});

      return { success: false, simulated: true, error: msg };
    }

    const apiKey = process.env.RESEND_API_KEY;

    // 2. Fail loudly if unconfigured or placeholder
    if (!apiKey || apiKey.startsWith("re_placeholder") || apiKey === "placeholder" || apiKey.trim().length === 0) {
      const errorMsg = `[RESEND EMAIL MISCONFIGURATION] RESEND_API_KEY is not configured or is a placeholder in process.env. Transactional email '${params.templateName}' for booking ${params.bookingId || "N/A"} could not be delivered to: ${toDisplay}. Add a valid RESEND_API_KEY in Vercel/env to enable live delivery.`;
      console.error(errorMsg);

      await this.recordEmailStatus(params.bookingId, "FAILED", errorMsg);

      await AuditLogService.log({
        action: "EMAIL_CONFIG_MISSING",
        actorEmail: "system@aapkaastro.com",
        targetId: params.bookingId || null,
        targetType: "EMAIL",
        notes: errorMsg,
      }).catch((e) => console.warn("[BookingEmailService] Failed to record email audit log:", e));

      return { success: false, simulated: true, error: errorMsg };
    }

    // 3. Network dispatch to Resend with strict 6-second timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Aapka Astro <bookings@mail.aapkaastro.com>",
          to: toList,
          subject: params.subject,
          html: params.html,
          text: params.text,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        const errorMsg = `[RESEND DELIVERY FAILURE] Resend API returned HTTP ${res.status} (${res.statusText}) for template '${params.templateName}' to ${toDisplay}. Response body: ${errText}`;
        console.error(errorMsg);

        await this.recordEmailStatus(params.bookingId, "FAILED", errorMsg);

        await AuditLogService.log({
          action: "EMAIL_DELIVERY_FAILED",
          actorEmail: "system@aapkaastro.com",
          targetId: params.bookingId || null,
          targetType: "EMAIL",
          notes: errorMsg,
        }).catch(() => {});

        return { success: false, simulated: false, error: errorMsg };
      }

      console.info(`[RESEND SUCCESS] Dispatched '${params.templateName}' email to ${toDisplay} for booking ${params.bookingId || "N/A"}`);

      await this.recordEmailStatus(params.bookingId, "DELIVERED");

      await AuditLogService.log({
        action: "EMAIL_DELIVERED",
        actorEmail: "system@aapkaastro.com",
        targetId: params.bookingId || null,
        targetType: "EMAIL",
        notes: `Successfully dispatched email '${params.templateName}' to ${toDisplay}`,
      }).catch(() => {});

      return { success: true, simulated: false };
    } catch (networkErr: any) {
      const isTimeout = networkErr?.name === "AbortError";
      const errorMsg = isTimeout
        ? `[RESEND TIMEOUT] Request to Resend timed out after 6000ms for template '${params.templateName}' to ${toDisplay}.`
        : `[RESEND NETWORK EXCEPTION] Network exception while dispatching '${params.templateName}' to ${toDisplay}: ${networkErr?.message || networkErr}`;

      console.error(errorMsg);

      await this.recordEmailStatus(params.bookingId, "FAILED", errorMsg);

      await AuditLogService.log({
        action: "EMAIL_DELIVERY_EXCEPTION",
        actorEmail: "system@aapkaastro.com",
        targetId: params.bookingId || null,
        targetType: "EMAIL",
        notes: errorMsg,
      }).catch(() => {});

      return { success: false, simulated: false, error: errorMsg };
    }
  }

  /**
   * 1. CLAIMED PAYMENT (to Owner)
   * Dispatched when user clicks "I have paid" in the manual UPI checkout.
   */
  public static async sendOwnerPaymentClaimedAlert(params: {
    bookingId: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string | null;
    productName: string;
    amount: number;
    utr?: string | null;
  }): Promise<DispatchEmailResult> {
    const ownerEmails = getOwnerEmails();
    const subject = `[PAYMENT CLAIMED] ${params.clientName} reported UPI payment for ${params.bookingId} (₹${params.amount})`;

    const text = `
PRANAM ACHARYA JI / ADMIN DESK,

A seeker has reported their UPI payment for manual bank verification.

BOOKING DETAILS:
- Booking Reference: ${params.bookingId}
- Seeker Name: ${params.clientName}
- WhatsApp / Phone: ${params.clientPhone}
- Email: ${params.clientEmail || "Not provided"}
- Service: ${params.productName}
- Amount Locked: ₹${params.amount.toLocaleString("en-IN")}
- UTR / Reference: ${params.utr || "Not entered (submitted via WhatsApp screenshot)"}
- Claim Timestamp: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST

ACTION REQUIRED:
1. Open your bank app or UPI business application to verify receipt of ₹${params.amount.toLocaleString("en-IN")}.
2. Check the Owner Verification Queue to approve and schedule:
   https://aapkaastro.com/admin/bookings

Aapka Astro Sanctum Desk
`.trim();

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 2px solid #7B2D26; border-radius: 12px; background: #FFFDF9;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <h3 style="color: #7B2D26; margin: 0; font-size: 18px;">⚡ New UPI Payment Claimed for Bank Verification</h3>
        </div>
        <p style="font-size: 14px; color: #3B2A1E; line-height: 1.5;">
          A seeker has completed their UPI QR transfer and submitted their payment reference for verification.
        </p>
        <div style="background: #FBF3E7; padding: 18px; border-radius: 10px; border: 1px solid #E8D8C3; margin: 18px 0;">
          <table style="width: 100%; font-size: 13px; line-height: 1.6;">
            <tr><td style="font-weight: bold; width: 40%; color: #6E5545;">Booking Reference:</td><td style="font-family: monospace; font-size: 14px; font-weight: bold; color: #7B2D26;">${params.bookingId}</td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">Seeker Name:</td><td><strong>${params.clientName}</strong></td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">Contact Phone:</td><td>${params.clientPhone}</td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">Email:</td><td>${params.clientEmail || "Not provided"}</td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">Service:</td><td>${params.productName}</td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">Amount:</td><td><strong style="color: #2A4720; font-size: 15px;">₹${params.amount.toLocaleString("en-IN")}</strong></td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">UTR / Txn Ref:</td><td style="font-family: monospace;">${params.utr || "None (screenshot on WhatsApp)"}</td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">Claimed At:</td><td>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td></tr>
          </table>
        </div>
        <p style="font-size: 13px; color: #6E5545; line-height: 1.5;">
          <strong>Important Verification Notice:</strong> Screenshots can be digitally altered. Only approve after confirming that the funds are actually credited in your Punjab National Bank or UPI merchant account.
        </p>
        <div style="margin-top: 20px;">
          <a href="https://aapkaastro.com/admin/bookings" style="display: inline-block; background: #7B2D26; color: #FFF; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
            Open Verification Queue &rarr;
          </a>
        </div>
      </div>
    `;

    return this.dispatchResendEmail({
      to: ownerEmails,
      subject,
      html,
      text,
      templateName: "CLAIMED_PAYMENT_TO_OWNER",
      bookingId: params.bookingId,
    });
  }

  /**
   * 2. CONFIRMED (to User)
   * Dispatched to the seeker when the Owner confirms bank credit receipt.
   */
  public static async sendClientBookingConfirmedEmail(params: {
    clientEmail?: string | null;
    clientName: string;
    clientPhone?: string;
    bookingId: string;
    productName: string;
    amount: number;
    format: string;
  }): Promise<DispatchEmailResult> {
    if (!params.clientEmail || !params.clientEmail.trim()) {
      return { success: false, simulated: true, error: "No client email provided." };
    }

    const subject = `Payment Verified: Your Consultation is Confirmed [${params.bookingId}]`;
    const whatsappUrl = this.getWhatsAppCoordinationLink({
      bookingId: params.bookingId,
      clientName: params.clientName,
      productName: params.productName,
    });

    const text = `
PRANAM ${params.clientName.toUpperCase()},

YOUR PAYMENT IS VERIFIED & BOOKING CONFIRMED!

We are pleased to inform you that your UPI payment of ₹${params.amount.toLocaleString("en-IN")} has been verified by Acharya Niraj Kumar's sanctum desk.

BOOKING SUMMARY:
- Booking Reference: ${params.bookingId}
- Service: ${params.productName}
- Preferred Format: ${params.format}
- Amount Paid: ₹${params.amount.toLocaleString("en-IN")}
- Status: Confirmed & Queued for Scheduling

WHAT HAPPENS NEXT:
Acharya Ji's sanctum desk is reviewing your intake preferences. Our team will assign your exact consultation time slot and provide your Google Meet or WhatsApp call link shortly.

MESSAGE US ON WHATSAPP:
If you would like to expedite slot confirmation or share additional questions, you may message Acharya Ji's desk directly:
${whatsappUrl}

View your live booking status in your account:
https://aapkaastro.com/account/consult

With warm blessings,
Acharya Niraj Kumar & Sanctum Team
Aapka Astro | WhatsApp: ${this.SANCTUM_PHONE_DISPLAY}
`.trim();

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E8D8C3; border-radius: 12px; background: #FFFDF9;">
        <h2 style="color: #7B2D26; margin-top: 0;">Pranam ${params.clientName},</h2>
        <div style="background: #F4F9F2; border: 1px solid #6B8E5A; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 15px; font-weight: bold; color: #2A4720;">
            ✓ Payment Verified — Your Consultation is Confirmed
          </p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #3B2A1E;">
            Your UPI payment of <strong>₹${params.amount.toLocaleString("en-IN")}</strong> has been verified by Acharya Ji&apos;s sanctum desk.
          </p>
        </div>

        <div style="background: #FBF3E7; border: 1px solid #E8D8C3; padding: 18px; border-radius: 10px; margin: 18px 0;">
          <h4 style="margin: 0 0 10px 0; color: #7B2D26; font-size: 14px;">Booking Summary</h4>
          <table style="width: 100%; font-size: 13px; line-height: 1.6;">
            <tr><td style="font-weight: bold; width: 40%; color: #6E5545;">Booking Reference:</td><td style="font-family: monospace; font-size: 14px; font-weight: bold; color: #7B2D26;">${params.bookingId}</td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">Consultation Type:</td><td>${params.productName}</td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">Delivery Mode:</td><td>${params.format}</td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">Payment Status:</td><td><span style="color: #2A4720; font-weight: bold;">PAID &amp; VERIFIED</span></td></tr>
          </table>
        </div>

        <h4 style="color: #7B2D26; margin: 18px 0 8px 0; font-size: 14px;">Next Steps: Scheduling Your Slot</h4>
        <p style="font-size: 13px; color: #6E5545; line-height: 1.5; margin: 0 0 16px 0;">
          Acharya Ji&apos;s team is reviewing your preferred day and time window. We will assign your consultation slot and dispatch your meeting link shortly via email and your account dashboard.
        </p>

        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <a href="${whatsappUrl}" style="display: inline-block; background: #25D366; color: #FFF; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
            Message Desk on WhatsApp &rarr;
          </a>
          <a href="https://aapkaastro.com/account/consult" style="display: inline-block; background: #7B2D26; color: #FFF; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
            View in My Bookings
          </a>
        </div>
      </div>
    `;

    return this.dispatchResendEmail({
      to: params.clientEmail,
      subject,
      html,
      text,
      templateName: "BOOKING_CONFIRMED_TO_USER",
      bookingId: params.bookingId,
    });
  }

  /**
   * 3. REJECTED (to User)
   * Dispatched when Owner rejects a payment claim with a required reason.
   */
  public static async sendClientBookingRejectedEmail(params: {
    clientEmail?: string | null;
    clientName: string;
    bookingId: string;
    productName: string;
    amount: number;
    reason: string;
  }): Promise<DispatchEmailResult> {
    if (!params.clientEmail || !params.clientEmail.trim()) {
      return { success: false, simulated: true, error: "No client email provided." };
    }

    const subject = `Payment Verification Update for Booking [${params.bookingId}]`;
    const helpWaText = encodeURIComponent(
      `Pranam Acharya Ji, my payment verification for Booking ID ${params.bookingId} (${params.productName}) was rejected. Reason: ${params.reason}. Please find attached my bank statement proof.`
    );
    const helpWaUrl = `https://wa.me/${this.SANCTUM_PHONE}?text=${helpWaText}`;

    const text = `
PRANAM ${params.clientName.toUpperCase()},

UPDATE REGARDING YOUR PAYMENT VERIFICATION

Our accounts desk was unable to verify the UPI payment submitted for your consultation booking.

DETAILS:
- Booking Reference: ${params.bookingId}
- Service: ${params.productName}
- Amount Claimed: ₹${params.amount.toLocaleString("en-IN")}
- Verification Outcome: Not Verified / Rejected
- Reason Provided: ${params.reason}

WHAT YOU CAN DO:
If the funds were debited from your bank account, please reply with your bank statement screenshot or official 12-digit UTR number directly to our sanctum desk on WhatsApp:
${helpWaUrl}

Alternatively, you may initiate a fresh booking and retry your payment via the official UPI QR:
https://aapkaastro.com/consult

Aapka Astro Sanctum Desk
WhatsApp: ${this.SANCTUM_PHONE_DISPLAY}
Email: ${this.SUPPORT_EMAIL}
`.trim();

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E8D8C3; border-radius: 12px; background: #FFFDF9;">
        <h2 style="color: #7B2D26; margin-top: 0;">Pranam ${params.clientName},</h2>
        <div style="background: #FDF2F0; border: 1px solid #E0A899; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 15px; font-weight: bold; color: #7B2D26;">
            Payment Verification Notice
          </p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #3B2A1E;">
            Our accounts desk could not confirm credit in our bank statement for booking <strong>${params.bookingId}</strong>.
          </p>
        </div>

        <div style="background: #FBF3E7; border: 1px solid #E8D8C3; padding: 18px; border-radius: 10px; margin: 18px 0;">
          <h4 style="margin: 0 0 10px 0; color: #7B2D26; font-size: 14px;">Reason for Rejection</h4>
          <p style="margin: 0; font-size: 13px; color: #3B2A1E; background: #FFF; padding: 10px 14px; border-radius: 6px; border: 1px dashed #C1662F;">
            &ldquo;${params.reason}&rdquo;
          </p>
        </div>

        <h4 style="color: #7B2D26; margin: 18px 0 8px 0; font-size: 14px;">How to Resolve</h4>
        <p style="font-size: 13px; color: #6E5545; line-height: 1.5; margin: 0 0 16px 0;">
          If the amount was debited from your bank or UPI application, please share your official bank transaction statement or 12-digit UTR with our desk. Our accounts team will manually match and credit your booking.
        </p>

        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <a href="${helpWaUrl}" style="display: inline-block; background: #25D366; color: #FFF; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
            Share Proof on WhatsApp &rarr;
          </a>
          <a href="https://aapkaastro.com/consult" style="display: inline-block; background: #7B2D26; color: #FFF; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
            Retry Booking
          </a>
        </div>
      </div>
    `;

    return this.dispatchResendEmail({
      to: params.clientEmail,
      subject,
      html,
      text,
      templateName: "BOOKING_REJECTED_TO_USER",
      bookingId: params.bookingId,
    });
  }

  /**
   * 4. SLOT-AND-LINK (to User)
   * Dispatched when Owner schedules the confirmed consultation slot and meeting link.
   */
  public static async sendClientBookingScheduledEmail(params: {
    clientEmail?: string | null;
    clientName: string;
    bookingId: string;
    productName: string;
    scheduledSlot: string;
    meetingLink: string;
  }): Promise<DispatchEmailResult> {
    if (!params.clientEmail || !params.clientEmail.trim()) {
      return { success: false, simulated: true, error: "No client email provided." };
    }

    const subject = `Your Consultation is Scheduled: ${params.productName} (Ref: ${params.bookingId})`;

    const text = `
PRANAM ${params.clientName.toUpperCase()},

YOUR CONSULTATION IS CONFIRMED & SCHEDULED

Your 1-on-1 consultation with Acharya Niraj Kumar has been confirmed and scheduled.

SCHEDULE DETAILS:
- Booking Reference: ${params.bookingId}
- Service: ${params.productName}
- Confirmed Time Slot: ${params.scheduledSlot}
- Meeting Link / Channel: ${params.meetingLink}

HOW TO PREPARE:
1. Please be present in a quiet environment 5 minutes before the scheduled time.
2. Have your exact birth questions or architectural concerns ready.
3. If connecting via WhatsApp call, Acharya Ji's sanctum will initiate the call directly at your phone number.
4. If connecting via Google Meet, click the link above at the appointed time.

View booking details in your account:
https://aapkaastro.com/account/consult

With warm blessings,
Acharya Niraj Kumar & Sanctum Team
Aapka Astro | WhatsApp: ${this.SANCTUM_PHONE_DISPLAY}
`.trim();

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E8D8C3; border-radius: 12px; background: #FFFDF9;">
        <h2 style="color: #7B2D26; margin-top: 0;">Pranam ${params.clientName},</h2>
        <p style="font-size: 15px; color: #3B2A1E; line-height: 1.5;">
          Your 1-on-1 consultation with <strong>Acharya Niraj Kumar</strong> has been confirmed and scheduled.
        </p>

        <div style="background: #FBF3E7; border: 1px solid #E8D8C3; padding: 18px; border-radius: 10px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #7B2D26; font-size: 14px;">Consultation Schedule &amp; Access</h4>
          <table style="width: 100%; font-size: 13px; line-height: 1.6;">
            <tr><td style="font-weight: bold; width: 40%; color: #6E5545;">Booking Reference:</td><td style="font-family: monospace; font-size: 14px; font-weight: bold; color: #7B2D26;">${params.bookingId}</td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">Service:</td><td>${params.productName}</td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">Confirmed Slot:</td><td><strong style="color: #2A4720; font-size: 14px;">${params.scheduledSlot}</strong></td></tr>
            <tr><td style="font-weight: bold; color: #6E5545;">Meeting Channel / Link:</td><td><a href="${params.meetingLink}" style="color: #7B2D26; font-weight: bold;">${params.meetingLink}</a></td></tr>
          </table>
        </div>

        <h4 style="color: #7B2D26; margin: 18px 0 8px 0; font-size: 14px;">Preparation Guidance</h4>
        <ul style="font-size: 13px; color: #6E5545; line-height: 1.6; padding-left: 20px; margin: 0 0 16px 0;">
          <li>Please ensure you have quiet surroundings and good internet connectivity 5 minutes prior to the start time.</li>
          <li>If joining via Google Meet, ensure camera and microphone permissions are enabled.</li>
          <li>If connecting via WhatsApp Call, Acharya Ji will initiate the call directly to your registered phone.</li>
        </ul>

        <div style="margin-top: 16px;">
          <a href="https://aapkaastro.com/account/consult" style="display: inline-block; background: #7B2D26; color: #FFF; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
            View in My Account &rarr;
          </a>
        </div>
      </div>
    `;

    return this.dispatchResendEmail({
      to: params.clientEmail,
      subject,
      html,
      text,
      templateName: "BOOKING_SCHEDULED_TO_USER",
      bookingId: params.bookingId,
    });
  }

  /**
   * Backward-compatible alias for sendClientBookingConfirmedEmail
   */
  public static async sendBookingConfirmationEmail(
    params: BookingConfirmationEmailParams
  ): Promise<DispatchEmailResult> {
    return this.sendClientBookingConfirmedEmail({
      clientEmail: params.clientEmail,
      clientName: params.clientName,
      clientPhone: params.phone,
      bookingId: params.bookingId,
      productName: params.productName,
      amount: params.amountPaid,
      format: params.format,
    });
  }

  /**
   * 5. PAYMENT SETTINGS MODIFIED (to Owner)
   */
  public static async sendOwnerPaymentSettingsAlert(params: {
    actorEmail: string;
    ipAddress?: string | null;
    previousSettings?: any;
    newSettings: {
      upiId: string;
      payeeName: string;
      whatsappNumber: string;
    };
  }): Promise<DispatchEmailResult> {
    const ownerEmails = getOwnerEmails();
    const subject = `[SECURITY ALERT] Aapka Astro UPI Payment Settings Modified by ${params.actorEmail}`;
    const text = `SECURITY ALERT: Payment settings for Aapka Astro were modified.\n\nActor: ${params.actorEmail}\nIP: ${params.ipAddress || "Unknown"}\nTimestamp: ${new Date().toISOString()}\n\nNew UPI ID: ${params.newSettings.upiId}\nNew Payee Name: ${params.newSettings.payeeName}\nNew WhatsApp: ${params.newSettings.whatsappNumber}\n\nIf you did not authorize this change, immediately inspect your database and credentials!`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #7B2D26; border-radius: 12px; background: #FFFDF9;">
        <h2 style="color: #7B2D26; margin-top: 0;">🚨 Critical Security Notification: Payment Settings Updated</h2>
        <p style="font-size: 14px; color: #3B2A1E;">
          The official UPI receipt and payee settings on <strong>Aapka Astro</strong> were just updated.
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
          <tr style="background: #FBF3E7;"><td style="padding: 8px; font-weight: bold;">Modified By:</td><td style="padding: 8px;">${params.actorEmail}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">New UPI ID:</td><td style="padding: 8px; color: #7B2D26; font-weight: bold;">${params.newSettings.upiId}</td></tr>
          <tr style="background: #FBF3E7;"><td style="padding: 8px; font-weight: bold;">New Payee Name:</td><td style="padding: 8px;">${params.newSettings.payeeName}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">WhatsApp Routing:</td><td style="padding: 8px;">${params.newSettings.whatsappNumber}</td></tr>
          <tr style="background: #FBF3E7;"><td style="padding: 8px; font-weight: bold;">Timestamp:</td><td style="padding: 8px;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td></tr>
        </table>
        <p style="font-size: 12px; color: #6E5545;">
          Audit logs have recorded this event in PostgreSQL with actor context.
        </p>
      </div>
    `;

    return this.dispatchResendEmail({
      to: ownerEmails,
      subject,
      html,
      text,
      templateName: "PAYMENT_SETTINGS_MODIFIED_TO_OWNER",
    });
  }
}
