import { useRouter } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import { useStore } from "zustand"
import { createStore } from "zustand/vanilla"
import type { StoreApi } from "zustand/vanilla"

import { createAuthApiClient } from "./api/authAPI"
import type { LoginCredentials } from "./api/authAPI"
import { createAuthenticatedApiClient } from "./authenticated-api-client"
import type { AuthenticatedApiClient } from "./authenticated-api-client"
import { createAuthSessionService } from "./auth-session-service"
import type {
  AuthSessionService,
  AuthStateSnapshot,
  AuthStateStore,
  LoginResult,
} from "./auth-session-service"

export interface AuthRuntime {
  store: StoreApi<AuthStateSnapshot>
  sessionService: AuthSessionService
  authenticatedApiClient: AuthenticatedApiClient
}

const INITIAL_AUTH_STATE: AuthStateSnapshot = {
  phase: "unknown",
  accessToken: null,
  identityProfile: null,
}

export function createAuthRuntime(args: { queryClient: QueryClient }): AuthRuntime {
  const store = createStore<AuthStateSnapshot>()(() => ({ ...INITIAL_AUTH_STATE }))

  const stateStore: AuthStateStore = {
    getState: store.getState,
    setState: (next) => store.setState(next, true),
  }

  const apiClient = createAuthApiClient(args.queryClient)
  const sessionService = createAuthSessionService(
    apiClient,
    args.queryClient,
    stateStore
  )
  const authenticatedApiClient = createAuthenticatedApiClient({
    authSessionService: sessionService,
  })

  // Wire authenticated client back into session service for logout flow
  sessionService._setAuthenticatedClient(authenticatedApiClient)

  return {
    store,
    sessionService,
    authenticatedApiClient,
  }
}

interface AuthHookState {
  session: AuthStateSnapshot
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  clear: () => void
  logout: () => Promise<void>
}

export default function useAuthStore(): AuthHookState {
  const router = useRouter()
  const auth = router.options.context.auth

  const session = useStore(auth.store, (state) => state)

  return {
    session,
    login: auth.sessionService.login,
    clear: auth.sessionService.clear,
    logout: auth.sessionService.logout,
  }
}
