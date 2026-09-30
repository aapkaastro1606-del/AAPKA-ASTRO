import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  ConsultationSessionTracker,
  ConsultationBookingService,
} from "../src/lib/services/consultationBilling";

describe("ConsultationSessionTracker (Pay-Per-Booking Live Session Manager)", () => {
  test("initializes with active state, zero seconds, clean format, and booking reference", () => {
    const tracker = new ConsultationSessionTracker("sess_test_1", "Voice Call", "book_123");
    const state = tracker.getState();

    assert.equal(state.sessionId, "sess_test_1");
    assert.equal(state.bookingId, "book_123");
    assert.equal(state.format, "Voice Call");
    assert.equal(state.sessionSeconds, 0);
    assert.equal(state.status, "active");
    assert.equal(state.isGracePeriod, false);
    assert.equal(state.graceSecondsRemaining, 60);
    assert.deepEqual(state.remedies, []);
  });

  test("increments session seconds on tick without any financial/wallet deductions", () => {
    const tracker = new ConsultationSessionTracker("sess_test_2", "Live Chat");

    for (let i = 0; i < 15; i++) {
      tracker.tick();
    }

    const state = tracker.getState();
    assert.equal(state.sessionSeconds, 15);
    assert.equal(state.status, "active");
    // No wallet balances or per-minute tariffs exist on tracker
    assert.equal((state as any).walletBalance, undefined);
    assert.equal((state as any).ratePerMin, undefined);
  });

  test("enters disconnect grace period of 60 seconds on network disconnect", () => {
    const tracker = new ConsultationSessionTracker("sess_test_3", "Video Call");
    tracker.tick();
    tracker.tick();

    tracker.notifyDisconnect();
    const state = tracker.getState();

    assert.equal(state.isGracePeriod, true);
    assert.equal(state.graceSecondsRemaining, 60);
    assert.equal(state.sessionSeconds, 2);
  });

  test("pauses session seconds during disconnect grace period while grace timer counts down", () => {
    const tracker = new ConsultationSessionTracker("sess_test_4", "Voice Call");

    for (let i = 0; i < 5; i++) tracker.tick();
    assert.equal(tracker.getState().sessionSeconds, 5);

    tracker.notifyDisconnect();

    // 10 ticks during grace period
    for (let i = 0; i < 10; i++) tracker.tick();

    const state = tracker.getState();
    assert.equal(state.isGracePeriod, true);
    assert.equal(state.sessionSeconds, 5); // Session timer paused!
    assert.equal(state.graceSecondsRemaining, 50); // Grace countdown decremented
  });

  test("resumes active session cleanly when client reconnects within grace period", () => {
    const tracker = new ConsultationSessionTracker("sess_test_5", "Live Chat");
    tracker.notifyDisconnect();
    for (let i = 0; i < 5; i++) tracker.tick();

    // Reconnect
    tracker.notifyReconnect();
    const reconnectedState = tracker.getState();
    assert.equal(reconnectedState.isGracePeriod, false);
    assert.equal(reconnectedState.graceSecondsRemaining, 60);

    // Active ticks resume
    tracker.tick();
    assert.equal(tracker.getState().sessionSeconds, 1);
  });

  test("terminates session when disconnect grace period of 60s expires", () => {
    const tracker = new ConsultationSessionTracker("sess_test_6", "Video Call");
    tracker.notifyDisconnect();

    for (let i = 0; i < 60; i++) {
      tracker.tick();
    }

    const state = tracker.getState();
    assert.equal(state.status, "completed");
    assert.equal(state.terminatedReason, "grace_expired");
  });

  test("attaches remedies and consultation notes to active session state", () => {
    const tracker = new ConsultationSessionTracker("sess_test_7", "Voice Call");
    tracker.setNotes("Analyzed Rahu Mahadasha transition in 10th house.");
    tracker.addRemedy("Chant Om Namah Shivaya 108 times daily.");
    tracker.addRemedy("Wear 5-mukhi certified Rudraksha.");

    const state = tracker.getState();
    assert.equal(state.notes, "Analyzed Rahu Mahadasha transition in 10th house.");
    assert.equal(state.remedies?.length, 2);
    assert.equal(state.remedies?.[0], "Chant Om Namah Shivaya 108 times daily.");
  });

  test("manually completes consultation cleanly with termination reason", () => {
    const tracker = new ConsultationSessionTracker("sess_test_8", "Live Chat");
    for (let i = 0; i < 30; i++) tracker.tick();

    const finalState = tracker.completeSession("completed_normally");
    assert.equal(finalState.status, "completed");
    assert.equal(finalState.terminatedReason, "completed_normally");
    assert.equal(finalState.sessionSeconds, 30);

    // Subsequent ticks do not advance timer
    tracker.tick();
    assert.equal(tracker.getState().sessionSeconds, 30);
  });
});

describe("ConsultationBookingService (Flat-Fee Pay-Per-Booking Model)", () => {
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
