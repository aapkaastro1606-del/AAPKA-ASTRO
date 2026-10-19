import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeRichText,
  isValidRichTextLink,
  normalizeLinkHref,
} from "../src/lib/content/sanitizeRichText";
import { ContentModelService } from "../src/lib/services/contentModelService";
import { ContentStatus } from "@prisma/client";
import { prisma } from "../src/lib/db/prisma";
import { GET as publicContentGet } from "../src/app/api/content/route";
import { NextRequest } from "next/server";

describe("Content Studio Editing Experience Test Suite", () => {
  beforeEach(() => {
    process.env.OWNER_EMAIL = "aapkaastro1606@gmail.com";
  });

  describe("Rich Text Sanitization & Link Protocol Security", () => {
    it("permits safe formatting tags (bold, italic, headings, lists, paragraphs)", () => {
      const rawHtml =
        "<h3>Consultation Guide</h3><p>Please call <b>Acharya Ji</b> at your scheduled time. <i>All readings are confidential.</i></p><ul><li>Birth chart review</li><li>Vastu remedies</li></ul>";
      const sanitized = sanitizeRichText(rawHtml);

      assert.ok(sanitized.includes("<h3>Consultation Guide</h3>"));
      assert.ok(sanitized.includes("<b>Acharya Ji</b>"));
      assert.ok(sanitized.includes("<i>All readings are confidential.</i>"));
      assert.ok(sanitized.includes("<ul><li>Birth chart review</li><li>Vastu remedies</li></ul>"));
    });

    it("strictly strips <script>, <iframe>, <style>, and inline on* event handlers", () => {
      const maliciousHtml =
        `<p>Welcome</p><script>alert('xss')</script><iframe src="evil.com"></iframe><img src="x" onerror="alert(1)" /><button onclick="steal()">Click</button><style>body { display: none; }</style>`;
      const sanitized = sanitizeRichText(maliciousHtml);

      assert.ok(!sanitized.includes("<script"));
      assert.ok(!sanitized.includes("alert('xss')"));
      assert.ok(!sanitized.includes("<iframe"));
      assert.ok(!sanitized.includes("<style"));
      assert.ok(!sanitized.includes("onerror"));
      assert.ok(!sanitized.includes("onclick"));
      assert.ok(!sanitized.includes("<button"));
      assert.ok(sanitized.includes("<p>Welcome</p>"));
    });

    it("validates link protocols allowing ONLY https, tel, mailto, and wa.me", () => {
      // Allowed links
      assert.equal(isValidRichTextLink("https://www.aapkaastro.com/consult"), true);
      assert.equal(isValidRichTextLink("https://wa.me/919311215564"), true);
      assert.equal(isValidRichTextLink("wa.me/919311215564"), true);
      assert.equal(isValidRichTextLink("tel:+919311215564"), true);
      assert.equal(isValidRichTextLink("mailto:contact@aapkaastro.com"), true);

      // Disallowed links
      assert.equal(isValidRichTextLink("javascript:alert(1)"), false);
      assert.equal(isValidRichTextLink("data:text/html;base64,..."), false);
      assert.equal(isValidRichTextLink("http://unencrypted.com"), false);
      assert.equal(isValidRichTextLink("ftp://files.com"), false);
    });

    it("normalizes wa.me links to full https://wa.me/ protocol", () => {
      assert.equal(normalizeLinkHref("wa.me/919311215564"), "https://wa.me/919311215564");
      assert.equal(normalizeLinkHref("https://wa.me/919311215564"), "https://wa.me/919311215564");
    });

    it("strips href attribute if unallowed protocol is injected inside <a> tag", () => {
      const injection = '<a href="javascript:alert(document.cookie)">Malicious Link</a>';
      const sanitized = sanitizeRichText(injection);
      assert.ok(!sanitized.includes("javascript:"));
      assert.ok(!sanitized.includes("<a"));
      assert.ok(sanitized.includes("Malicious Link"));
    });
  });

  describe("Draft vs Published Status & Owner-Only Draft Preview", () => {
    const draftKey = `test-draft-${Date.now()}`;

    it("saves an item as DRAFT and ensures regular visitors cannot see it", async () => {
      // 1. Save item as DRAFT
      await ContentModelService.saveEntry({
        collection: "faqs",
        key: draftKey,
        dataEn: {
          question: "Draft FAQ: Are consultations available on Sundays?",
          answer: "Yes, our sanctum desk operates 7 days a week.",
          category: "booking",
        },
        status: ContentStatus.DRAFT,
        actorEmail: "aapkaastro1606@gmail.com",
        changeSummary: "Created draft FAQ for review",
      });

      // 2. Regular visitor query (/api/content?lang=en) -> Must NOT include draft
      const regularReq = new NextRequest("http://localhost/api/content?lang=en");
      const regularRes = await publicContentGet(regularReq);
      const regularJson = await regularRes.json();

      const foundInPublic = regularJson.content.faqs.find((f: any) => f.id === draftKey);
      assert.equal(foundInPublic, undefined, "DRAFT item must NEVER be visible to regular public visitors");

      // 3. Clean up
      await prisma.contentEntry.delete({
        where: { collection_key: { collection: "faqs", key: draftKey } },
      }).catch(() => {});
    });
  });

  describe("One-Click Restore from Revision History", () => {
    const restoreKey = `test-rev-${Date.now()}`;

    it("records snapshot on every save and restores previous state in one click", async () => {
      // Version 1
      await ContentModelService.saveEntry({
        collection: "faqs",
        key: restoreKey,
        dataEn: {
          question: "Version 1 Question?",
          answer: "Version 1 Answer text.",
          category: "general",
        },
        status: ContentStatus.PUBLISHED,
        actorEmail: "aapkaastro1606@gmail.com",
        changeSummary: "Initial version",
      });

      // Version 2
      await ContentModelService.saveEntry({
        collection: "faqs",
        key: restoreKey,
        dataEn: {
          question: "Version 2 Question (Edited)?",
          answer: "Version 2 Answer text.",
          category: "general",
        },
        status: ContentStatus.PUBLISHED,
        actorEmail: "aapkaastro1606@gmail.com",
        changeSummary: "Edited question text",
      });

      const revisions = await ContentModelService.getRevisions({ collection: "faqs", key: restoreKey });
      assert.equal(revisions.length, 2);

      const v1Rev = revisions.find((r) => r.revisionNumber === 1);
      assert.ok(v1Rev);

      // Restore Version 1
      const restored = await ContentModelService.restoreRevision(v1Rev.id, "aapkaastro1606@gmail.com");
      assert.equal((restored.dataEn as any).question, "Version 1 Question?");

      // Verify a new revision snapshot (revision 3) was generated
      const updatedRevs = await ContentModelService.getRevisions({ collection: "faqs", key: restoreKey });
      assert.equal(updatedRevs.length, 3);
      assert.equal(updatedRevs[0].revisionNumber, 3);

      // Clean up
      await prisma.contentEntry.delete({
        where: { collection_key: { collection: "faqs", key: restoreKey } },
      }).catch(() => {});
    });
  });
});
