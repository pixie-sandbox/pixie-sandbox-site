import changelog from "@/data/changelog.json";

type ChangelogEntry = {
  title: string;
  description: string;
  date: string;
};

const entries = changelog as ChangelogEntry[];

describe("data/changelog.json", () => {
  it("AC3: is an array", () => {
    expect(Array.isArray(entries)).toBe(true);
  });

  it("AC3: contains exactly 4 seed entries", () => {
    expect(entries).toHaveLength(4);
  });

  it("AC3: every entry has a non-empty title", () => {
    for (const entry of entries) {
      expect(typeof entry.title).toBe("string");
      expect(entry.title.length).toBeGreaterThan(0);
    }
  });

  it("AC3: every entry has a non-empty description", () => {
    for (const entry of entries) {
      expect(typeof entry.description).toBe("string");
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });

  it("AC3: every date is a valid ISO 8601 timestamp", () => {
    for (const entry of entries) {
      const d = new Date(entry.date);
      expect(isNaN(d.getTime())).toBe(false);
      // Verify round-trip: toISOString() must reproduce the stored value
      expect(d.toISOString()).toBe(entry.date);
    }
  });

  it("AC3: entries are ordered newest first (descending chronological)", () => {
    for (let i = 0; i < entries.length - 1; i++) {
      const current = new Date(entries[i].date).getTime();
      const next = new Date(entries[i + 1].date).getTime();
      expect(current).toBeGreaterThan(next);
    }
  });

  it("AC3: contains a Footer entry", () => {
    expect(entries.some((e) => e.title === "Footer")).toBe(true);
  });

  it("AC3: contains a Dark Mode Toggle entry", () => {
    expect(entries.some((e) => e.title === "Dark Mode Toggle")).toBe(true);
  });

  it("AC3: contains a Back-to-Top Control entry", () => {
    expect(entries.some((e) => e.title === "Back-to-Top Control")).toBe(true);
  });

  it("AC3: contains a Custom 404 Page entry", () => {
    expect(entries.some((e) => e.title === "Custom 404 Page")).toBe(true);
  });
});
