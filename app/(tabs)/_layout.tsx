import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '@core/theming';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FloatingTimer } from '@pomodoro/index';

export default function TabsLayout() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: t.bg.surface,
            borderTopColor: t.border.default,
            borderTopWidth: t.borderWidth.default,
            height: 72,
            paddingTop: 8,
            paddingBottom: 18,
          },
          tabBarActiveTintColor: t.accent.primary,
          tabBarInactiveTintColor: t.text.tertiary,
        }}
      >
        <Tabs.Screen name='index' options={{ href: null }} />
        <Tabs.Screen
          name='today'
          options={{
            title: tr('tabs.today'),
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='task-alt' size={23} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='pomodoro'
          options={{
            title: tr('tabs.pomodoro'),
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='timer' size={23} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='stats'
          options={{
            title: tr('tabs.stats'),
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='leaderboard' size={23} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='profile'
          options={{
            title: tr('tabs.profile'),
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='person-outline' size={23} color={color} />
            ),
          }}
        />
        <Tabs.Screen name='grid' options={{ href: null }} />
      </Tabs>
      <FloatingTimer />
    </View>
  );
}
