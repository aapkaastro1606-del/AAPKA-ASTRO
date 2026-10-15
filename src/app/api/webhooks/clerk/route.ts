import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { syncClerkUserToDatabase, deleteClerkUserFromDatabase } from "@/lib/auth/syncUser";
import { ClerkWebhookTracker } from "@/lib/auth/clerkWebhookTracker";

export const dynamic = "force-dynamic";

/**
 * Clerk Webhook Handler
 *
 * Receives real-time user lifecycle events from Clerk (user.created, user.updated, user.deleted)
 * and guarantees a matching row exists in PostgreSQL (Neon).
 *
 * Verifies webhook signatures using svix headers ('svix-id', 'svix-timestamp', 'svix-signature')
 * against CLERK_WEBHOOK_SECRET when provided.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!rawBody || rawBody.trim().length === 0) {
      await ClerkWebhookTracker.recordFailure("unknown", "Missing webhook payload");
      return NextResponse.json({ error: "Missing webhook payload" }, { status: 400 });
    }

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret && process.env.NODE_ENV === "production") {
      console.error("Clerk webhook error: CLERK_WEBHOOK_SECRET is not configured in production");
      await ClerkWebhookTracker.recordFailure("unknown", "CLERK_WEBHOOK_SECRET not configured in production");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    if (webhookSecret) {
      const svixId = req.headers.get("svix-id");
      const svixTimestamp = req.headers.get("svix-timestamp");
      const svixSignature = req.headers.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        await ClerkWebhookTracker.recordFailure("unknown", "Missing required svix headers");
        return NextResponse.json(
          { error: "Missing required svix verification headers" },
          { status: 400 }
        );
      }

      try {
        const wh = new Webhook(webhookSecret);
        wh.verify(rawBody, {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        });
      } catch (err: any) {
        console.error("Clerk webhook signature verification failed:", err?.message || err);
        await ClerkWebhookTracker.recordFailure("unknown", `Signature verification failed: ${err?.message}`);
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 400 }
        );
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      await ClerkWebhookTracker.recordFailure("unknown", "Invalid JSON payload");
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventType = payload?.type;
    const eventData = payload?.data;
    const eventId = payload?.data?.id || req.headers.get("svix-id") || undefined;

    if (!eventType || !eventData) {
      await ClerkWebhookTracker.recordFailure("unknown", "Missing event type or data");
      return NextResponse.json({ error: "Missing event payload" }, { status: 400 });
    }

    if (eventType === "user.created" || eventType === "user.updated") {
      const clerkId = eventData.id;
      const primaryEmail =
        eventData.email_addresses?.find((e: any) => e.id === eventData.primary_email_address_id)?.email_address ||
        eventData.email_addresses?.[0]?.email_address ||
        null;
      const firstName = eventData.first_name || "";
      const lastName = eventData.last_name || "";
      const name = `${firstName} ${lastName}`.trim() || null;
      const phone = eventData.phone_numbers?.[0]?.phone_number || null;
      const imageUrl = eventData.image_url || null;

      const syncedUser = await syncClerkUserToDatabase({
        clerkId,
        email: primaryEmail,
        name,
        phone,
        imageUrl,
      });

      await ClerkWebhookTracker.recordSuccess(eventType, eventId, payload);

      return NextResponse.json({
        success: true,
        message: "User synced successfully",
        userId: syncedUser?.id,
        event: eventType,
      });
    }

    if (eventType === "user.deleted") {
      const clerkId = eventData.id;
      if (clerkId) {
        await deleteClerkUserFromDatabase(clerkId);
      }
      await ClerkWebhookTracker.recordSuccess(eventType, eventId, payload);
      return NextResponse.json({ success: true, message: "User deleted", event: eventType });
    }

    await ClerkWebhookTracker.recordSuccess(eventType, eventId, payload);
    return NextResponse.json({ received: true, event: eventType });
  } catch (err: any) {
    console.error("Clerk webhook error:", err);
    await ClerkWebhookTracker.recordFailure("error", err?.message || "Internal error");
    return NextResponse.json(
      { error: err?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
