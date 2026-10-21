/**
 * ============================================================================
 * BOOKING STATE MACHINE & LIFECYCLE SPECIFICATION
 * ============================================================================
 * Defines the canonical state machine for all consultation bookings.
 * 
 * Flow:
 * PENDING_PAYMENT -> PAYMENT_CLAIMED -> CONFIRMED -> SCHEDULED -> COMPLETED
 * Terminal / alternative states: REJECTED, CANCELLED, EXPIRED.
 * 
 * Enforces allowed transitions across three actor roles:
 * - OWNER: approve, reject, schedule, complete, cancel.
 * - CLIENT: claim payment, update UTR, cancel while still PENDING_PAYMENT.
 * - SYSTEM: expire unpaid bookings past expiration deadline.
 */

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_CLAIMED"
  | "CONFIRMED"
  | "SCHEDULED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED";

export type BookingActorRole = "OWNER" | "CLIENT" | "SYSTEM";

export type BookingAction =
  | "CLAIM_PAYMENT"
  | "UPDATE_UTR"
  | "CLIENT_CANCEL"
  | "OWNER_APPROVE"
  | "OWNER_REJECT"
  | "OWNER_SCHEDULE"
  | "OWNER_COMPLETE"
  | "OWNER_CANCEL"
  | "SYSTEM_EXPIRE";

export interface StateTransitionRule {
  from: BookingStatus[];
  to: BookingStatus;
  actor: BookingActorRole[];
  description: string;
}

export const BOOKING_TRANSITIONS: Record<BookingAction, StateTransitionRule> = {
  CLAIM_PAYMENT: {
    from: ["PENDING_PAYMENT"],
    to: "PAYMENT_CLAIMED",
    actor: ["CLIENT", "OWNER"],
    description: "Submit payment proof / UTR for bank credit verification",
  },
  UPDATE_UTR: {
    from: ["PENDING_PAYMENT", "PAYMENT_CLAIMED"],
    to: "PAYMENT_CLAIMED",
    actor: ["CLIENT", "OWNER"],
    description: "Update payment transaction reference or UTR before verification",
  },
  CLIENT_CANCEL: {
    from: ["PENDING_PAYMENT"],
    to: "CANCELLED",
    actor: ["CLIENT"],
    description: "Cancel unpaid booking while still pending payment",
  },
  OWNER_APPROVE: {
    from: ["PAYMENT_CLAIMED", "PENDING_PAYMENT"],
    to: "CONFIRMED",
    actor: ["OWNER"],
    description: "Confirm bank credit and approve booking",
  },
  OWNER_REJECT: {
    from: ["PAYMENT_CLAIMED", "PENDING_PAYMENT"],
    to: "REJECTED",
    actor: ["OWNER"],
    description: "Reject unverified payment with mandatory reason",
  },
  OWNER_SCHEDULE: {
    from: ["CONFIRMED", "SCHEDULED"],
    to: "SCHEDULED",
    actor: ["OWNER"],
    description: "Assign or reschedule consultation time slot and meeting link",
  },
  OWNER_COMPLETE: {
    from: ["SCHEDULED", "CONFIRMED"],
    to: "COMPLETED",
    actor: ["OWNER"],
    description: "Mark consultation as completed",
  },
  OWNER_CANCEL: {
    from: ["PENDING_PAYMENT", "PAYMENT_CLAIMED", "CONFIRMED", "SCHEDULED"],
    to: "CANCELLED",
    actor: ["OWNER"],
    description: "Cancel booking and record refund/cancellation reason",
  },
  SYSTEM_EXPIRE: {
    from: ["PENDING_PAYMENT"],
    to: "EXPIRED",
    actor: ["SYSTEM"],
    description: "Auto-expire unpaid booking past expiration deadline",
  },
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "Awaiting Seeker Payment",
  PAYMENT_CLAIMED: "Needs Verification",
  CONFIRMED: "Confirmed (Ready to Schedule)",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

/**
 * Checks whether a given transition is permitted.
 */
export function canTransitionBooking(
  currentStatus: BookingStatus,
  action: BookingAction,
  actor: BookingActorRole
): { allowed: boolean; reason?: string } {
  const rule = BOOKING_TRANSITIONS[action];
  if (!rule) {
    return { allowed: false, reason: `Unknown booking action: "${action}"` };
  }

  if (!rule.actor.includes(actor)) {
    return {
      allowed: false,
      reason: `Unauthorized: Action "${action}" can only be performed by ${rule.actor.join(" or ")}, but actor role is "${actor}".`,
    };
  }

  if (!rule.from.includes(currentStatus)) {
    if (action === "CLIENT_CANCEL" && currentStatus !== "PENDING_PAYMENT") {
      return {
        allowed: false,
        reason: `Only bookings in PENDING_PAYMENT state can be cancelled by the client. Current status is ${currentStatus}. Once payment is claimed or confirmed, please contact the sanctum to request cancellation.`,
      };
    }
    return {
      allowed: false,
      reason: `Invalid transition: Cannot transition booking from "${currentStatus}" via action "${action}". Allowed initial states are: ${rule.from.join(", ")}.`,
    };
  }

  return { allowed: true };
}

/**
 * Asserts that a transition is permitted, returning the next status or throwing an error.
 */
export function assertBookingTransition(
  currentStatus: BookingStatus,
  action: BookingAction,
  actor: BookingActorRole
): BookingStatus {
  const result = canTransitionBooking(currentStatus, action, actor);
  if (!result.allowed) {
    throw new Error(result.reason);
  }
  return BOOKING_TRANSITIONS[action].to;
}
