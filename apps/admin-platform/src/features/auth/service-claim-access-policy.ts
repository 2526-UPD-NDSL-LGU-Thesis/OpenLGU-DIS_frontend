import type { AuthStateSnapshot } from "./auth-session-service";
import { userRolesListSchema } from "#/types/schema";

const allowdRolesSchema = userRolesListSchema.extract([
  "Super",
  "Service Admin",
  "Service Employee",
  "Service Claim Admin",
  "Service Claim Employee"
])



export function canAccessServiceClaim(authState: AuthStateSnapshot): boolean {
  if (authState.phase !== "authenticated" || !authState.userProfile) {
    return false
  }

  const hasMatch = authState.userProfile.roles.some(role => allowdRolesSchema.safeParse(role) .success)
  return hasMatch;
}
