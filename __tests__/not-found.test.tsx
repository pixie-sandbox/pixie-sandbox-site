import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";

describe("NotFound (404 page)", () => {
  it("AC1: renders the custom error message", () => {
    render(<NotFound />);
    expect(
      screen.getByText(
        /The page you're looking for doesn't exist or has been moved/i
      )
    ).toBeInTheDocument();
  });

  it("AC1: renders the 'Return to Home' link instead of the framework default", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("link", { name: /return to home/i })
    ).toBeInTheDocument();
  });

  it("AC2: 'Return to Home' link points to the site root", () => {
    render(<NotFound />);
    const link = screen.getByRole("link", { name: /return to home/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("AC3: 'Return to Home' link is keyboard-focusable (rendered as an anchor element)", () => {
    render(<NotFound />);
    const link = screen.getByRole("link", { name: /return to home/i });
    // Links are natively keyboard-focusable; verify it is an anchor
    expect(link.tagName).toBe("A");
  });

  it("AC3: page has a descriptive heading for screen readers", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", { name: /page not found/i })
    ).toBeInTheDocument();
  });

  it("AC3: the icon is hidden from assistive technology", () => {
    render(<NotFound />);
    // The SVG is decorative; it should carry aria-hidden="true"
    const svg = document
      .querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("AC1: renders within a <main> landmark", () => {
    render(<NotFound />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
