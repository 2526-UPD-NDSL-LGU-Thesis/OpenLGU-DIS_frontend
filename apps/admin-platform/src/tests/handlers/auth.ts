import { faker } from "@faker-js/faker"
import { http, HttpResponse } from "msw"

import { authApiBaseUrl } from "#/features/auth/authAPI"

const CANONICAL_ROLES = [
  "SUPER",
  "SECTOR_ADMIN",
  "SERVICE_CLAIM_ADMIN",
  "SECTOR_EMPLOYEE",
  "SERVICE_CLAIM_EMPLOYEE",
  "ID_MANAGEMENT_ADMIN",
  "ID_MANAGEMENT_EMPLOYEE",
] as const

type CanonicalRole = (typeof CANONICAL_ROLES)[number]

export function buildMockAccessToken(): string {
  return faker.string.alphanumeric(48)
}

export function buildMockIdentityProfile(overrides?: {
  username?: string
  roles?: CanonicalRole[]
}): {
  username: string
  roles: CanonicalRole[]
} {
  return {
    username: overrides?.username ?? faker.internet.username(),
    roles:
      overrides?.roles ??
      faker.helpers.arrayElements(CANONICAL_ROLES, {
        min: 1,
        max: Math.min(2, CANONICAL_ROLES.length),
      }),
  }
}

export const authHandlers = [
  http.post(`${authApiBaseUrl}/token/`, async ({ request }) => {
    const payload = (await request.json()) as Partial<{ username: string; password: string }>

    if (!payload.username || !payload.password) {
      return HttpResponse.json({ detail: "Invalid credentials" }, { status: 401 })
    }

    return HttpResponse.json(
      {
        access: buildMockAccessToken(),
      },
      { status: 200 }
    )
  }),

  http.get(`${authApiBaseUrl}/me/`, ({ request }) => {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
    }

    return HttpResponse.json(buildMockIdentityProfile(), { status: 200 })
  }),
]
