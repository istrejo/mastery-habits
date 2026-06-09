/** @type {import('jest').Config} */
module.exports = {
  testMatch: ["**/src/**/*.test.{ts,tsx}"],

  // DOM environment for react-native-web components
  testEnvironment: "jest-environment-jsdom",

  // Setup: extend expect with jest-dom matchers (runs after env, before tests)
  setupFilesAfterEnv: ["./jest.setup.ts"],

  // Map react-native to react-native-web for DOM rendering in tests
  moduleNameMapper: {
    "^react-native$": "react-native-web",
  },

  // Transform TypeScript/JSX with babel-jest using Expo's babel preset
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": [
      "babel-jest",
      {
        presets: ["babel-preset-expo"],
      },
    ],
  },

  // Transform node_modules that ship untranspiled code
  transformIgnorePatterns: [
    "node_modules/(?!(" +
      "react-native|@react-native|@react-navigation|" +
      "expo|@expo|expo-router|" +
      "react-native-.*|" +
      "@testing-library|" +
      "@gorhom|" +
      "nativewind|react-native-css-interop|" +
      ")/)",
  ],
};
