import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute, canAccessSection } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import BlogManagerClient from "./BlogManagerClient";

export const dynamic = "force-dynamic";

/**
 * /dashboard/blog
 * Server Component enforcing section-level RBAC for the Vedic Journal.
 * Area 3: Blog, reels, knowledge entries, site content (Owner: Yes, Staff: Yes if granted, Client: No).
 */
export default async function AstrologerBlogPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/dashboard/blog");
  }

  // Canonical permission check: Owner or Staff with 'blog' permission
  const decision = canAccessRoute(auth, "/dashboard/blog");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Blog Post Manager"
        message={decision.reason || "You don't have access to this section. Your account requires the 'blog' permission."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  // Check whether user has MANAGE privilege to edit/publish/delete
  const canManage = auth.isOwner || canAccessSection(auth, "blog", "MANAGE");

  return <BlogManagerClient canManage={canManage} />;
}
