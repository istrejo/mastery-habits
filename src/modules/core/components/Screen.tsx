import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@core/theming';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentStyle,
}) => {
  const t = useTheme();

  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: t.bg.base,
  };

  if (scrollable) {
    return (
      <SafeAreaView style={[baseStyle, style]}>
        <ScrollView
          contentContainerStyle={[{ padding: 16 }, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[baseStyle, style]}>
      <View style={[{ flex: 1, padding: 16 }, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};
