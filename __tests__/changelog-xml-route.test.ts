/**
 * @jest-environment node
 *
 * This file tests a Next.js Route Handler (server-side). The node environment
 * is required because the Web API `Response` global is only available in Node
 * (not in jsdom) for this version of jest-environment-jsdom.
 */

import { GET } from "@/app/changelog.xml/route";
import changelog from "@/data/changelog.json";

type ChangelogEntry = {
  title: string;
  description: string;
  date: string;
};

const entries = changelog as ChangelogEntry[];

describe("GET /changelog.xml", () => {
  it("AC3: returns HTTP 200", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it("AC3: Content-Type header is application/xml", async () => {
    const response = await GET();
    expect(response.headers.get("Content-Type")).toContain("application/xml");
  });

  it("AC3: body is valid RSS 2.0 (has rss and channel elements)", async () => {
    const response = await GET();
    const body = await response.text();
    expect(body).toContain('<rss version="2.0">');
    expect(body).toContain("<channel>");
    expect(body).toContain("</channel>");
    expect(body).toContain("</rss>");
  });

  it("AC3: body starts with an XML declaration", async () => {
    const response = await GET();
    const body = await response.text();
    expect(body.trimStart()).toMatch(/^<\?xml/);
  });

  it("AC3: body contains all entry titles", async () => {
    const response = await GET();
    const body = await response.text();
    for (const entry of entries) {
      expect(body).toContain(`<title>${entry.title}</title>`);
    }
  });

  it("AC3: body contains all entry descriptions", async () => {
    const response = await GET();
    const body = await response.text();
    for (const entry of entries) {
      expect(body).toContain(entry.description);
    }
  });

  it("AC3: body contains ISO 8601 timestamps for all entries", async () => {
    const response = await GET();
    const body = await response.text();
    for (const entry of entries) {
      expect(body).toContain(`<pubDate>${entry.date}</pubDate>`);
    }
  });

  it("AC3: body contains 4 item elements", async () => {
    const response = await GET();
    const body = await response.text();
    const matches = body.match(/<item>/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(4);
  });
});
