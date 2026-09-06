import { render, screen } from "@testing-library/react";
import ChangelogList from "@/components/changelog/ChangelogList";

const entries = [
  {
    title: "Custom 404 Page",
    description: "Added a branded 404 error page.",
    date: "2026-08-20T00:00:00.000Z",
  },
  {
    title: "Back-to-Top Control",
    description: "Added a back-to-top button.",
    date: "2026-08-10T00:00:00.000Z",
  },
  {
    title: "Dark Mode Toggle",
    description: "Added a theme toggle.",
    date: "2026-08-01T00:00:00.000Z",
  },
];

describe("ChangelogList", () => {
  it("AC1: renders all entries", () => {
    render(<ChangelogList entries={entries} />);
    expect(screen.getByText("Custom 404 Page")).toBeInTheDocument();
    expect(screen.getByText("Back-to-Top Control")).toBeInTheDocument();
    expect(screen.getByText("Dark Mode Toggle")).toBeInTheDocument();
  });

  it("AC1: renders entries in the order they are supplied (caller sorts)", () => {
    render(<ChangelogList entries={entries} />);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(3);
    expect(articles[0]).toHaveTextContent("Custom 404 Page");
    expect(articles[1]).toHaveTextContent("Back-to-Top Control");
    expect(articles[2]).toHaveTextContent("Dark Mode Toggle");
  });

  it('renders a container with role="feed" and an accessible label', () => {
    render(<ChangelogList entries={entries} />);
    const feed = screen.getByRole("feed", { name: /changelog entries/i });
    expect(feed).toBeInTheDocument();
  });

  it("renders an empty feed gracefully when entries is empty", () => {
    render(<ChangelogList entries={[]} />);
    const feed = screen.getByRole("feed");
    expect(feed).toBeEmptyDOMElement();
  });
});
