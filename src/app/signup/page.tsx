import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { SignupClient } from "./SignupClient";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const auth = await getServerAuthUser();
  if (auth.isAuthenticated) {
    redirect("/account");
  }

  return (
    <Suspense fallback={<div className="min-h-[85vh] bg-[#FBF3E7]" />}>
      <SignupClient />
    </Suspense>
  );
}
