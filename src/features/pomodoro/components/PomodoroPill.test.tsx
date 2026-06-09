import { render, screen, fireEvent } from "@testing-library/react";

// Mock the pomodoro store
const mockPomodoroStore = {
  secondsRemaining: 1500,
  workDuration: 1500,
  shortBreakDuration: 300,
  longBreakDuration: 900,
};

jest.mock("../usePomodoroStore", () => ({
  usePomodoroStore: (selector?: (state: any) => any) => {
    if (selector) return selector(mockPomodoroStore);
    return mockPomodoroStore;
  },
}));

// Mock MaterialIcons
jest.mock("@expo/vector-icons/MaterialIcons", () => ({
  __esModule: true,
  default: (props: any) => null,
}));

import { PomodoroPill } from "./PomodoroPill";

describe("PomodoroPill", () => {
  it("renders with default time '25:00' when secondsRemaining is 1500", () => {
    render(<PomodoroPill onPress={() => {}} />);
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  it("renders time as MM:SS format", () => {
    mockPomodoroStore.secondsRemaining = 65;
    render(<PomodoroPill onPress={() => {}} />);
    expect(screen.getByText("01:05")).toBeInTheDocument();
  });

  it("renders single-digit minutes without padding when under 10 minutes", () => {
    mockPomodoroStore.secondsRemaining = 305; // 5:05
    render(<PomodoroPill onPress={() => {}} />);
    expect(screen.getByText("05:05")).toBeInTheDocument();
  });

  it("renders 0 seconds correctly", () => {
    mockPomodoroStore.secondsRemaining = 0;
    render(<PomodoroPill onPress={() => {}} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    mockPomodoroStore.secondsRemaining = 1500;
    render(<PomodoroPill onPress={onPress} />);

    // Find by accessibility label
    const button = screen.getByLabelText("Pomodoro timer 25:00");
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("has correct accessibility label with time", () => {
    mockPomodoroStore.secondsRemaining = 60;
    render(<PomodoroPill onPress={() => {}} />);
    expect(
      screen.getByLabelText("Pomodoro timer 01:00"),
    ).toBeInTheDocument();
  });

  it("uses MM:SS format for values over 1 hour", () => {
    mockPomodoroStore.secondsRemaining = 3661; // 1h 1m 1s
    render(<PomodoroPill onPress={() => {}} />);
    expect(screen.getByText("61:01")).toBeInTheDocument();
  });

  // Reset mock state after tests
  afterEach(() => {
    mockPomodoroStore.secondsRemaining = 1500;
  });
});
