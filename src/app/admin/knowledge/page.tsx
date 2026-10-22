import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import KnowledgeManagerClient from "./KnowledgeManagerClient";

export const dynamic = "force-dynamic";

/**
 * /admin/knowledge
 * Knowledge Base Management Console.
 * Area 3: Blog, reels, knowledge entries, site content (Owner: Yes, Staff: Yes if granted, Client: No).
 */
export default async function AdminKnowledgePage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/knowledge");
  }

  // Canonical permission check: Owner or Staff with 'knowledge' / 'content'
  const decision = canAccessRoute(auth, "/admin/knowledge");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Chatbot Knowledge Base"
        message={decision.reason || "You don't have access to this section. Your account requires the 'knowledge' permission."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  return <KnowledgeManagerClient currentUserEmail={auth.email} />;
}
