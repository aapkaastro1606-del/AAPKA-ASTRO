// PLACEHOLDER: replace with real content
import { PLACEHOLDER_ASTROLOGER } from "@/config/placeholderContent";
import { ConsultationBooking } from "@/lib/services/consultationBilling";

export interface SavedKundli {
  id: string;
  name: string;
  relation: "Self" | "Spouse" | "Child" | "Parent" | "Business Partner" | "Other";
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: "Male" | "Female" | "Other";
  lagna: string;
  rashi: string;
  nakshatra: string;
  createdAt: string;
}

export interface ConsultationRecord {
  id: string;
  date: string;
  duration: string;
  mode: "Chat" | "Voice Call" | "Video Call";
  amount: string;
  astrologer: string;
  topic: string;
  remedy: string;
  notes: string;
  summaryUrl?: string;
  hasReview: boolean;
}

export interface ClientReview {
  id: string;
  consultationId?: string;
  clientName: string;
  service: string;
  rating: number;
  comment: string;
  consentPublic: boolean;
  date: string;
}

export interface CallbackRequest {
  id: string;
  clientName: string;
  phone: string;
  topic: string;
  preferredSlot: string;
  createdAt: string;
  status: "pending" | "contacted" | "cancelled";
}

export interface ClientProfile {
  id?: string;
  name: string;
  identifier: string; // email, username, or future phone
  phone?: string;
  email?: string;
  isLoggedIn: boolean;
  walletBalance: number;
  joinedDate: string;
  role?: "CLIENT" | "ASTROLOGER" | "ADMIN";
}

let memoryClientProfile: ClientProfile = {
  id: "client-seeker",
  name: "Seeker",
  identifier: "",
  phone: "",
  email: "",
  isLoggedIn: false,
  walletBalance: 0,
  joinedDate: "Today",
  role: "CLIENT",
};

let memorySavedKundlis: SavedKundli[] = [];

let memoryConsultations: ConsultationRecord[] = [];

let memoryReviews: ClientReview[] = [];

let memoryCallbacks: CallbackRequest[] = [];

export const ClientAccountStore = {
  getProfile: (): ClientProfile => ({ ...memoryClientProfile }),

  setLoggedIn: (status: boolean, identifier: string = "", phone?: string, name?: string) => {
    memoryClientProfile.isLoggedIn = status;
    memoryClientProfile.identifier = identifier;
    memoryClientProfile.email = identifier.includes("@") ? identifier : "";
    if (phone) memoryClientProfile.phone = phone;
    if (name) memoryClientProfile.name = name;
  },

  updateProfile: (profile: Partial<ClientProfile>) => {
    memoryClientProfile = { ...memoryClientProfile, ...profile };
  },

  getSavedKundlis: (): SavedKundli[] => [...memorySavedKundlis],

  addSavedKundli: (kundli: Omit<SavedKundli, "id" | "createdAt">): SavedKundli => {
    const newKnd: SavedKundli = {
      ...kundli,
      id: `knd-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    memorySavedKundlis.unshift(newKnd);
    return newKnd;
  },

  deleteSavedKundli: (id: string) => {
    memorySavedKundlis = memorySavedKundlis.filter((k) => k.id !== id);
  },

  getConsultationHistory: (): ConsultationRecord[] => [...memoryConsultations],

  getConsultations: (): ConsultationRecord[] => [...memoryConsultations],

  getConsultationById: (id: string): ConsultationRecord | undefined => {
    return memoryConsultations.find((c) => c.id === id);
  },

  addConsultationRecord: (record: ConsultationRecord) => {
    memoryConsultations.unshift(record);
  },

  getReviews: (): ClientReview[] => [...memoryReviews],

  addReview: (review: Omit<ClientReview, "id" | "date">): ClientReview => {
    const newReview: ClientReview = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };
    memoryReviews.unshift(newReview);
    if (review.consultationId) {
      const c = memoryConsultations.find((item) => item.id === review.consultationId);
      if (c) c.hasReview = true;
    }
    return newReview;
  },

  getCallbackRequests: (): CallbackRequest[] => [...memoryCallbacks],

  requestCallback: (req: Omit<CallbackRequest, "id" | "createdAt" | "status">): CallbackRequest => {
    const newReq: CallbackRequest = {
      ...req,
      id: `call-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    memoryCallbacks.unshift(newReq);
    return newReq;
  },

  getActiveBooking: (): ConsultationBooking | null => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("aapka_active_booking");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  },

  setActiveBooking: (booking: ConsultationBooking | null) => {
    if (typeof window !== "undefined") {
      try {
        if (booking) {
          localStorage.setItem("aapka_active_booking", JSON.stringify(booking));
        } else {
          localStorage.removeItem("aapka_active_booking");
        }
        window.dispatchEvent(new Event("aapka_booking_updated"));
      } catch {}
    }
  },

  updateActiveBookingState: (status: "CONFIRMED" | "AWAITING_SESSION" | "COMPLETED") => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("aapka_active_booking");
        if (stored) {
          const booking = JSON.parse(stored);
          booking.status = status;
          localStorage.setItem("aapka_active_booking", JSON.stringify(booking));
          window.dispatchEvent(new Event("aapka_booking_updated"));
        }
      } catch {}
    }
  },
};
