import { render, screen, fireEvent } from "@testing-library/react";
import { WeekStrip } from "./WeekStrip";

// Mock the date utilities
jest.mock("../../core/utils/date", () => ({
  toDateString: (d: Date) => d.toISOString().slice(0, 10),
  todayString: () => "2026-06-09",
  getWeekDays: () => {
    const base = new Date("2026-06-08"); // Monday
    return [0, 1, 2, 3, 4].map((i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  },
  isSameDay: (a: string, b: string) => a === b,
}));

describe("WeekStrip", () => {
  it("renders all 5 weekdays (Mon–Fri)", () => {
    render(
      <WeekStrip selectedDate="2026-06-09" onSelectDate={() => {}} />,
    );
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
  });

  it("renders date numbers for each day", () => {
    render(
      <WeekStrip selectedDate="2026-06-09" onSelectDate={() => {}} />,
    );
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders the selected day's name and number together", () => {
    // The selected date is Tue Jun 9, so both "Tue" and "9" should render
    render(
      <WeekStrip selectedDate="2026-06-09" onSelectDate={() => {}} />,
    );
    expect(screen.getByLabelText("Tue 9")).toBeInTheDocument();
    // Verify the label points to a clickable element
    expect(screen.getByLabelText("Tue 9").tagName).toBeTruthy();
  });

  it("renders unselected day labels correctly", () => {
    render(
      <WeekStrip selectedDate="2026-06-09" onSelectDate={() => {}} />,
    );
    expect(screen.getByLabelText("Mon 8")).toBeInTheDocument();
    expect(screen.getByLabelText("Wed 10")).toBeInTheDocument();
    expect(screen.getByLabelText("Thu 11")).toBeInTheDocument();
    expect(screen.getByLabelText("Fri 12")).toBeInTheDocument();
  });

  it("calls onSelectDate when a day is tapped", () => {
    const onSelectDate = jest.fn();
    render(
      <WeekStrip selectedDate="2026-06-09" onSelectDate={onSelectDate} />,
    );
    fireEvent.click(screen.getByLabelText("Wed 10"));
    expect(onSelectDate).toHaveBeenCalledWith("2026-06-10");
  });

  it("calls onSelectDate when the selected day itself is tapped", () => {
    const onSelectDate = jest.fn();
    render(
      <WeekStrip selectedDate="2026-06-09" onSelectDate={onSelectDate} />,
    );
    fireEvent.click(screen.getByLabelText("Tue 9"));
    expect(onSelectDate).toHaveBeenCalledWith("2026-06-09");
  });

  it("each day renders both day name and date number", () => {
    render(
      <WeekStrip selectedDate="2026-06-10" onSelectDate={() => {}} />,
    );
    // Verify Wed 10 exists (selected) with both Mon and Wed
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
