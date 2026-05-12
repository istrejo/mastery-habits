import React from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const contentBase: ViewStyle = {
    paddingHorizontal: t.spacing.marginMobile,
    paddingTop: t.spacing.stackMd,
    paddingBottom: t.spacing.stackLg,
  };

  if (scrollable) {
    return (
      <SafeAreaView style={[baseStyle, style]}>
        <ScrollView
          contentContainerStyle={[contentBase, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[baseStyle, style]}>
      <View style={[{ flex: 1 }, contentBase, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};
