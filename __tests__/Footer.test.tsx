import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  const currentYear = new Date().getFullYear().toString();

  it("AC1: renders the current year", () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it("AC1: renders a link to the GitHub repository", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /github/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/pixie-sandbox/pixie-sandbox-site"
    );
  });

  it("AC4: opens the GitHub link in a new tab", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /github/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("has an accessible aria-label on the GitHub link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", {
      name: /view the pixie sandbox site source code on github/i,
    });
    expect(link).toBeInTheDocument();
  });

  it("renders a footer element", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
