import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthUser, hasStaffSectionAccess } from "@/lib/auth/serverAuth";
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

  const canView = auth.isOwner || hasStaffSectionAccess(auth, "content", "VIEW");
  if (!canView) {
    redirect("/admin");
  }

  const canManage = auth.isOwner || hasStaffSectionAccess(auth, "content", "MANAGE");
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
