import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { validateRedirectUrl } from "@/lib/auth/redirectValidation";
import { LoginClient } from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const params = await searchParams;
  const rawRedirect = params?.redirect_url;
  const validRedirect = validateRedirectUrl(rawRedirect, "/account");

  // Server-aware check: if the server session is valid, redirect on the server
  const auth = await getServerAuthUser();
  if (auth.isAuthenticated) {
    redirect(validRedirect);
  }

  return (
    <Suspense fallback={<div className="min-h-[85vh] bg-[#FBF3E7]" />}>
      <LoginClient targetUrl={validRedirect} serverSessionValid={false} />
    </Suspense>
  );
}
