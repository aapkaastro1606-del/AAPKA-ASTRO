import React from "react";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";

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

  // Operator Cockpit & Desks require Owner status or at least one active staff section permission
  const hasAccess = auth.isOwner || auth.permissions.length > 0 || auth.role === "ASTROLOGER";

  if (!hasAccess) {
    redirect("/account");
  }

  return <>{children}</>;
}
