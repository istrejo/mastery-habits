import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#006c49",
        tabBarInactiveTintColor: "#434655",
        tabBarStyle: {
          backgroundColor: "#fefaf6",
          borderTopColor: "#e0ddd8",
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="today" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: "Today tab",
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="cached" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: "Habits tab",
        }}
      />
      <Tabs.Screen
        name="pomodoro"
        options={{
          title: "Pomodoro",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="timer" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: "Pomodoro tab",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: "Settings tab",
        }}
      />
    </Tabs>
  );
}
