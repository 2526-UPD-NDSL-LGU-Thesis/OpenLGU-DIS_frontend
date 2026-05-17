import { describe, expect, it } from "vitest"

import type { AuthStateSnapshot } from "#/features/auth/auth-session-service"

import {
  canAccessSectorManagement,
  canManageSectors,
} from "./sector-access-policy"

describe("sector access policy", () => {
  const unauthenticatedState: AuthStateSnapshot = {
    phase: "unauthenticated",
    accessToken: null,
    userProfile: null,
  }

  it("allows SUPER and sector roles to access sector management", () => {
    const superState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "token",
      userProfile: { username: "super", roles: ["SUPER"] },
    }
    const employeeState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "token",
      userProfile: { username: "employee", roles: ["SECTOR_EMPLOYEE"] },
    }

    expect(canAccessSectorManagement(superState)).toBe(true)
    expect(canAccessSectorManagement(employeeState)).toBe(true)
    expect(canAccessSectorManagement(unauthenticatedState)).toBe(false)
  })

  it("allows only SUPER and sector admins to manage sectors", () => {
    const adminState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "token",
      userProfile: { username: "admin", roles: ["SECTOR_ADMIN"] },
    }
    const employeeState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "token",
      userProfile: { username: "employee", roles: ["SECTOR_EMPLOYEE"] },
    }
    const additiveState: AuthStateSnapshot = {
      phase: "authenticated",
      accessToken: "token",
      userProfile: {
        username: "mixed",
        roles: ["ID_MANAGEMENT_EMPLOYEE", "SECTOR_ADMIN"],
      },
    }

    expect(canManageSectors(adminState)).toBe(true)
    expect(canManageSectors(employeeState)).toBe(false)
    expect(canManageSectors(additiveState)).toBe(true)
  })
})
