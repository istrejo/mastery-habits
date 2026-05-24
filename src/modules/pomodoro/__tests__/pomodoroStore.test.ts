import { usePomodoroStore } from '../states/pomodoro.store';
import { DEFAULT_CONFIG } from '../utils/DEFAULT_CONFIG';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const reset = () =>
  usePomodoroStore.setState({
    status: 'idle',
    phase: 'work',
    cycleIndex: 1,
    startedAt: null,
    pausedAt: null,
    pausedAccumMs: 0,
    plannedDurationSeconds: DEFAULT_CONFIG.workSeconds,
    targetHabitId: null,
    targetTaskId: null,
    config: { ...DEFAULT_CONFIG },
    autoCheckIn: false,
  });

beforeEach(reset);

describe('usePomodoroStore', () => {
  it('start sets status to running and resets anchors', () => {
    usePomodoroStore.getState().start({ habitId: 'h1' });
    const s = usePomodoroStore.getState();
    expect(s.status).toBe('running');
    expect(s.phase).toBe('work');
    expect(s.cycleIndex).toBe(1);
    expect(s.startedAt).not.toBeNull();
    expect(s.pausedAccumMs).toBe(0);
    expect(s.targetHabitId).toBe('h1');
  });

  it('pause captures pausedAt', () => {
    usePomodoroStore.getState().start();
    usePomodoroStore.getState().pause();
    const s = usePomodoroStore.getState();
    expect(s.status).toBe('paused');
    expect(s.pausedAt).not.toBeNull();
  });

  it('resume accumulates paused ms and clears pausedAt', () => {
    usePomodoroStore.getState().start();
    usePomodoroStore.setState({ pausedAt: Date.now() - 5000, status: 'paused' });
    usePomodoroStore.getState().resume();
    const s = usePomodoroStore.getState();
    expect(s.status).toBe('running');
    expect(s.pausedAt).toBeNull();
    expect(s.pausedAccumMs).toBeGreaterThanOrEqual(5000);
  });

  it('reset returns to idle', () => {
    usePomodoroStore.getState().start({ habitId: 'h1' });
    usePomodoroStore.getState().reset();
    const s = usePomodoroStore.getState();
    expect(s.status).toBe('idle');
    expect(s.startedAt).toBeNull();
    expect(s.targetHabitId).toBeNull();
  });

  it('tickFinish sets status to finished and advances phase', () => {
    usePomodoroStore.getState().start();
    usePomodoroStore.getState().tickFinish();
    const s = usePomodoroStore.getState();
    expect(s.status).toBe('finished');
    expect(s.phase).toBe('short_break');
  });

  it('setAutoCheckIn toggles the flag', () => {
    usePomodoroStore.getState().setAutoCheckIn(true);
    expect(usePomodoroStore.getState().autoCheckIn).toBe(true);
    usePomodoroStore.getState().setAutoCheckIn(false);
    expect(usePomodoroStore.getState().autoCheckIn).toBe(false);
  });
});
