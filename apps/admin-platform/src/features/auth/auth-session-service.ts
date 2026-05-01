import { QueryClient } from "@tanstack/react-query"

import { AuthApiError, createAuthApiClient } from "./authAPI"
import type { AuthApiClient, LoginCredentials } from "./authAPI"

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

export interface IdentityProfile {
  username: string
  roles: CanonicalRole[]
}

export type AuthStatePhase = "unknown" | "authenticated" | "unauthenticated"

export interface AuthStateSnapshot {
  phase: AuthStatePhase
  accessToken: string | null
  identityProfile: IdentityProfile | null
}

export interface LoginFailure {
  ok: false
  error: {
    code:
      | "invalid_credentials"
      | "response_not_json"
      | "missing_access_token"
      | "identity_profile_failed"
    message: string
  }
}

export interface LoginSuccess {
  ok: true
  state: AuthStateSnapshot
}

export type LoginResult = LoginFailure | LoginSuccess

export interface AuthSessionService {
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  getAuthState: () => AuthStateSnapshot
  clear: () => void
}

const unauthenticatedState: AuthStateSnapshot = {
  phase: "unauthenticated",
  accessToken: null,
  identityProfile: null,
}

function normalizeIdentityProfile(raw: unknown): IdentityProfile | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const maybeUsername = (raw as { username?: unknown }).username
  const maybeRoles = (raw as { roles?: unknown }).roles

  if (typeof maybeUsername !== "string" || !Array.isArray(maybeRoles)) {
    return null
  }

  const canonicalRoles = maybeRoles.filter((role): role is CanonicalRole => {
    return typeof role === "string" && CANONICAL_ROLES.includes(role as CanonicalRole)
  })

  if (canonicalRoles.length === 0) {
    return null
  }

  return {
    username: maybeUsername,
    roles: canonicalRoles,
  }
}

const defaultQueryClient = new QueryClient()
const defaultAuthApiClient = createAuthApiClient(defaultQueryClient)

export function createAuthSessionService(apiClient: AuthApiClient = defaultAuthApiClient): AuthSessionService {
  let authState: AuthStateSnapshot = { ...unauthenticatedState }

  const clear = () => {
    authState = { ...unauthenticatedState }
  }

  return {
    async login(credentials) {
      try {
        const tokenPayload = await apiClient.requestAccessToken(credentials)
        const identityPayload = await apiClient.requestIdentityProfile(tokenPayload.access)
        const identityProfile = normalizeIdentityProfile(identityPayload)

        if (!identityProfile) {
          clear()
          return {
            ok: false,
            error: {
              code: "identity_profile_failed",
              message: "Identity profile response is invalid.",
            },
          }
        }

        authState = {
          phase: "authenticated",
          accessToken: tokenPayload.access,
          identityProfile,
        }

        return {
          ok: true,
          state: authState,
        }
      } catch (error) {
        clear()

        if (error instanceof AuthApiError) {
          return {
            ok: false,
            error: {
              code: error.code,
              message: error.message,
            },
          }
        }

        return {
          ok: false,
          error: {
            code: "identity_profile_failed",
            message: "Unable to load LGU Employee identity profile.",
          },
        }
      }
    },

    getAuthState() {
      return authState
    },

    clear,
  }
}
