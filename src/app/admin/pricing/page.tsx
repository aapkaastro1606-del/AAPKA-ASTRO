import { redirect } from "next/navigation";
import { getServerAuthUser, hasStaffSectionAccess } from "@/lib/auth/serverAuth";
import PricingManagerClient from "./PricingManagerClient";

export const dynamic = "force-dynamic";

/**
 * /admin/pricing
 * Server Component enforcing section-level RBAC for Consultation Pricing.
 * - Owner always passes automatically.
 * - Staff member requires active VIEW grant on "pricing".
 * - Passing canManage={true|false} signals whether mutations (updating rates/discounts) are authorized.
 */
export default async function AdminPricingPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/pricing");
  }

  // Server-side check: Pricing is strictly Owner-only
  if (!auth.isOwner) {
    redirect(auth.permissions.length > 0 ? "/dashboard" : "/account");
  }

  return <PricingManagerClient canManage={true} />;
}
