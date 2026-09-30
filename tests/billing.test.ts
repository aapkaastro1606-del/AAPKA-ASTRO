import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ConsultationBillingEngine } from "../src/lib/services/consultationBilling";

describe("ConsultationBillingEngine", () => {
  test("initializes with accurate rate and balance", () => {
    const engine = new ConsultationBillingEngine("sess_test_1", 20, 200);
    const state = engine.getState();

    assert.equal(state.sessionId, "sess_test_1");
    assert.equal(state.ratePerMin, 20);
    assert.equal(state.walletBalance, 200);
    assert.equal(state.sessionSeconds, 0);
    assert.equal(state.isLowBalance, false);
    assert.equal(state.isGracePeriod, false);
    assert.equal(state.isTerminated, false);
  });

  test("deducts per-second equivalent rate on tick", () => {
    // ₹60/min = ₹1 per second
    const engine = new ConsultationBillingEngine("sess_test_2", 60, 100);

    for (let i = 0; i < 10; i++) {
      engine.tick();
    }

    const state = engine.getState();
    assert.equal(state.sessionSeconds, 10);
    assert.equal(state.walletBalance, 90);
    assert.equal(state.billedAmount, 10);
  });

  test("flags low-balance warning when <= 60 seconds remain", () => {
    // ₹60/min = ₹1/sec. Balance ₹50 means 50 seconds remain (<= 60s)
    const engine = new ConsultationBillingEngine("sess_test_3", 60, 50);
    const state = engine.tick();

    assert.equal(state.isLowBalance, true);
    assert.equal(state.secondsRemaining, 49);
  });

  test("terminates gracefully when wallet reaches zero", () => {
    // ₹60/min = ₹1/sec. Balance ₹2. After 2 ticks balance is 0
    const engine = new ConsultationBillingEngine("sess_test_4", 60, 2);

    engine.tick(); // balance 1
    const finalState = engine.tick(); // balance 0 -> terminated

    assert.equal(finalState.walletBalance, 0);
    assert.equal(finalState.isTerminated, true);
    assert.equal(finalState.terminationReason, "zero_balance");
  });

  test("pauses billing during disconnect grace window and counts down", () => {
    // ₹60/min = ₹1/sec. Initial balance ₹100
    const engine = new ConsultationBillingEngine("sess_test_5", 60, 100);

    // Run 5 active seconds
    for (let i = 0; i < 5; i++) engine.tick();
    assert.equal(engine.getState().walletBalance, 95);

    // Trigger network disconnect
    engine.notifyDisconnect();
    const disconnectState = engine.getState();
    assert.equal(disconnectState.isGracePeriod, true);
    assert.equal(disconnectState.graceSecondsRemaining, 60);

    // Tick 10 seconds during grace period -> wallet balance MUST NOT decrease
    for (let i = 0; i < 10; i++) engine.tick();
    const graceState = engine.getState();
    assert.equal(graceState.walletBalance, 95); // Billing was paused!
    assert.equal(graceState.sessionSeconds, 5); // Session duration did not advance
    assert.equal(graceState.graceSecondsRemaining, 50); // Grace timer counted down
  });

  test("resumes billing smoothly when client reconnects within grace window", () => {
    const engine = new ConsultationBillingEngine("sess_test_6", 60, 100);

    engine.notifyDisconnect();
    assert.equal(engine.getState().isGracePeriod, true);

    // 5 seconds pass disconnected
    for (let i = 0; i < 5; i++) engine.tick();

    // Client reconnects
    engine.notifyReconnect();
    assert.equal(engine.getState().isGracePeriod, false);

    // Subsequent tick resumes active billing
    engine.tick();
    assert.equal(engine.getState().sessionSeconds, 1);
    assert.equal(engine.getState().walletBalance, 99);
  });

  test("terminates session when disconnect grace period of 60s expires", () => {
    const engine = new ConsultationBillingEngine("sess_test_7", 60, 100);
    engine.notifyDisconnect();

    for (let i = 0; i < 60; i++) {
      engine.tick();
    }

    const state = engine.getState();
    assert.equal(state.isTerminated, true);
    assert.equal(state.terminationReason, "grace_expired");
  });

  test("allows adding funds dynamically during consultation", () => {
    const engine = new ConsultationBillingEngine("sess_test_8", 60, 30);
    assert.equal(engine.getState().isLowBalance, true);

    engine.addFunds(200);
    const state = engine.getState();
    assert.equal(state.walletBalance, 230);
    assert.equal(state.isLowBalance, false); // No longer low balance
  });
});

describe("ConsultationBookingService (Flat-Fee Pay-Per-Booking Model)", () => {
  const { ConsultationBookingService } = require("../src/lib/services/consultationBilling");

  test("calculates first-time promotional consultation fee accurately (Flat ₹1,051)", () => {
    const feeInfo = ConsultationBookingService.calculateFee(true);
    assert.equal(feeInfo.standardFee, 2100);
    assert.equal(feeInfo.amountToPay, 1051);
    assert.equal(feeInfo.discountAmount, 1049);
    assert.equal(feeInfo.isFirstTime, true);
    assert.equal(feeInfo.currency, "₹");
    assert.equal(feeInfo.promoCode, "FIRST1051");
  });

  test("calculates returning client consultation fee without promo (Flat ₹2,100)", () => {
    const feeInfo = ConsultationBookingService.calculateFee(false);
    assert.equal(feeInfo.standardFee, 2100);
    assert.equal(feeInfo.amountToPay, 2100);
    assert.equal(feeInfo.discountAmount, 0);
    assert.equal(feeInfo.isFirstTime, false);
  });

  test("creates valid consultation booking across Voice Call, Video Call, and Live Chat", () => {
    const formats: Array<"Voice Call" | "Video Call" | "Live Chat"> = [
      "Voice Call",
      "Video Call",
      "Live Chat",
    ];

    for (const format of formats) {
      const booking = ConsultationBookingService.createBooking({
        userId: "user_test_123",
        clientName: "Rohan Sharma",
        phone: "+919876543210",
        format,
        topic: "Career guidance and marriage timing",
        preferredSlot: "Immediate",
        isFirstTime: true,
      });

      assert.ok(booking.bookingId.startsWith("book_"));
      assert.equal(booking.userId, "user_test_123");
      assert.equal(booking.clientName, "Rohan Sharma");
      assert.equal(booking.phone, "+919876543210");
      assert.equal(booking.format, format);
      assert.equal(booking.standardFee, 2100);
      assert.equal(booking.discountApplied, 1049);
      assert.equal(booking.amountPaid, 1051);
      assert.equal(booking.currency, "₹");
      assert.equal(booking.status, "PENDING_PAYMENT");
      assert.ok(booking.createdAt);
    }
  });
});
