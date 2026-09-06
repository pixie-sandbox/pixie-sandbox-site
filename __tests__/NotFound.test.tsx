import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";

describe("NotFound (404 page)", () => {
  it("AC1: renders a 'Page not found' h1 heading", () => {
    render(<NotFound />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/page not found/i);
  });

  it("AC1: renders a helpful plain-language explanation", () => {
    render(<NotFound />);
    expect(
      screen.getByText(/doesn't exist or has been moved/i)
    ).toBeInTheDocument();
  });

  it("AC2: renders a 'Return to Home' link pointing to '/'", () => {
    render(<NotFound />);
    const link = screen.getByRole("link", { name: /return to home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("AC3: outer wrapper carries dark-mode background class", () => {
    const { container } = render(<NotFound />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/dark:bg-black/);
  });

  it("AC4: h1 is the first heading on the page (screen-reader announcement order)", () => {
    render(<NotFound />);
    const headings = screen.getAllByRole("heading");
    expect(headings[0]).toHaveTextContent(/page not found/i);
  });

  it("AC4: uses semantic main element", () => {
    render(<NotFound />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
