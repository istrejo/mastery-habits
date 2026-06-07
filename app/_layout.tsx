import "../global.css";
import { useEffect, useRef } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { Anton_400Regular } from "@expo-google-fonts/anton";
import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from "@expo-google-fonts/lexend";
import { ThemeProvider } from "@core/theming";
import { ErrorBoundary } from "@core/components";
import { LocaleProvider, initI18n, resolveLocale, useLocaleStore } from "@core/i18n";
import { useSessionStore } from "@core/states/session.store";
import { supabase } from "@core/lib/supabase";
import { useTaskAutoSync } from '@tasks/index';

initI18n(resolveLocale(useLocaleStore.getState().locale));

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { session, setSession } = useSessionStore();
  const mounted = useRef(false);
  const sessionResolvedRef = useRef(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        void supabase.auth.signOut();
        setSession(null);
      } else {
        setSession(data.session);
      }

      sessionResolvedRef.current = true;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      setSession(s);
      sessionResolvedRef.current = true;
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [setSession]);

  useEffect(() => {
    mounted.current = true;
  }, []);

  useEffect(() => {
    if (!mounted.current || !sessionResolvedRef.current) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, segments, router]);

  return null;
}

function TaskSyncBootstrap() {
  useTaskAutoSync();
  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Anton_400Regular,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  return (
    <ThemeProvider>
      <LocaleProvider>
        <ErrorBoundary>
          {fontsLoaded ? (
            <>
              <AuthGate />
              <TaskSyncBootstrap />
              <Stack screenOptions={{ headerShown: false }} />
            </>
          ) : null}
        </ErrorBoundary>
      </LocaleProvider>
    </ThemeProvider>
  );
}
