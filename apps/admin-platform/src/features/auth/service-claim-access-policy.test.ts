import { describe, expect, it } from "vitest"

import { canAccessServiceClaim } from "#/features/auth/service-claim-access-policy"
import type { AuthStateSnapshot } from "#/features/auth/auth-session-service"

describe("canAccessServiceClaim", () => {
  it("allows SUPER role in Authenticated Area", () => {
    const authState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      identityProfile: {
        username: "employee-1",
        roles: ["SUPER"],
      },
    }

    expect(canAccessServiceClaim(authState)).toBe(true)
  })

  it("allows Service Claim Admin and Employee roles in Authenticated Area", () => {
    const authState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      identityProfile: {
        username: "employee-2",
        roles: ["SERVICE_CLAIM_ADMIN", "SERVICE_CLAIM_EMPLOYEE"],
      },
    }

    expect(canAccessServiceClaim(authState)).toBe(true)
  })

  it("denies non-Service-Claim roles and unauthenticated state", () => {
    const unauthorizedRoleState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      identityProfile: {
        username: "employee-3",
        roles: ["ID_MANAGEMENT_EMPLOYEE"],
      },
    }

    const unauthenticatedState: AuthStateSnapshot = {
      phase: "unauthenticated",
      accessToken: null,
      identityProfile: null,
    }

    expect(canAccessServiceClaim(unauthorizedRoleState)).toBe(false)
    expect(canAccessServiceClaim(unauthenticatedState)).toBe(false)
  })
})
