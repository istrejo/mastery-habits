import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders the label", () => {
    render(<Button label="Press me" onPress={() => {}} />);
    expect(screen.getByText("Press me")).toBeInTheDocument();
  });

  it("calls onPress when clicked", () => {
    const onPress = jest.fn();
    render(<Button label="Press me" onPress={onPress} />);
    fireEvent.click(screen.getByText("Press me"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    render(<Button label="Press me" onPress={onPress} disabled />);
    fireEvent.click(screen.getByText("Press me"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders with secondary variant", () => {
    render(<Button label="Secondary" onPress={() => {}} variant="secondary" />);
    expect(screen.getByText("Secondary")).toBeInTheDocument();
  });

  it("renders ghost variant", () => {
    render(<Button label="Ghost" onPress={() => {}} variant="ghost" />);
    expect(screen.getByText("Ghost")).toBeInTheDocument();
  });

  it("renders dark variant", () => {
    render(<Button label="Dark" onPress={() => {}} variant="dark" />);
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });

  it("renders fullWidth", () => {
    render(<Button label="Full" onPress={() => {}} fullWidth />);
    expect(screen.getByText("Full")).toBeInTheDocument();
  });
});
