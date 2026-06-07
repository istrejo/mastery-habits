// Mock for react-native-reanimated v4 — provides identical API surface
// so that Jest can parse components importing from reanimated.

const React = require('react');

const mockComponent = (name) => {
  const Component = React.forwardRef((props, ref) =>
    React.createElement(name, { ...props, ref })
  );
  Component.displayName = name;
  return Component;
};

const NOOP = () => {};
const ID = (t) => t;

// Hook mocks
const useSharedValue = (init) => {
  const ref = React.useRef({ value: init });
  return ref.current;
};

const useAnimatedStyle = (cb) => {
  return React.useMemo(() => {
    try {
      return cb();
    } catch {
      return {};
    }
  }, []);
};

const useAnimatedProps = (cb) => {
  return React.useMemo(() => {
    try {
      return cb();
    } catch {
      return {};
    }
  }, []);
};

const useDerivedValue = (cb, deps) => {
  return React.useMemo(() => {
    try {
      return { value: cb() };
    } catch {
      return { value: undefined };
    }
  }, deps || []);
};

const useAnimatedRef = () => React.useRef(null);
const useAnimatedScrollHandler = NOOP;
const useAnimatedSensor = NOOP;
const useAnimatedKeyboard = NOOP;
const useScrollViewOffset = NOOP;
const useEvent = NOOP;
const useAnimatedReaction = NOOP;

// Animation builders
const withTiming = (toValue, _config, callback) => {
  if (callback) callback(true);
  return toValue;
};

const withSpring = (toValue, _config, callback) => {
  if (callback) callback(true);
  return toValue;
};

const withDelay = (_delayMs, nextAnimation) => nextAnimation;
const withRepeat = (animation, _count) => animation;
const withSequence = (...animations) => animations[animations.length - 1];
const withDecay = (config, callback) => {
  if (callback) callback(true);
  return config;
};

const cancelAnimation = NOOP;
const runOnJS = (fn) => (...args) => fn(...args);
const runOnUI = (fn) => fn;
const createWorkletRuntime = NOOP;
const makeMutable = (value) => ({ value });

// Interpolation
const interpolate = (value, _inputRange, outputRange) => {
  if (typeof value !== 'number') return outputRange[0];
  const idx = Math.round(value * (outputRange.length - 1));
  return outputRange[Math.min(Math.max(idx, 0), outputRange.length - 1)];
};

const interpolateColor = (value, inputRange, outputRange) => {
  if (typeof value !== 'number') return outputRange[0];
  const idx = Math.round(value * (outputRange.length - 1));
  return outputRange[Math.min(Math.max(idx, 0), outputRange.length - 1)];
};

const Extrapolation = {
  CLAMP: 'clamp',
  EXTEND: 'extend',
  IDENTITY: 'identity',
};

// Easing
const Easing = {
  linear: ID,
  ease: ID,
  quad: ID,
  cubic: ID,
  poly: ID,
  sin: ID,
  circle: ID,
  exp: ID,
  elastic: ID,
  back: ID,
  bounce: ID,
  bezier: NOOP,
  bezierFn: ID,
  steps: NOOP,
  in: NOOP,
  out: NOOP,
  inOut: NOOP,
};

// SensorType
const SensorType = { ACCELEROMETER: 1, GYROSCOPE: 2, GRAVITY: 3, MAGNETIC_FIELD: 4, ROTATION: 5 };

// Animated components — must be renderable React components, not strings
const Animated = {
  View: mockComponent('Animated.View'),
  Text: mockComponent('Animated.Text'),
  Image: mockComponent('Animated.Image'),
  ScrollView: mockComponent('Animated.ScrollView'),
  FlatList: mockComponent('Animated.FlatList'),
  SectionList: mockComponent('Animated.SectionList'),
  createAnimatedComponent: (Component) => {
    // Return a wrapper that renders the original component with animatedProps support
    const Wrapped = React.forwardRef((props, ref) => {
      const { animatedProps, ...rest } = props || {};
      return React.createElement(Component, { ...rest, ...(animatedProps || {}), ref });
    });
    Wrapped.displayName = `Animated.${Component.displayName || Component.name || 'Component'}`;
    return Wrapped;
  },
};

module.exports = {
  __esModule: true,

  // Default export (Animated namespace)
  default: Animated,

  // Hooks
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedSensor,
  useAnimatedKeyboard,
  useScrollViewOffset,
  useEvent,
  useAnimatedReaction,

  // Animation builders
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  withDecay,

  // Utils
  cancelAnimation,
  runOnJS,
  runOnUI,
  createWorkletRuntime,
  makeMutable,
  interpolate,
  interpolateColor,
  Extrapolation,
  Easing,
  SensorType,
};
