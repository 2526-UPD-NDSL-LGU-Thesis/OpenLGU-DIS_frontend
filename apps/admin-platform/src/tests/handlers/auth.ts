import { faker } from "@faker-js/faker"
import { http, HttpResponse, passthrough } from "msw"

import { authApiBaseUrl } from "#/features/auth/api/authAPI"
import { UserRolesList } from "#/types/schema"

const IS_VITEST = Boolean(process.env.VITEST)
const MOCK_USERNAME_PREFIX = "mock:"

// NOTE: You cannot reliably set HttpOnly cookies from MSW-mocked responses in the browser.
// For dev-only "mock mode" persistence across reloads, we use localStorage.
const MOCK_STORAGE_KEY = "openlguid:msw-mock-username"

let lastMockUsername: string | null = IS_VITEST ? "employee-1" : null

function readPersistedMockUsername(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(MOCK_STORAGE_KEY) // TODO I don't think this localStorage approach is good for long term. It doesn't get cleared on logout
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

function rolesForMockUser(username: string): UserRolesList[] {
  const normalized = username.toLowerCase()

  if (normalized.includes("super")) return ["Super"]
  if (normalized.includes("sector-admin")) return ["Sector Admin"]
  if (normalized.includes("sector-employee")) return ["Sector Employee"]
  if (normalized.includes("service-claim-admin") || normalized.includes("service-admin")) {
    return ["Service Claim Admin"]
  }
  if (normalized.includes("service-claim-employee") || normalized.includes("service-employee")) {
    return ["Service Claim Employee"]
  }
  if (normalized.includes("id-management-admin") || normalized.includes("id-admin")) {
    return ["ID Management Admin"]
  }
  if (normalized.includes("id-management-employee") || normalized.includes("id-employee")) {
    return ["ID Management Employee"]
  }

  return ["ID Management Employee"]
}

function titleize(value: string): string {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export interface MockUserProfilePayload {
  username: string
  first_name: string
  last_name: string
  groups: Array<{ name: string }>
  assignment: null
}


export function buildMockUserProfile(overrides?: {
  username?: string
  roles?: UserRolesList[]
}): MockUserProfilePayload {
  const username = overrides?.username ?? "employee-1"
  const [firstNameToken, ...restTokens] = username.split(/[\s._-]+/).filter(Boolean)
  const firstName = titleize(firstNameToken ?? "Mock")
  const lastName = titleize(restTokens.join(" ") || "User")
  const roles = overrides?.roles ?? rolesForMockUser(username)

  return {
    username,
    first_name: firstName,
    last_name: lastName,
    groups: roles.map((r) => ({ name: r })),
    assignment: null,
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
    // Only persist mock username across page reloads when explicitly requested
    // by using the mock:username prefix in non-test (non-vitest) environments.
    if (!IS_VITEST && payload.username.startsWith(MOCK_USERNAME_PREFIX)) {
      persistMockUsername(lastMockUsername)
    } else {
      // avoid aggressive localStorage persistence for implicit/mock-mode logins
      persistMockUsername(null)
    }

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

    return HttpResponse.json(buildMockUserProfile({ username }), { status: 200 })
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
