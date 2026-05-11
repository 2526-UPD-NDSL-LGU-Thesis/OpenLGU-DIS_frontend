import { describe, expect, it, vi } from "vitest"

import { createClaimSubmissionGuard } from "./claim-submission-guard"

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

describe("createClaimSubmissionGuard", () => {
  it("blocks concurrent submissions while a claim is being created", async () => {
    const guard = createClaimSubmissionGuard()
    const worker = vi.fn(async () => {
      await wait(25)
      return "ok"
    })

    const [first, second] = await Promise.all([
      guard.run(worker),
      guard.run(worker),
    ])

    expect(first).toBe("ok")
    expect(second).toBeNull()
    expect(worker).toHaveBeenCalledTimes(1)
  })
})
