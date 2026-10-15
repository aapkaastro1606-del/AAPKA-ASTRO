import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { config as middlewareConfig } from "../src/middleware";

describe("Clerk Google OAuth SSO Callback Handshake Verification", () => {
  const rootDir = path.resolve(__dirname, "..");

  it("verifies src/app/login/sso-callback/page.tsx exists and renders AuthenticateWithRedirectCallback", () => {
    const filePath = path.join(rootDir, "src/app/login/sso-callback/page.tsx");
    assert.equal(fs.existsSync(filePath), true, "Route src/app/login/sso-callback/page.tsx must exist");

    const content = fs.readFileSync(filePath, "utf-8");
    assert.equal(content.includes("AuthenticateWithRedirectCallback"), true, "Must import and render AuthenticateWithRedirectCallback");
    assert.equal(content.includes('signInForceRedirectUrl="/account"'), true, "Must redirect authenticated sign-ins to /account");
    assert.equal(content.includes('signUpForceRedirectUrl="/account"'), true, "Must redirect authenticated sign-ups to /account");
    assert.equal(content.includes('"use client"'), true, "Must be client component for browser OAuth processing");
  });

  it("verifies src/app/signup/sso-callback/page.tsx exists and handles sign-up callbacks without 404", () => {
    const filePath = path.join(rootDir, "src/app/signup/sso-callback/page.tsx");
    assert.equal(fs.existsSync(filePath), true, "Route src/app/signup/sso-callback/page.tsx must exist");

    const content = fs.readFileSync(filePath, "utf-8");
    assert.equal(content.includes("AuthenticateWithRedirectCallback"), true, "Must import and render AuthenticateWithRedirectCallback");
    assert.equal(content.includes('signInForceRedirectUrl="/account"'), true, "Must redirect authenticated sign-ins to /account");
    assert.equal(content.includes('signUpForceRedirectUrl="/account"'), true, "Must redirect authenticated sign-ups to /account");
  });

  it("verifies src/app/sso-callback/page.tsx exists for root-level OAuth callbacks", () => {
    const filePath = path.join(rootDir, "src/app/sso-callback/page.tsx");
    assert.equal(fs.existsSync(filePath), true, "Route src/app/sso-callback/page.tsx must exist");

    const content = fs.readFileSync(filePath, "utf-8");
    assert.equal(content.includes("AuthenticateWithRedirectCallback"), true, "Must import and render AuthenticateWithRedirectCallback");
    assert.equal(content.includes('signInForceRedirectUrl="/account"'), true, "Must redirect authenticated sign-ins to /account");
    assert.equal(content.includes('signUpForceRedirectUrl="/account"'), true, "Must redirect authenticated sign-ups to /account");
  });

  it("verifies middleware does not block sso-callback routes", () => {
    const matchers = middlewareConfig.matcher;
    assert.equal(Array.isArray(matchers), true);
    assert.equal(matchers.includes("/__clerk/:path*"), true, "Clerk internal routes must be matched");

    // Public auth routes regex check
    const middlewareFile = path.join(rootDir, "src/middleware.ts");
    const middlewareContent = fs.readFileSync(middlewareFile, "utf-8");

    // Verify protected routes do NOT enclose /login or /signup or /sso-callback
    assert.equal(middlewareContent.includes('createRouteMatcher(["/login'), false, "Login must be public");
    assert.equal(middlewareContent.includes('createRouteMatcher(["/signup'), false, "Signup must be public");
    assert.equal(middlewareContent.includes('createRouteMatcher(["/sso-callback'), false, "SSO callback must be public");
  });

  it("verifies LoginClient and SignupClient configure matching redirect targets to /account", () => {
    const loginClientPath = path.join(rootDir, "src/app/login/LoginClient.tsx");
    const loginContent = fs.readFileSync(loginClientPath, "utf-8");
    assert.equal(
      loginContent.includes('forceRedirectUrl={targetUrl}') || loginContent.includes('forceRedirectUrl="/account"'),
      true,
      "LoginClient must force redirect to targetUrl or /account"
    );
    assert.equal(loginContent.includes('path="/login"'), true, "LoginClient must use path routing at /login");

    const signupClientPath = path.join(rootDir, "src/app/signup/SignupClient.tsx");
    const signupContent = fs.readFileSync(signupClientPath, "utf-8");
    assert.equal(signupContent.includes('forceRedirectUrl="/account"'), true, "SignupClient must force redirect to /account");
    assert.equal(signupContent.includes('path="/signup"'), true, "SignupClient must use path routing at /signup");
  });
});
