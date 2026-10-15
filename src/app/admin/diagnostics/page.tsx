import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import DiagnosticsClient from "./DiagnosticsClient";

export const dynamic = "force-dynamic";

/**
 * /admin/diagnostics
 * Owner-Only System Diagnostics Console.
 * Access is strictly restricted to aapkaastro1606@gmail.com (fail-closed server-side).
 */
export default async function AdminDiagnosticsPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/diagnostics");
  }

  // Strictly Owner only
  if (!auth.isOwner) {
    redirect("/dashboard");
  }

  return <DiagnosticsClient />;
}
