import { describe, expect, it } from "vitest"

import { authApiBaseUrl } from "#/features/auth/api/authAPI"

describe("sector management handlers", () => {
  it("returns seeded sectors with stable IDs", async () => {
    const response = await fetch(`${authApiBaseUrl}/sectors/`, {
      headers: {
        authorization: "Bearer test-token",
      },
    })
    const sectors = (await response.json()) as Array<{ id?: string; name?: string }>

    expect(response.status).toBe(200)
    expect(sectors.length).toBeGreaterThan(0)
    for (const sector of sectors) {
      expect(typeof sector.id).toBe("string")
      expect(sector.id).not.toHaveLength(0)
      expect(typeof sector.name).toBe("string")
      expect(sector.name).not.toHaveLength(0)
    }
  })

  it("supports idempotent enlistment for repeated QR scans", async () => {
    const authHeaders = {
      authorization: "Bearer test-token",
      "content-type": "application/json",
    }

    const createResponse = await fetch(`${authApiBaseUrl}/sectors/`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ name: `test-sector-${Date.now()}` }),
    })
    const created = (await createResponse.json()) as { id: string }
    expect(createResponse.status).toBe(201)

    const firstEnlistResponse = await fetch(
      `${authApiBaseUrl}/sectors/${created.id}/enlist/`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ qr: "dedupe-qr-value" }),
      }
    )
    const firstEnlist = await firstEnlistResponse.json()

    const secondEnlistResponse = await fetch(
      `${authApiBaseUrl}/sectors/${created.id}/enlist/`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ qr: "dedupe-qr-value" }),
      }
    )
    const secondEnlist = await secondEnlistResponse.json()

    expect(firstEnlistResponse.status).toBe(200)
    expect(secondEnlistResponse.status).toBe(200)
    expect(firstEnlist.resident).toEqual(secondEnlist.resident)
    expect(secondEnlist.message).toContain("already enlisted")
  })
})
