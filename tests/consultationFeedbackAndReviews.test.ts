import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { ContentStudioService, ReviewItem } from "../src/lib/services/contentStudioService";
import { POST as reviewsPost, GET as reviewsGet } from "../src/app/api/reviews/route";
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/db/prisma";

describe("Consultation Feedback & Unified Testimonials Test Suite", () => {
  beforeEach(() => {
    process.env.OWNER_EMAIL = "aapkaastro1606@gmail.com";
  });

  describe("ContentStudioService.getUnifiedReviews", () => {
    it("returns reviews from the unified database and reflects seeker feedback in admin content", async () => {
      const unifiedReviews = await ContentStudioService.getUnifiedReviews();
      assert.ok(Array.isArray(unifiedReviews), "Unified reviews must be an array");
      assert.ok(unifiedReviews.length >= 5, "Must have at least the initial seed reviews or recorded reviews");

      // Verify that every review item conforms to the schema expected by Admin Content Studio
      for (const review of unifiedReviews) {
        assert.ok(typeof review.id === "string" && review.id.length > 0, "Review must have an ID");
        assert.ok(typeof review.clientName === "string" && review.clientName.length > 0, "Review must have a client name");
        assert.ok(typeof review.text === "string" && review.text.length > 0, "Review must have text content");
        assert.ok(typeof review.stars === "number" && review.stars >= 1 && review.stars <= 5, "Stars must be between 1 and 5");
        assert.ok(typeof review.isActive === "boolean", "Review must specify isActive flag for moderation");
      }
    });

    it("getContent() integrates unified reviews into Admin Content Studio schema", async () => {
      const studioContent = await ContentStudioService.getContent();
      assert.ok(studioContent.reviews, "ContentStudio data must have reviews section");
      assert.ok(studioContent.reviews.length >= 5, "Must contain at least 5 reviews in Content Studio");

      // Check if Parnika Grover's feedback is loaded into Content Studio
      const parnikaReview = studioContent.reviews.find(
        (r) =>
          (r.clientName && r.clientName.toLowerCase().includes("parnika")) ||
          (r.text && r.text.toLowerCase().includes("parnika"))
      );
      if (parnikaReview) {
        assert.equal(parnikaReview.stars, 5);
        assert.ok(parnikaReview.text.includes("Acharya ji listened to all my issues"));
      }
    });
  });

  describe("API /api/reviews Route Verification", () => {
    it("fetches reviews list successfully via GET /api/reviews", async () => {
      const req = new NextRequest("http://localhost:3000/api/reviews");
      const res = await reviewsGet(req);
      assert.equal(res.status, 200);

      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.reviews));
      assert.ok(json.reviews.length >= 5);
    });

    it("submits visitor consultation feedback successfully via POST /api/reviews", async () => {
      const testName = "Test Seeker Verification " + Date.now();
      const testComment = "Accurate prediction on my birth chart and practical remedies.";
      const testService = "Voice Call Consultation";

      const req = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: testName,
          service: testService,
          rating: 5,
          comment: testComment,
          bookingId: "TEST-BK-FEEDBACK",
        }),
      });

      const res = await reviewsPost(req);
      assert.ok(res.status === 200 || res.status === 201, `Status should be 200 or 201, got ${res.status}`);

      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.review);
      assert.equal(json.review.clientName, testName);
      assert.equal(json.review.rating, 5);

      // Verify that this review now appears in ContentStudioService.getUnifiedReviews()
      const updatedUnified = await ContentStudioService.getUnifiedReviews();
      const found = updatedUnified.find((r) => r.clientName === testName);
      assert.ok(found, "Newly submitted consultation review must immediately appear in ContentStudio unified reviews");
      assert.equal(found?.stars, 5);
      assert.equal(found?.text, testComment);

      // Clean up test review
      try {
        await prisma.review.deleteMany({
          where: { clientName: testName },
        });
      } catch {}
    });

    it("validates required fields on feedback submission", async () => {
      const req = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: "",
          comment: "",
        }),
      });

      const res = await reviewsPost(req);
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.ok(json.message);
    });
  });
});
