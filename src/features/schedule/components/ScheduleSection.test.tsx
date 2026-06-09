import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock MaterialIcons to a simple View that renders nothing but exposes testID
jest.mock("@expo/vector-icons/MaterialIcons", () => ({
  __esModule: true,
  default: (props: any) => null,
}));

import { ScheduleSection } from "./ScheduleSection";
import type { ScheduleEvent } from "../mockSchedule";

const mockEvents: ScheduleEvent[] = [
  {
    id: "e1",
    title: "Team Standup",
    time: "09:30 AM",
    subtitle: "Google Meet",
    kind: "video",
  },
  {
    id: "e2",
    title: "Coffee at Blue Bottle",
    time: "03:00 PM",
    subtitle: "123 Main St",
    kind: "location",
  },
  {
    id: "e3",
    title: "Design Review",
    time: "10:00 AM",
    subtitle: "Zoom",
    kind: "video",
  },
];

describe("ScheduleSection", () => {
  it("renders the Schedule header with event icon", () => {
    render(<ScheduleSection events={mockEvents} />);
    expect(screen.getByText("Schedule")).toBeInTheDocument();
  });

  it("renders all event titles", () => {
    render(<ScheduleSection events={mockEvents} />);
    expect(screen.getByText("Team Standup")).toBeInTheDocument();
    expect(screen.getByText("Coffee at Blue Bottle")).toBeInTheDocument();
    expect(screen.getByText("Design Review")).toBeInTheDocument();
  });

  it("renders all event times", () => {
    render(<ScheduleSection events={mockEvents} />);
    expect(screen.getByText("09:30 AM")).toBeInTheDocument();
    expect(screen.getByText("03:00 PM")).toBeInTheDocument();
    expect(screen.getByText("10:00 AM")).toBeInTheDocument();
  });

  it("renders all event subtitles", () => {
    render(<ScheduleSection events={mockEvents} />);
    expect(screen.getByText("Google Meet")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("Zoom")).toBeInTheDocument();
  });

  it("starts expanded by default", () => {
    render(<ScheduleSection events={mockEvents} />);
    // Events are visible initially
    expect(screen.getByText("Team Standup")).toBeInTheDocument();
  });

  it("collapses and expands when chevron is tapped", async () => {
    const user = userEvent.setup();
    render(<ScheduleSection events={mockEvents} />);

    // Find collapse button by accessibility label
    const collapseButton = screen.getByRole("button", {
      name: "Collapse schedule",
    });
    expect(collapseButton).toBeInTheDocument();

    // Tap to collapse
    await user.click(collapseButton);

    // Events should be hidden
    expect(screen.queryByText("Team Standup")).not.toBeInTheDocument();
    expect(screen.queryByText("Coffee at Blue Bottle")).not.toBeInTheDocument();
    expect(screen.queryByText("Design Review")).not.toBeInTheDocument();

    // Header should remain
    expect(screen.getByText("Schedule")).toBeInTheDocument();

    // Chevron label should change
    const expandButton = screen.getByRole("button", {
      name: "Expand schedule",
    });
    expect(expandButton).toBeInTheDocument();

    // Tap to expand again
    await user.click(expandButton);
    expect(screen.getByText("Team Standup")).toBeInTheDocument();
  });

  it("renders 'No events scheduled.' when events array is empty", () => {
    render(<ScheduleSection events={[]} />);
    expect(screen.getByText("Schedule")).toBeInTheDocument();
    expect(screen.getByText("No events scheduled.")).toBeInTheDocument();
  });
});
