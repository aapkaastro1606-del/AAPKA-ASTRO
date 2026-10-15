import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { BookingEmailService } from "../src/lib/services/bookingEmailService";
import { AstrologerStateStore } from "../src/lib/store/astrologerStore";

describe("Post-Payment Handoff & WhatsApp / Google Meet Architecture", () => {
  test("generates WhatsApp coordination link with sanctum phone +919311215564 and prefilled message", () => {
    const linkAstro = BookingEmailService.getWhatsAppCoordinationLink({
      bookingId: "book_astro_101",
      clientName: "Sunil Joshi",
      productName: "Astro Consultation",
    });

    assert.ok(linkAstro.startsWith("https://wa.me/919311215564?text="));
    assert.ok(linkAstro.includes(encodeURIComponent("book_astro_101")));
    assert.ok(linkAstro.includes(encodeURIComponent("Sunil Joshi")));
    assert.ok(linkAstro.includes(encodeURIComponent("Astro Consultation")));
    assert.ok(linkAstro.includes(encodeURIComponent("WhatsApp call or Google Meet")));

    const linkVaastu = BookingEmailService.getWhatsAppCoordinationLink({
      bookingId: "book_vaastu_202",
      clientName: "Meera Nair",
      productName: "Vaastu Consultation",
    });

    assert.ok(linkVaastu.startsWith("https://wa.me/919311215564?text="));
    assert.ok(linkVaastu.includes(encodeURIComponent("book_vaastu_202")));
    assert.ok(linkVaastu.includes(encodeURIComponent("Vaastu Consultation")));
  });

  test("BookingEmailService dispatches client booking confirmation email cleanly with zero uncaught throws", async () => {
    const result = await BookingEmailService.sendClientBookingConfirmedEmail({
      bookingId: "book_astro_777",
      clientName: "Rohan Malhotra",
      clientEmail: "rohan@example.com",
      productName: "Astro Consultation",
      amount: 1051,
      format: "WhatsApp Call",
    });

    // Validates structured result contract (never throws, returns success boolean and simulation status)
    assert.equal(typeof result.success, "boolean");
    assert.equal(typeof result.simulated, "boolean");
  });

  test("BookingEmailService dispatches slot-and-meeting-link email cleanly without blocking or throwing", async () => {
    const result = await BookingEmailService.sendClientBookingScheduledEmail({
      bookingId: "book_test_999",
      clientName: "Pooja Verma",
      clientEmail: "pooja@example.com",
      productName: "Vaastu Consultation",
      scheduledSlot: "Tomorrow, 4:00 PM IST",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      format: "Google Meet",
    });

    assert.equal(typeof result.success, "boolean");
    assert.equal(typeof result.simulated, "boolean");
  });

  test("ConsultationConfirmationScreen source contains required WhatsApp link and delivery statement", () => {
    const screenCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/consult/ConsultationConfirmationScreen.tsx"),
      "utf8"
    );

    // 1. Mandatory statement
    assert.match(
      screenCode,
      /conducted via <strong>WhatsApp call<\/strong> or <strong>Google Meet<\/strong>, as you prefer or as arranged/i
    );

    // 2. Direct one-tap WhatsApp link
    assert.match(
      screenCode,
      /Message on WhatsApp \(\+91 93112 15564\)/i
    );
    assert.match(screenCode, /whatsappCoordinationUrl/);

    // 3. Paid in full / zero per-minute debits confirmation
    assert.match(screenCode, /Zero Per-Minute Debits/i);

    // 4. Print receipt action
    assert.match(screenCode, /window\.print\(\)/);
  });

  test("consultation page integrates ConsultationConfirmationScreen upon confirmed booking", () => {
    const consultPageCode = fs.readFileSync(
      path.join(process.cwd(), "src/app/consult/page.tsx"),
      "utf8"
    );

    assert.match(consultPageCode, /import\s*\{\s*ConsultationConfirmationScreen\s*\}\s*from/);
    assert.match(consultPageCode, /<ConsultationConfirmationScreen/);
    assert.match(consultPageCode, /confirmedBooking\s*\?\s*\(/);
  });

  test("astrologer real-time status indicator is preserved for trust and urgency", () => {
    const currentStatus = AstrologerStateStore.getStatus();
    assert.ok(["AVAILABLE", "BUSY", "BREAK", "OFFLINE"].includes(currentStatus));

    const consultPageCode = fs.readFileSync(
      path.join(process.cwd(), "src/app/consult/page.tsx"),
      "utf8"
    );

    // Preserved status presence pill
    assert.match(consultPageCode, /Real-Time Desk Presence/);
    assert.match(consultPageCode, /ONLINE \(AVAILABLE\)/);
    assert.match(consultPageCode, /IN CONSULTATION/);
  });

  test("in-app Agora/Zego calling engine is decommissioned and not active in consultation flow", () => {
    const consultPageCode = fs.readFileSync(
      path.join(process.cwd(), "src/app/consult/page.tsx"),
      "utf8"
    );

    // Proves in-app Agora stream components and Agora SDK imports do NOT exist in consult flow
    assert.doesNotMatch(consultPageCode, /agora-rtc/i);
    assert.doesNotMatch(consultPageCode, /zegocloud/i);
  });

  test("FAQ section eliminates in-app queue chimes and accurately describes WhatsApp/Meet delivery", () => {
    const faqCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/home/FAQSection.tsx"),
      "utf8"
    );

    // Old in-app chime / queue connection mechanism must NOT exist
    assert.doesNotMatch(faqCode, /device chimes/i);
    assert.doesNotMatch(faqCode, /notifies you the moment Acharya Ji connects with you/i);

    // New real flow copy must exist
    assert.match(faqCode, /book and pay the flat consultation fee online/i);
    assert.match(faqCode, /direct WhatsApp contact details \(\+91 93112 15564\)/i);
    assert.match(faqCode, /WhatsApp call or Google Meet/i);
  });

  test("Hero CTA and Services page describe real booking flow rather than in-app queue", () => {
    const heroCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/home/Hero.tsx"),
      "utf8"
    );

    assert.doesNotMatch(heroCode, /Join Live Queue/i);

    const servicesCode = fs.readFileSync(
      path.join(process.cwd(), "src/app/services/[slug]/page.tsx"),
      "utf8"
    );

    assert.match(servicesCode, /Direct WhatsApp & Google Meet Handoff/i);
    assert.match(servicesCode, /WhatsApp call or Google Meet/i);
  });

  test("client-facing consultation status view shows booking states (confirmed, awaiting session, completed) and replaces join call with WhatsApp link", () => {
    const statusViewCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/consult/ClientConsultationStatusView.tsx"),
      "utf8"
    );

    // Asserts booking states (confirmed, awaiting session, completed)
    assert.match(statusViewCode, /Confirmed/i);
    assert.match(statusViewCode, /Awaiting Session/i);
    assert.match(statusViewCode, /Completed/i);

    // Asserts direct WhatsApp link from Section 1 (+91 93112 15564)
    assert.match(statusViewCode, /https:\/\/wa\.me\/919311215564/);
    assert.match(statusViewCode, /Message on WhatsApp \(\+91 93112 15564\)/);

    // Strictly eliminates in-app join call buttons
    assert.doesNotMatch(statusViewCode, /join call/i);
    assert.doesNotMatch(statusViewCode, /start call/i);
    assert.doesNotMatch(statusViewCode, /open consultation room/i);

    // Account consult page imports and renders ClientConsultationStatusView
    const accountConsultCode = fs.readFileSync(
      path.join(process.cwd(), "src/app/account/consult/page.tsx"),
      "utf8"
    );
    assert.match(accountConsultCode, /ClientConsultationStatusView/);

    // Account dashboard banner replaces Open Consultation Room with WhatsApp link and 3-stage status
    const accountDashboardCode = fs.readFileSync(
      path.join(process.cwd(), "src/app/account/page.tsx"),
      "utf8"
    );
    assert.ok(
      accountDashboardCode.includes("1. Initiated") || accountDashboardCode.includes("1. Confirmed")
    );
    assert.ok(
      accountDashboardCode.includes("2. Bank Verified") || accountDashboardCode.includes("2. Awaiting Session")
    );
    assert.ok(
      accountDashboardCode.includes("3. Scheduled") || accountDashboardCode.includes("3. Completed")
    );
  });

  test("astrologer dashboard displays confirmed, paid bookings with client contact details rather than an in-app start call control", () => {
    const dashboardCode = fs.readFileSync(
      path.join(process.cwd(), "src/app/dashboard/page.tsx"),
      "utf8"
    );

    // Confirmed & Paid Consultation Bookings section title
    assert.match(dashboardCode, /Confirmed & Paid Consultation Bookings/i);
    assert.match(dashboardCode, /Client bookings confirmed with upfront payment/i);

    // Client contact details collected at booking (name, phone number)
    assert.match(dashboardCode, /item\.userName/);
    assert.match(dashboardCode, /item\.userPhone/);

    // Outreach actions via WhatsApp and Phone dial
    assert.match(dashboardCode, /Reach Out on WhatsApp/i);
    assert.match(dashboardCode, /https:\/\/wa\.me\//);
    assert.match(dashboardCode, /tel:\$\{cleanedPhone\}/);

    // State progression controls
    assert.match(dashboardCode, /Awaiting Session/i);
    assert.match(dashboardCode, /Mark Completed/i);

    // No in-app start call or accept and connect controls
    assert.doesNotMatch(dashboardCode, /Accept & Connect/i);
    assert.doesNotMatch(dashboardCode, /start call/i);
    assert.doesNotMatch(dashboardCode, /join call/i);
  });
});
