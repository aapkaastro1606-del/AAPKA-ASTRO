import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ContactContentSchema,
  SocialContentSchema,
  TestimonialContentSchema,
  TrustMetricSchema,
  HeroCarouselItemSchema,
  AboutSectionSchema,
  CredentialItemSchema,
  PhotoGalleryItemSchema,
  PopupConfigSchema,
  LegalPageSchema,
} from "../src/lib/content/contentSchemas";
import { retrieveRelevantKnowledge } from "../src/lib/assistant/retriever";

describe("Client-Manageable Collections - Section 7 Verification", () => {
  describe("1. Site Settings & Schema Validations", () => {
    it("validates ContactContentSchema with separate public email and footer tagline", () => {
      const validContact = {
        phone: "+91 931-121-5564",
        phoneRaw: "+919311215564",
        whatsapp: "+91 93112 15564",
        whatsappLink: "https://wa.me/919311215564",
        email: "contact@aapkaastro.com", // public contact email, separate from owner login
        sanctumCity: "Noida, G.B. Nagar - U.P. 201301",
        address: "Unit No. A-1212 D, Tower A, Spectrum@Metro",
        operatingHours: "Monday – Sunday: 7:00 AM – 11:00 PM IST",
        footerTagline: "Where Spiritual Science Meets Corporate Insight",
      };

      const result = ContactContentSchema.safeParse(validContact);
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.email, "contact@aapkaastro.com");
        assert.equal(result.data.footerTagline, "Where Spiritual Science Meets Corporate Insight");
      }
    });

    it("validates SocialContentSchema with optional LinkedIn profile", () => {
      const social = {
        instagram: { name: "Instagram", url: "https://instagram.com/aapkaastrologer", handle: "@aapkaastrologer", enabled: true },
        youtube: { name: "YouTube", url: "https://youtube.com/@aapkaastro", handle: "@aapkaastro", enabled: true },
        facebook: { name: "Facebook", url: "https://facebook.com/aapkaastro", handle: "aapkaastro", enabled: true },
        linkedin: { name: "LinkedIn", url: "https://linkedin.com/in/acharya-niraj-kumar", handle: "acharya-niraj-kumar", enabled: true },
      };

      const result = SocialContentSchema.safeParse(social);
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.linkedin?.url, "https://linkedin.com/in/acharya-niraj-kumar");
      }
    });
  });

  describe("2. Testimonials Mandatory Consent Note & Date", () => {
    it("fails validation when consentNote is missing or empty", () => {
      const invalidReview = {
        clientName: "Rahul Verma",
        city: "Mumbai",
        service: "Vedic Consultation",
        stars: 5,
        text: "Accurate guidance on planetary periods.",
        date: "2026-03-15",
        consentNote: "", // EMPTY: must fail
        verified: true,
      };

      const result = TestimonialContentSchema.safeParse(invalidReview);
      assert.equal(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues[0].message.includes("consent note is required"));
      }
    });

    it("passes validation when consentNote and date are provided", () => {
      const validReview = {
        clientName: "Rahul Verma",
        city: "Mumbai",
        service: "Vedic Consultation",
        stars: 5,
        text: "Accurate guidance on planetary periods.",
        date: "2026-03-15",
        consentNote: "Explicit client consent recorded on file via WhatsApp on 15 March 2026.",
        verified: true,
      };

      const result = TestimonialContentSchema.safeParse(validReview);
      assert.equal(result.success, true);
    });
  });

  describe("3. Homepage & Trust Metrics Verification", () => {
    it("validates trust metrics schema", () => {
      const metric = {
        label: "Years Vedic Mastery",
        value: "20+",
        warningAcknowledged: true,
      };
      const result = TrustMetricSchema.safeParse(metric);
      assert.equal(result.success, true);
    });

    it("validates hero carousel item schema", () => {
      const slide = {
        imageUrl: "/images/Acharya_Niraj_Kumar.jpg",
        caption: "Acharya Niraj Kumar at consultation desk",
        order: 1,
        visible: true,
      };
      const result = HeroCarouselItemSchema.safeParse(slide);
      assert.equal(result.success, true);
    });
  });

  describe("4. About Page Sections, Credentials & Gallery", () => {
    it("validates about section schema", () => {
      const sec = {
        title: "Ancient Wisdom & Modern Life",
        body: "Authentic Parashari Jyotish and Devta Vastu.",
      };
      const result = AboutSectionSchema.safeParse(sec);
      assert.equal(result.success, true);
    });

    it("validates credential item schema with optional certificate image", () => {
      const cred = {
        title: "Jyotish Acharya",
        issuer: "Bhartiya Vidya Bhawan, New Delhi",
        year: "2006",
        certificateImage: "/images/Acharya_Niraj_Kumar.jpg",
      };
      const result = CredentialItemSchema.safeParse(cred);
      assert.equal(result.success, true);
    });

    it("validates photo gallery item schema", () => {
      const photo = {
        imageUrl: "/images/Acharya_Niraj_Kumar.jpg",
        caption: "Sanctum consultation",
      };
      const result = PhotoGalleryItemSchema.safeParse(photo);
      assert.equal(result.success, true);
    });
  });

  describe("5. Popups & Legal Pages", () => {
    it("validates popup schema for welcome and festival promotions", () => {
      const popup = {
        type: "welcome",
        headline: "Flat 50% Off First Consultation",
        text: "Special introductory blessing for first-time seekers.",
        image: "/images/Acharya_Niraj_Kumar.jpg",
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        enabled: true,
      };
      const result = PopupConfigSchema.safeParse(popup);
      assert.equal(result.success, true);
    });

    it("validates legal page schema with pendingLawyerReview flag", () => {
      const legalDoc = {
        slug: "terms",
        title: "Terms of Service & Consultation Agreement",
        content: "Official terms and conditions governing use of Aapka Astro.",
        pendingLawyerReview: true,
        lastUpdated: "March 2026",
      };
      const result = LegalPageSchema.safeParse(legalDoc);
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.pendingLawyerReview, true);
      }
    });
  });

  describe("6. AI Chatbot Retriever Single Source of Truth", () => {
    it("falls back cleanly to static site knowledge when db is empty or offline", async () => {
      const results = await retrieveRelevantKnowledge("What is Sade Sati?");
      assert.equal(typeof results, "object");
      assert.equal(Array.isArray(results.sections), true);
      assert.ok(results.sections.length > 0);
      assert.ok(results.sections[0].content.length > 0);
    });
  });
});
