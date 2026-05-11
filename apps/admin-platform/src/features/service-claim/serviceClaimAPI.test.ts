import { describe, expect, it, vi } from "vitest"

import type { AuthenticatedApiClient } from "#/features/auth/authenticated-api-client"

import { createClaim, getClaims } from "./serviceClaimAPI"

function buildClaimResponse() {
  return {
    user: "admin-user",
    claimed_by: "resident-user",
    service: "medical-assistance",
    claimed_at: "2026-05-11T00:00:00.000Z",
  }
}

describe("createClaim", () => {
  it("reuses a single in-flight request for identical serviceID and QR payload", async () => {
    const claim = buildClaimResponse()
    const request = vi.fn(async () => {
      return new Response(JSON.stringify(claim), {
        status: 201,
        headers: {
          "content-type": "application/json",
        },
      })
    })

    const apiClient: AuthenticatedApiClient = {
      request,
    }

    const [resultA, resultB] = await Promise.all([
      createClaim(apiClient, "medical-assistance", "same-qr"),
      createClaim(apiClient, "medical-assistance", "same-qr"),
    ])

    expect(resultA).toEqual(claim)
    expect(resultB).toEqual(claim)
    expect(request).toHaveBeenCalledTimes(1)
  })

  it("throws and does not call API when serviceID is invalid", async () => {
    const request = vi.fn()
    const apiClient: AuthenticatedApiClient = { request }

    await expect(createClaim(apiClient, "undefined", "same-qr")).rejects.toThrow(
      "Service ID is required."
    )
    expect(request).not.toHaveBeenCalled()
  })
})

describe("getClaims", () => {
  it("throws and does not call API when serviceID is invalid", async () => {
    const request = vi.fn()
    const apiClient: AuthenticatedApiClient = { request }

    await expect(getClaims(apiClient, "undefined")).rejects.toThrow("Service ID is required.")
    expect(request).not.toHaveBeenCalled()
  })
})
