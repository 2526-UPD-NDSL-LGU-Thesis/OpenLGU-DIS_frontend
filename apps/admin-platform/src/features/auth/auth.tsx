import { create } from "zustand"

import { createAuthSessionService } from "./auth-session-service"
import type { AuthStateSnapshot, LoginResult } from "./auth-session-service"
import type { LoginCredentials } from "./authAPI"

interface AuthState {
  session: AuthStateSnapshot
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  clear: () => void
}

export const authSessionService = createAuthSessionService()

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
}))

export default useAuthStore
