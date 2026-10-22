import React from "react";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/dashboard");
  }

  // Canonical layout check
  const decision = canAccessRoute(auth, "/dashboard");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Operator Cockpit"
        message={decision.reason || "You don't have access to this section. Operator areas are restricted to authorized staff and practitioners."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  return <>{children}</>;
}
