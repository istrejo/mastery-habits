import { Tabs } from "expo-router";
import { useTheme } from "@core/theming";
import { Ionicons } from "@expo/vector-icons";

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
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hábitos",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "checkmark-circle" : "checkmark-circle-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
