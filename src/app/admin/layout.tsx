import React from "react";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/bookings");
  }

  // Admin section strictly requires Owner or staff with active pricing/analytics/staff permissions
  const hasAdminSectionPerm =
    auth.permissions.includes("pricing") ||
    auth.permissions.includes("analytics") ||
    auth.permissions.includes("staff");

  if (!auth.isOwner && !hasAdminSectionPerm) {
    redirect(auth.permissions.length > 0 ? "/dashboard" : "/account");
  }

  return <>{children}</>;
}
