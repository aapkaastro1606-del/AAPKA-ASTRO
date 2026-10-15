import React, { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] bg-[#FBF3E7]" />}>
      <LoginClient />
    </Suspense>
  );
}
