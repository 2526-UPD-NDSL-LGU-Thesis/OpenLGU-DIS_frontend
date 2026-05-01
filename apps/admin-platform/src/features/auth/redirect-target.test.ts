import { describe, expect, it } from "vitest"

import { getRedirectTarget } from "./redirect-target"

describe("getRedirectTarget", () => {
  it("uses href directly when available", () => {
    expect(
      getRedirectTarget({
        href: "/_authenticated/id-registration?tab=1",
        pathname: "/_authenticated/id-registration",
      })
    ).toBe("/_authenticated/id-registration?tab=1")
  })

  it("falls back to pathname + searchStr + hash when href is missing", () => {
    expect(
      getRedirectTarget({
        pathname: "/_authenticated/service-claim",
        searchStr: "?page=2",
        hash: "#section-a",
      })
    ).toBe("/_authenticated/service-claim?page=2#section-a")
  })
})
