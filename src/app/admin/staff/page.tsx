import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import StaffManagementClient from "./StaffManagementClient";

export const dynamic = "force-dynamic";

/**
 * /admin/staff
 * Strictly Owner-Only.
 * Area 2: Payment settings, pricing, leads, team, diagnostics, legal pages (Owner: Yes, Staff: No, Client: No).
 */
export default async function AdminStaffPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/staff");
  }

  // Canonical permission check: Owner Only
  const decision = canAccessRoute(auth, "/admin/staff");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Staff Permissions"
        message={decision.reason || "You don't have access to this section. Staff permissions management is strictly reserved for the Platform Owner."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  return <StaffManagementClient />;
}
