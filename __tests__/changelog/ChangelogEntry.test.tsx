import { render, screen } from "@testing-library/react";
import ChangelogEntry from "@/components/changelog/ChangelogEntry";

const entry = {
  title: "Custom 404 Page",
  description: "Added a branded 404 error page.",
  date: "2026-08-20T00:00:00.000Z",
};

describe("ChangelogEntry", () => {
  it("AC1: renders the entry title", () => {
    render(<ChangelogEntry entry={entry} />);
    expect(screen.getByText("Custom 404 Page")).toBeInTheDocument();
  });

  it("AC1: renders the entry description", () => {
    render(<ChangelogEntry entry={entry} />);
    expect(
      screen.getByText("Added a branded 404 error page.")
    ).toBeInTheDocument();
  });

  it("AC1: wraps the entry in an <article> element", () => {
    render(<ChangelogEntry entry={entry} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("AC2: renders a <time> element with the ISO dateTime attribute", () => {
    render(<ChangelogEntry entry={entry} />);
    const article = screen.getByRole("article");
    const time = article.querySelector("time");
    expect(time).not.toBeNull();
    expect(time).toHaveAttribute("dateTime", entry.date);
  });

  it("AC2: renders a tooltip with the full formatted date", () => {
    render(<ChangelogEntry entry={entry} />);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    // The formatted date should mention August and 2026
    expect(tooltip.textContent).toMatch(/August/);
    expect(tooltip.textContent).toMatch(/2026/);
  });

  it("AC2: tooltip is linked to the trigger via aria-describedby", () => {
    render(<ChangelogEntry entry={entry} />);
    const tooltip = screen.getByRole("tooltip");
    const tooltipId = tooltip.getAttribute("id");
    expect(tooltipId).toBeTruthy();
    const trigger = document.querySelector(`[aria-describedby="${tooltipId}"]`);
    expect(trigger).not.toBeNull();
  });

  it("AC4: entry border uses dark mode Tailwind class", () => {
    const { container } = render(<ChangelogEntry entry={entry} />);
    const article = container.querySelector("article");
    expect(article?.className).toContain("dark:border-white");
  });

  it("AC4: title uses dark mode text class", () => {
    render(<ChangelogEntry entry={entry} />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).toMatch(/dark:text-zinc/);
  });

  it("AC4: description uses dark mode text class", () => {
    render(<ChangelogEntry entry={entry} />);
    const description = screen.getByText("Added a branded 404 error page.");
    expect(description.className).toMatch(/dark:text-zinc/);
  });
});

// ── Reading time rendering ─────────────────────────────────────────────────

/**
 * Builds a description string with exactly `n` words.
 */
function makeDescription(wordCount: number): string {
  return Array.from({ length: wordCount }, (_, i) => `word${i + 1}`).join(' ');
}

const baseEntry = {
  title: "Test Entry",
  date: "2026-08-20T00:00:00.000Z",
};

describe("ChangelogEntry — reading time", () => {
  it("AC1: renders '3 min read' for a 450-word description", () => {
    render(
      <ChangelogEntry entry={{ ...baseEntry, description: makeDescription(450) }} />
    );
    expect(screen.getByText(/3 min read/)).toBeInTheDocument();
  });

  it("AC2: renders '1 min read' for a 10-word description", () => {
    render(
      <ChangelogEntry entry={{ ...baseEntry, description: makeDescription(10) }} />
    );
    expect(screen.getByText(/1 min read/)).toBeInTheDocument();
  });

  it("AC3: renders '1 min read' for an empty description", () => {
    render(<ChangelogEntry entry={{ ...baseEntry, description: "" }} />);
    expect(screen.getByText(/1 min read/)).toBeInTheDocument();
  });

  it("AC4: reading time span uses 'text-sm' and muted zinc color classes", () => {
    const { container } = render(
      <ChangelogEntry entry={{ ...baseEntry, description: makeDescription(10) }} />
    );
    // The reading time is rendered inside a <span> next to the title
    const spans = container.querySelectorAll("span");
    const readingTimeSpan = Array.from(spans).find((s) =>
      s.textContent?.includes("min read")
    );
    expect(readingTimeSpan).toBeTruthy();
    expect(readingTimeSpan?.className).toContain("text-sm");
    expect(readingTimeSpan?.className).toMatch(/text-zinc-\d+/);
  });

  it("renders a bullet separator (•) between title and reading time", () => {
    const { container } = render(
      <ChangelogEntry entry={{ ...baseEntry, description: makeDescription(10) }} />
    );
    const spans = container.querySelectorAll("span");
    const readingTimeSpan = Array.from(spans).find((s) =>
      s.textContent?.includes("min read")
    );
    expect(readingTimeSpan?.textContent).toContain("•");
  });

  it("renders reading time on the same line as the title (same flex container)", () => {
    const { container } = render(
      <ChangelogEntry entry={{ ...baseEntry, description: makeDescription(10) }} />
    );
    const heading = container.querySelector("h2");
    const readingTimeSpan = Array.from(
      container.querySelectorAll("span")
    ).find((s) => s.textContent?.includes("min read"));
    // Both the heading and reading time span share the same parent element
    expect(heading?.parentElement).toBe(readingTimeSpan?.parentElement);
  });
});
