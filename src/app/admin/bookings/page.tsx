import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import BookingsQueueClient from "./BookingsQueueClient";

export const dynamic = "force-dynamic";

/**
 * /admin/bookings
 * Owner Verification Queue — Owner Only.
 * Area: Bookings and payment verification (Owner: Yes, Staff: No, Client: Own bookings only).
 */
export default async function AdminBookingsPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/bookings");
  }

  // Canonical permission check: Owner Only
  const decision = canAccessRoute(auth, "/admin/bookings");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Bookings & UPI Verification"
        message={decision.reason || "You don't have access to this section. Payment verification and booking approval is strictly reserved for the Platform Owner."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  return <BookingsQueueClient userEmail={auth.email || ""} />;
}
