/**
 * Tests for the entry-count display added to app/changelog/page.tsx.
 *
 * jest.mock is hoisted above imports, so we cannot reference a `const`
 * defined later. Instead we return a plain [] from the factory and then
 * obtain the same array reference through jest.requireMock() inside each
 * test so we can mutate it in-place without resetting the module registry
 * (which would create duplicate React instances and break hooks).
 */
import { render, screen, cleanup } from "@testing-library/react";
import ChangelogPage from "@/app/changelog/page";

jest.mock("@/data/changelog.json", () => []);

type Entry = { title: string; description: string; date: string };

/** Overwrite the shared mocked array so the next render sees n entries. */
function setEntries(n: number): void {
  const mock = jest.requireMock<Entry[]>("@/data/changelog.json");
  mock.length = 0;
  for (let i = 0; i < n; i++) {
    mock.push({
      title: `Entry ${i + 1}`,
      description: "A description for entry.",
      date: new Date(Date.UTC(2026, 0, i + 1)).toISOString(),
    });
  }
}

afterEach(cleanup);

describe("ChangelogPage — Back to top link (AC1, AC2)", () => {
  it("AC1: renders a right-aligned 'Back to top' link in muted text", () => {
    setEntries(3);
    render(<ChangelogPage />);

    const link = screen.getByRole("link", { name: /back to top/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#changelog-heading");
    expect(link.className).toMatch(/text-zinc-500/);
    expect(link.className).toMatch(/dark:text-zinc-400/);

    // The wrapping div must have text-right for right-alignment.
    const wrapper = link.parentElement!;
    expect(wrapper.className).toMatch(/text-right/);
  });

  it("AC2: the link href targets the H1 with id='changelog-heading'", () => {
    setEntries(1);
    render(<ChangelogPage />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAttribute("id", "changelog-heading");

    const link = screen.getByRole("link", { name: /back to top/i });
    expect(link).toHaveAttribute("href", "#changelog-heading");
  });

  it("AC2: the 'Back to top' link appears after the changelog list in DOM order", () => {
    setEntries(2);
    render(<ChangelogPage />);

    const link = screen.getByRole("link", { name: /back to top/i });
    const heading = screen.getByRole("heading", { level: 1 });

    // The link must come after the heading in document order.
    expect(
      heading.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});

describe("ChangelogPage — entry count display", () => {
  it("AC1: shows '{n} entries' (plural) when there are 42 entries", () => {
    setEntries(42);
    render(<ChangelogPage />);
    expect(screen.getByText("42 entries")).toBeInTheDocument();
  });

  it("AC2: shows '1 entry' (singular) when there is exactly 1 entry", () => {
    setEntries(1);
    render(<ChangelogPage />);
    expect(screen.getByText("1 entry")).toBeInTheDocument();
  });

  it("AC3: shows '0 entries' (plural) when there are 0 entries", () => {
    setEntries(0);
    render(<ChangelogPage />);
    expect(screen.getByText("0 entries")).toBeInTheDocument();
  });

  it("count text appears in the DOM directly after the <h1> heading", () => {
    setEntries(3);
    render(<ChangelogPage />);

    const heading = screen.getByRole("heading", { level: 1 });
    const countEl = screen.getByText("3 entries");

    // Node.DOCUMENT_POSITION_FOLLOWING means countEl comes after heading.
    expect(
      heading.compareDocumentPosition(countEl) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("count text is styled with muted zinc Tailwind classes", () => {
    setEntries(2);
    render(<ChangelogPage />);

    const countEl = screen.getByText("2 entries");
    expect(countEl.className).toMatch(/text-zinc-600/);
    expect(countEl.className).toMatch(/dark:text-zinc-400/);
  });
});
