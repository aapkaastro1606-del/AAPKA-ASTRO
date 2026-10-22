import React from "react";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin");
  }

  // Canonical layout check: derived from the one permission policy
  const decision = canAccessRoute(auth, "/admin");

  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Administration Control Centre"
        message={decision.reason || "You don't have access to this section."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col lg:flex-row">
      <AdminSidebar auth={auth} />
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
