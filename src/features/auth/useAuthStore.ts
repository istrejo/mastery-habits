import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Session, User } from "@supabase/supabase-js";
import { mmkvStorage } from "../../core/storage/mmkvAdapter";

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      isLoading: true,
      setSession: (session) => set({ session, user: session?.user ?? null }),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set({ session: null, user: null, isLoading: false }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ session: state.session, user: state.user }),
    }
  )
);
