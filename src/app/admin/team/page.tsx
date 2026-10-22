import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import TeamManagementClient from "./TeamManagementClient";

export const dynamic = "force-dynamic";

/**
 * /admin/team
 * Strictly Owner-Only.
 * Area 2: Payment settings, pricing, leads, team, diagnostics, legal pages (Owner: Yes, Staff: No, Client: No).
 */
export default async function AdminTeamPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/team");
  }

  // Canonical permission check: Owner Only
  const decision = canAccessRoute(auth, "/admin/team");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Team & Staff Access"
        message={decision.reason || "You don't have access to this section. Team and staff permissions management is strictly reserved for the Platform Owner."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  return (
    <TeamManagementClient
      currentUserEmail={auth.email}
      currentUserId={auth.userId}
    />
  );
}
