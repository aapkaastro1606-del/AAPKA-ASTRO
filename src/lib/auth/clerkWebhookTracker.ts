import { prisma } from "@/lib/db/prisma";

export interface WebhookEventRecord {
  id?: string;
  timestamp: string;
  eventType: string;
  status: "SUCCESS" | "FAILED";
  error?: string;
}

let inMemoryLastWebhook: WebhookEventRecord | null = null;

export const ClerkWebhookTracker = {
  async recordSuccess(eventType: string, eventId?: string, payload?: any) {
    inMemoryLastWebhook = {
      timestamp: new Date().toISOString(),
      eventType,
      status: "SUCCESS",
    };

    try {
      if (prisma && prisma.clerkWebhookEvent) {
        await prisma.clerkWebhookEvent.create({
          data: {
            eventId: eventId || null,
            eventType: eventType || "unknown",
            payload: payload ? payload : undefined,
            status: "SUCCESS",
          },
        });
      }
    } catch (e) {
      console.error("Failed to persist clerk webhook event to database:", e);
    }
  },

  async recordFailure(eventType: string, error: string, eventId?: string, payload?: any) {
    inMemoryLastWebhook = {
      timestamp: new Date().toISOString(),
      eventType,
      status: "FAILED",
      error,
    };

    try {
      if (prisma && prisma.clerkWebhookEvent) {
        await prisma.clerkWebhookEvent.create({
          data: {
            eventId: eventId || null,
            eventType: eventType || "unknown",
            payload: payload ? payload : undefined,
            status: "FAILED",
            error: error || null,
          },
        });
      }
    } catch (e) {
      console.error("Failed to persist clerk webhook failure to database:", e);
    }
  },

  async getLastWebhook(): Promise<WebhookEventRecord | null> {
    try {
      if (prisma && prisma.clerkWebhookEvent) {
        const latest = await prisma.clerkWebhookEvent.findFirst({
          orderBy: { createdAt: "desc" },
        });
        if (latest) {
          return {
            id: latest.id,
            timestamp: latest.createdAt.toISOString(),
            eventType: latest.eventType,
            status: latest.status === "SUCCESS" ? "SUCCESS" : "FAILED",
            error: latest.error || undefined,
          };
        }
      }
    } catch (e) {
      console.warn("Could not retrieve latest webhook from DB, falling back to memory:", e);
    }
    return inMemoryLastWebhook ? { ...inMemoryLastWebhook } : null;
  },

  async getLastEvent(): Promise<WebhookEventRecord | null> {
    return this.getLastWebhook();
  },
};
