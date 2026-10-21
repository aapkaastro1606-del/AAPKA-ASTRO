import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import LeadsManagerClient from "./LeadsManagerClient";

export const dynamic = "force-dynamic";

/**
 * /admin/leads
 * Owner-Only Kundli Leads Portal.
 * Area 2: Payment settings, pricing, leads, team, diagnostics, legal pages (Owner: Yes, Staff: No, Client: No).
 */
export default async function AdminLeadsPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/leads");
  }

  // Canonical permission check: Owner Only
  const decision = canAccessRoute(auth, "/admin/leads");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Kundli Leads"
        message={decision.reason || "You don't have access to this section. Kundli lead capture and export is strictly reserved for the Platform Owner."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  return <LeadsManagerClient userEmail={auth.email || ""} />;
}
