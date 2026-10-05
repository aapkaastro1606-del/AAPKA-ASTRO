import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_FEATURED_REELS, INSTAGRAM_PROFILE_URL, INSTAGRAM_HANDLE } from "../src/config/featuredReels";
import { ReelsStore } from "../src/lib/store/reelsStore";

test("Featured Reels Config: contains verified Instagram profile and real-format reel entries", () => {
  assert.strictEqual(
    INSTAGRAM_PROFILE_URL,
    "https://www.instagram.com/aapkaastrologer/",
    "Profile URL must point to https://www.instagram.com/aapkaastrologer/"
  );
  assert.strictEqual(
    INSTAGRAM_HANDLE,
    "@aapkaastrologer",
    "Handle must be @aapkaastrologer"
  );
  assert.ok(
    DEFAULT_FEATURED_REELS.length >= 2,
    "Must have at least 2 default featured reels"
  );

  for (const reel of DEFAULT_FEATURED_REELS) {
    assert.ok(reel.id, "Reel must have an id");
    assert.match(
      reel.instagramUrl,
      /https:\/\/(www\.)?instagram\.com\/(reel|p)\//,
      `Reel ${reel.id} must have a valid Instagram post/reel URL format`
    );
    assert.ok(reel.caption, "Reel must have a caption");
    assert.ok(["Horoscope", "Vastu", "Gemstone", "Remedy"].includes(reel.category), "Reel must have a valid category");
    assert.strictEqual(typeof reel.pinnedToHome, "boolean");
    assert.strictEqual(typeof reel.isHidden, "boolean");
    assert.strictEqual(typeof reel.order, "number");
  }
});

test("Embed Widget: InstagramReelEmbed uses native oEmbed blockquote and embed.js", () => {
  const embedPath = path.join(process.cwd(), "src/components/reels/InstagramReelEmbed.tsx");
  const content = fs.readFileSync(embedPath, "utf-8");

  assert.ok(
    content.includes('className="instagram-media"'),
    "Must include official class 'instagram-media'"
  );
  assert.ok(
    content.includes('data-instgrm-permalink'),
    "Must include data-instgrm-permalink attribute"
  );
  assert.ok(
    content.includes('data-instgrm-version="14"'),
    "Must specify Instagram oEmbed version"
  );
  assert.ok(
    content.includes("https://www.instagram.com/embed.js"),
    "Must dynamically load official Instagram embed.js script"
  );
  assert.ok(
    content.includes("instgrm.Embeds.process"),
    "Must invoke window.instgrm.Embeds.process() for hydration"
  );
  assert.ok(
    content.includes(INSTAGRAM_PROFILE_URL),
    "Must link directly to Acharya Niraj Kumar's Instagram profile"
  );
});

test("Homepage & Reels Page: Mock Unsplash thumbnails and fake stats are completely eliminated", () => {
  const homePath = path.join(process.cwd(), "src/components/home/InstagramFeedSection.tsx");
  const homeContent = fs.readFileSync(homePath, "utf-8");

  assert.ok(
    !homeContent.includes("images.unsplash.com"),
    "Homepage feed must NOT contain mock Unsplash image URLs"
  );
  assert.ok(
    !homeContent.includes("142.5K"),
    "Homepage feed must NOT contain fake 142.5K view counts"
  );
  assert.ok(
    homeContent.includes("InstagramReelEmbed"),
    "Homepage must render native InstagramReelEmbed component"
  );
  assert.ok(
    homeContent.includes(INSTAGRAM_PROFILE_URL) || homeContent.includes("INSTAGRAM_PROFILE_URL"),
    "Homepage must include direct click-through to https://www.instagram.com/aapkaastrologer/"
  );

  const reelsPagePath = path.join(process.cwd(), "src/app/reels/page.tsx");
  const reelsContent = fs.readFileSync(reelsPagePath, "utf-8");

  assert.ok(
    !reelsContent.includes("images.unsplash.com"),
    "/reels page must NOT contain mock Unsplash image URLs"
  );
  assert.ok(
    !reelsContent.includes("142.5K"),
    "/reels page must NOT contain fake 142.5K view counts"
  );
  assert.ok(
    reelsContent.includes("InstagramReelEmbed"),
    "/reels page must render native InstagramReelEmbed component"
  );
  assert.ok(
    reelsContent.includes(INSTAGRAM_PROFILE_URL) || reelsContent.includes("INSTAGRAM_PROFILE_URL"),
    "/reels page must link to https://www.instagram.com/aapkaastrologer/"
  );
});

test("ReelsStore: Supports adding, reordering, pinning, hiding, and removing reels dynamically", () => {
  ReelsStore.resetToDefaults();
  const initialCount = ReelsStore.getAllReels().length;

  // Add reel
  const added = ReelsStore.addReel({
    instagramUrl: "https://www.instagram.com/reel/TEST_REEL_123/",
    caption: "Test Jyotish Reel",
    category: "Horoscope",
    pinnedToHome: true,
  });
  assert.ok(added.id, "Added reel must receive a unique id");
  assert.strictEqual(ReelsStore.getAllReels().length, initialCount + 1);

  // Pin & Hide toggles
  const initialPin = added.pinnedToHome;
  ReelsStore.togglePin(added.id);
  assert.strictEqual(ReelsStore.getAllReels().find((r) => r.id === added.id)?.pinnedToHome, !initialPin);

  ReelsStore.toggleHide(added.id);
  assert.strictEqual(ReelsStore.getAllReels().find((r) => r.id === added.id)?.isHidden, true);
  assert.ok(!ReelsStore.getVisibleReels().some((r) => r.id === added.id));

  // Reorder
  const firstId = ReelsStore.getAllReels()[0].id;
  ReelsStore.reorderReel(firstId, "down");
  assert.notStrictEqual(ReelsStore.getAllReels()[0].id, firstId);

  // Remove
  ReelsStore.removeReel(added.id);
  assert.strictEqual(ReelsStore.getAllReels().length, initialCount);

  // Reset
  ReelsStore.resetToDefaults();
  assert.strictEqual(ReelsStore.getAllReels().length, initialCount);
});

test("Dashboard Reels: Curation desk supports manual additions, reordering, and informs about interim oEmbed step", () => {
  const deskPath = path.join(process.cwd(), "src/app/dashboard/reels/ReelsManagerClient.tsx");
  const content = fs.readFileSync(deskPath, "utf-8");

  assert.ok(
    content.includes("Add Featured Reel"),
    "Curation desk must include button to add featured reel"
  );
  assert.ok(
    content.includes("handleReorder"),
    "Curation desk must support moving reels up/down"
  );
  assert.ok(
    content.includes("handleRemove"),
    "Curation desk must support deleting/removing reels"
  );
  assert.ok(
    content.includes("Interim Native Instagram Embed Active"),
    "Curation desk must document the interim native oEmbed workflow"
  );
  assert.ok(
    content.includes("Meta Graph API"),
    "Curation desk must explain future compatibility with Meta Graph API"
  );
});
