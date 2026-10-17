import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer build date", () => {
  const ORIGINAL = process.env.NEXT_PUBLIC_BUILD_DATE;

  afterEach(() => {
    if (ORIGINAL === undefined) {
      delete process.env.NEXT_PUBLIC_BUILD_DATE;
    } else {
      process.env.NEXT_PUBLIC_BUILD_DATE = ORIGINAL;
    }
  });

  it("AC1: shows 'Built: YYYY-MM-DD' when NEXT_PUBLIC_BUILD_DATE is set", () => {
    process.env.NEXT_PUBLIC_BUILD_DATE = "2026-10-17";
    render(<Footer />);
    expect(screen.getByText(/Built: 2026-10-17/)).toBeInTheDocument();
  });

  it("AC2: renders no 'Built:' line when NEXT_PUBLIC_BUILD_DATE is absent", () => {
    delete process.env.NEXT_PUBLIC_BUILD_DATE;
    render(<Footer />);
    expect(screen.queryByText(/Built:/)).not.toBeInTheDocument();
  });
});
