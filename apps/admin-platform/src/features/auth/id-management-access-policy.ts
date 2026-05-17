import type { AuthStateSnapshot } from "./auth-session-service";
import { userRolesListSchema } from "#/types/schema";

const allowdRolesSchema = userRolesListSchema.extract([
  "Super",
  "ID Management Admin",
  "ID Management Employee",
])


export function canAccessIdManagement(authState: AuthStateSnapshot): boolean {
  if (authState.phase !== "authenticated" || !authState.userProfile) {
    return false
  }

 
  const hasMatch = authState.userProfile.roles.some(role => allowdRolesSchema.safeParse(role) .success)
  return hasMatch; 
}
