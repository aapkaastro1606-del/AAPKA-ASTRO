import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import DiagnosticsClient from "./DiagnosticsClient";

export const dynamic = "force-dynamic";

/**
 * /admin/diagnostics
 * Owner-Only System Diagnostics Console.
 * Area 2: Payment settings, pricing, leads, team, diagnostics, legal pages (Owner: Yes, Staff: No, Client: No).
 */
export default async function AdminDiagnosticsPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/diagnostics");
  }

  // Canonical permission check: Owner Only
  const decision = canAccessRoute(auth, "/admin/diagnostics");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="System Diagnostics"
        message={decision.reason || "You don't have access to this section. System diagnostics and database telemetry is strictly reserved for the Platform Owner."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  return <DiagnosticsClient />;
}
