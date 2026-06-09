import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SubTaskRow } from "./SubTaskRow";
import type { Database } from "../../../shared/types/database.types";

// Mock MaterialIcons
jest.mock("@expo/vector-icons/MaterialIcons", () => {
  return function MockIcon(props: any) {
    return require("react").createElement(
      require("react-native").View,
      { testID: `icon-${props.name}` },
    );
  };
});

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

const baseSubTask: TaskRow = {
  id: "st1",
  title: "Buy milk",
  description: null,
  due_date: "2026-06-09",
  is_completed: false,
  completed_at: null,
  parent_id: "t1",
  priority: "low",
  frequency: "once",
  custom_days: null,
  created_at: "2026-06-03",
  updated_at: "2026-06-03",
  user_id: "user-1",
};

describe("SubTaskRow", () => {
  it("renders the sub-task title", () => {
    render(<SubTaskRow subtask={baseSubTask} onToggle={jest.fn()} />);

    expect(screen.getByText("Buy milk")).toBeInTheDocument();
  });

  it("renders unchecked icon when sub-task is not completed", () => {
    render(<SubTaskRow subtask={baseSubTask} onToggle={jest.fn()} />);

    expect(screen.getByTestId("icon-radio-button-unchecked")).toBeInTheDocument();
  });

  it("renders checked icon when sub-task is completed", () => {
    const completed = { ...baseSubTask, is_completed: true, completed_at: "2026-06-09T10:00:00Z" };
    render(<SubTaskRow subtask={completed} onToggle={jest.fn()} />);

    expect(screen.getByTestId("icon-check-circle")).toBeInTheDocument();
  });

  it("has correct accessibility label on checkbox", () => {
    render(<SubTaskRow subtask={baseSubTask} onToggle={jest.fn()} />);

    const toggleButton = screen.getByLabelText("Toggle subtask Buy milk");
    expect(toggleButton).toBeInTheDocument();
  });

  it("calls onToggle when checkbox is pressed", () => {
    const onToggle = jest.fn();
    render(<SubTaskRow subtask={baseSubTask} onToggle={onToggle} />);

    fireEvent.click(screen.getByLabelText("Toggle subtask Buy milk"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
