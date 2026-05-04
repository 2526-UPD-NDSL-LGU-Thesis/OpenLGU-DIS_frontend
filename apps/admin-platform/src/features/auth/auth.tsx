import { create } from "zustand"

import { createAuthenticatedApiClient } from "./authenticated-api-client"
import { createAuthSessionService } from "./auth-session-service"
import type { AuthStateSnapshot, LoginResult } from "./auth-session-service"
import type { LoginCredentials } from "./authAPI"

interface AuthState {
  session: AuthStateSnapshot
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  clear: () => void
  logout: () => Promise<void>
}

export const authSessionService = createAuthSessionService()
export const authenticatedApiClient = createAuthenticatedApiClient({ authSessionService })

// Wire authenticated client back into session service for logout flow
authSessionService._setAuthenticatedClient(authenticatedApiClient)

const useAuthStore = create<AuthState>()((set) => ({
  session: authSessionService.getAuthState(),
  async login(credentials) {
    const result = await authSessionService.login(credentials)
    set({ session: authSessionService.getAuthState() })
    return result
  },
  clear() {
    authSessionService.clear()
    set({ session: authSessionService.getAuthState() })
  },
  async logout() {
    await authSessionService.logout()
    set({ session: authSessionService.getAuthState() })
  },
}))

export default useAuthStore
