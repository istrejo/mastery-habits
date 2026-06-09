import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateTaskSheet } from "./CreateTaskSheet";

// Mock @gorhom/bottom-sheet
jest.mock("@gorhom/bottom-sheet", () => {
  const actualReact = require("react");
  const rn = require("react-native");

  return {
    BottomSheetModal: actualReact.forwardRef(
      (props: any, ref: any) => {
        actualReact.useImperativeHandle(ref, () => ({
          present: jest.fn(),
          dismiss: jest.fn(),
          close: jest.fn(),
        }));
        return actualReact.createElement(rn.View, { testID: "bottom-sheet-modal" }, props.children);
      },
    ),
    BottomSheetModalProvider: (props: any) =>
      actualReact.createElement(rn.View, null, props.children),
    BottomSheetTextInput: (props: any) => {
      const { value, onChangeText, onBlur, placeholder, ...rest } = props;
      return actualReact.createElement("input", {
        ...rest,
        type: "text",
        value: value ?? "",
        placeholder: placeholder ?? "",
        onChange: (e: any) => onChangeText?.(e.target.value),
        onBlur: (e: any) => onBlur?.(e),
        "data-testid": rest.testID,
      });
    },
    BottomSheetView: (props: any) =>
      actualReact.createElement(rn.View, props),
    BottomSheetBackdrop: () =>
      actualReact.createElement(rn.View, null),
  };
});

// Mock MaterialIcons
jest.mock("@expo/vector-icons/MaterialIcons", () => {
  return function MockIcon(props: any) {
    return require("react").createElement(
      require("react-native").View,
      { testID: `icon-${props.name}` },
    );
  };
});

const defaultProps = {
  defaultDate: "2026-06-09",
  onSubmit: jest.fn(),
  onClose: jest.fn(),
};

describe("CreateTaskSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the title input field", () => {
    render(<CreateTaskSheet {...defaultProps} />);
    expect(screen.getByPlaceholderText("Task title")).toBeInTheDocument();
  });

  it("shows the default due date as text", () => {
    render(<CreateTaskSheet {...defaultProps} />);
    expect(screen.getByText("2026-06-09")).toBeInTheDocument();
  });

  it("renders frequency selector chips", () => {
    render(<CreateTaskSheet {...defaultProps} />);

    expect(screen.getByText("Once")).toBeInTheDocument();
    expect(screen.getByText("Daily")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("shows day-of-week selector when 'Custom' frequency is selected", async () => {
    render(<CreateTaskSheet {...defaultProps} />);

    const customChip = screen.getByText("Custom");
    fireEvent.click(customChip);

    await waitFor(() => {
      expect(screen.getAllByText("M")[0]).toBeInTheDocument();
      expect(screen.getAllByText("W")[0]).toBeInTheDocument();
      expect(screen.getAllByText("F")[0]).toBeInTheDocument();
    });
  });

  it("renders '+ Add subtask' button", () => {
    render(<CreateTaskSheet {...defaultProps} />);

    expect(screen.getByText("+ Add subtask")).toBeInTheDocument();
  });

  it("adds a subtask input row when '+ Add subtask' is clicked", async () => {
    render(<CreateTaskSheet {...defaultProps} />);

    fireEvent.click(screen.getByText("+ Add subtask"));

    await waitFor(() => {
      const subtaskInputs = screen.getAllByPlaceholderText("Subtask title");
      expect(subtaskInputs.length).toBeGreaterThan(0);
    });
  });

  it("calls onSubmit with correct data when save is pressed with valid title", async () => {
    const onSubmit = jest.fn();
    render(<CreateTaskSheet {...defaultProps} onSubmit={onSubmit} />);

    // Fill title
    const titleInput = screen.getByPlaceholderText("Task title");
    fireEvent.change(titleInput, { target: { value: "My Task" } });

    // Click save
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "My Task",
          due_date: "2026-06-09",
          frequency: "once",
        }),
      );
    });
  });

  it("includes custom_days when 'Custom' frequency is selected", async () => {
    const onSubmit = jest.fn();
    render(<CreateTaskSheet {...defaultProps} onSubmit={onSubmit} />);

    // Fill title
    const titleInput = screen.getByPlaceholderText("Task title");
    fireEvent.change(titleInput, { target: { value: "Gym" } });

    // Select "Custom" frequency
    fireEvent.click(screen.getByText("Custom"));

    // Wait for day chips to appear
    await waitFor(() => {
      expect(screen.getAllByText("M")[0]).toBeInTheDocument();
    });

    // Click M (Monday = 1), W (Wednesday = 3), F (Friday = 5)
    fireEvent.click(screen.getAllByText("M")[0]);
    fireEvent.click(screen.getAllByText("W")[0]);
    fireEvent.click(screen.getAllByText("F")[0]);

    // Click save
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Gym",
          frequency: "custom",
          custom_days: expect.arrayContaining([1, 3, 5]),
        }),
      );
    });
  });

  it("does NOT call onSubmit when title is empty", async () => {
    const onSubmit = jest.fn();
    render(<CreateTaskSheet {...defaultProps} onSubmit={onSubmit} />);

    // Click save without filling title
    fireEvent.click(screen.getByText("Save"));

    // onSubmit should not have been called
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
