import "../global.css";
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ThemeProvider } from "@core/theming";
import { useSessionStore } from "@core/states/session.store";
import { supabase } from "@core/lib/supabase";

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { session, setSession } = useSessionStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, segments, router, mounted]);

  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
