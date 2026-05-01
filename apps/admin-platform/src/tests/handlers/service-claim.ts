import { faker } from "@faker-js/faker"
import { http, HttpResponse } from "msw"

import { authApiBaseUrl } from "#/features/auth/authAPI"
import type { ClaimItem, ServiceItem } from "#/features/service-claim/types/serviceClaim"

const services = new Map<string, ServiceItem>()
const claimsByService = new Map<string, ClaimItem[]>()

function buildMockService(name?: string): ServiceItem {
  const serviceName = name ?? faker.helpers.slugify(faker.commerce.productName()).toLowerCase()
  return {
    name: serviceName,
    verbose_name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    max_claims_per_user: faker.number.int({ min: 1, max: 10 }),
    claim_type: faker.helpers.arrayElement(["onetime", "repeatable"]),
    refresh_interval: faker.helpers.arrayElement([null, "daily", "weekly"]),
    stocks_type: faker.helpers.arrayElement(["unlimited", "limited"]),
    stocks: faker.number.int({ min: 10, max: 1000 }),
    active: true,
    recepient_sectors: [faker.location.city(), faker.location.city()],
    allowed_groups: [faker.number.int({ min: 1, max: 5 })],
  }
}

function buildMockClaim(serviceName: string): ClaimItem {
  return {
    user: faker.internet.username(),
    claimed_by: faker.internet.username(),
    service: serviceName,
    claimed_at: faker.date.recent().toISOString(),
  }
}

function ensureSeedData() {
  if (services.size > 0) {
    return
  }

  const seeded = [buildMockService("medical-assistance"), buildMockService("food-subsidy")]
  for (const service of seeded) {
    services.set(service.name, service)
    claimsByService.set(service.name, [buildMockClaim(service.name)])
  }
}

function isAuthorized(request: Request): boolean {
  return request.headers.get("authorization")?.startsWith("Bearer ") ?? false
}

export const serviceClaimHandlers = [
  http.get(`${authApiBaseUrl}/services/`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
    }

    ensureSeedData()
    return HttpResponse.json(Array.from(services.values()), { status: 200 })
  }),

  http.post(`${authApiBaseUrl}/services/`, async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
    }

    const payload = (await request.json()) as Partial<ServiceItem>
    if (!payload.name) {
      return HttpResponse.json({ detail: "Invalid service payload" }, { status: 400 })
    }

    const service: ServiceItem = {
      ...buildMockService(payload.name),
      ...payload,
      name: payload.name,
    }

    services.set(service.name, service)
    claimsByService.set(service.name, claimsByService.get(service.name) ?? [])
    return HttpResponse.json(service, { status: 201 })
  }),

  http.get(`${authApiBaseUrl}/services/:serviceName/claims/`, ({ request, params }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
    }

    ensureSeedData()
    const serviceName = String(params.serviceName)
    const claims = claimsByService.get(serviceName) ?? []
    return HttpResponse.json(claims, { status: 200 })
  }),

  http.post(`${authApiBaseUrl}/claim/:serviceName/`, async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
    }

    const serviceName = String(params.serviceName)
    const body = (await request.json()) as { qr?: string }
    if (!body.qr) {
      return HttpResponse.json({ detail: "Missing QR value" }, { status: 400 })
    }

    const claim = buildMockClaim(serviceName)
    const currentClaims = claimsByService.get(serviceName) ?? []
    claimsByService.set(serviceName, [claim, ...currentClaims])
    return HttpResponse.json(claim, { status: 201 })
  }),
]
