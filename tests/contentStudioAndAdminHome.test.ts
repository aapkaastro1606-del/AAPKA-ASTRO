import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { STAFF_SECTIONS, StaffSection } from "../src/lib/auth/staffPermissions";
import {
  ContentStudioService,
  DEFAULT_CONTENT_STUDIO,
  DEFAULT_FAQS,
  FaqItem,
} from "../src/lib/services/contentStudioService";
import { GET as publicContentGet } from "../src/app/api/content/route";
import { GET as adminContentGet, POST as adminContentPost } from "../src/app/api/admin/content/route";
import { NextRequest } from "next/server";
import { ServerAuthResult, hasStaffSectionAccess } from "../src/lib/auth/serverAuth";

describe("Content Studio & Admin Home Hub Test Suite", () => {
  beforeEach(() => {
    process.env.OWNER_EMAIL = "aapkaastro1606@gmail.com";
  });

  describe("Staff Section Registration & RBAC", () => {
    it("ensures 'content' section is registered in STAFF_SECTIONS", () => {
      const sectionIds = STAFF_SECTIONS.map((s) => s.id);
      assert.ok(
        sectionIds.includes("content" as StaffSection),
        "'content' must be an officially recognized staff section"
      );
      const contentMeta = STAFF_SECTIONS.find((s) => s.id === "content");
      assert.equal(contentMeta?.name, "Content Studio");
      assert.equal(Boolean(contentMeta?.ownerOnly), false);
    });

    it("allows Owner full VIEW and MANAGE access to Content Studio", () => {
      const ownerAuth: ServerAuthResult = {
        isAuthenticated: true,
        userId: "owner_usr",
        role: "OWNER",
        isAstrologer: true,
        isAdmin: true,
        isOwner: true,
        email: "aapkaastro1606@gmail.com",
        permissions: STAFF_SECTIONS.map((s) => s.id),
        grants: [],
      };

      assert.equal(hasStaffSectionAccess(ownerAuth, "content", "VIEW"), true);
      assert.equal(hasStaffSectionAccess(ownerAuth, "content", "MANAGE"), true);
    });

    it("enforces VIEW vs MANAGE access for staff members", () => {
      const viewStaffAuth: ServerAuthResult = {
        isAuthenticated: true,
        userId: "staff_editor",
        role: "CLIENT",
        isAstrologer: false,
        isAdmin: false,
        isOwner: false,
        email: "editor@aapkaastro.com",
        permissions: ["content"],
        grants: [
          {
            id: "grant_content_view",
            email: "editor@aapkaastro.com",
            section: "content",
            accessLevel: "VIEW",
            grantedAt: new Date().toISOString(),
            revokedAt: null,
          },
        ],
      };

      assert.equal(hasStaffSectionAccess(viewStaffAuth, "content", "VIEW"), true);
      assert.equal(hasStaffSectionAccess(viewStaffAuth, "content", "MANAGE"), false);

      const manageStaffAuth: ServerAuthResult = {
        isAuthenticated: true,
        userId: "staff_manager",
        role: "CLIENT",
        isAstrologer: false,
        isAdmin: false,
        isOwner: false,
        email: "manager@aapkaastro.com",
        permissions: ["content"],
        grants: [
          {
            id: "grant_content_manage",
            email: "manager@aapkaastro.com",
            section: "content",
            accessLevel: "MANAGE",
            grantedAt: new Date().toISOString(),
            revokedAt: null,
          },
        ],
      };

      assert.equal(hasStaffSectionAccess(manageStaffAuth, "content", "VIEW"), true);
      assert.equal(hasStaffSectionAccess(manageStaffAuth, "content", "MANAGE"), true);
    });

    it("strictly blocks regular clients without permissions", () => {
      const regularClientAuth: ServerAuthResult = {
        isAuthenticated: true,
        userId: "seeker_123",
        role: "CLIENT",
        isAstrologer: false,
        isAdmin: false,
        isOwner: false,
        email: "client@example.com",
        permissions: [],
        grants: [],
      };

      assert.equal(hasStaffSectionAccess(regularClientAuth, "content", "VIEW"), false);
      assert.equal(hasStaffSectionAccess(regularClientAuth, "content", "MANAGE"), false);
    });
  });

  describe("ContentStudioService Logic & Defaults", () => {
    it("returns default content structure when initialized", async () => {
      const content = await ContentStudioService.getContent();
      assert.ok(content.contact);
      assert.ok(content.social);
      assert.ok(content.hero);
      assert.ok(Array.isArray(content.faqs));
      assert.ok(content.faqs.length >= 6);

      // Verify contact details fallback
      assert.ok(content.contact.phone);
      assert.ok(content.contact.email);

      // Verify hero text
      assert.ok(content.hero.headline);
      assert.ok(content.hero.subheadline);
    });

    it("adds, edits, toggles, and deletes FAQs accurately", async () => {
      const testEmail = "aapkaastro1606@gmail.com";
      const initial = await ContentStudioService.getContent();
      const initialCount = initial.faqs.length;

      // 1. Add FAQ
      const addedData = await ContentStudioService.addFaq(
        {
          q: "Test Question What is Astrology?",
          a: "Astrology is the study of cosmic movements and their influence on earthly lives.",
          category: "general",
          isActive: true,
        },
        testEmail
      );

      const addedFaq = addedData.faqs.find((f) => f.q === "Test Question What is Astrology?");
      assert.ok(addedFaq, "Newly added FAQ must exist in returned list");
      assert.equal(addedFaq.isActive, true);
      assert.equal(addedData.faqs.length, initialCount + 1);

      // 2. Toggle FAQ active status
      const toggledData = await ContentStudioService.toggleFaqActive(addedFaq.id, testEmail);
      const toggledFaq = toggledData.faqs.find((f) => f.id === addedFaq.id);
      assert.ok(toggledFaq);
      assert.equal(toggledFaq.isActive, false, "FAQ should now be inactive");

      // 3. Update FAQ text
      const updatedData = await ContentStudioService.updateFaq(
        addedFaq.id,
        { a: "Updated answer explaining Jyotish Shastra." },
        testEmail
      );
      const updatedFaq = updatedData.faqs.find((f) => f.id === addedFaq.id);
      assert.ok(updatedFaq);
      assert.equal(updatedFaq.a, "Updated answer explaining Jyotish Shastra.");

      // 4. Delete FAQ
      const deletedData = await ContentStudioService.deleteFaq(addedFaq.id, testEmail);
      const deletedFaq = deletedData.faqs.find((f) => f.id === addedFaq.id);
      assert.equal(deletedFaq, undefined, "FAQ must be removed after deletion");
      assert.equal(deletedData.faqs.length, initialCount);
    });
  });

  describe("Public /api/content Route", () => {
    it("returns public content with only active FAQs and reviews", async () => {
      const res = await publicContentGet();
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.content);
      assert.ok(Array.isArray(json.content.faqs));

      // All returned FAQs must have isActive === true
      for (const faq of json.content.faqs) {
        assert.equal(faq.isActive, true, `FAQ ${faq.id} in public response must be active`);
      }

      // Verify contact and social are present
      assert.ok(json.content.contact.phone);
      assert.ok(json.content.social.instagram);
    });
  });

  describe("Admin /api/admin/content Access Control", () => {
    it("fails closed with 401 for unauthenticated requests", async () => {
      const req = new NextRequest("http://localhost/api/admin/content", {
        method: "GET",
      });

      const res = await adminContentGet(req);
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
    });

    it("fails closed with 401 on POST for unauthenticated requests", async () => {
      const req = new NextRequest("http://localhost/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ action: "add_faq", faq: { q: "Q?", a: "A" } }),
      });

      const res = await adminContentPost(req);
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
    });
  });
});
