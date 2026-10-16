import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import KnowledgeManagerClient from "./KnowledgeManagerClient";

export const dynamic = "force-dynamic";

/**
 * /admin/knowledge
 * Owner-Only Knowledge Base Management Console.
 * Access is strictly restricted to aapkaastro1606@gmail.com (fail-closed server-side).
 */
export default async function AdminKnowledgePage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/knowledge");
  }

  // Strictly Owner only
  if (!auth.isOwner) {
    redirect(auth.permissions.length > 0 ? "/dashboard" : "/account");
  }

  return <KnowledgeManagerClient currentUserEmail={auth.email} />;
}
