/**
 * ChangelogPage – entry count display (AC2: exactly one entry)
 *
 * Verifies that the singular form '1 entry' is used when changelog.json
 * contains exactly one item.
 */

jest.mock("@/data/changelog.json", () => [
  { title: "Only Entry", description: "The only one.", date: "2026-01-01T00:00:00.000Z" },
]);

import { render, screen } from "@testing-library/react";
import ChangelogPage from "@/app/changelog/page";

describe("ChangelogPage – entry count (AC2: singular)", () => {
  it("AC2: displays '1 entry' (singular) for exactly one entry", () => {
    render(<ChangelogPage />);
    expect(screen.getByText("1 entry")).toBeInTheDocument();
  });

  it("AC2: does NOT display the plural '1 entries'", () => {
    render(<ChangelogPage />);
    expect(screen.queryByText("1 entries")).not.toBeInTheDocument();
  });
});
