import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Service Handoff Audit: Homepage ServicesGrid specifies WhatsApp Call or Google Meet without encrypted connection claims", () => {
  const filePath = path.join(process.cwd(), "src/components/home/ServicesGrid.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(
    content.includes("Direct 1-on-1 session via WhatsApp Call or Google Meet"),
    "ServicesGrid must specify 'Direct 1-on-1 session via WhatsApp Call or Google Meet'"
  );
  assert.ok(
    !content.includes("Live 1-on-1 direct encrypted connection"),
    "ServicesGrid must NOT contain 'Live 1-on-1 direct encrypted connection'"
  );
  assert.ok(
    !content.toLowerCase().includes("encrypted connection"),
    "ServicesGrid must NOT claim an 'encrypted connection'"
  );
});

test("Service Handoff Audit: placeholderContent service config specifies WhatsApp Call or Google Meet", () => {
  const filePath = path.join(process.cwd(), "src/config/placeholderContent.ts");
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(
    content.includes("Direct 1-on-1 session via WhatsApp Call or Google Meet"),
    "placeholderContent must specify 'Direct 1-on-1 session via WhatsApp Call or Google Meet'"
  );
  assert.ok(
    !content.toLowerCase().includes("encrypted connection"),
    "placeholderContent must NOT contain 'encrypted connection'"
  );
});

test("Service Handoff Audit: Services overview page reflects WhatsApp Call and Google Meet", () => {
  const filePath = path.join(process.cwd(), "src/app/services/page.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(
    content.includes("Direct 1-on-1 session via WhatsApp Call or Google Meet"),
    "services/page.tsx must list 'Direct 1-on-1 session via WhatsApp Call or Google Meet'"
  );
  assert.ok(
    !content.toLowerCase().includes("encrypted chat"),
    "services/page.tsx must NOT claim 'encrypted chat'"
  );
});

test("Service Handoff Audit: Terms of Service states consultations are via WhatsApp Call or Google Meet", () => {
  const filePath = path.join(process.cwd(), "src/app/terms/page.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(
    content.includes("conducted directly via WhatsApp Call or Google Meet"),
    "terms/page.tsx must state consultations are conducted directly via WhatsApp Call or Google Meet"
  );
  assert.ok(
    !content.includes("encrypted audio call"),
    "terms/page.tsx must NOT claim 'encrypted audio call'"
  );
});

test("Service Handoff Audit: Vastu consultation confirmation does not imply in-app chat room", () => {
  const filePath = path.join(process.cwd(), "src/app/vastu/page.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(
    !content.includes("Start Live Chat with Acharya Ji Now"),
    "vastu/page.tsx must NOT show 'Start Live Chat with Acharya Ji Now'"
  );
});
