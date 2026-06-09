import { render, screen, fireEvent } from "@testing-library/react";
import { HabitChip } from "./HabitChip";
import type { HabitWithCompletion } from "../hooks/useHabitsQuery";

// Mock MaterialIcons — use createElement to avoid jsxImportSource issues in mock factory
jest.mock("@expo/vector-icons/MaterialIcons", () => {
  return function MockIcon(props: any) {
    return require("react").createElement(
      require("react-native").View,
      { testID: `icon-${props.name}` },
    );
  };
});

const baseHabit: HabitWithCompletion = {
  id: "h1",
  title: "Exercise",
  color: "#FF0000",
  frequency: "daily",
  is_active: true,
  current_streak: 5,
  created_at: "2026-01-01",
  updated_at: "2026-06-01",
  user_id: "user-1",
  completed: false,
};

describe("HabitChip", () => {
  it("renders the habit title", () => {
    render(<HabitChip habit={baseHabit} onToggle={() => {}} />);
    expect(screen.getByText("Exercise")).toBeInTheDocument();
  });

  it("shows radio_button_unchecked icon when not completed", () => {
    render(<HabitChip habit={baseHabit} onToggle={() => {}} />);
    expect(screen.getByTestId("icon-radio-button-unchecked")).toBeInTheDocument();
  });

  it("shows check_circle icon when completed", () => {
    const completed = { ...baseHabit, completed: true };
    render(<HabitChip habit={completed} onToggle={() => {}} />);
    expect(screen.getByTestId("icon-check-circle")).toBeInTheDocument();
  });

  it("calls onToggle when pressed", () => {
    const onToggle = jest.fn();
    render(<HabitChip habit={baseHabit} onToggle={onToggle} />);

    fireEvent.click(screen.getByText("Exercise"));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("has correct accessibility label", () => {
    render(<HabitChip habit={baseHabit} onToggle={() => {}} />);
    expect(screen.getByLabelText("Toggle Exercise")).toBeInTheDocument();
  });

  it("renders with different colors without crashing", () => {
    const blueHabit = { ...baseHabit, color: "#0000FF" };
    const nullColorHabit = { ...baseHabit, color: null };

    expect(() => {
      render(<HabitChip habit={blueHabit} onToggle={() => {}} />);
    }).not.toThrow();

    expect(() => {
      render(<HabitChip habit={nullColorHabit} onToggle={() => {}} />);
    }).not.toThrow();
  });
});
