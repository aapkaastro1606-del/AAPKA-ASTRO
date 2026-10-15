"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClerkProvider as RealClerkProvider,
  UserButton as RealUserButton,
  SignIn as RealSignIn,
  SignUp as RealSignUp,
  useUser as useRealUser,
  useAuth as useRealAuth,
} from "@clerk/nextjs";
import { LogIn, Sparkles } from "lucide-react";
import { isClerkConfigured } from "@/lib/auth/clerkConfig";
import { ClerkRoleBridge } from "@/lib/auth/roleContext";

export { isClerkConfigured };

// ==============================================================================
// 1. ROOT CLERK PROVIDER
// ==============================================================================

export const AstroClerkProvider: React.FC<{
  children: React.ReactNode;
  publishableKey?: string;
  domain?: string;
  isSatellite?: boolean;
  signInUrl?: string;
  signUpUrl?: string;
  signInForceRedirectUrl?: string;
  signUpForceRedirectUrl?: string;
  signInFallbackRedirectUrl?: string;
  signUpFallbackRedirectUrl?: string;
  appearance?: any;
}> = (props) => {
  return (
    <RealClerkProvider {...props}>
      <ClerkRoleBridge>{props.children}</ClerkRoleBridge>
    </RealClerkProvider>
  );
};

// ==============================================================================
// 2. ADAPTIVE SHOW COMPONENT (Guarantees zero SSR blank flash)
// ==============================================================================

export const Show: React.FC<{
  when: "signed-in" | "signed-out";
  children: React.ReactNode;
}> = ({ when, children }) => {
  const { isSignedIn, isLoaded } = useRealAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before Clerk finishes loading, render signed-out by default
  // so visitors immediately see "Sign In" and "Sign Up" options with zero blank flash!
  if (!mounted || !isLoaded) {
    return when === "signed-out" ? <>{children}</> : null;
  }

  if (when === "signed-in" && isSignedIn) {
    return <>{children}</>;
  }

  if (when === "signed-out" && !isSignedIn) {
    return <>{children}</>;
  }

  return null;
};

// ==============================================================================
// 3. SEMANTIC SIGN-IN & SIGN-UP CONTROLS
// ==============================================================================

export const SignInButton: React.FC<{
  children?: React.ReactNode;
  mode?: "modal" | "redirect";
  forceRedirectUrl?: string;
  fallbackRedirectUrl?: string;
  signUpForceRedirectUrl?: string;
  signUpFallbackRedirectUrl?: string;
}> = (props) => {
  if (props.children) {
    return (
      <Link href="/login" className="inline-flex">
        {props.children}
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#7B2D26] bg-transparent px-3 py-1.5 text-xs font-bold text-[#7B2D26] hover:bg-[#7B2D26]/10 transition-all cursor-pointer"
    >
      <LogIn className="h-3.5 w-3.5" />
      <span>Sign In</span>
    </Link>
  );
};

export const SignUpButton: React.FC<{
  children?: React.ReactNode;
  mode?: "modal" | "redirect";
  forceRedirectUrl?: string;
  fallbackRedirectUrl?: string;
  signInForceRedirectUrl?: string;
  signInFallbackRedirectUrl?: string;
}> = (props) => {
  if (props.children) {
    return (
      <Link href="/signup" className="inline-flex">
        {props.children}
      </Link>
    );
  }

  return (
    <Link
      href="/signup"
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#7B2D26] bg-[#7B2D26] px-3 py-1.5 text-xs font-bold text-[#FBF3E7] hover:bg-[#64221C] transition-all shadow-xs cursor-pointer"
    >
      <Sparkles className="h-3.5 w-3.5 text-[#E8A33D]" />
      <span>Sign Up</span>
    </Link>
  );
};

// ==============================================================================
// 4. REAL CLERK USER CONTROLS & HOOKS
// ==============================================================================

export const UserButton: React.FC<{ appearance?: any }> = (props) => {
  return <RealUserButton {...props} />;
};

export const SignIn: React.FC<any> = (props) => {
  return <RealSignIn {...props} />;
};

export const SignUp: React.FC<any> = (props) => {
  return <RealSignUp {...props} />;
};

export const useUser = useRealUser;
export const useAuth = useRealAuth;
