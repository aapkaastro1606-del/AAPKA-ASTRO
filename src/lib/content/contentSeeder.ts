import { prisma } from "@/lib/db/prisma";
import {
  DEFAULT_CONTENT_COLLECTIONS,
  INITIAL_MEDIA_ASSETS,
} from "./contentDefaults";
import { ContentStatus } from "@prisma/client";

export interface SeedResult {
  success: boolean;
  entriesCount: number;
  revisionsCount: number;
  mediaCount: number;
  message: string;
}

/**
 * Seeds content entries, initial revisions, and media assets into PostgreSQL.
 * Safe and idempotent: can be executed multiple times without corrupting existing records.
 */
export async function seedContentModel(options: { overwrite?: boolean } = {}): Promise<SeedResult> {
  let entriesCount = 0;
  let revisionsCount = 0;
  let mediaCount = 0;

  try {
    if (!prisma || !prisma.contentEntry) {
      return {
        success: false,
        entriesCount: 0,
        revisionsCount: 0,
        mediaCount: 0,
        message: "Prisma client does not have ContentEntry model available.",
      };
    }

    // 1. Seed Content Collections
    for (const [collectionName, items] of Object.entries(DEFAULT_CONTENT_COLLECTIONS)) {
      for (const item of items) {
        const existing = await prisma.contentEntry.findUnique({
          where: {
            collection_key: {
              collection: collectionName,
              key: item.key,
            },
          },
        });

        let entryId = existing?.id;

        if (!existing) {
          const created = await prisma.contentEntry.create({
            data: {
              collection: collectionName,
              key: item.key,
              slug: item.slug || item.key,
              status: ContentStatus.PUBLISHED,
              sortOrder: item.sortOrder,
              schemaVersion: "1.0",
              dataEn: item.dataEn,
              dataHi: item.dataHi,
              metadata: item.metadata || {},
              createdBy: "system_seed",
              updatedBy: "system_seed",
            },
          });
          entryId = created.id;
          entriesCount++;
        } else if (options.overwrite) {
          await prisma.contentEntry.update({
            where: { id: existing.id },
            data: {
              dataEn: item.dataEn,
              dataHi: item.dataHi,
              sortOrder: item.sortOrder,
              slug: item.slug || existing.slug,
              updatedBy: "system_seed_overwrite",
            },
          });
          entriesCount++;
        }

        // Ensure at least one initial revision snapshot exists
        if (entryId) {
          const revCount = await prisma.contentRevision.count({
            where: { contentId: entryId },
          });

          if (revCount === 0) {
            await prisma.contentRevision.create({
              data: {
                contentId: entryId,
                collection: collectionName,
                key: item.key,
                status: ContentStatus.PUBLISHED,
                sortOrder: item.sortOrder,
                dataEn: item.dataEn,
                dataHi: item.dataHi,
                metadata: item.metadata || {},
                revisionNumber: 1,
                changeSummary: "Initial launch seed from codebase defaults",
                createdBy: "system_seed",
              },
            });
            revisionsCount++;
          }
        }
      }
    }

    // 2. Seed Media Assets
    for (const media of INITIAL_MEDIA_ASSETS) {
      const existingMedia = await prisma.mediaAsset.findFirst({
        where: { url: media.url },
      });

      if (!existingMedia) {
        await prisma.mediaAsset.create({
          data: {
            url: media.url,
            filename: media.filename,
            mimeType: media.mimeType,
            altTextEn: media.altTextEn,
            altTextHi: media.altTextHi,
            collection: media.collection,
            uploadedBy: "system_seed",
          },
        });
        mediaCount++;
      }
    }

    return {
      success: true,
      entriesCount,
      revisionsCount,
      mediaCount,
      message: `Seeded ${entriesCount} entries, ${revisionsCount} revisions, and ${mediaCount} media assets successfully.`,
    };
  } catch (err: any) {
    console.error("seedContentModel error:", err);
    return {
      success: false,
      entriesCount,
      revisionsCount,
      mediaCount,
      message: err.message || "Failed to seed content model.",
    };
  }
}
