import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute, canAccessSection } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { ContentModelService } from "@/lib/services/contentModelService";
import { isPublicStorageConfigured } from "@/lib/storage/r2PublicStorage";
import MediaLibraryClient from "./MediaLibraryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media Library — Photos & Certificates | Aapka Astro Admin",
  description: "Upload and manage website imagery with direct-to-storage Cloudflare R2 uploads.",
};

export default async function AdminMediaPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/media");
  }

  // Canonical permission check: Owner or Staff with 'content' permission
  const decision = canAccessRoute(auth, "/admin/media");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Media Library"
        message={decision.reason || "You don't have access to this section. Your account requires the 'content' permission."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  const canManage = auth.isOwner || canAccessSection(auth, "content", "MANAGE");
  const storageConfig = isPublicStorageConfigured();

  // Load initial media assets with usage analysis
  let initialAssets: any[] = [];
  try {
    const rawAssets = await ContentModelService.getMediaAssets();
    initialAssets = await Promise.all(
      rawAssets.map(async (asset) => {
        const usage = await ContentModelService.checkMediaAssetUsage(asset.id);
        return {
          id: asset.id,
          url: asset.url,
          filename: asset.filename,
          mimeType: asset.mimeType,
          fileSize: asset.fileSize,
          altTextEn: asset.altTextEn,
          altTextHi: asset.altTextHi,
          collection: asset.collection,
          uploadedBy: asset.uploadedBy,
          createdAt: typeof asset.createdAt === "string" ? asset.createdAt : (asset.createdAt as Date).toISOString(),
          inUse: usage.inUse,
          usedIn: usage.usedIn,
        };
      })
    );
  } catch (err) {
    console.error("AdminMediaPage error loading assets:", err);
  }

  return (
    <MediaLibraryClient
      initialAssets={initialAssets}
      storageConfig={storageConfig}
      canManage={canManage}
    />
  );
}
