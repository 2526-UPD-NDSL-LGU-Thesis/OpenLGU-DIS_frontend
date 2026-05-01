import { authApiBaseUrl } from "./authAPI"
import type { AuthSessionService } from "./auth-session-service"

export class AuthenticatedApiError extends Error {
  code: "unauthenticated" | "refresh_failed"

  constructor(code: "unauthenticated" | "refresh_failed", message: string) {
    super(message)
    this.name = "AuthenticatedApiError"
    this.code = code
  }
}

export interface AuthenticatedApiClient {
  request: (path: string, init?: RequestInit) => Promise<Response>
}

let inFlightRefresh: Promise<boolean> | null = null

function toUrl(path: string): string {
  return `${authApiBaseUrl}${path}`
}

function withAuthHeader(init: RequestInit | undefined, accessToken: string): RequestInit {
  const headers = new Headers(init?.headers)
  headers.set("authorization", `Bearer ${accessToken}`)

  return {
    ...init,
    headers,
    credentials: "include",
  }
}

async function runSingleFlightRefresh(authSessionService: AuthSessionService): Promise<boolean> {
  if (!inFlightRefresh) {
    inFlightRefresh = authSessionService.refreshSession().finally(() => {
      inFlightRefresh = null
    })
  }

  return inFlightRefresh
}

export function createAuthenticatedApiClient(args: {
  authSessionService: AuthSessionService
}): AuthenticatedApiClient {
  const { authSessionService } = args

  return {
    async request(path, init) {
      const current = authSessionService.getAuthState()
      if (!current.accessToken) {
        throw new AuthenticatedApiError("unauthenticated", "Access token is missing.")
      }

      const firstResponse = await fetch(toUrl(path), withAuthHeader(init, current.accessToken)) // TODO ASK why raw fetch? Need to walk through this thing.
      if (firstResponse.status !== 401) {
        return firstResponse
      }

      const refreshed = await runSingleFlightRefresh(authSessionService)
      if (!refreshed) {
        authSessionService.clear()
        throw new AuthenticatedApiError("refresh_failed", "Refresh session failed.")
      }

      const afterRefresh = authSessionService.getAuthState()
      if (!afterRefresh.accessToken) {
        authSessionService.clear()
        throw new AuthenticatedApiError("unauthenticated", "Access token is missing after refresh.")
      }

      const retryResponse = await fetch(toUrl(path), withAuthHeader(init, afterRefresh.accessToken))
      if (retryResponse.status === 401) {
        authSessionService.clear()
        throw new AuthenticatedApiError("refresh_failed", "Request remained unauthorized after refresh.")
      }

      return retryResponse
    },
  }
}
