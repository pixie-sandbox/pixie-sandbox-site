/**
 * ChangelogPage – entry count display (AC3: zero entries)
 *
 * Verifies that '0 entries' is displayed when changelog.json is empty.
 */

jest.mock("@/data/changelog.json", () => []);

import { render, screen } from "@testing-library/react";
import ChangelogPage from "@/app/changelog/page";

describe("ChangelogPage – entry count (AC3: zero entries)", () => {
  it("AC3: displays '0 entries' for an empty changelog", () => {
    render(<ChangelogPage />);
    expect(screen.getByText("0 entries")).toBeInTheDocument();
  });
});
