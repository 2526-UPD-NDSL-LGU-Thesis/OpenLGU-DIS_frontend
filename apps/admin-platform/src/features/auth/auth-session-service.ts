import { QueryClient } from "@tanstack/react-query"
import { linkOptions } from "@tanstack/react-router"
import { z } from 'zod';

import { AuthApiError, createAuthApiClient } from "./api/authAPI"
import type { AuthApiClient, LoginCredentials } from "./api/authAPI"

import { userProfileSchema } from "#/types/schema"
import type { UserProfile } from "#/types/schema";

export type AuthStatePhase = "unknown" | "authenticated" | "unauthenticated"

export interface AuthStateSnapshot {
  phase: AuthStatePhase
  accessToken: string | null
  userProfile: UserProfile | null
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

export interface EnsureAuthenticatedSuccess {
  ok: true
  state: AuthStateSnapshot
}

export interface EnsureAuthenticatedRedirect {
  ok: false
  redirect: {
    to: "/login"
    search: {
      redirect: string
    }
  }
}

export type EnsureAuthenticatedResult =
  | EnsureAuthenticatedSuccess
  | EnsureAuthenticatedRedirect

export interface AuthSessionService {
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  ensureAuthenticated: (args: {
    redirectTo: string
  }) => Promise<EnsureAuthenticatedResult>
  refreshSession: () => Promise<boolean>
  getAuthState: () => AuthStateSnapshot
  clear: () => void
  logout: () => Promise<void>
  _setAuthenticatedClient: (client: {
    request: (path: string, init?: RequestInit) => Promise<Response>
  }) => void
}

/**
 * Minimal state-store contract.
 *
 * In runtime, this is typically backed by a Zustand vanilla store.
 * In tests, you can use the in-memory default store.
 */
export interface AuthStateStore {
  getState: () => AuthStateSnapshot
  setState: (next: AuthStateSnapshot) => void
}

const initialAuthState: AuthStateSnapshot = {
  phase: "unknown",
  accessToken: null,
  userProfile: null,
}

const unauthenticatedState: AuthStateSnapshot = {
  phase: "unauthenticated",
  accessToken: null,
  userProfile: null,
}

function createInMemoryAuthStateStore(
  initial: AuthStateSnapshot = initialAuthState
): AuthStateStore {
  let state: AuthStateSnapshot = { ...initial }

  return {
    getState: () => state,
    setState: (next) => {
      state = { ...next }
    },
  }
}



const defaultQueryClient = new QueryClient()
const defaultAuthApiClient = createAuthApiClient(defaultQueryClient)

function buildPublicLoginRedirect(redirectTo: string) {
  return linkOptions({
    to: "/login",
    search: {
      redirect: redirectTo,
    },
  })
}

export function createAuthSessionService(
  apiClient: AuthApiClient = defaultAuthApiClient,
  queryClient: QueryClient = defaultQueryClient,
  stateStore: AuthStateStore = createInMemoryAuthStateStore()
): AuthSessionService {
  let authenticatedApiClient: {
    request: (path: string, init?: RequestInit) => Promise<Response>
  } | null = null

  const getAuthState = () => stateStore.getState()

  const clear = () => {
    stateStore.setState({ ...unauthenticatedState })
  }

  const setAuthenticated = (next: {
    accessToken: string
    identityProfile: UserProfile
  }) => {
    stateStore.setState({
      phase: "authenticated",
      accessToken: next.accessToken,
      userProfile: next.identityProfile,
    })
  }

  const refreshAndHydrate = async (): Promise<boolean> => {
    try {
      const tokenPayload = await apiClient.requestRefreshAccessToken()
      const identityPayload = await apiClient.requestIdentityProfile(
        tokenPayload.access
      )
      const identityProfile = userProfileSchema.parse(identityPayload)

      setAuthenticated({ accessToken: tokenPayload.access, identityProfile })
      return true
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        return false
      }
      return false
    }
  }

  return {
    async login(credentials) {
      try {
        const tokenPayload = await apiClient.requestAccessToken(credentials)
        const identityPayload = await apiClient.requestIdentityProfile(
          tokenPayload.access
        )
        const identityProfile = userProfileSchema.parse(identityPayload);

        setAuthenticated({ accessToken: tokenPayload.access, identityProfile })

        return {
          ok: true,
          state: getAuthState(),
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
        else if (error instanceof z.ZodError){
          console.error(error)
          return {
            ok: false,
            error: {
              code: "identity_profile_failed",
              message: "Identity profile response schema failed to parse"
            }
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

    async ensureAuthenticated({ redirectTo }) {
      const current = getAuthState()
      if (
        current.phase === "authenticated" &&
        current.accessToken &&
        current.userProfile
      ) {
        return { ok: true, state: current }
      }

      try {
        const refreshed = await refreshAndHydrate()
        if (!refreshed) {
          clear()
          return {
            ok: false,
            redirect: buildPublicLoginRedirect(redirectTo),
          }
        }
        return { ok: true, state: getAuthState() }
      } catch {
        clear()
        return {
          ok: false,
          redirect: buildPublicLoginRedirect(redirectTo),
        }
      }
    },

    async refreshSession() {
      try {
        const refreshed = await refreshAndHydrate()
        if (!refreshed) {
          clear()
          return false
        }
        return true
      } catch {
        clear()
        return false
      }
    },

    getAuthState,

    clear,

    async logout() {
      // Try to call backend logout endpoint through authenticated client (graceful bypass if fails)
      if (authenticatedApiClient) {
        try {
          await authenticatedApiClient.request("/logout/", { method: "POST" })
        } catch {
          // Gracefully ignore logout endpoint failures
          // Session is cleared locally regardless of backend response
        }
      }
      // Clear TanStack Query cache before session state
      queryClient.clear()
      // Clear local session state
      clear()
    },

    _setAuthenticatedClient(client) {
      authenticatedApiClient = client
    },
  }
}
