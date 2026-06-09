// Extend Jest matchers with @testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock NativeWind (no-op in test environment)
jest.mock("nativewind", () => ({
  styled: (component: any) => component,
  useColorScheme: () => "light",
}));

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  ScrollView: "ScrollView",
  FlatList: "FlatList",
}));

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => ({
  default: {
    View: "View",
    Text: "Text",
  },
  useSharedValue: (val: any) => ({ value: val }),
  useAnimatedStyle: () => ({}),
  withTiming: (val: any) => val,
}));
