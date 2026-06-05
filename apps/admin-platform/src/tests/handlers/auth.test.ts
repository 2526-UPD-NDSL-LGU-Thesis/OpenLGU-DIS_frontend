import { describe, expect, it } from "vitest"

import { buildMockUserProfile } from "./auth"

describe("mock auth user profile", () => {
  it("maps generic employee usernames to a non-admin role", () => {
    const groups = buildMockUserProfile({ username: "employee-1" }).groups.map(g => g.name)
    expect(groups).toEqual(["ID Management Employee"])
  })

  it("maps explicit super usernames to super", () => {
    const groups = buildMockUserProfile({ username: "super-user" }).groups.map(g => g.name)
    expect(groups).toEqual(["Super"])
  })
})
