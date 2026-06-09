import "../global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "../src/core/api/supabase";
import { useAuthStore } from "../src/features/auth/useAuthStore";
import { ThemeProvider } from "../src/core/theme/ThemeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AuthGuard() {
  const { session, isLoading, setSession, setLoading } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    }).catch(() => {
      // ignore errors, just finish loading
    }).finally(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)/today");
    }
  }, [session, segments, isLoading, router]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <AuthGuard />
          </ThemeProvider>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
