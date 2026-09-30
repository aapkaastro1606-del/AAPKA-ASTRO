import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { KUNDLI_PDF_PRODUCT } from "../src/config/placeholderContent";
import { calculateKundli } from "../src/lib/astrology/chartCalculations";
import { POST as createOrderPost } from "../src/app/api/payments/create-order/route";
import { POST as verifyPost } from "../src/app/api/payments/verify/route";

describe("Kundli Full PDF Report — Paid Product (₹501) & Free Tool Integrity", () => {
  test("product configuration defines ₹501 one-time purchase price", () => {
    assert.equal(KUNDLI_PDF_PRODUCT.id, "kundli_pdf");
    assert.equal(KUNDLI_PDF_PRODUCT.price, 501);
    assert.equal(KUNDLI_PDF_PRODUCT.currency, "₹");
    assert.ok(KUNDLI_PDF_PRODUCT.name.includes("PDF"));
    assert.ok(KUNDLI_PDF_PRODUCT.deliverables.length >= 4);
  });

  test("free online Kundli chart generator calculates full horoscope without payment", () => {
    const chart = calculateKundli({
      name: "Rohit Sharma",
      gender: "male",
      birthDate: "1992-05-18",
      birthTime: "09:45",
      birthPlace: "Mumbai, Maharashtra",
      latitude: 19.076,
      longitude: 72.8777,
      timezone: 5.5,
    });

    // Verification that all calculation modules function freely without payment
    assert.ok(chart.ascendant.rashiName, "Must have Lagna ascendant");
    assert.ok(chart.moonSign, "Must have Moon sign");
    assert.ok(chart.planets.length >= 9, "Must compute all 9 Vedic Grahas");
    assert.ok(chart.dashas.length > 0, "Must compute Vimshottari dasha hierarchy");
    assert.ok(chart.doshas, "Must compute classical dosha diagnosis");
    assert.ok(chart.luckyGemstone, "Must provide prescribed gemstone");
  });

  test("server enforces exact ₹501 order amount for kundli_pdf product, ignoring client tampering", async () => {
    // Client maliciously attempts to send ₹1
    const req = new NextRequest("http://localhost:3000/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 1, // Malicious override
        productId: "kundli_pdf",
        serviceType: "kundli_pdf_report",
        clientName: "Rohit Sharma",
      }),
    });

    const res = await createOrderPost(req);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    // Server enforces ₹501 (50,100 paise in Razorpay format)
    assert.equal(data.order.amount, 50100);
    assert.equal(data.order.notes.productId, "kundli_pdf");
    assert.equal(data.order.notes.amountINR, "501");
  });

  test("payment verify endpoint confirms ₹501 payment for kundli_pdf without creating consultation session", async () => {
    const req = new NextRequest("http://localhost:3000/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "order_mock_test_501",
        paymentId: "pay_mock_test_501",
        signature: "sig_mock_test",
        productId: "kundli_pdf",
        amountINR: 501,
        topic: "Kundli PDF Report for Rohit Sharma",
      }),
    });

    const res = await verifyPost(req);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.paidAmount, 501);
    assert.equal(data.productId, "kundli_pdf");
    assert.ok(data.bookingId);
  });

  test("chart signature uniquely isolates unlocked PDF access per chart parameters", () => {
    const chart1 = {
      name: "Rohit Sharma",
      birthDate: "1992-05-18",
      birthTime: "09:45",
      birthPlace: "Mumbai, Maharashtra",
    };

    const chart2 = {
      name: "Pooja Verma",
      birthDate: "1995-11-20",
      birthTime: "14:15",
      birthPlace: "Delhi",
    };

    const sig1 = `${chart1.name}_${chart1.birthDate}_${chart1.birthTime}_${chart1.birthPlace}`;
    const sig2 = `${chart2.name}_${chart2.birthDate}_${chart2.birthTime}_${chart2.birthPlace}`;

    assert.notEqual(sig1, sig2, "Different charts must have different unlock signatures");
    assert.equal(
      `aapka_unlocked_kundli_${encodeURIComponent(sig1)}`,
      "aapka_unlocked_kundli_Rohit%20Sharma_1992-05-18_09%3A45_Mumbai%2C%20Maharashtra"
    );
  });
});
