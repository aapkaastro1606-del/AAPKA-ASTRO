import React, { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthUser, hasStaffSectionAccess } from "@/lib/auth/serverAuth";
import { ContentStudioService } from "@/lib/services/contentStudioService";
import ContentStudioClient from "./ContentStudioClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Content Studio — Website Content Manager | Aapka Astro",
  description: "Add, edit, hide, or delete FAQs, contact details, hero banners, and seeker testimonials.",
};

export default async function ContentStudioPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/content");
  }

  const hasAccess = auth.isOwner || hasStaffSectionAccess(auth, "content", "VIEW");
  if (!hasAccess) {
    redirect("/admin");
  }

  const canManage = auth.isOwner || hasStaffSectionAccess(auth, "content", "MANAGE");
  const content = await ContentStudioService.getContent();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-8 text-[#7B2D26] font-bold text-xs">
          Loading Content Studio...
        </div>
      }
    >
      <ContentStudioClient initialContent={content} canManage={canManage} />
    </Suspense>
  );
}
