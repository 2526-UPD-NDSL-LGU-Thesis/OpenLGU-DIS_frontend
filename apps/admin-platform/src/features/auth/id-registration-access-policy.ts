import type { AuthStateSnapshot } from "./auth-session-service"

const ID_REGISTRATION_ALLOWED_ROLES = new Set([
  "SUPER",
  "ID_MANAGEMENT_ADMIN",
  "ID_MANAGEMENT_EMPLOYEE",
])

export function canAccessIdRegistration(authState: AuthStateSnapshot): boolean {
  if (authState.phase !== "authenticated" || !authState.identityProfile) {
    return false
  }

  return authState.identityProfile.roles.some((role) => ID_REGISTRATION_ALLOWED_ROLES.has(role))
}
