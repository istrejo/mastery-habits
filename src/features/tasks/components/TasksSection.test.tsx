import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TasksSection } from "./TasksSection";
import type { TaskWithSubTasks } from "../hooks/useTasksQuery";

// Mock MaterialIcons — follow existing project pattern
jest.mock("@expo/vector-icons/MaterialIcons", () => {
  return function MockIcon(props: any) {
    return require("react").createElement(
      require("react-native").View,
      { testID: `icon-${props.name}` },
    );
  };
});

const mockTasks: TaskWithSubTasks[] = [
  {
    id: "t1",
    title: "Buy groceries",
    description: "Milk, eggs, bread",
    due_date: "2026-06-09",
    is_completed: false,
    completed_at: null,
    parent_id: null,
    priority: "high" as const,
    frequency: "once" as const,
    custom_days: null,
    created_at: "2026-06-01",
    updated_at: "2026-06-01",
    user_id: "user-1",
    subtasks: [],
  },
  {
    id: "t2",
    title: "Read chapter 5",
    description: null,
    due_date: "2026-06-09",
    is_completed: true,
    completed_at: "2026-06-09T10:00:00Z",
    parent_id: null,
    priority: "medium" as const,
    frequency: "daily" as const,
    custom_days: null,
    created_at: "2026-06-02",
    updated_at: "2026-06-02",
    user_id: "user-1",
    subtasks: [],
  },
];

describe("TasksSection", () => {
  it("renders the section header with 'Tasks' title", () => {
    render(
      <TasksSection
        tasks={[]}
        onToggleTask={jest.fn()}
        onAddTask={jest.fn()}
      />,
    );

    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });

  it("renders the checklist icon in the header", () => {
    render(
      <TasksSection
        tasks={[]}
        onToggleTask={jest.fn()}
        onAddTask={jest.fn()}
      />,
    );

    expect(screen.getByTestId("icon-checklist")).toBeInTheDocument();
  });

  it("renders the chevron icon for collapse/expand", () => {
    render(
      <TasksSection
        tasks={[]}
        onToggleTask={jest.fn()}
        onAddTask={jest.fn()}
      />,
    );

    // When expanded, shows keyboard-arrow-up; when collapsed, keyboard-arrow-down
    // Default is expanded
    expect(screen.getByTestId("icon-keyboard-arrow-up")).toBeInTheDocument();
  });

  it("renders each task title", () => {
    render(
      <TasksSection
        tasks={mockTasks}
        onToggleTask={jest.fn()}
        onAddTask={jest.fn()}
      />,
    );

    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Read chapter 5")).toBeInTheDocument();
  });

  it("shows '+ Add Task' button", () => {
    render(
      <TasksSection
        tasks={[]}
        onToggleTask={jest.fn()}
        onAddTask={jest.fn()}
      />,
    );

    expect(screen.getByText("+ Add Task")).toBeInTheDocument();
  });

  it("calls onAddTask when '+ Add Task' is pressed", () => {
    const onAddTask = jest.fn();

    render(
      <TasksSection
        tasks={[]}
        onToggleTask={jest.fn()}
        onAddTask={onAddTask}
      />,
    );

    fireEvent.click(screen.getByText("+ Add Task"));
    expect(onAddTask).toHaveBeenCalledTimes(1);
  });

  it("shows task count in header when tasks exist", () => {
    render(
      <TasksSection
        tasks={mockTasks}
        onToggleTask={jest.fn()}
        onAddTask={jest.fn()}
      />,
    );

    expect(screen.getByText("Tasks (2)")).toBeInTheDocument();
  });

  it("shows no task count when empty", () => {
    render(
      <TasksSection
        tasks={[]}
        onToggleTask={jest.fn()}
        onAddTask={jest.fn()}
      />,
    );

    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.queryByText(/Tasks \(\d+\)/)).not.toBeInTheDocument();
  });
});
