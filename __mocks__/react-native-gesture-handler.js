// Mock for react-native-gesture-handler — provides minimal API surface
// so that Jest can parse components importing from gesture-handler.

const React = require('react');

// Builder pattern: each method returns `this` for chaining
function createGestureBuilder() {
  const builder = {};
  const methods = [
    'minDistance',
    'maxDistance',
    'onStart',
    'onUpdate',
    'onEnd',
    'onBegin',
    'onFinalize',
    'enabled',
    'simultaneousWithExternalGesture',
    'requireExternalGestureToFail',
    'withRef',
    'activeOffsetX',
    'activeOffsetY',
    'failOffsetX',
    'failOffsetY',
    'hitSlop',
    'maxPointers',
    'minPointers',
    'activateAfterLongPress',
    'numberOfTaps',
    'maxDurationMs',
  ];
  methods.forEach((method) => {
    builder[method] = () => builder;
  });
  return builder;
}

const Gesture = {
  Pan: () => createGestureBuilder(),
  Tap: () => createGestureBuilder(),
  LongPress: () => createGestureBuilder(),
  Pinch: () => createGestureBuilder(),
  Rotation: () => createGestureBuilder(),
  Fling: () => createGestureBuilder(),
  Native: () => createGestureBuilder(),
  Race: (...gestures) => gestures[0],
  Simultaneous: (...gestures) => gestures[0],
  Exclusive: (...gestures) => gestures[0],
};

const GestureDetector = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

module.exports = {
  __esModule: true,
  Gesture,
  GestureDetector,
  default: { Gesture, GestureDetector },
};
