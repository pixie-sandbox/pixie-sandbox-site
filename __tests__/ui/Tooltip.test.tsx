import { render, screen } from "@testing-library/react";
import Tooltip from "@/components/ui/Tooltip";

describe("Tooltip", () => {
  it("renders children", () => {
    render(
      <Tooltip content="August 20, 2026">
        <span>5 days ago</span>
      </Tooltip>
    );
    expect(screen.getByText("5 days ago")).toBeInTheDocument();
  });

  it('AC2: renders the tooltip content with role="tooltip"', () => {
    render(
      <Tooltip content="August 20, 2026">
        <span>5 days ago</span>
      </Tooltip>
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("August 20, 2026");
  });

  it("AC2: the trigger has aria-describedby pointing to the tooltip", () => {
    render(
      <Tooltip content="August 20, 2026">
        <span>5 days ago</span>
      </Tooltip>
    );
    const tooltip = screen.getByRole("tooltip");
    const tooltipId = tooltip.getAttribute("id");
    expect(tooltipId).not.toBeNull();
    // The trigger is the sibling span with aria-describedby
    const trigger = tooltip.parentElement?.querySelector(
      `[aria-describedby="${tooltipId}"]`
    );
    expect(trigger).not.toBeNull();
  });

  it("AC4: tooltip uses dark mode inverted colour classes", () => {
    render(
      <Tooltip content="August 20, 2026">
        <span>5 days ago</span>
      </Tooltip>
    );
    const tooltip = screen.getByRole("tooltip");
    // dark: classes must be present for AC4 dark mode compliance
    expect(tooltip.className).toMatch(/dark:/);
  });
});
