import { render, screen, fireEvent } from "@testing-library/react";
import { HabitsSection } from "./HabitsSection";
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

const mockHabits: HabitWithCompletion[] = [
  {
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
  },
  {
    id: "h2",
    title: "Read",
    color: "#00FF00",
    frequency: "weekly",
    is_active: true,
    current_streak: 3,
    created_at: "2026-01-01",
    updated_at: "2026-06-01",
    user_id: "user-1",
    completed: true,
  },
];

describe("HabitsSection", () => {
  it("renders the Habits section header with an eco icon", () => {
    render(<HabitsSection habits={mockHabits} onToggle={() => {}} />);
    expect(screen.getByText("Habits")).toBeInTheDocument();
    expect(screen.getByTestId("icon-eco")).toBeInTheDocument();
  });

  it("renders a chip for each habit", () => {
    render(<HabitsSection habits={mockHabits} onToggle={() => {}} />);

    expect(screen.getByText("Exercise")).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  it("calls onToggle with the correct habitId when a chip is pressed", () => {
    const onToggle = jest.fn();
    render(<HabitsSection habits={mockHabits} onToggle={onToggle} />);

    fireEvent.click(screen.getByText("Exercise"));

    expect(onToggle).toHaveBeenCalledWith("h1");
  });

  it("handles an empty habits list gracefully", () => {
    render(<HabitsSection habits={[]} onToggle={() => {}} />);

    expect(screen.getByText("Habits")).toBeInTheDocument();
    // No chips should be rendered for empty list
    expect(screen.queryByLabelText(/Toggle/)).not.toBeInTheDocument();
  });

  it("renders a chevron icon for collapse/expand", () => {
    render(<HabitsSection habits={mockHabits} onToggle={() => {}} />);
    expect(screen.getByTestId("icon-keyboard-arrow-down")).toBeInTheDocument();
  });
});
