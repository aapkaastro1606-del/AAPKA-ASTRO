import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/db/prisma";
import { ContentStatus } from "@prisma/client";
import {
  ContentModelService,
  ResolvedContentEntry,
} from "../src/lib/services/contentModelService";
import {
  validateCollectionData,
  FaqContentSchema,
  HeroContentSchema,
} from "../src/lib/content/contentSchemas";
import { seedContentModel } from "../src/lib/content/contentSeeder";
import {
  DEFAULT_CONTENT_COLLECTIONS,
  getDefaultCollection,
  getDefaultEntry,
} from "../src/lib/content/contentDefaults";
import { GET as publicContentGet } from "../src/app/api/content/route";
import { NextRequest } from "next/server";

describe("Content Model, Revisions, & Media Asset Test Suite", () => {
  beforeEach(() => {
    process.env.OWNER_EMAIL = "aapkaastro1606@gmail.com";
  });

  describe("Schema Validation Layer", () => {
    it("validates FAQ schema requiring question and answer", () => {
      const validFaq = { question: "What is Devta Vastu?", answer: "Devta Vastu balances 45 energy fields without demolition.", category: "vastu" };
      const validResult = validateCollectionData("faqs", validFaq);
      assert.equal(validResult.valid, true);

      const invalidFaq = { question: "", answer: "" };
      const invalidResult = validateCollectionData("faqs", invalidFaq);
      assert.equal(invalidResult.valid, false);
      assert.ok(invalidResult.error);
    });

    it("validates Hero schema ensuring defaults and types", () => {
      const validHero = {
        badgeText: "20+ Years Mastery",
        headline: "Authentic Vedic Jyotish",
        subheadline: "Deep traditional learning",
        experienceYears: "20+",
        consultationsCount: "15,000+",
      };
      const result = validateCollectionData("hero", validHero);
      assert.equal(result.valid, true);
    });
  });

  describe("Content Seeder & Code Defaults Alignment", () => {
    it("seeds database from code defaults idempotently so visual launch remains identical", async () => {
      const result = await seedContentModel();
      assert.equal(result.success, true);

      // Verify faqs collection is present in database
      const dbFaqs = await prisma.contentEntry.findMany({
        where: { collection: "faqs", status: ContentStatus.PUBLISHED },
      });
      assert.ok(dbFaqs.length >= 6, `Expected at least 6 FAQs in database, got ${dbFaqs.length}`);

      // Verify contact entry
      const dbContact = await prisma.contentEntry.findUnique({
        where: { collection_key: { collection: "contact", key: "primary" } },
      });
      assert.ok(dbContact);
      const contactData = dbContact.dataEn as Record<string, any>;
      assert.ok(contactData.phone);
      assert.ok(contactData.email);

      // Verify initial revisions exist
      const revisions = await prisma.contentRevision.findMany({
        where: { collection: "contact", key: "primary" },
      });
      assert.ok(revisions.length >= 1, "Initial seed revision must exist");
      assert.equal(revisions[0].revisionNumber, 1);

      // Verify media assets exist
      const mediaAssets = await prisma.mediaAsset.findMany();
      assert.ok(mediaAssets.length >= 7, "Default official media gallery assets must be seeded");
    });
  });

  describe("ContentModelService Resilient Fallback (Never Blank or Crashing)", () => {
    it("gracefully falls back to in-memory code defaults for unknown collection", async () => {
      const entries = await ContentModelService.getPublishedCollection("unknown_collection");
      assert.ok(Array.isArray(entries));
      assert.equal(entries.length, 0); // Unknown collection defaults to empty array without crashing
    });

    it("falls back to in-memory code defaults for built-in collections if not in DB", async () => {
      const fallbackFaqs = getDefaultCollection("faqs");
      assert.ok(fallbackFaqs.length >= 6);

      const entry = getDefaultEntry("contact", "primary");
      assert.ok(entry);
      assert.equal(entry.key, "primary");
      assert.ok(entry.dataEn.phone);
    });

    it("returns bilingual content correctly for English and Hindi", async () => {
      const enFaqs = await ContentModelService.getPublishedCollection("faqs", "en");
      const hiFaqs = await ContentModelService.getPublishedCollection("faqs", "hi");

      assert.ok(enFaqs.length > 0);
      assert.ok(hiFaqs.length > 0);

      // Verify a seeded FAQ has distinct English and Hindi text
      const seededEn = enFaqs.find((f) => f.key === "faq-1") || enFaqs[0];
      const seededHi = hiFaqs.find((f) => f.key === "faq-1") || hiFaqs[0];

      const enQ = seededEn.data.question;
      assert.ok(typeof enQ === "string" && enQ.length > 0);

      const hiQ = seededHi.data.question;
      assert.ok(typeof hiQ === "string" && hiQ.length > 0);
      assert.notEqual(enQ, hiQ, "English and Hindi questions should differ");
    });
  });

  describe("Snapshot Revisions & Restore Functionality", () => {
    const testKey = `test-faq-${Date.now()}`;
    const testActor = "aapkaastro1606@gmail.com";

    it("creates a ContentEntry and an automatic revision snapshot on save", async () => {
      // 1. Initial save
      const entry = await ContentModelService.saveEntry({
        collection: "faqs",
        key: testKey,
        dataEn: {
          question: "Original Question: Is Manglik Dosha permanent?",
          answer: "Original Answer: No, Manglik Dosha can be pacified with authentic Vedic remedies.",
          category: "doshas",
        },
        dataHi: {
          question: "मूल प्रश्न: क्या मांगलिक दोष स्थायी होता है?",
          answer: "मूल उत्तर: नहीं, वैदिक उपायों से इसका निवारण संभव है।",
          category: "doshas",
        },
        status: ContentStatus.PUBLISHED,
        sortOrder: 99,
        actorEmail: testActor,
        changeSummary: "First version of Manglik Dosha FAQ",
      });

      assert.equal(entry.key, testKey);

      // Verify revision 1 was captured
      const revs1 = await ContentModelService.getRevisions({ collection: "faqs", key: testKey });
      assert.equal(revs1.length, 1);
      assert.equal(revs1[0].revisionNumber, 1);
      assert.equal(revs1[0].changeSummary, "First version of Manglik Dosha FAQ");

      // 2. Second save (update)
      await ContentModelService.saveEntry({
        collection: "faqs",
        key: testKey,
        dataEn: {
          question: "Revised Question: Can Manglik Dosha be mitigated?",
          answer: "Revised Answer: Yes, Kumbh Vivah and Hanuman Chalisa recitation balance Mars energy.",
          category: "doshas",
        },
        status: ContentStatus.PUBLISHED,
        sortOrder: 99,
        actorEmail: testActor,
        changeSummary: "Updated remedies explanation",
      });

      // Verify revision 2 was captured
      const revs2 = await ContentModelService.getRevisions({ collection: "faqs", key: testKey });
      assert.equal(revs2.length, 2);
      assert.equal(revs2[0].revisionNumber, 2);
      assert.equal(revs2[0].changeSummary, "Updated remedies explanation");

      // 3. Restore revision 1
      const revision1 = revs2.find((r) => r.revisionNumber === 1);
      assert.ok(revision1, "Revision 1 must exist");

      const restored = await ContentModelService.restoreRevision(revision1.id, testActor);
      assert.equal(restored.key, testKey);
      assert.equal(
        (restored.dataEn as any).question,
        "Original Question: Is Manglik Dosha permanent?",
        "Restored entry should match revision 1"
      );

      // Verify a new revision snapshot (revision 3) was created documenting the restore
      const revs3 = await ContentModelService.getRevisions({ collection: "faqs", key: testKey });
      assert.equal(revs3.length, 3);
      assert.equal(revs3[0].revisionNumber, 3);
      assert.ok(revs3[0].changeSummary?.includes("Restored from revision #1"));

      // Clean up test entry
      await prisma.contentEntry.delete({
        where: { collection_key: { collection: "faqs", key: testKey } },
      });
    });
  });

  describe("Media Asset Management", () => {
    it("fetches media assets and creates new assets with audit tracking", async () => {
      const testAssetUrl = `/gallery/test_cert_${Date.now()}.png`;
      const created = await ContentModelService.createMediaAsset({
        url: testAssetUrl,
        filename: "test_cert.png",
        mimeType: "image/png",
        altTextEn: "Test Certificate",
        altTextHi: "परीक्षण प्रमाण पत्र",
        collection: "credentials",
        actorEmail: "aapkaastro1606@gmail.com",
      });

      assert.ok(created.id);
      assert.equal(created.url, testAssetUrl);

      const assets = await ContentModelService.getMediaAssets("credentials");
      const found = assets.find((a) => a.url === testAssetUrl);
      assert.ok(found, "Newly created asset must be found");

      // Clean up test asset
      await prisma.mediaAsset.delete({ where: { id: created.id } });
    });
  });

  describe("Public /api/content Route Resiliency", () => {
    it("responds with published bilingual content without failing or throwing", async () => {
      const enReq = new NextRequest("http://localhost/api/content?lang=en");
      const enRes = await publicContentGet(enReq);
      assert.equal(enRes.status, 200);

      const enJson = await enRes.json();
      assert.equal(enJson.success, true);
      assert.equal(enJson.lang, "en");
      assert.ok(enJson.content.hero);
      assert.ok(enJson.content.contact);
      assert.ok(Array.isArray(enJson.content.faqs));
      assert.ok(enJson.content.faqs.length >= 6);

      const hiReq = new NextRequest("http://localhost/api/content?lang=hi");
      const hiRes = await publicContentGet(hiReq);
      assert.equal(hiRes.status, 200);

      const hiJson = await hiRes.json();
      assert.equal(hiJson.success, true);
      assert.equal(hiJson.lang, "hi");
      assert.ok(hiJson.content.hero);
    });
  });
});
