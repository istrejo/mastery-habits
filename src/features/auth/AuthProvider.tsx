import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { supabase } from "../../core/api/supabase";
import { useAuthStore } from "./useAuthStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, setLoading, session } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)/today");
    }
  }, [session, segments]);

  return <>{children}</>;
}
