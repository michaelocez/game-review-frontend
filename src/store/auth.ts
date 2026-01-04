import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    token: string | null;
    userId: number | null;
    setAuth: (token: string, userId: number) => void;
    clearAuth: () => void;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            userId: null,
            setAuth: (token, userId) => set({ token, userId }),
            clearAuth: () => set({ token: null, userId: null }),
        }), {name: "auth-store"}
    )
)

export default useAuthStore;