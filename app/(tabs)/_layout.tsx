import { Tabs } from "expo-router";
import { useTheme } from "@core/theming";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function TabsLayout() {
  const t = useTheme();
  const { t: tr } = useTranslation();
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
    >
      <Tabs.Screen
        name="index"
        options={{
          title: tr("tabs.habits"),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="bolt" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="grid"
        options={{
          title: tr("tabs.power_grid"),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="grid-view" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: tr("tabs.stats"),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="leaderboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: tr("tabs.profile"),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
