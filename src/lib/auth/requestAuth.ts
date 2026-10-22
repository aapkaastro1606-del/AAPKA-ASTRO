import { NextRequest } from "next/server";
import { UserRole, isAstrologerRole, isAdminRole } from "./roles";
import {
  isOwnerEmail,
  StaffPermissionService,
  STAFF_SECTIONS,
  StaffSection,
  StaffGrant,
  AccessLevel,
} from "./staffPermissions";

export interface RequestAuthResult {
  isAuthenticated: boolean;
  userId: string | null;
  clerkId: string | null;
  role: UserRole | null;
  isAstrologer: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  email: string | null;
  permissions: StaffSection[];
  grants: StaffGrant[];
}

export const UNAUTHENTICATED_REQUEST_RESULT: RequestAuthResult = {
  isAuthenticated: false,
  userId: null,
  clerkId: null,
  role: null,
  isAstrologer: false,
  isAdmin: false,
  isOwner: false,
  email: null,
  permissions: [],
  grants: [],
};

/**
 * Legacy Request Auth helper.
 * Strictly hardened: No identity may be derived from browser-set cookies or headers.
 * All API routes and Server Components must use getServerAuthUser().
 */
export function getAuthFromRequest(_req?: NextRequest): RequestAuthResult {
  return UNAUTHENTICATED_REQUEST_RESULT;
}
