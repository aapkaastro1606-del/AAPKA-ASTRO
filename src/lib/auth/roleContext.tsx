"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole, isAstrologerRole, isAdminRole } from "./roles";
import {
  isOwnerEmail,
  StaffPermissionService,
  STAFF_SECTIONS,
  StaffSection,
  hasSectionPermission,
} from "./staffPermissions";
import { useUser as useClerkUser } from "@clerk/nextjs";

export interface CurrentUserRoleState {
  role: UserRole | null;
  isAuthenticated: boolean;
  isAstrologer: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  email: string | null;
  permissions: StaffSection[];
  hasPermission: (section: StaffSection) => boolean;
  isLoading: boolean;
}

const defaultRoleState: CurrentUserRoleState = {
  role: null,
  isAuthenticated: false,
  isAstrologer: false,
  isAdmin: false,
  isOwner: false,
  email: null,
  permissions: [],
  hasPermission: () => false,
  isLoading: true,
};

const RoleContext = createContext<CurrentUserRoleState>(defaultRoleState);

/**
 * Universal hook to inspect current user's role and authorization flags
 * throughout any client component in the tree.
 */
export function useCurrentUserRole(): CurrentUserRoleState {
  return useContext(RoleContext);
}

/**
 * Bridge for Clerk authentication environment
 */
export const ClerkRoleBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useClerkUser();
  const [mounted, setMounted] = useState(false);
  const [fallbackReady, setFallbackReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setFallbackReady(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || (!isLoaded && !fallbackReady)) {
    return (
      <RoleContext.Provider value={{ ...defaultRoleState, isLoading: true }}>
        {children}
      </RoleContext.Provider>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <RoleContext.Provider
        value={{
          role: null,
          isAuthenticated: false,
          isAstrologer: false,
          isAdmin: false,
          isOwner: false,
          email: null,
          permissions: [],
          hasPermission: () => false,
          isLoading: false,
        }}
      >
        {children}
      </RoleContext.Provider>
    );
  }

  const email = user.primaryEmailAddress?.emailAddress || null;
  const isOwner = isOwnerEmail(email);

  let rawRole =
    (user.publicMetadata as any)?.role ||
    (user.unsafeMetadata as any)?.role ||
    "CLIENT";

  if (String(rawRole).toUpperCase() === "OWNER" && !isOwner) {
    rawRole = "CLIENT";
  }

  const role: UserRole = isOwner ? "OWNER" : (String(rawRole).toUpperCase() as UserRole);

  const permissions = isOwner
    ? (STAFF_SECTIONS.map((s) => s.id) as StaffSection[])
    : StaffPermissionService.getPermissionsSync(email || "");

  const isAstrologer = isAstrologerRole(role) || permissions.length > 0;
  const isAdmin = isOwner || isAdminRole(role);

  const hasPermission = (section: StaffSection) =>
    hasSectionPermission({ email, role, permissions }, section);

  return (
    <RoleContext.Provider
      value={{
        role,
        isAuthenticated: true,
        isAstrologer,
        isAdmin,
        isOwner,
        email,
        permissions,
        hasPermission,
        isLoading: false,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

/**
 * Declarative component for conditional rendering by role
 */
export const RoleGate: React.FC<{
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ allowedRoles, children, fallback = null }) => {
  const { role, isAuthenticated, isLoading } = useCurrentUserRole();

  if (isLoading || !isAuthenticated || !role) {
    return <>{fallback}</>;
  }

  if (allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * Declarative component for conditional rendering by staff section permission
 */
export const StaffGate: React.FC<{
  section: StaffSection;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ section, children, fallback = null }) => {
  const { hasPermission, isLoading } = useCurrentUserRole();

  if (isLoading) {
    return null;
  }

  if (hasPermission(section)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
