import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { HERO_SLIDES } from "../src/components/home/HeroImageCarousel";

describe("Hero Section Auto-Rotating Image Carousel", () => {
  const rootDir = process.cwd();

  it("verifies all carousel slides use confirmed real photo assets on disk", () => {
    assert.ok(HERO_SLIDES.length >= 5, "Carousel must contain at least 5 credential photos");

    for (const slide of HERO_SLIDES) {
      assert.ok(slide.src.startsWith("/") || slide.src.startsWith("/gallery/"), `Slide src must be absolute web path: ${slide.src}`);
      assert.ok(slide.alt && slide.alt.length > 5, `Slide must have descriptive accessibility alt: ${slide.alt}`);
      assert.ok(slide.badge && slide.badge.length > 3, `Slide must have honest trust badge: ${slide.badge}`);
      assert.ok(slide.caption && slide.caption.length > 5, `Slide must have credential caption: ${slide.caption}`);

      // Verify asset exists in public folder
      const diskPath = path.join(rootDir, "public", slide.src.replace(/^\//, ""));
      assert.ok(
        fs.existsSync(diskPath),
        `Referenced image file must exist on disk at public/${slide.src}: ${diskPath}`
      );
    }
  });

  it("verifies HeroImageCarousel component implements 5-second auto-advance and smooth crossfade", () => {
    const carouselPath = path.join(rootDir, "src/components/home/HeroImageCarousel.tsx");
    assert.ok(fs.existsSync(carouselPath), "HeroImageCarousel.tsx must exist");
    const content = fs.readFileSync(carouselPath, "utf-8");

    // 5-second interval
    assert.ok(
      content.includes("5000"),
      "Carousel must auto-advance every 5 seconds (5000ms)"
    );

    // Crossfade transition (opacity-based, not sliding/swipe)
    assert.ok(
      content.includes("transition-opacity") && content.includes("duration-700"),
      "Carousel must use smooth crossfade opacity transition (duration-700)"
    );
    assert.doesNotMatch(
      content,
      /translate-x|translateX/,
      "Carousel must avoid busy sliding/swipe translate animations in favor of smooth crossfade"
    );
  });

  it("verifies carousel pauses auto-advance on hover and touch interaction", () => {
    const carouselPath = path.join(rootDir, "src/components/home/HeroImageCarousel.tsx");
    const content = fs.readFileSync(carouselPath, "utf-8");

    assert.ok(
      content.includes("onMouseEnter") && content.includes("onMouseLeave"),
      "Carousel must pause on mouse hover (desktop)"
    );
    assert.ok(
      content.includes("onTouchStart") && content.includes("onTouchEnd"),
      "Carousel must pause on touch interaction (mobile)"
    );
  });

  it("verifies carousel respects prefers-reduced-motion accessibility preference", () => {
    const carouselPath = path.join(rootDir, "src/components/home/HeroImageCarousel.tsx");
    const content = fs.readFileSync(carouselPath, "utf-8");

    assert.ok(
      content.includes("prefers-reduced-motion: reduce"),
      "Carousel must inspect prefers-reduced-motion system setting"
    );
    assert.ok(
      content.includes("prefersReducedMotion"),
      "Carousel state must track prefersReducedMotion"
    );
  });

  it("verifies subtle warm-gold dot indicators and manual next/prev controls are present", () => {
    const carouselPath = path.join(rootDir, "src/components/home/HeroImageCarousel.tsx");
    const content = fs.readFileSync(carouselPath, "utf-8");

    // Subtle dots
    assert.ok(
      content.includes('role="tablist"') || content.includes('role="tab"'),
      "Carousel must render accessible navigation dots with tab roles"
    );
    assert.ok(
      content.includes("#C1662F") || content.includes("#E8A33D"),
      "Dots must be styled in the warm gold / saffron brand palette"
    );

    // Manual next/prev controls
    assert.ok(
      content.includes("goToPrev") && content.includes("goToNext"),
      "Carousel must provide manual previous and next navigation controls"
    );
  });

  it("verifies Hero component wires HeroImageCarousel in place of the static image", () => {
    const heroPath = path.join(rootDir, "src/components/home/Hero.tsx");
    const content = fs.readFileSync(heroPath, "utf-8");

    assert.ok(
      content.includes("import { HeroImageCarousel }"),
      "Hero.tsx must import HeroImageCarousel"
    );
    assert.ok(
      content.includes("<HeroImageCarousel />") || content.includes("<HeroImageCarousel"),
      "Hero.tsx must render <HeroImageCarousel />"
    );
  });
});
