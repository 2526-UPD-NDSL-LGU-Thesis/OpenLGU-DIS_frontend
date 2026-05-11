import { describe, expect, it } from "vitest"

import { authApiBaseUrl } from "#/features/auth/api/authAPI"

describe("service claim handlers", () => {
  it("returns services with non-empty id so route params are stable", async () => {
    const response = await fetch(`${authApiBaseUrl}/services/`, {
      headers: {
        authorization: "Bearer test-token",
      },
    })
    const services = (await response.json()) as Array<{ id?: string }>

    expect(response.status).toBe(200)
    expect(services.length).toBeGreaterThan(0)
    for (const service of services) {
      expect(typeof service.id).toBe("string")
      expect(service.id).not.toHaveLength(0)
    }
  })

  it("deduplicates repeated claim POSTs for the same service and QR payload", async () => {
    const serviceName = `service-${Date.now()}`
    const authHeader = {
      authorization: "Bearer test-token",
      "content-type": "application/json",
    }

    const createServiceResponse = await fetch(`${authApiBaseUrl}/services/`, {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ name: serviceName }),
    })
    expect(createServiceResponse.status).toBe(201)

    const firstClaimResponse = await fetch(`${authApiBaseUrl}/claim/${serviceName}/`, {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ qr: "duplicate-qr" }),
    })
    const firstClaim = await firstClaimResponse.json()

    const secondClaimResponse = await fetch(`${authApiBaseUrl}/claim/${serviceName}/`, {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ qr: "duplicate-qr" }),
    })
    const secondClaim = await secondClaimResponse.json()

    expect(firstClaimResponse.status).toBe(201)
    expect(secondClaimResponse.status).toBe(201)
    expect(secondClaim).toEqual(firstClaim)

    const claimsResponse = await fetch(`${authApiBaseUrl}/services/${serviceName}/claims/`, {
      headers: {
        authorization: "Bearer test-token",
      },
    })
    const claims = await claimsResponse.json()
    expect(claimsResponse.status).toBe(200)
    expect(claims).toHaveLength(1)
  })
})
