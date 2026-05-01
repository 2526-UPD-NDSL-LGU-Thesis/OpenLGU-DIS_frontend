import { describe, expect, it } from "vitest"

import { canAccessIdRegistration } from "./id-registration-access-policy"
import type { AuthStateSnapshot } from "./auth-session-service"

describe("canAccessIdRegistration", () => {
  it("allows SUPER role in Authenticated Area", () => {
    const authState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "access-token",
      identityProfile: {
        username: "employee-1",
        roles: ["SUPER"],
      },
    }

    expect(canAccessIdRegistration(authState)).toBe(true)
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

    expect(canAccessIdRegistration(authState)).toBe(true)
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

    expect(canAccessIdRegistration(unauthorizedRoleState)).toBe(false)
    expect(canAccessIdRegistration(unauthenticatedState)).toBe(false)
  })
})
