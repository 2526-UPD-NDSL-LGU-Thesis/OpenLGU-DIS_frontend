
import type { QueryClient } from "@tanstack/react-query"

export const authApiBaseUrl = import.meta.env.VITE_API_BASE_URL

export interface LoginCredentials {
  username: string
  password: string
}

export interface AccessTokenPayload {
  access: string
  refresh?: string
}

export interface UserProfilePayload {
  username: string
  first_name?: string
  last_name?: string
  groups?: Array<{ name: string }>
  assignment?: any | null
}

type AuthApiErrorCode =
  | "invalid_credentials"
  | "response_not_json"
  | "missing_access_token"
  | "missing_refresh_token"
  | "user_profile_failed"

export class AuthApiError extends Error {
  code: AuthApiErrorCode

  constructor(code: AuthApiErrorCode, message: string) {
    super(message)
    this.name = "AuthApiError"
    this.code = code
  }
}

export interface AuthApiClient {
  requestAccessToken: (credentials: LoginCredentials) => Promise<AccessTokenPayload>
  requestRefreshAccessToken: (refreshToken: string) => Promise<AccessTokenPayload>
  requestUserProfile: (accessToken: string) => Promise<UserProfilePayload>
}

function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type")
  return contentType !== null && contentType.includes("application/json")
}

function toUrl(path: string): string {
  return `${authApiBaseUrl}${path}`
}

export function createAuthApiClient(queryClient: QueryClient): AuthApiClient {
  return {
    async requestAccessToken(credentials) {
      return queryClient.fetchQuery({
        queryKey: ["auth", "token-exchange", credentials.username],
        staleTime: 0,
        gcTime: 0,
        retry: false,
        queryFn: async () => {
          let response: Response
          try {
            response = await fetch(toUrl("/token/"), {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify(credentials),
            })
          } catch {
            throw new AuthApiError("user_profile_failed", "Unable to reach auth server.")
          }

          if (!response.ok) {
            throw new AuthApiError("invalid_credentials", "Invalid username or password.")
          }

          if (!isJsonResponse(response)) {
            throw new AuthApiError("response_not_json", "Auth server returned non-JSON token response.")
          }

          const payload = (await response.json()) as Partial<AccessTokenPayload>
          if (!payload.access) {
            throw new AuthApiError("missing_access_token", "Auth server response is missing access token.")
          }

          return { access: payload.access, refresh: payload.refresh }
        },
      })
    },

    async requestUserProfile(accessToken) {
      return queryClient.fetchQuery({
        queryKey: ["auth", "user-profile"],
        staleTime: 0,
        gcTime: 0,
        retry: false,
        queryFn: async () => {
          let response: Response
          try {
            response = await fetch(toUrl("/users/me/"), {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            })
          } catch {
            throw new AuthApiError("user_profile_failed", "Unable to reach auth server.")
          }

          if (!response.ok || !isJsonResponse(response)) {
            throw new AuthApiError("user_profile_failed", "Unable to load LGU Employee user profile.")
          }

          return (await response.json()) as UserProfilePayload
        },
      })
    },

    async requestRefreshAccessToken(refreshToken) {
      const normalizedRefresh = refreshToken.trim()
      if (!normalizedRefresh) {
        throw new AuthApiError("missing_refresh_token", "Refresh token is missing.")
      }

      return queryClient.fetchQuery({
        queryKey: ["auth", "token-refresh", normalizedRefresh],
        staleTime: 0,
        gcTime: 0,
        retry: false,
        queryFn: async () => {
          let response: Response
          try {
            response = await fetch(toUrl("/token/refresh/"), {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ refresh: normalizedRefresh }),
            })
          } catch {
            throw new AuthApiError("user_profile_failed", "Unable to reach auth server.")
          }

          if (!response.ok) {
            throw new AuthApiError("invalid_credentials", "Refresh session is invalid.")
          }

          if (!isJsonResponse(response)) {
            throw new AuthApiError("response_not_json", "Auth server returned non-JSON refresh response.")
          }

          const payload = (await response.json()) as Partial<AccessTokenPayload>
          if (!payload.access) {
            throw new AuthApiError("missing_access_token", "Auth server refresh response is missing access token.")
          }

          return { access: payload.access, refresh: payload.refresh }
        },
      })
    },
  }
}
