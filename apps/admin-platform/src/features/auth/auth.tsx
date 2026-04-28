import { create } from 'zustand';
import type { User } from '#/types/users.tsx';

// TODO connect to authAPI

interface AuthState {
    user: User | null,
    isAuthenticated: boolean,
    //login: (username: string, password: string) => Promise<void>,
    //logout: () => Promise<void>
}

const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    isAuthenticated: false,
    //login: async (username, password) => set((state) => )
}));

