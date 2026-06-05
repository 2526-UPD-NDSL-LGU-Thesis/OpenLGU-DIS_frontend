import { describe, expect, it } from "vitest"

import { canAccessIdManagement } from "./id-management-access-policy"
import type { AuthStateSnapshot } from "./auth-session-service"

describe("canAccessIdManagement", () => {
  it("allows SUPER role in Authenticated Area", () => {
    const authState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      userProfile: {
        username: "employee-1",
        roles: ["Super"],
      },
    }

    expect(canAccessIdManagement(authState)).toBe(true)
  })

  it("allows ID Management roles in Authenticated Area", () => {
    const authState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      userProfile: {
        username: "employee-2",
        roles: ["ID Management Admin", "ID Management Employee"],
      },
    }

    expect(canAccessIdManagement(authState)).toBe(true)
  })

  it("denies non-ID-management roles and unauthenticated state", () => {
    const unauthorizedRoleState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      userProfile: {
        username: "employee-3",
        roles: ["Service Claim Employee"],
      },
    }

    const unauthenticatedState: AuthStateSnapshot = {
      phase: "unauthenticated",
      accessToken: null,
      userProfile: null,
    }

    expect(canAccessIdManagement(unauthorizedRoleState)).toBe(false)
    expect(canAccessIdManagement(unauthenticatedState)).toBe(false)
  })
})
