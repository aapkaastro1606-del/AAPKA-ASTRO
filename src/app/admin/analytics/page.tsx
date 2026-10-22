import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import AnalyticsManagerClient from "./AnalyticsManagerClient";

export const dynamic = "force-dynamic";

/**
 * /admin/analytics
 * Area 2: Payment settings, pricing, leads, team, diagnostics, legal pages (Owner: Yes, Staff: No, Client: No).
 */
export default async function AdminAnalyticsPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/analytics");
  }

  // Canonical permission check: Owner Only
  const decision = canAccessRoute(auth, "/admin/analytics");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Platform Intelligence"
        message={decision.reason || "You don't have access to this section. Platform intelligence is strictly reserved for the Platform Owner."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  return <AnalyticsManagerClient />;
}
