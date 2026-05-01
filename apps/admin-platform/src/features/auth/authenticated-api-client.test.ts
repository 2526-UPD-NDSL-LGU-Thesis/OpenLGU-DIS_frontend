import { describe, expect, it } from "vitest"
import { http, HttpResponse } from "msw"

import { server } from "#/tests/node"

import { authApiBaseUrl } from "./authAPI"
import { AuthenticatedApiError, createAuthenticatedApiClient } from "./authenticated-api-client"
import { createAuthSessionService } from "./auth-session-service"

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

describe("createAuthenticatedApiClient", () => {
  it("runs one refresh for concurrent 401 responses and retries queued requests", async () => {
    const expiredAccessToken = "expired-access-token"
    const refreshedAccessToken = "refreshed-access-token"
    let refreshCalls = 0
    let protectedCalls = 0

    server.use(
      http.post(`${authApiBaseUrl}/token/`, () => {
        return HttpResponse.json({ access: expiredAccessToken }, { status: 200 })
      }),
      http.post(`${authApiBaseUrl}/token/refresh/`, async () => {
        refreshCalls += 1
        await wait(50)
        return HttpResponse.json({ access: refreshedAccessToken }, { status: 200 })
      }),
      http.get(`${authApiBaseUrl}/me/`, () => {
        return HttpResponse.json({ username: "employee-1", roles: ["SUPER"] }, { status: 200 })
      }),
      http.get(`${authApiBaseUrl}/services/`, ({ request }) => {
        protectedCalls += 1
        const authHeader = request.headers.get("authorization")

        if (authHeader === `Bearer ${expiredAccessToken}`) {
          return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
        }

        if (authHeader === `Bearer ${refreshedAccessToken}`) {
          return HttpResponse.json([{ name: "Service A" }], { status: 200 })
        }

        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
      })
    )

    const authSessionService = createAuthSessionService()
    await authSessionService.login({ username: "employee-1", password: "password" })

    const apiClient = createAuthenticatedApiClient({ authSessionService })
    const [responseA, responseB] = await Promise.all([
      apiClient.request("/services/"),
      apiClient.request("/services/"),
    ])

    expect(responseA.status).toBe(200)
    expect(responseB.status).toBe(200)
    expect(refreshCalls).toBe(1)
    expect(protectedCalls).toBe(4)
    expect(authSessionService.getAuthState().accessToken).toBe(refreshedAccessToken)
  })

  it("clears session and throws refresh_failed when refresh cannot recover", async () => {
    const expiredAccessToken = "expired-access-token"

    server.use(
      http.post(`${authApiBaseUrl}/token/`, () => {
        return HttpResponse.json({ access: expiredAccessToken }, { status: 200 })
      }),
      http.post(`${authApiBaseUrl}/token/refresh/`, () => {
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
      }),
      http.get(`${authApiBaseUrl}/me/`, () => {
        return HttpResponse.json({ username: "employee-1", roles: ["SUPER"] }, { status: 200 })
      }),
      http.get(`${authApiBaseUrl}/services/`, () => {
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
      })
    )

    const authSessionService = createAuthSessionService()
    await authSessionService.login({ username: "employee-1", password: "password" })

    const apiClient = createAuthenticatedApiClient({ authSessionService })

    await expect(apiClient.request("/services/")).rejects.toEqual(
      new AuthenticatedApiError("refresh_failed", "Refresh session failed.")
    )

    expect(authSessionService.getAuthState()).toEqual({
      phase: "unauthenticated",
      accessToken: null,
      identityProfile: null,
    })
  })
})
