import { prisma } from "@/lib/db/prisma";
import { AuditLogService } from "./auditLogService";

export interface CaptureLeadInput {
  name: string;
  phone: string;
  email?: string | null;
  gender?: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthPlace: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: number | null;
  sourcePage?: string;
  userId?: string | null;
  consentGiven: boolean;
  consentText: string;
  consentVersion?: string;
  honeypot?: string; // website_hp
  formRenderedAt?: number; // millisecond timestamp
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface GetLeadsParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// In-memory rate limiting map for basic spam protection (cleans up automatically)
const ipRateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  if (!ip || ip === "unknown" || ip === "127.0.0.1") return true;
  const now = Date.now();
  const timestamps = (ipRateLimitMap.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  ipRateLimitMap.set(ip, timestamps);
  return true;
}

export class KundliLeadService {
  public static readonly DEFAULT_CONSENT_TEXT =
    "I agree to be contacted about consultations and services, and I can withdraw consent any time.";
  public static readonly CURRENT_CONSENT_VERSION = "v1.0";

  /**
   * Normalizes phone number: strips formatting, ensures valid digits.
   */
  public static normalizePhone(rawPhone: string): string {
    const cleaned = rawPhone.replace(/[^\d+]/g, "").trim();
    return cleaned;
  }

  /**
   * Captures a free Kundli lead before chart generation.
   * Enforces spam protection, rate limiting, explicit consent, and deduplication by phone.
   */
  public static async captureLead(input: CaptureLeadInput) {
    // 1. Anti-spam: Honeypot check
    if (input.honeypot && input.honeypot.trim().length > 0) {
      console.warn("[KundliLead] Bot detected via honeypot field:", input.honeypot);
      throw new Error("Spam submission rejected.");
    }

    // 2. Anti-spam: Velocity check (human takes > 1.2s to fill the form)
    if (input.formRenderedAt && Number(input.formRenderedAt) > 0) {
      const elapsed = Date.now() - Number(input.formRenderedAt);
      if (elapsed < 1200) {
        console.warn("[KundliLead] Velocity check failed. Form filled in:", elapsed, "ms");
        throw new Error("Form submission rejected: completed suspiciously fast.");
      }
    }

    // 3. Rate limiting check by IP
    const clientIp = input.ipAddress || "unknown";
    if (!checkRateLimit(clientIp)) {
      throw new Error("Too many chart requests. Please wait a minute before trying again.");
    }

    // 4. Input validation
    const name = input.name?.trim();
    if (!name || name.length < 2) {
      throw new Error("A valid full name is required.");
    }

    const rawPhone = input.phone?.trim();
    if (!rawPhone) {
      throw new Error("A valid WhatsApp/mobile phone number is required.");
    }

    const normalizedPhone = this.normalizePhone(rawPhone);
    const digitsOnly = normalizedPhone.replace(/[^\d]/g, "");
    if (digitsOnly.length < 10) {
      throw new Error("Please enter a valid phone number with at least 10 digits.");
    }

    // 5. Consent mandate
    if (!input.consentGiven) {
      throw new Error(
        "Consent is required to generate your free Kundli chart and receive astrological updates."
      );
    }

    const consentText = input.consentText?.trim() || this.DEFAULT_CONSENT_TEXT;
    const consentVersion = input.consentVersion?.trim() || this.CURRENT_CONSENT_VERSION;
    const consentTimestamp = new Date();

    const dob = input.birthDate ? new Date(input.birthDate) : new Date("1995-01-01");
    const timeOfBirth = input.birthTime || "12:00";
    const placeOfBirth = input.birthPlace || "New Delhi, India";
    const gender = input.gender || "male";
    const sourcePage = input.sourcePage || "/kundli-generator";
    const email = input.email?.trim() || null;

    if (!prisma || !prisma.kundliLead) {
      throw new Error("Database service is unavailable. Please try again later.");
    }

    // 6. Deduplication by phone number
    const existingLead = await prisma.kundliLead.findFirst({
      where: { phone: normalizedPhone },
    });

    if (existingLead) {
      const updated = await prisma.kundliLead.update({
        where: { id: existingLead.id },
        data: {
          name,
          email: email || existingLead.email,
          gender,
          dob,
          timeOfBirth,
          placeOfBirth,
          latitude: input.latitude ?? existingLead.latitude,
          longitude: input.longitude ?? existingLead.longitude,
          timezone: input.timezone ?? existingLead.timezone,
          sourcePage,
          userId: input.userId || existingLead.userId,
          consentGiven: true,
          consentText,
          consentVersion,
          consentTimestamp,
          ipAddress: input.ipAddress || existingLead.ipAddress,
          userAgent: input.userAgent || existingLead.userAgent,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        leadId: updated.id,
        isUpdate: true,
        lead: updated,
      };
    }

    const created = await prisma.kundliLead.create({
      data: {
        name,
        phone: normalizedPhone,
        email,
        gender,
        dob,
        timeOfBirth,
        placeOfBirth,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        timezone: input.timezone || null,
        sourcePage,
        userId: input.userId || null,
        consentGiven: true,
        consentText,
        consentVersion,
        consentTimestamp,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
      },
    });

    return {
      success: true,
      leadId: created.id,
      isUpdate: false,
      lead: created,
    };
  }

  /**
   * Retrieves leads with search, date filtering, and pagination (Owner Only).
   */
  public static async getLeads(params: GetLeadsParams = {}) {
    if (!prisma || !prisma.kundliLead) {
      return { leads: [], total: 0, totalPages: 0, page: 1, pageSize: 25, stats: { total: 0, uniquePhones: 0, todayCount: 0 } };
    }

    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 25));
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.search && params.search.trim().length > 0) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { email: { contains: q, mode: "insensitive" } },
        { placeOfBirth: { contains: q, mode: "insensitive" } },
      ];
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [leads, total] = await Promise.all([
      prisma.kundliLead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.kundliLead.count({ where }),
    ]);

    // Aggregate stats for owner dashboard
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [allTotal, todayCount] = await Promise.all([
      prisma.kundliLead.count(),
      prisma.kundliLead.count({
        where: {
          createdAt: { gte: startOfToday },
        },
      }),
    ]);

    return {
      leads,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      stats: {
        total: allTotal,
        todayCount,
      },
    };
  }

  /**
   * Generates RFC 4180 compliant CSV and writes an AuditLog entry (Owner Only).
   */
  public static async exportLeadsCsv(actorEmail: string): Promise<string> {
    if (!prisma || !prisma.kundliLead) {
      throw new Error("Database unavailable for CSV export.");
    }

    const leads = await prisma.kundliLead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const headers = [
      "Lead ID",
      "Name",
      "Phone",
      "Email",
      "Gender",
      "Date of Birth",
      "Time of Birth",
      "Place of Birth",
      "Source Page",
      "User ID",
      "Consent Given",
      "Consent Version",
      "Consent Timestamp",
      "Created At",
      "Updated At",
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = leads.map((l) => [
      escapeCsv(l.id),
      escapeCsv(l.name),
      escapeCsv(l.phone),
      escapeCsv(l.email || ""),
      escapeCsv(l.gender),
      escapeCsv(l.dob ? l.dob.toISOString().split("T")[0] : ""),
      escapeCsv(l.timeOfBirth),
      escapeCsv(l.placeOfBirth),
      escapeCsv(l.sourcePage),
      escapeCsv(l.userId || ""),
      escapeCsv(l.consentGiven ? "YES" : "NO"),
      escapeCsv(l.consentVersion),
      escapeCsv(l.consentTimestamp ? l.consentTimestamp.toISOString() : ""),
      escapeCsv(l.createdAt ? l.createdAt.toISOString() : ""),
      escapeCsv(l.updatedAt ? l.updatedAt.toISOString() : ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    // Write audit log entry
    await AuditLogService.log({
      action: "EXPORT_KUNDLI_LEADS",
      actorEmail,
      targetType: "KundliLead",
      notes: `Exported ${leads.length} Kundli leads to CSV download.`,
    });

    return csvContent;
  }

  /**
   * Deletes a lead on seeker request and logs the action (Owner Only).
   */
  public static async deleteLead(leadId: string, actorEmail: string, reason?: string) {
    if (!prisma || !prisma.kundliLead) {
      throw new Error("Database unavailable.");
    }

    const lead = await prisma.kundliLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error("Lead record not found.");
    }

    await prisma.kundliLead.delete({
      where: { id: leadId },
    });

    await AuditLogService.log({
      action: "DELETE_KUNDLI_LEAD",
      actorEmail,
      targetId: leadId,
      targetType: "KundliLead",
      previousState: {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        consentTimestamp: lead.consentTimestamp,
      },
      notes: reason || "Seeker requested data erasure under DPDP/GDPR rights.",
    });

    return { success: true, deletedId: leadId };
  }
}
