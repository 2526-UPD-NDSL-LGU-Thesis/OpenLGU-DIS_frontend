import { describe, expect, it } from "vitest"

import { canAccessServiceClaim } from "#/features/auth/service-claim-access-policy"
import type { AuthStateSnapshot } from "#/features/auth/auth-session-service"

describe("canAccessServiceClaim", () => {
  it("allows SUPER role in Authenticated Area", () => {
    const authState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      userProfile: {
        username: "employee-1",
        roles: ["Super"],
      },
    }

    expect(canAccessServiceClaim(authState)).toBe(true)
  })

  it("allows Service Claim Admin and Employee roles in Authenticated Area", () => {
    const authState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      userProfile: {
        username: "employee-2",
        roles: ["Service Claim Admin", "Service Claim Employee", "Service Admin", "Service Employee"],
      },
    }

    expect(canAccessServiceClaim(authState)).toBe(true)
  })

  it("denies non-Service-Claim roles and unauthenticated state", () => {
    const unauthorizedRoleState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      userProfile: {
        username: "employee-3",
        roles: ["ID Management Employee"],
      },
    }

    const unauthenticatedState: AuthStateSnapshot = {
      phase: "unauthenticated",
      accessToken: null,
      userProfile: null,
    }

    expect(canAccessServiceClaim(unauthorizedRoleState)).toBe(false)
    expect(canAccessServiceClaim(unauthenticatedState)).toBe(false)
  })
})
