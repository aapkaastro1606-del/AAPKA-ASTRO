import React from "react";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

/**
 * Server-Side Protected Layout for /account/*
 * Ensures unauthenticated requests are redirected on the server before client rendering.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/account");
  }

  return <>{children}</>;
}
