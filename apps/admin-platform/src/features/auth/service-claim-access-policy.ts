import type { AuthStateSnapshot } from "./auth-session-service"

const SERVICE_CLAIM_ALLOWED_ROLES = new Set([
  "SUPER",
  "SERVICE_CLAIM_ADMIN",
  "SERVICE_CLAIM_EMPLOYEE",
])

export function canAccessServiceClaim(authState: AuthStateSnapshot): boolean {
  if (authState.phase !== "authenticated" || !authState.identityProfile) {
    return false
  }

  return authState.identityProfile.roles.some((role) => SERVICE_CLAIM_ALLOWED_ROLES.has(role))
}
