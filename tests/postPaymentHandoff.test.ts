import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { BookingEmailService } from "../src/lib/services/bookingEmailService";
import { ConsultationBookingService } from "../src/lib/services/consultationBilling";
import { POST as verifyPost } from "../src/app/api/payments/verify/route";
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

  test("generates booking confirmation email with mandatory delivery text and one-tap WhatsApp link", () => {
    const emailAstro = BookingEmailService.generateEmailContent({
      bookingId: "book_astro_777",
      clientName: "Rohan Malhotra",
      clientEmail: "rohan@example.com",
      phone: "+919876543210",
      productName: "Astro Consultation",
      productId: "astro",
      amountPaid: 1051,
      format: "Voice Call",
      orderId: "order_rzp_777",
      paymentId: "pay_rzp_777",
      dateOfBirth: "1994-06-12",
      timeOfBirth: "10:30",
      placeOfBirth: "Delhi",
    });

    // Subject
    assert.ok(emailAstro.subject.includes("Booking Confirmed: Astro Consultation"));
    assert.ok(emailAstro.subject.includes("book_astro_777"));

    // Plain text contains delivery statement
    assert.match(
      emailAstro.text,
      /conducted via WhatsApp call or Google Meet, as you prefer or as arranged/i
    );
    assert.ok(emailAstro.text.includes("https://wa.me/919311215564"));
    assert.ok(emailAstro.text.includes("₹1,051"));

    // HTML contains delivery statement and one-tap button
    assert.match(
      emailAstro.html,
      /conducted via <strong>WhatsApp call<\/strong> or <strong>Google Meet<\/strong>, as you prefer or as arranged/i
    );
    assert.ok(emailAstro.html.includes("https://wa.me/919311215564"));
    assert.ok(emailAstro.html.includes("Message on WhatsApp (+91 93112 15564)"));
  });

  test("dispatches booking confirmation email cleanly without blocking or throwing", async () => {
    const result = await BookingEmailService.sendBookingConfirmationEmail({
      bookingId: "book_test_999",
      clientName: "Pooja Verma",
      clientEmail: "pooja@example.com",
      phone: "+919876500000",
      productName: "Vaastu Consultation",
      productId: "vaastu",
      amountPaid: 15000,
      format: "Video Call",
    });

    assert.equal(result.success, true);
    assert.ok(result.messageId);
  });

  test("payment verify endpoint confirms Astro payment, dispatches confirmation email, and returns WhatsApp URL", async () => {
    const req = new NextRequest("http://localhost:3000/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "order_test_astro_1051",
        paymentId: "pay_test_astro_1051",
        signature: "sig_mock_test",
        productId: "astro",
        amountINR: 1051,
        format: "Voice Call",
        clientName: "Amitabh Sen",
        clientEmail: "amitabh@example.com",
        clientPhone: "+919811122233",
        topic: "Career and finance reading",
      }),
    });

    const res = await verifyPost(req);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.paidAmount, 1051);
    assert.equal(data.productId, "astro");
    assert.ok(data.whatsappCoordinationUrl.startsWith("https://wa.me/919311215564"));
    assert.equal(data.emailDispatched, true);
  });

  test("payment verify endpoint confirms Vaastu payment, dispatches confirmation email, and returns WhatsApp URL", async () => {
    const req = new NextRequest("http://localhost:3000/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "order_test_vaastu_15k",
        paymentId: "pay_test_vaastu_15k",
        signature: "sig_mock_test",
        productId: "vaastu",
        amountINR: 15000,
        format: "Video Call",
        clientName: "Vikram Rathore",
        clientEmail: "vikram@example.com",
        clientPhone: "+919988776655",
        topic: "Residential villa south-west main door remedy",
      }),
    });

    const res = await verifyPost(req);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.paidAmount, 15000);
    assert.equal(data.productId, "vaastu");
    assert.ok(data.whatsappCoordinationUrl.startsWith("https://wa.me/919311215564"));
    assert.equal(data.emailDispatched, true);
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
});
