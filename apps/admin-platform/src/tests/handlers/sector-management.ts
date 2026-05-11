import { faker } from "@faker-js/faker"
import { http, HttpResponse, passthrough } from "msw"

import { authApiBaseUrl } from "#/features/auth/api/authAPI"
import type { SectorItem } from "#/features/sector-management/types"
import type { IdDetails } from "@openlguid/ui/features/verification/types/verification"

import { isMockModeRequest } from "./auth"

const sectors = new Map<string, SectorItem>()
const enlistmentsBySectorAndQR = new Map<string, IdDetails>()

function buildMockSector(name?: string, description?: string): SectorItem {
  const sectorName =
    name ?? faker.helpers.slugify(faker.commerce.department()).toLowerCase()

  return {
    id: sectorName,
    name: sectorName,
    description: description ?? faker.commerce.productDescription(),
    created_at: faker.date.recent().toISOString(),
    resident_count: faker.number.int({ min: 0, max: 100 }),
  }
}

function buildMockResident(qr: string): IdDetails {
  return {
    local_id: faker.string.numeric(8),
    full_name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    dob: faker.date.birthdate({ min: 18, max: 80, mode: "age" }).toISOString().slice(0, 10),
    gender: faker.helpers.arrayElement(["Male", "Female"]),
    email: `${qr.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "resident"}@openlguid.local`,
    phone: faker.phone.number(),
    face: faker.image.avatar(),
    issuerType: "LGU",
  }
}

function ensureSeedData() {
  if (sectors.size > 0) {
    return
  }

  const seeded = [
    buildMockSector("north-district", "Northern district households"),
    buildMockSector("south-district", "Southern district households"),
  ]

  for (const sector of seeded) {
    sectors.set(sector.id, sector)
  }
}

function isAuthorized(request: Request): boolean {
  return request.headers.get("authorization")?.startsWith("Bearer ") ?? false
}

function readJsonBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>
}

export const sectorHandlers = [
  http.get(`${authApiBaseUrl}/sectors/`, ({ request }) => {
    if (!isMockModeRequest(request)) {
      return passthrough()
    }

    if (!isAuthorized(request)) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
    }

    ensureSeedData()
    return HttpResponse.json(Array.from(sectors.values()), { status: 200 })
  }),

  http.post(`${authApiBaseUrl}/sectors/`, async ({ request }) => {
    if (!isMockModeRequest(request)) {
      return passthrough()
    }

    if (!isAuthorized(request)) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
    }

    const payload = (await readJsonBody<{
      name?: string
      description?: string
      fromSectors?: string[]
    }>(request))

    if (!payload.name?.trim()) {
      return HttpResponse.json({ message: "Sector name is required." }, { status: 400 })
    }

    const sector = buildMockSector(payload.name.trim(), payload.description?.trim())
    const sourceCount = (payload.fromSectors ?? []).reduce((total, sourceID) => {
      const sourceSector = sectors.get(sourceID)
      return total + (sourceSector?.resident_count ?? 0)
    }, 0)

    const created: SectorItem = {
      ...sector,
      resident_count: payload.fromSectors?.length ? sourceCount : sector.resident_count,
    }

    sectors.set(created.id, created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.delete(`${authApiBaseUrl}/sectors/:sectorID/`, ({ request, params }) => {
    if (!isMockModeRequest(request)) {
      return passthrough()
    }

    if (!isAuthorized(request)) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
    }

    const sectorID = String(params.sectorID)
    if (!sectors.has(sectorID)) {
      return HttpResponse.json({ message: "Sector not found." }, { status: 404 })
    }

    sectors.delete(sectorID)
    for (const key of Array.from(enlistmentsBySectorAndQR.keys())) {
      if (key.startsWith(`${sectorID}::`)) {
        enlistmentsBySectorAndQR.delete(key)
      }
    }

    return new HttpResponse(null, { status: 204 })
  }),

  // http.post(`${authApiBaseUrl}/sectors/:sectorID/enlist/`, async ({ request, params }) => {
  //   if (!isMockModeRequest(request)) {
  //     return passthrough()
  //   }

  //   if (!isAuthorized(request)) {
  //     return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
  //   }

  //   const sectorID = String(params.sectorID)
  //   if (!sectors.has(sectorID)) {
  //     return HttpResponse.json({ message: "Sector not found." }, { status: 404 })
  //   }

  //   const body = (await readJsonBody<{ qr?: string }>(request))
  //   if (!body.qr?.trim()) {
  //     return HttpResponse.json({ message: "QR value is required." }, { status: 400 })
  //   }

  //   if (body.qr.startsWith("error:")) {
  //     return HttpResponse.json({ message: body.qr.slice("error:".length) || "Unable to enlist resident." }, { status: 400 })
  //   }

  //   const dedupeKey = `${sectorID}::${body.qr}`
  //   const existing = enlistmentsBySectorAndQR.get(dedupeKey)
  //   if (existing) {
  //     return HttpResponse.json(
  //       {
  //         ok: true,
  //         resident: existing,
  //         message: "Resident already enlisted in this sector.",
  //       },
  //       { status: 200 }
  //     )
  //   }

  //   const resident = buildMockResident(body.qr)
  //   enlistmentsBySectorAndQR.set(dedupeKey, resident)
  //   const currentSector = sectors.get(sectorID)
  //   if (currentSector) {
  //     sectors.set(sectorID, {
  //       ...currentSector,
  //       resident_count: currentSector.resident_count + 1,
  //     })
  //   }

  //   return HttpResponse.json(
  //     {
  //       ok: true,
  //       resident,
  //       message: "Resident enlisted in this sector.",
  //     },
  //     { status: 200 }
  //   )
  // }), TODO not yet reflective of current api call
]
