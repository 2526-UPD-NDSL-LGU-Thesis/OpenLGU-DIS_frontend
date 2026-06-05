// TODO I feel like we should consolidate access policies into one file

import type { AuthStateSnapshot } from "#/features/auth/auth-session-service";

import { userRolesListSchema } from "#/types/schema";

const allowdRolesSchema = userRolesListSchema.extract([
  "Super",
  "Sector Admin",
  "Sector Employee",
])



const SECTOR_MANAGEMENT_ALLOWED_ROLES = new Set([
  "SUPER",
  "SECTOR_ADMIN",
  "SECTOR_EMPLOYEE",
])

const SECTOR_MANAGE_ALLOWED_ROLES = new Set([ // TODO why did I need this?
  "Super",
  "Sector Admin",
])

export function canAccessSectorManagement(authState: AuthStateSnapshot): boolean {
  if (authState.phase !== "authenticated" || !authState.userProfile) {
    return false
  }

  const hasMatch = authState.userProfile.roles.some(role => allowdRolesSchema.safeParse(role) .success)
  return hasMatch;
}

export function canManageSectors(authState: AuthStateSnapshot): boolean {
  if (authState.phase !== "authenticated" || !authState.userProfile) {
    return false
  }

  return authState.userProfile.roles.some((role) =>
    SECTOR_MANAGE_ALLOWED_ROLES.has(role)
  )
}
