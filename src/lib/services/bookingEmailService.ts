/**
 * ============================================================================
 * BOOKING CONFIRMATION EMAIL SERVICE
 * ============================================================================
 * Dispatches formal booking confirmation emails to clients upon successful
 * payment for Astro Consultation or Vaastu Consultation.
 *
 * Core requirement:
 * - States clearly that consultation will be conducted via WhatsApp call or Google Meet.
 * - Provides a direct, one-tap "Message on WhatsApp" link (https://wa.me/919311215564).
 * - Delivers complete booking metadata, receipt reference, and next steps.
 */

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

export class BookingEmailService {
  private static readonly SANCTUM_PHONE = "919311215564";
  private static readonly SANCTUM_PHONE_DISPLAY = "+91 93112 15564";
  private static readonly SUPPORT_EMAIL = "contact@aapkaastro.com";
  private static readonly WEBSITE_URL = "https://aapkaastro.com";

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
   * Generates email subject, plain text version, and HTML template
   */
  public static generateEmailContent(params: BookingConfirmationEmailParams): {
    subject: string;
    text: string;
    html: string;
    whatsappUrl: string;
  } {
    const isVaastu = params.productId === "vaastu";
    const subject = `Booking Confirmed: ${params.productName} with Acharya Niraj Kumar [${params.bookingId}]`;
    const whatsappUrl = this.getWhatsAppCoordinationLink({
      bookingId: params.bookingId,
      clientName: params.clientName,
      productName: params.productName,
    });

    const text = `
PRANAM ${params.clientName.toUpperCase()},

YOUR CONSULTATION IS CONFIRMED
Thank you for booking with Aapka Astro. Your payment of ₹${params.amountPaid.toLocaleString("en-IN")} has been verified successfully.

CONSULTATION DETAILS:
- Booking Reference: ${params.bookingId}
- Consultation Type: ${params.productName}
- Delivery Channels: WhatsApp Call or Google Meet
- Client Contact: ${params.phone}
- Format Preference: ${params.format}
- Payment Reference: ${params.paymentId || params.orderId || "Verified"}
${!isVaastu && params.dateOfBirth ? `- Birth Details: ${params.dateOfBirth} ${params.timeOfBirth || ""} (${params.placeOfBirth || ""})` : ""}
${isVaastu && params.propertyType ? `- Property Type: ${params.propertyType} (${params.propertyLocation || ""})` : ""}

HOW YOUR CONSULTATION WILL BE CONDUCTED:
Your consultation is confirmed, and it will be conducted via WhatsApp call or Google Meet, as you prefer or as arranged with Acharya Ji's sanctum. There are no proprietary apps or complex browser plugins required.

COORDINATE IMMEDIATELY ON WHATSAPP:
Click the link below to message Acharya Ji's sanctum directly and coordinate your preferred time and format:
${whatsappUrl}

Alternatively, our desk will reach out to you directly at ${params.phone}.

Warm regards,
Acharya Niraj Kumar & Sanctum Desk
Aapka Astro | Viar.in
WhatsApp: ${this.SANCTUM_PHONE_DISPLAY}
Email: ${this.SUPPORT_EMAIL}
Website: ${this.WEBSITE_URL}
`.trim();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF5EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #3B2A1E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF5EE; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E8D8C3; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(123, 45, 38, 0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: #7B2D26; padding: 28px 32px; text-align: center; border-bottom: 3px solid #E8A33D;">
              <h1 style="margin: 0; font-size: 24px; color: #FFFFFF; letter-spacing: 0.5px;">AAPKA ASTRO</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #F5DEC3; font-style: italic;">Authentic Vedic Astrology &amp; Devta Vaastu</p>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center;">
              <div style="display: inline-block; background-color: #F4F9F2; border: 1px solid #B8DCB0; color: #2A4720; font-size: 12px; font-weight: bold; padding: 6px 16px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px;">
                &#10003; Payment Verified &bull; Booking Confirmed
              </div>
              <h2 style="margin: 16px 0 8px 0; font-size: 22px; color: #7B2D26; line-height: 1.3;">
                Your Consultation is Confirmed
              </h2>
              <p style="margin: 0; font-size: 14px; color: #6E5545; line-height: 1.5;">
                Pranam <strong>${params.clientName}</strong>, your <strong>${params.productName}</strong> with <strong>Acharya Niraj Kumar</strong> has been received and scheduled.
              </p>
            </td>
          </tr>

          <!-- Important Delivery Notice -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: #FAF5EE; border-left: 4px solid #E8A33D; border-radius: 8px; padding: 16px 20px;">
                <p style="margin: 0; font-size: 14px; color: #3B2A1E; line-height: 1.6;">
                  <strong>How Your Consultation Will Be Conducted:</strong><br />
                  Your consultation is confirmed, and it will be conducted via <strong>WhatsApp call</strong> or <strong>Google Meet</strong>, as you prefer or as arranged with Acharya Ji's sanctum.
                </p>
              </div>
            </td>
          </tr>

          <!-- One-Tap WhatsApp Action Button -->
          <tr>
            <td style="padding: 0 32px 28px 32px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-size: 15px; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.35);">
                      &#128172; Message on WhatsApp (+91 93112 15564)
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #7D6B5D;">
                Tap above to coordinate your exact preferred time and format directly with the sanctum desk.
              </p>
            </td>
          </tr>

          <!-- Booking Summary Table -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table width="100%" cellpadding="8" cellspacing="0" style="font-size: 13px; border: 1px solid #E8D8C3; border-radius: 12px; background-color: #FFFDF9; border-collapse: separate;">
                <tr style="border-bottom: 1px solid #E8D8C3;">
                  <td style="color: #7D6B5D; padding: 10px 14px; border-bottom: 1px solid #F0E6D8;">Booking Reference:</td>
                  <td style="color: #3B2A1E; font-weight: bold; font-family: monospace; padding: 10px 14px; border-bottom: 1px solid #F0E6D8;">${params.bookingId}</td>
                </tr>
                <tr>
                  <td style="color: #7D6B5D; padding: 10px 14px; border-bottom: 1px solid #F0E6D8;">Consultation Type:</td>
                  <td style="color: #7B2D26; font-weight: bold; padding: 10px 14px; border-bottom: 1px solid #F0E6D8;">${params.productName}</td>
                </tr>
                <tr>
                  <td style="color: #7D6B5D; padding: 10px 14px; border-bottom: 1px solid #F0E6D8;">Client Phone:</td>
                  <td style="color: #3B2A1E; font-weight: bold; padding: 10px 14px; border-bottom: 1px solid #F0E6D8;">${params.phone}</td>
                </tr>
                <tr>
                  <td style="color: #7D6B5D; padding: 10px 14px; border-bottom: 1px solid #F0E6D8;">Selected Preference:</td>
                  <td style="color: #3B2A1E; padding: 10px 14px; border-bottom: 1px solid #F0E6D8;">${params.format}</td>
                </tr>
                <tr>
                  <td style="color: #7D6B5D; padding: 10px 14px; border-bottom: 1px solid #F0E6D8;">Amount Paid:</td>
                  <td style="color: #2A4720; font-weight: bold; padding: 10px 14px; border-bottom: 1px solid #F0E6D8;">Flat &#8377;${params.amountPaid.toLocaleString("en-IN")} (Paid in Full)</td>
                </tr>
                ${
                  params.paymentId
                    ? `<tr>
                        <td style="color: #7D6B5D; padding: 10px 14px;">Transaction ID:</td>
                        <td style="color: #7D6B5D; font-family: monospace; font-size: 11px; padding: 10px 14px;">${params.paymentId}</td>
                      </tr>`
                    : ""
                }
              </table>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #7B2D26; text-transform: uppercase; letter-spacing: 0.5px;">What Happens Next</h3>
              <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #5C4535; line-height: 1.7;">
                <li><strong>One-Tap Coordination:</strong> Use the WhatsApp button above to message our desk anytime.</li>
                <li><strong>Desk Outreach:</strong> If you don't message right away, Acharya Ji's sanctum desk will contact your number (${params.phone}) to confirm your preferred slot.</li>
                <li><strong>Sacred Chart Preparation:</strong> Acharya Ji personally erects your horoscope or 16-zone Devta Vaastu grid in advance.</li>
                <li><strong>Live Guidance:</strong> Connect directly on WhatsApp call or Google Meet for your focused 1-on-1 reading.</li>
              </ol>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF5EE; padding: 24px 32px; text-align: center; border-top: 1px solid #E8D8C3; font-size: 12px; color: #7D6B5D; line-height: 1.6;">
              <p style="margin: 0 0 6px 0;"><strong>Aapka Astro</strong> &bull; Authentic Vedic Astrology &amp; Devta Vaastu Consultations</p>
              <p style="margin: 0 0 6px 0;">Direct WhatsApp Desk: <a href="https://wa.me/${this.SANCTUM_PHONE}" style="color: #7B2D26; text-decoration: none; font-weight: bold;">${this.SANCTUM_PHONE_DISPLAY}</a> &bull; Email: <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #7B2D26; text-decoration: none;">${this.SUPPORT_EMAIL}</a></p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #A89888;">&copy; ${new Date().getFullYear()} Aapka Astro. In association with Viar.in. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

    return { subject, text, html, whatsappUrl };
  }

  /**
   * Dispatches the booking confirmation email.
   * If an external email provider is configured, it sends live; otherwise,
   * it provides a logged/simulated dispatch that never blocks checkout.
   */
  public static async sendBookingConfirmationEmail(
    params: BookingConfirmationEmailParams
  ): Promise<{ success: boolean; simulated: boolean; messageId: string }> {
    const { subject, text, html, whatsappUrl } = this.generateEmailContent(params);
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Log the generated confirmation dispatch for transparency and auditing
    console.info(
      `[BookingEmailService] Booking confirmation email prepared for ${params.clientEmail || params.clientName} (${params.bookingId}) -> WhatsApp Bridge: ${whatsappUrl}`
    );

    // If external mail provider (e.g. RESEND_API_KEY) is configured:
    if (process.env.RESEND_API_KEY && params.clientEmail) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Aapka Astro <bookings@aapkaastro.com>",
            to: params.clientEmail,
            subject,
            html,
            text,
          }),
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          return {
            success: true,
            simulated: false,
            messageId: data.id || messageId,
          };
        }
      } catch (err) {
        console.warn("[BookingEmailService] Live email dispatch warning, falling back to simulated:", err);
      }
    }

    // Default resilient simulated dispatch
    return {
      success: true,
      simulated: true,
      messageId,
    };
  }

  /**
   * Dispatches a high-priority security alert to the Site Owner whenever payment settings are altered.
   */
  public static async sendOwnerPaymentSettingsAlert(params: {
    actorEmail: string;
    previousSettings: any;
    newSettings: any;
    ipAddress?: string | null;
  }): Promise<{ success: boolean; simulated: boolean }> {
    const ownerEmails = (process.env.OWNER_EMAIL || "anmol@aapkaastro.com,acharya@aapkaastro.com")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

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

    if (process.env.RESEND_API_KEY && ownerEmails.length > 0) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Aapka Astro Security <security@aapkaastro.com>",
            to: ownerEmails,
            subject,
            html,
            text,
          }),
        });
        return { success: true, simulated: false };
      } catch (err) {
        console.warn("[BookingEmailService] Owner alert email failed, logged in server:", err);
      }
    }

    console.info(`[BookingEmailService] (Simulated) Owner payment alert logged for ${ownerEmails.join(", ")}`);
    return { success: true, simulated: true };
  }

  /**
   * Alerts the Owner when a seeker clicks "I have paid".
   */
  public static async sendOwnerPaymentClaimedAlert(params: {
    bookingId: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string | null;
    productName: string;
    amount: number;
    utr?: string | null;
  }): Promise<{ success: boolean; simulated: boolean }> {
    const ownerEmails = (process.env.OWNER_EMAIL || "anmol@aapkaastro.com,acharya@aapkaastro.com")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const subject = `[PAYMENT CLAIMED] ${params.clientName} reported UPI payment for ${params.bookingId} (₹${params.amount})`;
    const text = `New UPI payment claimed by seeker!\n\nBooking ID: ${params.bookingId}\nClient: ${params.clientName} (${params.clientPhone})\nService: ${params.productName}\nAmount: ₹${params.amount}\nUTR / Ref: ${params.utr || "Not provided"}\n\nPlease verify your bank/UPI app and approve in the Owner Verification Queue: https://aapkaastro.com/admin/bookings`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #E8D8C3; border-radius: 12px; background: #FFFDF9;">
        <h3 style="color: #7B2D26; margin-top: 0;">⚡ New UPI Payment Claimed for Verification</h3>
        <p style="font-size: 14px; color: #3B2A1E;">
          A seeker has submitted their consultation payment proof.
        </p>
        <div style="background: #FAF5EE; padding: 16px; border-radius: 8px; border: 1px solid #E8D8C3; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Booking ID:</strong> <span style="font-family: monospace; font-size: 15px; color: #7B2D26;">${params.bookingId}</span></p>
          <p style="margin: 4px 0;"><strong>Seeker:</strong> ${params.clientName} (${params.clientPhone})</p>
          <p style="margin: 4px 0;"><strong>Service:</strong> ${params.productName}</p>
          <p style="margin: 4px 0;"><strong>Amount Locked:</strong> ₹${params.amount.toLocaleString("en-IN")}</p>
          <p style="margin: 4px 0;"><strong>UTR / Txn Ref:</strong> <span style="font-family: monospace;">${params.utr || "None provided (screenshot sent on WhatsApp)"}</span></p>
        </div>
        <p style="font-size: 13px; color: #6E5545;">
          Please open your bank or UPI business app to confirm credit before approving:
        </p>
        <a href="https://aapkaastro.com/admin/bookings" style="display: inline-block; background: #7B2D26; color: #FFF; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
          Open Verification Queue &rarr;
        </a>
      </div>
    `;

    if (process.env.RESEND_API_KEY && ownerEmails.length > 0) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Aapka Astro Queue <bookings@aapkaastro.com>",
            to: ownerEmails,
            subject,
            html,
            text,
          }),
        });
        return { success: true, simulated: false };
      } catch (err) {
        console.warn("[BookingEmailService] Owner payment claimed alert error:", err);
      }
    }

    console.info(`[BookingEmailService] (Simulated) Payment claimed notification for ${params.bookingId}`);
    return { success: true, simulated: true };
  }

  /**
   * Dispatches confirmed time slot and meeting link directly to the seeker.
   */
  public static async sendClientBookingScheduledEmail(params: {
    clientEmail?: string | null;
    clientName: string;
    bookingId: string;
    productName: string;
    scheduledSlot: string;
    meetingLink: string;
  }): Promise<{ success: boolean; simulated: boolean }> {
    if (!params.clientEmail) return { success: false, simulated: true };

    const subject = `Your Consultation is Scheduled: ${params.productName} (Ref: ${params.bookingId})`;
    const text = `Pranam ${params.clientName},\n\nYour consultation with Acharya Niraj Kumar has been confirmed and scheduled.\n\n• Booking Reference: ${params.bookingId}\n• Service: ${params.productName}\n• Scheduled Time Window: ${params.scheduledSlot}\n• Consultation Link / Format: ${params.meetingLink}\n\nPlease be ready with your birth details or questions 5 minutes prior.\n\nView details in your account: https://aapkaastro.com/account/consult`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E8D8C3; border-radius: 12px; background: #FFFDF9;">
        <h2 style="color: #7B2D26; margin-top: 0;">Pranam ${params.clientName},</h2>
        <p style="font-size: 15px; color: #3B2A1E; line-height: 1.5;">
          Your consultation with <strong>Acharya Niraj Kumar</strong> has been confirmed and scheduled.
        </p>
        <div style="background: #FBF3E7; border: 1px solid #E8D8C3; padding: 18px; border-radius: 10px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #7B2D26;">Consultation Schedule &amp; Access</h4>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Booking ID:</strong> <span style="font-family: monospace; color: #7B2D26;">${params.bookingId}</span></p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Scheduled Time Slot:</strong> <span style="font-weight: bold; color: #2A4720;">${params.scheduledSlot}</span></p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Meeting Format / Link:</strong> <a href="${params.meetingLink}" style="color: #7B2D26; font-weight: bold;">${params.meetingLink}</a></p>
        </div>
        <p style="font-size: 13px; color: #6E5545; line-height: 1.5;">
          Please ensure you have good internet connectivity and your quiet environment prepared. If connecting via WhatsApp call, Acharya Ji will initiate the call directly at the scheduled time.
        </p>
        <a href="https://aapkaastro.com/account/consult" style="display: inline-block; background: #7B2D26; color: #FFF; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin-top: 10px;">
          View in My Account &rarr;
        </a>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Aapka Astro <bookings@aapkaastro.com>",
            to: params.clientEmail,
            subject,
            html,
            text,
          }),
        });
        return { success: true, simulated: false };
      } catch (err) {
        console.warn("[BookingEmailService] Live scheduling email dispatch warning:", err);
      }
    }

    console.info(`[BookingEmailService] (Simulated) Scheduled email prepared for ${params.clientEmail}`);
    return { success: true, simulated: true };
  }
}
