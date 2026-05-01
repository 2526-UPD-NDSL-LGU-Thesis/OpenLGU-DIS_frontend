import { describe, expect, it } from "vitest"
import { http, HttpResponse } from "msw"

import { server } from "#/tests/node"
import { buildMockAccessToken } from "#/tests/handlers/auth"

import { authApiBaseUrl } from "./authAPI"
import { createAuthSessionService } from "./auth-session-service"

const CANONICAL_ROLES = new Set([
  "SUPER",
  "SECTOR_ADMIN",
  "SERVICE_CLAIM_ADMIN",
  "SECTOR_EMPLOYEE",
  "SERVICE_CLAIM_EMPLOYEE",
  "ID_MANAGEMENT_ADMIN",
  "ID_MANAGEMENT_EMPLOYEE",
])

describe("createAuthSessionService", () => {
  it("authenticates LGU Employee login and hydrates identity profile from /me", async () => {
    const service = createAuthSessionService() // TODO ASK why make this a separate function
    const result = await service.login({ username: "employee-1", password: "password" })

    expect(result.ok).toBe(true)

    const state = service.getAuthState()
    expect(state.phase).toBe("authenticated")
    expect(typeof state.accessToken).toBe("string")
    expect(state.accessToken).not.toHaveLength(0)
    expect(typeof state.identityProfile?.username).toBe("string")
    expect(state.identityProfile?.roles.length).toBeGreaterThan(0)
    for (const role of state.identityProfile?.roles ?? []) {
      expect(CANONICAL_ROLES.has(role)).toBe(true)
    }
  })

  it("returns invalid_credentials and stays unauthenticated when token exchange fails", async () => {
    server.use(
      http.post(`${authApiBaseUrl}/token/`, () => {
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }) // TODO ASK why not use auth.ts' handler directly
      })
    )

    const service = createAuthSessionService()
    const result = await service.login({ username: "employee-1", password: "wrong-password" })

    expect(result).toEqual({
      ok: false,
      error: {
        code: "invalid_credentials",
        message: "Invalid username or password.",
      },
    })
    expect(service.getAuthState()).toEqual({
      phase: "unauthenticated",
      accessToken: null,
      identityProfile: null,
    })
  })

  it("returns response_not_json when token endpoint responds with non-JSON body", async () => {
    server.use(
      http.post(`${authApiBaseUrl}/token/`, () => {
        return new HttpResponse("<html>ok</html>", {
          status: 200,
          headers: {
            "content-type": "text/html",
          },
        })
      })
    )

    const service = createAuthSessionService()
    const result = await service.login({ username: "employee-1", password: "password" })

    expect(result).toEqual({
      ok: false,
      error: {
        code: "response_not_json",
        message: "Auth server returned non-JSON token response.",
      },
    })
    expect(service.getAuthState()).toEqual({
      phase: "unauthenticated",
      accessToken: null,
      identityProfile: null,
    })
  })

  it("returns identity_profile_failed and clears session when /me hydration fails", async () => {
    server.use(
      http.post(`${authApiBaseUrl}/token/`, () => {
        return HttpResponse.json({ access: buildMockAccessToken() }, { status: 200 })
      }),
      http.get(`${authApiBaseUrl}/me/`, () => {
        return HttpResponse.json({ detail: "Server error" }, { status: 500 })
      })
    )

    const service = createAuthSessionService()
    const result = await service.login({ username: "employee-1", password: "password" })

    expect(result).toEqual({
      ok: false,
      error: {
        code: "identity_profile_failed",
        message: "Unable to load LGU Employee identity profile.",
      },
    })
    expect(service.getAuthState()).toEqual({
      phase: "unauthenticated",
      accessToken: null,
      identityProfile: null,
    })
  })

})
