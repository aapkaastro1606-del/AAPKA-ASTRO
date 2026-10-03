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

test("Testimonial Audit: Siddharth Malhotra testimonial contains no defined session duration claim", () => {
  const filePath = path.join(process.cwd(), "src/config/placeholderContent.ts");
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(
    !content.includes("45-minute"),
    "placeholderContent must NOT mention '45-minute' in testimonials"
  );
  assert.ok(
    content.includes("Had a live 1-on-1 consultation regarding career expansion and investment timing"),
    "placeholderContent must retain career expansion and investment timing substance"
  );
});

test("Grammar Audit: Refund policy does not contain repeated 'schedule a scheduled'", () => {
  const filePath = path.join(process.cwd(), "src/app/refund-policy/page.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(
    !content.includes("schedule a scheduled"),
    "refund-policy/page.tsx must NOT contain repeated 'schedule a scheduled'"
  );
  assert.ok(
    content.includes("If you have a scheduled consultation slot"),
    "refund-policy/page.tsx must read 'If you have a scheduled consultation slot'"
  );
});

