import { faker } from "@faker-js/faker"
import { http, HttpResponse, passthrough } from "msw"

import { authApiBaseUrl } from "#/features/auth/api/authAPI"

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

const IS_VITEST = Boolean(process.env.VITEST)
const MOCK_USERNAME_PREFIX = "mock:"
const MOCK_COOKIE_NAME = "openlguid_mock"
const MOCK_USER_COOKIE_NAME = "openlguid_mock_user"

let lastMockUsername: string | null = IS_VITEST ? "employee-1" : null

function readCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null

  const parts = cookieHeader.split(";")
  for (const part of parts) {
    const [k, ...vRest] = part.trim().split("=")
    if (k === name) {
      const raw = vRest.join("=")
      try {
        return decodeURIComponent(raw)
      } catch {
        return raw
      }
    }
  }
  return null
}

export function isMockModeRequest(request: Request): boolean {
  if (IS_VITEST) return true

  const cookie = request.headers.get("cookie")
  return readCookieValue(cookie, MOCK_COOKIE_NAME) === "1"
}

export function buildMockAccessToken(): string {
  return faker.string.alphanumeric(48)
}

function rolesForMockUser(username: string): CanonicalRole[] {
  // Simple, deterministic roles for dev: tweak later if you want mock users with varying RBAC.
  if (username.toLowerCase().includes("super")) return ["SUPER"]
  if (username.toLowerCase().includes("id")) return ["ID_MANAGEMENT_ADMIN"]
  return ["SERVICE_CLAIM_ADMIN"]
}

export function buildMockIdentityProfile(overrides?: {
  username?: string
  roles?: CanonicalRole[]
}): {
  username: string
  roles: CanonicalRole[]
} {
  const username = overrides?.username ?? "employee-1"
  return {
    username,
    roles: overrides?.roles ?? rolesForMockUser(username),
  }
}

function setMockCookies(args: { username: string }): Headers {
  const headers = new Headers()
  headers.append("set-cookie", `${MOCK_COOKIE_NAME}=1; Path=/; SameSite=Lax`)
  headers.append(
    "set-cookie",
    `${MOCK_USER_COOKIE_NAME}=${encodeURIComponent(args.username)}; Path=/; SameSite=Lax`
  )
  return headers
}

function clearMockCookies(): Headers {
  const headers = new Headers()
  headers.append("set-cookie", `${MOCK_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`)
  headers.append("set-cookie", `${MOCK_USER_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`)
  return headers
}

export const authHandlers = [
  http.post(`${authApiBaseUrl}/token/`, async ({ request }) => {
    const payload = (await request.json()) as Partial<{ username: string; password: string }>

    if (!payload.username || !payload.password) {
      return HttpResponse.json({ detail: "Invalid credentials" }, { status: 401 })
    }

    const wantsMock = IS_VITEST || payload.username.startsWith(MOCK_USERNAME_PREFIX)
    if (!wantsMock) {
      return passthrough()
    }

    const actualUsername = payload.username.startsWith(MOCK_USERNAME_PREFIX)
      ? payload.username.slice(MOCK_USERNAME_PREFIX.length)
      : payload.username

    lastMockUsername = actualUsername || "employee-1"

    return HttpResponse.json(
      {
        access: buildMockAccessToken(),
      },
      {
        status: 200,
        headers: setMockCookies({ username: lastMockUsername }),
      }
    )
  }),

  http.post(`${authApiBaseUrl}/token/refresh/`, ({ request }) => {
    if (!isMockModeRequest(request)) {
      return passthrough()
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

    if (!isMockModeRequest(request)) {
      return passthrough()
    }

    const cookie = request.headers.get("cookie")
    const cookieUsername = readCookieValue(cookie, MOCK_USER_COOKIE_NAME)
    const username = cookieUsername ?? lastMockUsername ?? "employee-1"

    return HttpResponse.json(buildMockIdentityProfile({ username }), { status: 200 })
  }),

  http.post(`${authApiBaseUrl}/logout/`, ({ request }) => {
    if (!isMockModeRequest(request)) {
      return passthrough()
    }

    lastMockUsername = null

    return HttpResponse.json(
      { detail: "Logged out" },
      {
        status: 200,
        headers: clearMockCookies(),
      }
    )
  }),
]
