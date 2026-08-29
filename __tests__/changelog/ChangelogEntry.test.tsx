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
