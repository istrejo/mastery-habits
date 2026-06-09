import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskRow } from "./TaskRow";
import type { TaskWithSubTasks } from "../hooks/useTasksQuery";

// Mock MaterialIcons
jest.mock("@expo/vector-icons/MaterialIcons", () => {
  return function MockIcon(props: any) {
    return require("react").createElement(
      require("react-native").View,
      { testID: `icon-${props.name}` },
    );
  };
});

const baseTask: TaskWithSubTasks = {
  id: "t1",
  title: "Buy groceries",
  description: null,
  due_date: "2026-06-09",
  is_completed: false,
  completed_at: null,
  parent_id: null,
  priority: "medium" as const,
  frequency: "once" as const,
  custom_days: null,
  created_at: "2026-06-01",
  updated_at: "2026-06-01",
  user_id: "user-1",
  subtasks: [],
};

describe("TaskRow", () => {
  it("renders the task title", () => {
    render(<TaskRow task={baseTask} onToggle={jest.fn()} onAddSubtask={jest.fn()} />);

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("renders unchecked icon when task is not completed", () => {
    render(<TaskRow task={baseTask} onToggle={jest.fn()} onAddSubtask={jest.fn()} />);

    expect(screen.getByTestId("icon-radio-button-unchecked")).toBeInTheDocument();
  });

  it("renders checked icon when task is completed", () => {
    const completedTask = { ...baseTask, is_completed: true, completed_at: "2026-06-09T10:00:00Z" };
    render(<TaskRow task={completedTask} onToggle={jest.fn()} onAddSubtask={jest.fn()} />);

    expect(screen.getByTestId("icon-check-circle")).toBeInTheDocument();
  });

  it("renders 'High Priority' badge when priority is 'high'", () => {
    const highTask = { ...baseTask, priority: "high" as const };
    render(<TaskRow task={highTask} onToggle={jest.fn()} onAddSubtask={jest.fn()} />);

    expect(screen.getByText("High Priority")).toBeInTheDocument();
  });

  it("does NOT render 'High Priority' badge when priority is not 'high'", () => {
    render(<TaskRow task={baseTask} onToggle={jest.fn()} onAddSubtask={jest.fn()} />);

    expect(screen.queryByText("High Priority")).not.toBeInTheDocument();
  });

  it("renders description when present", () => {
    const withDesc = { ...baseTask, description: "Milk, eggs, bread" };
    render(<TaskRow task={withDesc} onToggle={jest.fn()} onAddSubtask={jest.fn()} />);

    expect(screen.getByText("Milk, eggs, bread")).toBeInTheDocument();
  });

  it("does not render description when null", () => {
    render(<TaskRow task={baseTask} onToggle={jest.fn()} onAddSubtask={jest.fn()} />);

    // Only the title should be present — description area is not rendered
    expect(screen.queryByTestId("task-description")).not.toBeInTheDocument();
  });

  it("has correct accessibility label on checkbox area", () => {
    render(<TaskRow task={baseTask} onToggle={jest.fn()} onAddSubtask={jest.fn()} />);

    const toggleButton = screen.getByLabelText("Toggle Buy groceries");
    expect(toggleButton).toBeInTheDocument();
  });

  it("calls onToggle when checkbox is pressed", () => {
    const onToggle = jest.fn();
    render(<TaskRow task={baseTask} onToggle={onToggle} onAddSubtask={jest.fn()} />);

    fireEvent.click(screen.getByLabelText("Toggle Buy groceries"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("shows sub-task count when subtasks exist", () => {
    const taskWithSubs = {
      ...baseTask,
      subtasks: [
        { id: "st1", title: "Sub 1", ...baseTask, parent_id: "t1" } as any,
        { id: "st2", title: "Sub 2", ...baseTask, parent_id: "t1" } as any,
      ],
    };
    render(<TaskRow task={taskWithSubs} onToggle={jest.fn()} onAddSubtask={jest.fn()} />);

    expect(screen.getByText("2 subtasks")).toBeInTheDocument();
  });
});
