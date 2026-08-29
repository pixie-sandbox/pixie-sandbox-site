import changelog from "@/data/changelog.json";

type ChangelogEntry = {
  title: string;
  description: string;
  date: string;
};

/** Escapes characters that are special in XML element content. */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function GET() {
  const entries = changelog as ChangelogEntry[];

  const items = entries
    .map(
      (entry) => `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <description>${escapeXml(entry.description)}</description>
      <pubDate>${entry.date}</pubDate>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Pixie Sandbox Changelog</title>
    <link>https://pixie-sandbox-site.vercel.app/changelog</link>
    <description>Updates and improvements to the Pixie sandbox site.</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
