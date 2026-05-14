import { describe, expect, it } from "vitest"

import { canAccessIdManagement } from "./id-management-access-policy"
import type { AuthStateSnapshot } from "./auth-session-service"

describe("canAccessIdManagement", () => {
  it("allows SUPER role in Authenticated Area", () => {
    const authState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      identityProfile: {
        username: "employee-1",
        roles: ["SUPER"],
      },
    }

    expect(canAccessIdManagement(authState)).toBe(true)
  })

  it("allows ID Management roles in Authenticated Area", () => {
    const authState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      identityProfile: {
        username: "employee-2",
        roles: ["ID_MANAGEMENT_ADMIN", "ID_MANAGEMENT_EMPLOYEE"],
      },
    }

    expect(canAccessIdManagement(authState)).toBe(true)
  })

  it("denies non-ID-management roles and unauthenticated state", () => {
    const unauthorizedRoleState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      identityProfile: {
        username: "employee-3",
        roles: ["SERVICE_CLAIM_EMPLOYEE"],
      },
    }

    const unauthenticatedState: AuthStateSnapshot = {
      phase: "unauthenticated",
      accessToken: null,
      identityProfile: null,
    }

    expect(canAccessIdManagement(unauthorizedRoleState)).toBe(false)
    expect(canAccessIdManagement(unauthenticatedState)).toBe(false)
  })
})
