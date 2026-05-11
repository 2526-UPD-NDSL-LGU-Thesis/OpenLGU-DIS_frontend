import { describe, expect, it, vi } from "vitest"

import type { AuthenticatedApiClient } from "#/features/auth/authenticated-api-client"

import {
  createSector,
  deleteSector,
  enlistResidentToSector,
  getSectors,
} from "./sectorAPI"

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  })
}

describe("sectorAPI", () => {
  it("lists sectors through the injected authenticated client", async () => {
    const request = vi.fn(async (path: string) => {
      expect(path).toBe("/sectors/")
      return jsonResponse([
        {
          id: "sector-1",
          name: "West District",
          description: "Primary district",
          created_at: "2026-05-11T00:00:00.000Z",
          resident_count: 12,
        },
      ])
    })
    const apiClient: AuthenticatedApiClient = { request }

    const sectors = await getSectors(apiClient)

    expect(sectors).toHaveLength(1)
    expect(request).toHaveBeenCalledTimes(1)
  })

  it("creates a sector with source sectors when provided", async () => {
    const request = vi.fn(async (path: string, init?: RequestInit) => {
      expect(path).toBe("/sectors/")
      expect(init?.method).toBe("POST")
      expect(init?.headers).toEqual(
        expect.objectContaining({ "content-type": "application/json" })
      )
      expect(JSON.parse(String(init?.body))).toEqual({
        name: "North District",
        description: "Copied memberships",
        fromSectors: ["sector-a", "sector-b"],
      })

      return jsonResponse({
        id: "sector-2",
        name: "North District",
        description: "Copied memberships",
        created_at: "2026-05-11T00:00:00.000Z",
        resident_count: 0,
      })
    })
    const apiClient: AuthenticatedApiClient = { request }

    const sector = await createSector(apiClient, {
      name: "North District",
      description: "Copied memberships",
      fromSectors: ["sector-a", "sector-b"],
    })

    expect(sector.id).toBe("sector-2")
  })

  it("throws backend messages for enlist failures", async () => {
    const request = vi.fn(async () =>
      jsonResponse({ message: "Resident already enlisted." }, { status: 400 })
    )
    const apiClient: AuthenticatedApiClient = { request }

    await expect(
      enlistResidentToSector(apiClient, "sector-1", "bad-qr")
    ).rejects.toThrow("Resident already enlisted.")
  })

  it("deletes a sector using an encoded sector ID", async () => {
    const request = vi.fn(async (path: string, init?: RequestInit) => {
      expect(path).toBe("/sectors/sector%2Fspecial/")
      expect(init?.method).toBe("DELETE")
      return new Response(null, { status: 204 })
    })
    const apiClient: AuthenticatedApiClient = { request }

    await expect(deleteSector(apiClient, "sector/special")).resolves.toBeUndefined()
  })
})
