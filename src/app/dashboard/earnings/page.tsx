import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute, canAccessSection } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import EarningsManagerClient from "./EarningsManagerClient";

export const dynamic = "force-dynamic";

/**
 * /dashboard/earnings
 * Server Component enforcing section-level RBAC for Consultation Revenue & Earnings.
 * - Owner and Astrologer role pass automatically.
 * - Staff member requires active VIEW grant on "earnings".
 */
export default async function AstrologerEarningsPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/dashboard/earnings");
  }

  // Canonical permission check
  const decision = canAccessRoute(auth, "/dashboard/earnings");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Revenue & Earnings"
        message={decision.reason || "You don't have access to this section. Your account requires the 'earnings' permission."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  const canManage =
    auth.isOwner ||
    auth.role === "ASTROLOGER" ||
    canAccessSection(auth, "earnings", "MANAGE");

  return <EarningsManagerClient canManage={canManage} />;
}
