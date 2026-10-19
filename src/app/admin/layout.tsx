import React from "react";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";

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

  // Admin section strictly requires Owner or staff with active permissions
  const hasAccess = auth.isOwner || (auth.permissions && auth.permissions.length > 0);

  if (!hasAccess) {
    redirect("/account");
  }

  return <>{children}</>;
}
