import type { AuthStateSnapshot } from "#/features/auth/auth-session-service"

const SECTOR_MANAGEMENT_ALLOWED_ROLES = new Set([
  "SUPER",
  "SECTOR_ADMIN",
  "SECTOR_EMPLOYEE",
])

const SECTOR_MANAGE_ALLOWED_ROLES = new Set([
  "SUPER",
  "SECTOR_ADMIN",
])

export function canAccessSectorManagement(authState: AuthStateSnapshot): boolean {
  if (authState.phase !== "authenticated" || !authState.identityProfile) {
    return false
  }

  return authState.identityProfile.roles.some((role) =>
    SECTOR_MANAGEMENT_ALLOWED_ROLES.has(role)
  )
}

export function canManageSectors(authState: AuthStateSnapshot): boolean {
  if (authState.phase !== "authenticated" || !authState.identityProfile) {
    return false
  }

  return authState.identityProfile.roles.some((role) =>
    SECTOR_MANAGE_ALLOWED_ROLES.has(role)
  )
}
