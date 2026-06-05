const React = require('react');

const mockComponent = (name) => {
  const Component = (props) => React.createElement(name, props, props.children);
  Component.displayName = name;
  return Component;
};

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: mockComponent('LinearGradient'),
}));

jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: mockComponent('Svg'),
  Circle: mockComponent('Circle'),
}));
