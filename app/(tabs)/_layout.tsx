import { Tabs } from "expo-router";
import { useTheme } from "@core/theming";

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.bg.surface,
          borderTopColor: t.border.default,
          borderTopWidth: t.borderWidth.hairline,
        },
        tabBarActiveTintColor: t.accent.primary,
        tabBarInactiveTintColor: t.text.tertiary,
      }}
    />
  );
}
