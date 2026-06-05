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

  it("enlists a resident through the ids endpoint with qr and sector list", async () => {
    const request = vi.fn(async (path: string, init?: RequestInit) => {
      expect(path).toBe("/ids/enlist/")
      expect(init?.method).toBe("POST")
      expect(init?.headers).toEqual(
        expect.objectContaining({ "content-type": "application/json" })
      )
      expect(JSON.parse(String(init?.body))).toEqual({
        qr: "bad-qr",
        sector: ["sector-1"],
      })

      return jsonResponse({
        ok: true,
        pcn: "pcn-1",
        uin: "uin-1",
        issued_at: "2026-05-11T00:00:00.000Z",
        active: true,
        email: "resident@example.com",
        phone_number: "09171234567",
        sector: ["sector-1"],
      })
    })
    const apiClient: AuthenticatedApiClient = { request }

    const response = await enlistResidentToSector(apiClient, ["sector-1"], "bad-qr")

    expect(response).toEqual(
      expect.objectContaining({
        ok: true,
        uin: "uin-1",
        sector: ["sector-1"],
      })
    )
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
