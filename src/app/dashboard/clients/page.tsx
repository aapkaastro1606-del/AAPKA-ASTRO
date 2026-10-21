import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute, canAccessSection } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import ClientsManagerClient from "./ClientsManagerClient";

export const dynamic = "force-dynamic";

/**
 * /dashboard/clients
 * Server Component enforcing section-level RBAC for Seeker Directory.
 * - Owner and Astrologer role pass automatically.
 * - Staff member requires active VIEW grant on "clients".
 */
export default async function AstrologerClientsPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/dashboard/clients");
  }

  // Canonical permission check
  const decision = canAccessRoute(auth, "/dashboard/clients");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Client Intake Profiles"
        message={decision.reason || "You don't have access to this section. Your account requires the 'clients' permission."}
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
    canAccessSection(auth, "clients", "MANAGE");

  return <ClientsManagerClient canManage={canManage} />;
}
