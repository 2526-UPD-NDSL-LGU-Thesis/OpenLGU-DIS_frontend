import { describe, expect, it } from "vitest"

import { getRedirectTarget } from "./redirect-target"

describe("getRedirectTarget", () => {
  it("uses href directly when available", () => {
    expect(
      getRedirectTarget({
        href: "/id-management?tab=1",
        pathname: "/id-management",
      })
    ).toBe("/id-management?tab=1")
  })

  it("falls back to pathname + searchStr + hash when href is missing", () => {
    expect(
      getRedirectTarget({
        pathname: "/service-claim",
        searchStr: "?page=2",
        hash: "#section-a",
      })
    ).toBe("/service-claim?page=2#section-a")
  })
})
