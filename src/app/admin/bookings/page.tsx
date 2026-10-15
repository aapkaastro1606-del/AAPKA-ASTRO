import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import BookingsQueueClient from "./BookingsQueueClient";

export const dynamic = "force-dynamic";

/**
 * /admin/bookings
 * Owner Verification Queue — Owner Only.
 * Provides bank credit confirmation, UTR duplicate prevention,
 * consultation scheduling, and audit trail viewing.
 */
export default async function AdminBookingsPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/bookings");
  }

  // Strictly Owner only
  if (!auth.isOwner) {
    redirect("/dashboard");
  }

  return <BookingsQueueClient userEmail={auth.email || ""} />;
}
