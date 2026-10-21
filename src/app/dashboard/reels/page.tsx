import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute, canAccessSection } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import ReelsManagerClient from "./ReelsManagerClient";

export const dynamic = "force-dynamic";

/**
 * /dashboard/reels
 * Server Component enforcing section-level RBAC for the Reels Curation Desk.
 * Area 3: Blog, reels, knowledge entries, site content (Owner: Yes, Staff: Yes if granted, Client: No).
 */
export default async function AstrologerReelsPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/dashboard/reels");
  }

  // Canonical permission check: Owner or Staff with 'reels' permission
  const decision = canAccessRoute(auth, "/dashboard/reels");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Instagram Reel Curation"
        message={decision.reason || "You don't have access to this section. Your account requires the 'reels' permission."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  const canManage = auth.isOwner || canAccessSection(auth, "reels", "MANAGE");

  return <ReelsManagerClient canManage={canManage} />;
}
