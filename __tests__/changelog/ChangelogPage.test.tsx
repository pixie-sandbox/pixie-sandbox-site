/**
 * ChangelogPage – entry count display (AC1: multiple entries)
 *
 * The changelog.json is mocked at module level so we control the data
 * without touching the real JSON file.
 */

jest.mock("@/data/changelog.json", () => [
  { title: "Alpha", description: "First entry.", date: "2026-01-02T00:00:00.000Z" },
  { title: "Beta", description: "Second entry.", date: "2026-01-01T00:00:00.000Z" },
]);

import { render, screen } from "@testing-library/react";
import ChangelogPage from "@/app/changelog/page";

describe("ChangelogPage – entry count (AC1: multiple entries)", () => {
  it("AC1: displays '[N] entries' directly under the h1 for multiple entries", () => {
    render(<ChangelogPage />);
    expect(screen.getByText("2 entries")).toBeInTheDocument();
  });

  it("AC1: count element appears immediately after the h1 in DOM order", () => {
    render(<ChangelogPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    const countEl = screen.getByText("2 entries");
    expect(heading.nextElementSibling).toBe(countEl);
  });

  it("AC1: count element carries muted zinc styling classes", () => {
    render(<ChangelogPage />);
    const countEl = screen.getByText("2 entries");
    expect(countEl.className).toMatch(/text-zinc-600/);
    expect(countEl.className).toMatch(/dark:text-zinc-400/);
  });
});
