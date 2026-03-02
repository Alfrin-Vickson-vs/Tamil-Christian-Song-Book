import { create } from 'zustand';

interface AuthState {
    user: any | null;
    session: any | null;
    role: 'admin' | 'user' | null;
    isLoading: boolean;
    setUser: (user: any | null, role?: 'admin' | 'user' | null) => void;
    setSession: (session: any | null) => void;
    setLoading: (isLoading: boolean) => void;
    signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    role: null,
    isLoading: true,
    setUser: (user, role = null) => set({ user, role }),
    setSession: (session) => set({ session }),
    setLoading: (isLoading) => set({ isLoading }),
    signOut: () => set({ user: null, session: null, role: null }),
}));
