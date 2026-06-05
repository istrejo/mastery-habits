import "../global.css";
import { useEffect, useState } from "react";
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
import { LocaleProvider, initI18n, resolveLocale, useLocaleStore } from "@core/i18n";
import { useSessionStore } from "@core/states/session.store";
import { supabase } from "@core/lib/supabase";

initI18n(resolveLocale(useLocaleStore.getState().locale));

function AuthGate({ onReady }: { onReady: (ready: boolean) => void }) {
  const router = useRouter();
  const segments = useSegments();
  const { session, setSession } = useSessionStore();
  const [mounted, setMounted] = useState(false);
  const [sessionResolved, setSessionResolved] = useState(false);

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

      setSessionResolved(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      setSession(s);
      setSessionResolved(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [setSession]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onReady(sessionResolved);
  }, [onReady, sessionResolved]);

  useEffect(() => {
    if (!mounted || !sessionResolved) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, sessionResolved, segments, router, mounted]);

  return null;
}

export default function RootLayout() {
  const [authReady, setAuthReady] = useState(false);
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
        {fontsLoaded ? <AuthGate onReady={setAuthReady} /> : null}
        {fontsLoaded && authReady ? (
          <Stack screenOptions={{ headerShown: false }} />
        ) : null}
      </LocaleProvider>
    </ThemeProvider>
  );
}
