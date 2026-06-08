import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Session, User } from "@supabase/supabase-js";
import { mmkvStorage } from "../../core/storage/mmkvAdapter";

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  loginAttempts: number;
  loginBlockedUntil: number;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  recordLoginAttempt: () => void;
  resetLoginAttempts: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      isLoading: true,
      loginAttempts: 0,
      loginBlockedUntil: 0,
      setSession: (session) => set({ session, user: session?.user ?? null }),
      setLoading: (isLoading) => set({ isLoading }),
      recordLoginAttempt: () =>
        set((state) => {
          const attempts = state.loginAttempts + 1;
          const MAX_ATTEMPTS = 5;
          const BLOCK_DURATION = 30 * 1000; // 30 seconds
          const blockedUntil = attempts >= MAX_ATTEMPTS ? Date.now() + BLOCK_DURATION : 0;
          return { loginAttempts: attempts, loginBlockedUntil: blockedUntil };
        }),
      resetLoginAttempts: () => set({ loginAttempts: 0, loginBlockedUntil: 0 }),
      reset: () => set({ session: null, user: null, isLoading: false, loginAttempts: 0, loginBlockedUntil: 0 }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ session: state.session, user: state.user }),
    }
  )
);
