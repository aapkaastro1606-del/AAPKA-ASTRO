/**
 * ============================================================================
 * CONSULTATION SESSION TRACKER & DISCONNECT RESILIENCE
 * ============================================================================
 * Manages live consultation duration and network disconnect grace windows for
 * flat-fee, pay-per-booking consultations.
 * Eliminates all second-by-second wallet debits and low-balance auto-termination.
 */

export interface SessionTrackerState {
  sessionId: string;
  bookingId?: string;
  sessionSeconds: number;
  format: "Voice Call" | "Video Call" | "Live Chat";
  status: "active" | "completed" | "cancelled";
  isGracePeriod: boolean;
  graceSecondsRemaining: number;
  notes?: string;
  remedies?: string[];
  terminatedReason?: "completed_normally" | "grace_expired" | "user_cancelled";
}

export class ConsultationSessionTracker {
  private sessionId: string;
  private bookingId?: string;
  private format: "Voice Call" | "Video Call" | "Live Chat";
  private sessionSeconds: number = 0;
  private status: "active" | "completed" | "cancelled" = "active";
  private isGracePeriod: boolean = false;
  private graceSecondsRemaining: number = 60;
  private notes: string = "";
  private remedies: string[] = [];
  private terminatedReason?: "completed_normally" | "grace_expired" | "user_cancelled";

  constructor(
    sessionId: string,
    format: "Voice Call" | "Video Call" | "Live Chat" = "Live Chat",
    bookingId?: string
  ) {
    this.sessionId = sessionId;
    this.format = format;
    this.bookingId = bookingId;
  }

  public tick(): SessionTrackerState {
    if (this.status !== "active") {
      return this.getState();
    }

    if (this.isGracePeriod) {
      this.graceSecondsRemaining -= 1;
      if (this.graceSecondsRemaining <= 0) {
        this.status = "completed";
        this.terminatedReason = "grace_expired";
      }
      return this.getState();
    }

    this.sessionSeconds += 1;
    return this.getState();
  }

  public notifyDisconnect(): void {
    if (this.status === "active") {
      this.isGracePeriod = true;
      this.graceSecondsRemaining = 60; // 60s network reconnect grace window
    }
  }

  public notifyReconnect(): void {
    if (this.status === "active" && this.isGracePeriod) {
      this.isGracePeriod = false;
      this.graceSecondsRemaining = 60;
    }
  }

  public addRemedy(remedy: string): void {
    if (remedy && remedy.trim()) {
      this.remedies.push(remedy.trim());
    }
  }

  public setNotes(notes: string): void {
    this.notes = notes;
  }

  public completeSession(
    reason: "completed_normally" | "user_cancelled" = "completed_normally"
  ): SessionTrackerState {
    this.status = reason === "user_cancelled" ? "cancelled" : "completed";
    this.terminatedReason = reason;
    return this.getState();
  }

  public getState(): SessionTrackerState {
    return {
      sessionId: this.sessionId,
      bookingId: this.bookingId,
      sessionSeconds: this.sessionSeconds,
      format: this.format,
      status: this.status,
      isGracePeriod: this.isGracePeriod,
      graceSecondsRemaining: this.graceSecondsRemaining,
      notes: this.notes,
      remedies: [...this.remedies],
      terminatedReason: this.terminatedReason,
    };
  }
}

/**
 * ============================================================================
 * FLAT-FEE CONSULTATION BOOKING SERVICE
 * ============================================================================
 * Pay-per-booking model matching confirmed promotional creatives:
 * - First Consultation: Flat ₹1,051/- (Standard ₹2,100, 50% discount)
 * - Standard Consultation: Flat ₹2,100/-
 * - Unified flat fee across Voice Call, Video Call, and Live Chat
 */
export interface ConsultationBooking {
  bookingId: string;
  userId: string;
  clientName: string;
  phone: string;
  format: "Voice Call" | "Video Call" | "Live Chat";
  topic: string;
  preferredSlot: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  standardFee: number;
  discountApplied: number;
  amountPaid: number;
  currency: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "IN_SESSION" | "COMPLETED" | "CANCELLED";
  paymentId?: string;
  orderId?: string;
  createdAt: string;
  confirmedAt?: string;
}

export class ConsultationBookingService {
  public static calculateFee(isFirstTime: boolean = true): {
    standardFee: number;
    discountAmount: number;
    amountToPay: number;
    currency: string;
    isFirstTime: boolean;
    promoCode: string;
  } {
    const standardFee = 2100;
    const amountToPay = isFirstTime ? 1051 : 2100;
    const discountAmount = standardFee - amountToPay;

    return {
      standardFee,
      discountAmount,
      amountToPay,
      currency: "₹",
      isFirstTime,
      promoCode: isFirstTime ? "FIRST1051" : "",
    };
  }

  public static createBooking(params: {
    userId: string;
    clientName: string;
    phone: string;
    format: "Voice Call" | "Video Call" | "Live Chat";
    topic: string;
    preferredSlot: string;
    dateOfBirth?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
    isFirstTime?: boolean;
  }): ConsultationBooking {
    const pricing = this.calculateFee(params.isFirstTime ?? true);
    const bookingId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      bookingId,
      userId: params.userId,
      clientName: params.clientName,
      phone: params.phone,
      format: params.format,
      topic: params.topic,
      preferredSlot: params.preferredSlot,
      dateOfBirth: params.dateOfBirth,
      timeOfBirth: params.timeOfBirth,
      placeOfBirth: params.placeOfBirth,
      standardFee: pricing.standardFee,
      discountApplied: pricing.discountAmount,
      amountPaid: pricing.amountToPay,
      currency: "₹",
      status: "PENDING_PAYMENT",
      createdAt: new Date().toISOString(),
    };
  }
}
