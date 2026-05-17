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

// NOTE: You cannot reliably set HttpOnly cookies from MSW-mocked responses in the browser.
// For dev-only "mock mode" persistence across reloads, we use localStorage.
const MOCK_STORAGE_KEY = "openlguid:msw-mock-username"

let lastMockUsername: string | null = IS_VITEST ? "employee-1" : null

function readPersistedMockUsername(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(MOCK_STORAGE_KEY)
  } catch {
    return null
  }
}

function persistMockUsername(username: string | null) {
  if (typeof window === "undefined") return
  try {
    if (username) {
      window.localStorage.setItem(MOCK_STORAGE_KEY, username)
    } else {
      window.localStorage.removeItem(MOCK_STORAGE_KEY)
    }
  } catch {
    // ignore
  }
}

export function isMockModeRequest(_request: Request): boolean {
  if (IS_VITEST) return true

  const persisted = readPersistedMockUsername()
  return persisted !== null || lastMockUsername !== null
}

export function buildMockAccessToken(): string {
  return faker.string.alphanumeric(48)
}

function rolesForMockUser(username: string): CanonicalRole[] {
  if (username.toLowerCase().includes("super")) return ["SUPER"]
  if (username.toLowerCase().includes("id")) return ["ID_MANAGEMENT_ADMIN"]
  if (username.toLowerCase().includes("service")) return ["SERVICE_CLAIM_ADMIN"]

  return ["SUPER"] // Simple, deterministic roles for dev: tweak later if you want mock users with varying RBAC.
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
    persistMockUsername(lastMockUsername)

    return HttpResponse.json(
      {
        access: buildMockAccessToken(),
      },
      {
        status: 200,
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

  http.get(`${authApiBaseUrl}/users/me/`, ({ request }) => {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
    }

    if (!isMockModeRequest(request)) {
      return passthrough()
    }

    const username = readPersistedMockUsername() ?? lastMockUsername ?? "employee-1"

    return HttpResponse.json(buildMockIdentityProfile({ username }), { status: 200 })
  }),

  http.post(`${authApiBaseUrl}/logout/`, ({ request }) => {
    if (!isMockModeRequest(request)) {
      return passthrough()
    }

    lastMockUsername = null
    persistMockUsername(null)

    return HttpResponse.json({ detail: "Logged out" }, { status: 200 })
  }),
]
