import { prisma } from "@/lib/db/prisma";
import { ContentStatus } from "@prisma/client";
import {
  DEFAULT_CONTENT_COLLECTIONS,
  INITIAL_MEDIA_ASSETS,
  getDefaultCollection,
  getDefaultEntry,
  DefaultEntryDefinition,
} from "@/lib/content/contentDefaults";
import { validateCollectionData } from "@/lib/content/contentSchemas";
import { sanitizeRichText } from "@/lib/content/sanitizeRichText";
import { AuditLogService } from "@/lib/services/auditLogService";
import { revalidateAffectedContent } from "@/lib/content/revalidation";

export interface ResolvedContentEntry<T = Record<string, any>> {
  id: string;
  collection: string;
  key: string;
  slug?: string | null;
  status: ContentStatus;
  sortOrder: number;
  schemaVersion: string;
  data: T;
  dataEn: T;
  dataHi: T;
  metadata?: Record<string, any> | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  isFallback?: boolean;
  isDraft?: boolean;
}

function sanitizeContentObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") {
      result[k] = sanitizeRichText(v);
    } else if (Array.isArray(v)) {
      result[k] = v.map((item) => (typeof item === "string" ? sanitizeRichText(item) : item));
    } else if (v && typeof v === "object") {
      result[k] = sanitizeContentObject(v);
    } else {
      result[k] = v;
    }
  }
  return result;
}

export interface SaveEntryInput {
  collection: string;
  key: string;
  slug?: string;
  dataEn: Record<string, any>;
  dataHi?: Record<string, any>;
  status?: ContentStatus;
  sortOrder?: number;
  schemaVersion?: string;
  metadata?: Record<string, any>;
  actorEmail: string;
  changeSummary?: string;
}

export class ContentModelService {
  /**
   * Reads all PUBLISHED entries in a collection, sorted by sortOrder.
   * NEVER fails: falls back to built-in code defaults if database is unreachable,
   * table is empty, or specific entries are missing.
   */
  static async getPublishedCollection<T = Record<string, any>>(
    collection: string,
    language: "en" | "hi" = "en",
    options?: { includeDraftsForOwner?: boolean }
  ): Promise<ResolvedContentEntry<T>[]> {
    const fallbackList = getDefaultCollection(collection).map((item) => ({
      id: `fallback-${collection}-${item.key}`,
      collection,
      key: item.key,
      slug: item.slug || item.key,
      status: ContentStatus.PUBLISHED,
      sortOrder: item.sortOrder,
      schemaVersion: "1.0",
      data: (language === "hi" && Object.keys(item.dataHi || {}).length > 0
        ? item.dataHi
        : item.dataEn) as T,
      dataEn: item.dataEn as T,
      dataHi: item.dataHi as T,
      metadata: item.metadata || {},
      createdBy: "system_default",
      updatedBy: "system_default",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFallback: true,
      isDraft: false,
    }));

    try {
      if (!prisma || !prisma.contentEntry) {
        return fallbackList;
      }

      const statusFilter = options?.includeDraftsForOwner
        ? { in: [ContentStatus.PUBLISHED, ContentStatus.DRAFT] }
        : ContentStatus.PUBLISHED;

      const dbEntries = await prisma.contentEntry.findMany({
        where: {
          collection,
          status: statusFilter,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });

      if (!dbEntries || dbEntries.length === 0) {
        return fallbackList;
      }

      // Map DB entries
      return dbEntries.map((entry) => {
        const en = (entry.dataEn || {}) as T;
        const hi = (entry.dataHi || {}) as T;
        const chosenData = language === "hi" && Object.keys(hi as object).length > 0 ? hi : en;

        return {
          id: entry.id,
          collection: entry.collection,
          key: entry.key,
          slug: entry.slug,
          status: entry.status,
          sortOrder: entry.sortOrder,
          schemaVersion: entry.schemaVersion,
          data: chosenData,
          dataEn: en,
          dataHi: hi,
          metadata: (entry.metadata as Record<string, any>) || {},
          createdBy: entry.createdBy,
          updatedBy: entry.updatedBy,
          createdAt: entry.createdAt.toISOString(),
          updatedAt: entry.updatedAt.toISOString(),
          isFallback: false,
          isDraft: entry.status === ContentStatus.DRAFT,
        };
      });
    } catch (err) {
      console.error(`ContentModelService.getPublishedCollection(${collection}) error:`, err);
      return fallbackList;
    }
  }

  /**
   * Reads a single PUBLISHED entry by collection and key/slug.
   * Falls back to built-in code defaults if not found or DB unreachable.
   */
  static async getPublishedEntry<T = Record<string, any>>(
    collection: string,
    keyOrSlug: string,
    language: "en" | "hi" = "en",
    options?: { includeDraftsForOwner?: boolean }
  ): Promise<ResolvedContentEntry<T> | null> {
    const defaultItem = getDefaultEntry(collection, keyOrSlug);
    const fallbackEntry: ResolvedContentEntry<T> | null = defaultItem
      ? {
          id: `fallback-${collection}-${defaultItem.key}`,
          collection,
          key: defaultItem.key,
          slug: defaultItem.slug || defaultItem.key,
          status: ContentStatus.PUBLISHED,
          sortOrder: defaultItem.sortOrder,
          schemaVersion: "1.0",
          data: (language === "hi" && Object.keys(defaultItem.dataHi || {}).length > 0
            ? defaultItem.dataHi
            : defaultItem.dataEn) as T,
          dataEn: defaultItem.dataEn as T,
          dataHi: defaultItem.dataHi as T,
          metadata: defaultItem.metadata || {},
          createdBy: "system_default",
          updatedBy: "system_default",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFallback: true,
          isDraft: false,
        }
      : null;

    try {
      if (!prisma || !prisma.contentEntry) {
        return fallbackEntry;
      }

      const statusFilter = options?.includeDraftsForOwner
        ? { in: [ContentStatus.PUBLISHED, ContentStatus.DRAFT] }
        : ContentStatus.PUBLISHED;

      const dbEntry = await prisma.contentEntry.findFirst({
        where: {
          collection,
          status: statusFilter,
          OR: [{ key: keyOrSlug }, { slug: keyOrSlug }],
        },
      });

      if (!dbEntry) {
        return fallbackEntry;
      }

      const en = (dbEntry.dataEn || {}) as T;
      const hi = (dbEntry.dataHi || {}) as T;
      const chosenData = language === "hi" && Object.keys(hi as object).length > 0 ? hi : en;

      return {
        id: dbEntry.id,
        collection: dbEntry.collection,
        key: dbEntry.key,
        slug: dbEntry.slug,
        status: dbEntry.status,
        sortOrder: dbEntry.sortOrder,
        schemaVersion: dbEntry.schemaVersion,
        data: chosenData,
        dataEn: en,
        dataHi: hi,
        metadata: (dbEntry.metadata as Record<string, any>) || {},
        createdBy: dbEntry.createdBy,
        updatedBy: dbEntry.updatedBy,
        createdAt: dbEntry.createdAt.toISOString(),
        updatedAt: dbEntry.updatedAt.toISOString(),
        isFallback: false,
        isDraft: dbEntry.status === ContentStatus.DRAFT,
      };
    } catch (err) {
      console.error(`ContentModelService.getPublishedEntry(${collection}, ${keyOrSlug}) error:`, err);
      return fallbackEntry;
    }
  }

  /**
   * Reads all entries in a collection regardless of status (for Admin Studio).
   */
  static async getAllEntries<T = Record<string, any>>(collection?: string): Promise<ResolvedContentEntry<T>[]> {
    try {
      if (!prisma || !prisma.contentEntry) {
        return (collection ? getDefaultCollection(collection) : []).map((item) => ({
          id: `fallback-${collection || "generic"}-${item.key}`,
          collection: collection || "generic",
          key: item.key,
          slug: item.slug || item.key,
          status: ContentStatus.PUBLISHED,
          sortOrder: item.sortOrder,
          schemaVersion: "1.0",
          data: item.dataEn as T,
          dataEn: item.dataEn as T,
          dataHi: item.dataHi as T,
          metadata: item.metadata || {},
          createdBy: "system_default",
          updatedBy: "system_default",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFallback: true,
        }));
      }

      const whereClause = collection ? { collection } : undefined;
      const entries = await prisma.contentEntry.findMany({
        where: whereClause,
        orderBy: [{ collection: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      });

      if (entries.length === 0 && collection) {
        return getDefaultCollection(collection).map((item) => ({
          id: `fallback-${collection}-${item.key}`,
          collection,
          key: item.key,
          slug: item.slug || item.key,
          status: ContentStatus.PUBLISHED,
          sortOrder: item.sortOrder,
          schemaVersion: "1.0",
          data: item.dataEn as T,
          dataEn: item.dataEn as T,
          dataHi: item.dataHi as T,
          metadata: item.metadata || {},
          createdBy: "system_default",
          updatedBy: "system_default",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFallback: true,
        }));
      }

      return entries.map((entry) => ({
        id: entry.id,
        collection: entry.collection,
        key: entry.key,
        slug: entry.slug,
        status: entry.status,
        sortOrder: entry.sortOrder,
        schemaVersion: entry.schemaVersion,
        data: (entry.dataEn || {}) as T,
        dataEn: (entry.dataEn || {}) as T,
        dataHi: (entry.dataHi || {}) as T,
        metadata: (entry.metadata as Record<string, any>) || {},
        createdBy: entry.createdBy,
        updatedBy: entry.updatedBy,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
        isFallback: false,
      }));
    } catch (err) {
      console.error("ContentModelService.getAllEntries error:", err);
      return [];
    }
  }

  /**
   * Saves or updates a content entry, validates schema, and creates a revision snapshot.
   */
  static async saveEntry(input: SaveEntryInput): Promise<ResolvedContentEntry> {
    const {
      collection,
      key,
      slug,
      dataEn,
      dataHi = {},
      status = ContentStatus.PUBLISHED,
      sortOrder = 0,
      schemaVersion = "1.0",
      metadata = {},
      actorEmail,
      changeSummary,
    } = input;

    // 1. Schema Validation for English data
    const enValidation = validateCollectionData(collection, dataEn);
    if (!enValidation.valid) {
      throw new Error(`Schema validation failed for English data: ${enValidation.error}`);
    }

    // 2. Schema Validation for Hindi data if provided
    if (dataHi && Object.keys(dataHi).length > 0) {
      const hiValidation = validateCollectionData(collection, dataHi);
      if (!hiValidation.valid) {
        throw new Error(`Schema validation failed for Hindi data: ${hiValidation.error}`);
      }
    }

    if (!prisma || !prisma.contentEntry) {
      throw new Error("Database client unavailable for saving content entry.");
    }

    // 3. Upsert entry in database
    const existing = await prisma.contentEntry.findUnique({
      where: {
        collection_key: { collection, key },
      },
    });

    let effectiveDataHi = dataHi;
    if (!effectiveDataHi || Object.keys(effectiveDataHi).length === 0) {
      if (existing?.dataHi && Object.keys(existing.dataHi as object).length > 0) {
        effectiveDataHi = existing.dataHi as Record<string, any>;
      } else {
        const defaultItem = getDefaultEntry(collection, key);
        effectiveDataHi = defaultItem?.dataHi || {};
      }
    }

    const isNew = !existing;
    const sanitizedDataEn = sanitizeContentObject(dataEn);
    const sanitizedDataHi = sanitizeContentObject(effectiveDataHi);

    // Atomic transaction: entry upsert + revision snapshot creation
    const { entry, revisionNumber } = await prisma.$transaction(async (tx) => {
      const savedEntry = await tx.contentEntry.upsert({
        where: {
          collection_key: { collection, key },
        },
        create: {
          collection,
          key,
          slug: slug || key,
          status,
          sortOrder,
          schemaVersion,
          dataEn: sanitizedDataEn,
          dataHi: sanitizedDataHi,
          metadata,
          createdBy: actorEmail,
          updatedBy: actorEmail,
        },
        update: {
          slug: slug || existing?.slug || key,
          status,
          sortOrder,
          schemaVersion,
          dataEn: sanitizedDataEn,
          dataHi: sanitizedDataHi,
          metadata,
          updatedBy: actorEmail,
        },
      });

      const previousRevisionsCount = await tx.contentRevision.count({
        where: { contentId: savedEntry.id },
      });
      const revNum = previousRevisionsCount + 1;

      await tx.contentRevision.create({
        data: {
          contentId: savedEntry.id,
          collection,
          key,
          status,
          sortOrder,
          dataEn: sanitizedDataEn,
          dataHi: sanitizedDataHi,
          metadata,
          revisionNumber: revNum,
          changeSummary: changeSummary || (isNew ? "Initial creation" : `Updated by ${actorEmail}`),
          createdBy: actorEmail,
        },
      });

      return { entry: savedEntry, revisionNumber: revNum };
    });

    // 5. Audit Log
    await AuditLogService.log({
      action: isNew ? "CONTENT_ENTRY_CREATED" : "CONTENT_ENTRY_UPDATED",
      actorEmail,
      targetId: entry.id,
      targetType: "ContentEntry",
      notes: `Collection: ${collection}, Key: ${key}, Status: ${status}, Revision: #${revisionNumber}`,
    });

    // 6. On-demand cache revalidation (affected pages only, zero redeploy required)
    revalidateAffectedContent(collection, key);

    return {
      id: entry.id,
      collection: entry.collection,
      key: entry.key,
      slug: entry.slug,
      status: entry.status,
      sortOrder: entry.sortOrder,
      schemaVersion: entry.schemaVersion,
      data: dataEn,
      dataEn,
      dataHi,
      metadata: (entry.metadata as Record<string, any>) || {},
      createdBy: entry.createdBy,
      updatedBy: entry.updatedBy,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      isFallback: false,
    };
  }

  /**
   * Restores a past ContentRevision to active status and creates a new revision snapshot inside a transaction.
   */
  static async restoreRevision(revisionId: string, actorEmail: string): Promise<ResolvedContentEntry> {
    if (!prisma || !prisma.contentRevision || !prisma.contentEntry) {
      throw new Error("Database client unavailable for restoring revision.");
    }

    const revision = await prisma.contentRevision.findUnique({
      where: { id: revisionId },
    });

    if (!revision) {
      throw new Error(`ContentRevision with ID "${revisionId}" was not found.`);
    }

    const parentEntry = await prisma.contentEntry.findUnique({
      where: { id: revision.contentId },
    });

    if (!parentEntry) {
      throw new Error(`Parent ContentEntry for revision "${revisionId}" was not found.`);
    }

    // Atomic transaction for restoring entry state and creating new restore revision
    const { restored, newRevisionNumber } = await prisma.$transaction(async (tx) => {
      const updated = await tx.contentEntry.update({
        where: { id: parentEntry.id },
        data: {
          status: revision.status,
          sortOrder: revision.sortOrder,
          dataEn: revision.dataEn as any,
          dataHi: revision.dataHi as any,
          metadata: (revision.metadata as any) || {},
          updatedBy: actorEmail,
        },
      });

      const revCount = await tx.contentRevision.count({
        where: { contentId: parentEntry.id },
      });
      const revNum = revCount + 1;

      await tx.contentRevision.create({
        data: {
          contentId: parentEntry.id,
          collection: revision.collection,
          key: revision.key,
          status: revision.status,
          sortOrder: revision.sortOrder,
          dataEn: revision.dataEn as any,
          dataHi: revision.dataHi as any,
          metadata: revision.metadata as any,
          revisionNumber: revNum,
          changeSummary: `Restored from revision #${revision.revisionNumber} by ${actorEmail}`,
          createdBy: actorEmail,
        },
      });

      return { restored: updated, newRevisionNumber: revNum };
    });

    // Audit Log
    await AuditLogService.log({
      action: "CONTENT_REVISION_RESTORED",
      actorEmail,
      targetId: parentEntry.id,
      targetType: "ContentEntry",
      notes: `Restored collection ${revision.collection}:${revision.key} from revision #${revision.revisionNumber}`,
    });

    // Revalidate affected cache tags
    revalidateAffectedContent(revision.collection, revision.key);

    return {
      id: restored.id,
      collection: restored.collection,
      key: restored.key,
      slug: restored.slug,
      status: restored.status,
      sortOrder: restored.sortOrder,
      schemaVersion: restored.schemaVersion,
      data: (restored.dataEn || {}) as any,
      dataEn: (restored.dataEn || {}) as any,
      dataHi: (restored.dataHi || {}) as any,
      metadata: (restored.metadata as Record<string, any>) || {},
      createdBy: restored.createdBy,
      updatedBy: restored.updatedBy,
      createdAt: restored.createdAt.toISOString(),
      updatedAt: restored.updatedAt.toISOString(),
      isFallback: false,
    };
  }

  /**
   * Fetches revision history for a content item.
   */
  static async getRevisions(query: { contentId?: string; collection?: string; key?: string }) {
    try {
      if (!prisma || !prisma.contentRevision) return [];

      let whereClause: any = {};
      if (query.contentId) {
        whereClause.contentId = query.contentId;
      } else if (query.collection && query.key) {
        whereClause.collection = query.collection;
        whereClause.key = query.key;
      } else {
        return [];
      }

      return await prisma.contentRevision.findMany({
        where: whereClause,
        orderBy: { revisionNumber: "desc" },
      });
    } catch (err) {
      console.error("ContentModelService.getRevisions error:", err);
      return [];
    }
  }

  /**
   * Fetches media assets, falling back to initial media assets if table is empty or error occurs.
   */
  static async getMediaAssets(collection?: string): Promise<Array<{
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    fileSize: number | null;
    altTextEn: string | null;
    altTextHi: string | null;
    collection: string | null;
    uploadedBy: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  }>> {
    const fallback = collection
      ? INITIAL_MEDIA_ASSETS.filter((m) => m.collection === collection)
      : INITIAL_MEDIA_ASSETS;

    try {
      if (!prisma || !prisma.mediaAsset) return fallback;

      const assets = await prisma.mediaAsset.findMany({
        where: collection ? { collection } : undefined,
        orderBy: { createdAt: "desc" },
      });

      if (assets.length === 0) return fallback;
      return assets;
    } catch (err) {
      console.error("ContentModelService.getMediaAssets error:", err);
      return fallback;
    }
  }

  /**
   * Adds a new media asset.
   * Strictly enforces:
   * - Prohibits Base64 data URLs in database
   * - Requires alt text for accessibility and SEO
   */
  static async createMediaAsset(input: {
    url: string;
    filename: string;
    mimeType?: string;
    fileSize?: number;
    altTextEn?: string;
    altTextHi?: string;
    collection?: string;
    actorEmail?: string;
  }) {
    if (!prisma || !prisma.mediaAsset) {
      throw new Error("Database client unavailable for creating media asset.");
    }

    // Strictly prohibit Base64 in database
    if (input.url.startsWith("data:") || input.url.includes(";base64,")) {
      throw new Error(
        "Base64 image storage in database is prohibited. Images must be stored in Cloudflare R2."
      );
    }

    // Enforce required alt text (English required for accessibility and SEO)
    if (!input.altTextEn || !input.altTextEn.trim()) {
      throw new Error("Alt text (English) is required for accessibility and SEO.");
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        url: input.url,
        filename: input.filename,
        mimeType: input.mimeType || "image/jpeg",
        fileSize: input.fileSize,
        altTextEn: input.altTextEn.trim(),
        altTextHi: input.altTextHi?.trim() || null,
        collection: input.collection || "general",
        uploadedBy: input.actorEmail,
      },
    });

    await AuditLogService.log({
      action: "MEDIA_ASSET_CREATED",
      actorEmail: input.actorEmail,
      targetId: asset.id,
      targetType: "MediaAsset",
      notes: `Uploaded media: ${asset.filename} (${asset.url})`,
    });

    return asset;
  }

  /**
   * Checks whether a media asset is currently in use across ContentEntry collections,
   * platform settings, or official site galleries.
   */
  static async checkMediaAssetUsage(
    assetIdOrUrl: string
  ): Promise<{ inUse: boolean; usedIn: string[] }> {
    const usedIn: string[] = [];
    if (!prisma) return { inUse: false, usedIn: [] };

    let targetUrl = assetIdOrUrl;
    let targetFilename = "";

    try {
      if (prisma.mediaAsset) {
        const asset = await prisma.mediaAsset.findFirst({
          where: { OR: [{ id: assetIdOrUrl }, { url: assetIdOrUrl }] },
        });
        if (asset) {
          targetUrl = asset.url;
          targetFilename = asset.filename;
        }
      }
    } catch {
      // Ignore lookup failure
    }

    if (!targetUrl) return { inUse: false, usedIn: [] };

    // 1. Scan content_entries
    try {
      if (prisma.contentEntry) {
        const entries = await prisma.contentEntry.findMany({
          select: { collection: true, key: true, dataEn: true, dataHi: true },
        });

        for (const entry of entries) {
          const strEn = JSON.stringify(entry.dataEn || {});
          const strHi = JSON.stringify(entry.dataHi || {});
          if (
            strEn.includes(targetUrl) ||
            strHi.includes(targetUrl) ||
            (targetFilename && (strEn.includes(targetFilename) || strHi.includes(targetFilename)))
          ) {
            usedIn.push(`Content: ${entry.collection} (${entry.key})`);
          }
        }
      }
    } catch (e) {
      console.error("checkMediaAssetUsage contentEntry scan error:", e);
    }

    // 2. Scan platform_settings
    try {
      if (prisma.platformSetting) {
        const setting = await prisma.platformSetting.findUnique({
          where: { id: "singleton_settings" },
        });
        if (setting) {
          const strSettings = JSON.stringify(setting);
          if (
            strSettings.includes(targetUrl) ||
            (targetFilename && strSettings.includes(targetFilename))
          ) {
            usedIn.push("Platform Settings");
          }
        }
      }
    } catch (e) {
      console.error("checkMediaAssetUsage platformSetting scan error:", e);
    }

    // 3. Scan official site gallery baseline
    if (INITIAL_MEDIA_ASSETS.some((m) => m.url === targetUrl)) {
      usedIn.push("Official Site Gallery Baseline");
    }

    return {
      inUse: usedIn.length > 0,
      usedIn,
    };
  }

  /**
   * Safely deletes a media asset, blocking deletion if the image is currently in use.
   */
  static async deleteMediaAsset(
    id: string,
    actorEmail: string
  ): Promise<{ success: boolean; message: string; blocked?: boolean; usedIn?: string[] }> {
    if (!prisma || !prisma.mediaAsset) {
      throw new Error("Database client unavailable for deleting media asset.");
    }

    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new Error(`Media asset with ID "${id}" was not found.`);
    }

    // Check if asset is still in use
    const usage = await this.checkMediaAssetUsage(asset.id);
    if (usage.inUse) {
      return {
        success: false,
        blocked: true,
        message: `Cannot delete image "${asset.filename}" because it is currently in use in: ${usage.usedIn.join(", ")}. Please remove or replace this image before deleting.`,
        usedIn: usage.usedIn,
      };
    }

    // Safe to delete
    await prisma.mediaAsset.delete({
      where: { id: asset.id },
    });

    await AuditLogService.log({
      action: "MEDIA_ASSET_DELETED",
      actorEmail,
      targetId: asset.id,
      targetType: "MediaAsset",
      notes: `Deleted unused media asset: ${asset.filename} (${asset.url})`,
    });

    return {
      success: true,
      message: `Media asset "${asset.filename}" was successfully deleted.`,
    };
  }
}
