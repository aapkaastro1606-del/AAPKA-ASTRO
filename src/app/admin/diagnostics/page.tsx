import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import DiagnosticsClient from "./DiagnosticsClient";

export const dynamic = "force-dynamic";

/**
 * /admin/diagnostics
 * Strictly Owner-Only System Diagnostics Console.
 */
export default async function AdminDiagnosticsPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/diagnostics");
  }

  // Strictly Owner-only
  if (!auth.isOwner && auth.role !== "OWNER") {
    redirect("/dashboard");
  }

  return <DiagnosticsClient />;
}
