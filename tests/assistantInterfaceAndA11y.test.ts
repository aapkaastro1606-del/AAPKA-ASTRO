import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  isAllowedAssistantUrl,
  renderSafeAssistantContent,
} from "../src/components/assistant/FloatingAssistant";

describe("Floating AI Assistant Interface & Accessibility Suite", () => {
  const componentPath = path.join(
    process.cwd(),
    "src/components/assistant/FloatingAssistant.tsx"
  );
  const fileContent = fs.readFileSync(componentPath, "utf-8");

  // ==========================================================================
  // 1. Logo as Cover Image & Brand Style
  // ==========================================================================
  describe("1. Cover Image & Brand Styling", () => {
    test("uses the official website logo as the cover image in both trigger and dialog", () => {
      assert.ok(
        fileContent.includes('src="/images/logo.png"'),
        "Must use /images/logo.png as the cover logo"
      );
      assert.ok(
        fileContent.includes('alt="Aapka Astro Logo"') ||
        fileContent.includes('alt="Aapka Astro Official Logo"'),
        "Must provide accessible alt text for the logo"
      );
    });

    test("floating button has an accessible name and brand styling", () => {
      assert.ok(
        fileContent.includes('aria-label={isHi ? "AI सहायक खोलें" : "Open Aapka Astro AI Assistant"}'),
        "Must have bilingual accessible aria-label on trigger"
      );
      assert.ok(fileContent.includes("bg-gradient-to-r from-[#7B2D26]"));
    });
  });

  // ==========================================================================
  // 2. Panel Dimensions & Mobile Sheet (390px Phone Compatibility)
  // ==========================================================================
  describe("2. Panel Dimensions & Full-Height Mobile Sheet", () => {
    test("enforces ~380x560 on desktop and full-height sheet on mobile", () => {
      assert.ok(
        fileContent.includes("sm:w-[380px]"),
        "Must specify 380px width on desktop"
      );
      assert.ok(
        fileContent.includes("sm:h-[560px]"),
        "Must specify 560px height on desktop"
      );
      assert.ok(
        fileContent.includes("fixed inset-0 sm:inset-auto"),
        "Must expand to full viewport sheet on mobile devices"
      );
      assert.ok(
        fileContent.includes("max-h-[100dvh] sm:max-h-[560px]"),
        "Must handle dynamic viewport height on mobile"
      );
    });

    test("starts closed and does not open automatically", () => {
      assert.ok(
        fileContent.includes("const [isOpen, setIsOpen] = useState(false);"),
        "Assistant must default to closed (isOpen = false)"
      );
    });
  });

  // ==========================================================================
  // 3. Header, AI Badge, 4 Chips, New Chat & Close Controls
  // ==========================================================================
  describe("3. Header, AI Badge & Suggested Question Chips", () => {
    test("header contains assistant name and 'AI Assistant' badge", () => {
      assert.ok(fileContent.includes("Aapka Astro Assistant") || fileContent.includes("Aapka Astro AI सहायक"));
      assert.ok(fileContent.includes("AI Assistant"), "Must contain 'AI Assistant' badge");
    });

    test("header contains 'New Chat' reset control and close button", () => {
      assert.ok(fileContent.includes("handleNewChat"), "Must provide handleNewChat handler");
      assert.ok(fileContent.includes("RotateCcw"), "Must render New Chat icon");
      assert.ok(fileContent.includes("aria-label={isHi ? \"सहायक बंद करें\" : \"Close Assistant\"}"));
    });

    test("contains exactly 4 suggested-question chips", () => {
      assert.ok(fileContent.includes("const CHIPS_EN = ["));
      assert.ok(fileContent.includes("const CHIPS_HI = ["));

      // Verify 4 chips exist in arrays
      const chipsEnMatch = fileContent.match(/const CHIPS_EN = \[([\s\S]*?)\];/);
      assert.ok(chipsEnMatch);
      const enEntries = (chipsEnMatch[1].match(/label:/g) || []).length;
      assert.strictEqual(enEntries, 4, "Must contain exactly four suggested chips in English");

      const chipsHiMatch = fileContent.match(/const CHIPS_HI = \[([\s\S]*?)\];/);
      assert.ok(chipsHiMatch);
      const hiEntries = (chipsHiMatch[1].match(/label:/g) || []).length;
      assert.strictEqual(hiEntries, 4, "Must contain exactly four suggested chips in Hindi");
    });

    test("includes typing indicator when loading", () => {
      assert.ok(fileContent.includes("aria-label=\"Assistant is typing\""));
      assert.ok(fileContent.includes("animate-bounce"));
    });
  });

  // ==========================================================================
  // 4. Keyboard Accessibility & Motion Reduction
  // ==========================================================================
  describe("4. Accessibility (Focus Trap, Escape, Aria-Live, Reduced Motion)", () => {
    test("implements focus trap inside dialog", () => {
      assert.ok(fileContent.includes("focusableElements[0]"));
      assert.ok(fileContent.includes("e.shiftKey"));
      assert.ok(fileContent.includes("firstElement.focus()"));
      assert.ok(fileContent.includes("lastElement.focus()"));
    });

    test("Escape key closes the panel and restores focus to trigger", () => {
      assert.ok(fileContent.includes('e.key === "Escape"'));
      assert.ok(fileContent.includes("setIsOpen(false)"));
      assert.ok(fileContent.includes("triggerButtonRef.current?.focus()"));
    });

    test("aria-live region announces new assistant messages", () => {
      assert.ok(fileContent.includes('aria-live="polite"'));
      assert.ok(fileContent.includes('aria-atomic="false"'));
    });

    test("respects prefers-reduced-motion media query", () => {
      assert.ok(fileContent.includes("motion-reduce:animate-none"));
      assert.ok(fileContent.includes("motion-reduce:transition-none"));
    });

    test("enforces visible focus rings on interactive elements", () => {
      assert.ok(fileContent.includes("focus-visible:ring-2"));
      assert.ok(fileContent.includes("focus-visible:ring-[#7B2D26]"));
    });
  });

  // ==========================================================================
  // 5. Route Hiding (/admin, /dashboard, /instructor, checkout/booking)
  // ==========================================================================
  describe("5. Route Hiding Rules", () => {
    test("hides assistant widget on /admin, /dashboard, /instructor, /checkout and booking", () => {
      assert.ok(fileContent.includes('pathname.startsWith("/admin")'));
      assert.ok(fileContent.includes('pathname.startsWith("/dashboard")'));
      assert.ok(fileContent.includes('pathname.startsWith("/instructor")'));
      assert.ok(fileContent.includes('pathname.startsWith("/checkout")'));
      assert.ok(fileContent.includes('pathname.startsWith("/booking")'));
    });
  });

  // ==========================================================================
  // 6. Safe Markdown & URL Allowlist
  // ==========================================================================
  describe("6. Safe Markdown & URL Allowlist (Zero HTML Injection)", () => {
    test("isAllowedAssistantUrl allows internal paths, site canonicals, WhatsApp, and tel", () => {
      assert.strictEqual(isAllowedAssistantUrl("/consult"), true);
      assert.strictEqual(isAllowedAssistantUrl("/pricing-policy"), true);
      assert.strictEqual(isAllowedAssistantUrl("https://www.aapkaastro.com/consult"), true);
      assert.strictEqual(isAllowedAssistantUrl("https://wa.me/919311215564"), true);
      assert.strictEqual(isAllowedAssistantUrl("tel:+919311215564"), true);
    });

    test("isAllowedAssistantUrl rejects external domains, javascript, and data URIs", () => {
      assert.strictEqual(isAllowedAssistantUrl("https://malicious-site.com"), false);
      assert.strictEqual(isAllowedAssistantUrl("javascript:alert(1)"), false);
      assert.strictEqual(isAllowedAssistantUrl("data:text/html;base64,..."), false);
      assert.strictEqual(isAllowedAssistantUrl("//external-domain.com"), false);
    });

    test("never uses dangerouslySetInnerHTML", () => {
      assert.ok(
        !fileContent.includes("dangerouslySetInnerHTML"),
        "Must NOT use dangerouslySetInnerHTML in FloatingAssistant"
      );
    });
  });

  // ==========================================================================
  // 7. SessionStorage & Footer Note
  // ==========================================================================
  describe("7. SessionStorage Persistence & Privacy Footer Note", () => {
    test("persists conversation strictly in sessionStorage under dedicated key", () => {
      assert.ok(fileContent.includes('const STORAGE_KEY = "aapka_astro_chat_history";'));
      assert.ok(fileContent.includes("sessionStorage.getItem(STORAGE_KEY)"));
      assert.ok(fileContent.includes("sessionStorage.setItem(STORAGE_KEY"));
      assert.ok(fileContent.includes("sessionStorage.removeItem(STORAGE_KEY)"));
    });

    test("renders mandatory footer note with Privacy Policy link", () => {
      assert.ok(
        fileContent.includes("AI assistant. Answers may be imperfect. For personal guidance please contact us.")
      );
      assert.ok(
        fileContent.includes("AI सहायक। उत्तर अपूर्ण हो सकते हैं। व्यक्तिगत मार्गदर्शन के लिए संपर्क करें।")
      );
      assert.ok(fileContent.includes('href="/privacy-policy"'));
    });
  });

  // ==========================================================================
  // 8. Error Handling & Pre-filled WhatsApp Escalation
  // ==========================================================================
  describe("8. Error Handling & Always-Available Escalation", () => {
    test("pre-fills WhatsApp link with visitor's last question", () => {
      assert.ok(fileContent.includes("prefilledWhatsappUrl"));
      assert.ok(fileContent.includes("Namaste Acharya Ji, ${lastUserQuestion}"));
    });

    test("escalation bar with WhatsApp, Call, and Booking link is always available", () => {
      assert.ok(fileContent.includes("tel:+919311215564"));
      assert.ok(fileContent.includes("/consult?product=astro&offer=FIRST1051"));
    });
  });
});
