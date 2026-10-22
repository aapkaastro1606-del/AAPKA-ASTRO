import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import PricingManagerClient from "./PricingManagerClient";

export const dynamic = "force-dynamic";

/**
 * /admin/pricing
 * Server Component enforcing Area 2 (Payment settings, pricing, leads, team, diagnostics, legal pages).
 * Owner: Yes, Staff: No, Client: No.
 */
export default async function AdminPricingPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/pricing");
  }

  // Canonical permission check: Owner Only
  const decision = canAccessRoute(auth, "/admin/pricing");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Pricing & Coupons"
        message={decision.reason || "You don't have access to this section. Pricing and discount management is strictly reserved for the Platform Owner."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  return <PricingManagerClient canManage={true} />;
}
