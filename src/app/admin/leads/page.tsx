import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import LeadsManagerClient from "./LeadsManagerClient";

export const dynamic = "force-dynamic";

/**
 * /admin/leads
 * Owner-Only Kundli Leads Portal.
 * Enables searching, filtering, date range queries, CSV export with audit logging,
 * and GDPR/DPDP deletion-on-request.
 */
export default async function AdminLeadsPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/leads");
  }

  // Strictly Owner only
  if (!auth.isOwner) {
    redirect("/dashboard");
  }

  return <LeadsManagerClient userEmail={auth.email || ""} />;
}
