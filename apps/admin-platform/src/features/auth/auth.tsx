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

  // Also register the authenticated client for shared libraries (e.g., verificationService)
  // so library code can delegate requests through the app's auth/session layer.
  try {
    // Set a well-known global so libraries can pick it up at runtime.
    ;(globalThis as any).__OPENLGU_AUTH_CLIENT = authenticatedApiClient
  } catch {
    // Ignore global assignment failures in restricted runtimes
  }

  // Lazy-import the verification service setter to avoid circular deps in build-time
  try {
    // Import the setter dynamically to avoid coupling the UI library to app auth internals at module-eval time.
    // This will be stripped by bundlers when unused in other apps.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { setVerificationRequestClient } = require("@openlguid/ui/features/verification/api/verificationService")
    if (typeof setVerificationRequestClient === "function") {
      setVerificationRequestClient((path: string, init?: RequestInit) =>
        authenticatedApiClient.request(path, init)
      )
    }
  } catch {
    // Best-effort: if the UI library isn't available or import fails, fall back to the global above.
  }

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
