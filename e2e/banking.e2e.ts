/**
 * End-to-end acceptance tests for the Northline Bank demo.
 *
 * Driven through a real browser against `next build && next start` (see
 * playwright.config.ts). This covers what Jest + Testing Library cannot:
 * the async server component at app/accounts/[id]/page.tsx, the RootLayout
 * Header on every route, notFound() → app/not-found.tsx (which Next 16
 * renders client-side from the RSC payload for dynamic routes), and the
 * client-rendered /changelog list.
 */
import fs from "node:fs";
import path from "node:path";
import { test, expect, type Locator, type Page } from "@playwright/test";
import accounts from "../data/accounts.json";
import changelog from "../data/changelog.json";

const ROOT = path.resolve(__dirname, "..");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const AUD = /^\$[\d,]+\.\d{2}$/;

/** The overview card for an account: its masked number and headline figure. */
async function overviewCard(page: Page, id: string) {
  const card = page.locator(`main a[href="/accounts/${id}"]`);
  await expect(card).toHaveCount(1);
  const text = (await card.textContent()) ?? "";
  const masked = text.match(/•+\s?\d{4}/)?.[0];
  const balance = text.match(/\$[\d,]+\.\d{2}/)?.[0];
  expect(masked, `masked number on ${id} card`).toBeDefined();
  expect(balance, `balance on ${id} card`).toBeDefined();
  return { masked: masked!, balance: balance! };
}

type Row = { date: string; description: string; amount: string; balance: string; amountCell: Locator; descriptionCell: Locator };

async function transactionRows(page: Page): Promise<Row[]> {
  const rows = page.locator("table tbody tr");
  const n = await rows.count();
  const out: Row[] = [];
  for (let i = 0; i < n; i++) {
    const cells = rows.nth(i).locator("td");
    const [date, description, amount, balance] = (await cells.allTextContents()).map((s) => s.trim());
    out.push({ date, description, amount, balance, amountCell: cells.nth(2), descriptionCell: cells.nth(1) });
  }
  return out;
}

function parseDisplayDate(s: string): number {
  const [dd, mmm, yyyy] = s.split(" ");
  return Date.UTC(Number(yyyy), MONTHS.indexOf(mmm), Number(dd));
}

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
}

const color = (l: Locator) => l.evaluate((el) => getComputedStyle(el).color);

/** Converts a computed CSS colour (rgb() or oklch()) to a hue in degrees plus chroma. */
async function hueAndChroma(page: Page, css: string): Promise<{ hue: number; chroma: number }> {
  return page.evaluate((c) => {
    const probe = document.createElement("canvas").getContext("2d")!;
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = Array.from(probe.getImageData(0, 0, 1, 1).data).map((v) => v / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
    }
    return { hue: (h * 60 + 360) % 360, chroma: d };
  }, css);
}

test.describe("account detail page", () => {
  test("AC6: /accounts/everyday shows name, masked number and balance matching the overview", async ({ page }) => {
    await page.goto("/");
    const { masked, balance } = await overviewCard(page, "everyday");

    const res = await page.goto("/accounts/everyday");
    expect(res?.status()).toBe(200);
    const summary = page.locator("main h1").locator("..");
    await expect(page.locator("main h1")).toHaveText("Everyday");
    await expect(summary).toContainText(masked);
    await expect(summary).toContainText(`Balance${balance}`);
  });

  test("AC6/AC9: every detail page matches its overview card and its newest balance", async ({ page }) => {
    await page.goto("/");
    const cards: Record<string, { masked: string; balance: string }> = {};
    for (const a of accounts) cards[a.id] = await overviewCard(page, a.id);

    for (const a of accounts) {
      await page.goto(`/accounts/${a.id}`);
      const summary = page.locator("main h1").locator("..");
      await expect(page.locator("main h1")).toHaveText(a.name);
      await expect(summary).toContainText(cards[a.id].masked);
      await expect(summary).toContainText(cards[a.id].balance);
      const rows = await transactionRows(page);
      expect(rows[0].balance).toBe(cards[a.id].balance);
    }
  });

  test("AC7 + AC13: transactions are newest first with DD MMM YYYY date, description, signed amount and AUD balance", async ({ page }) => {
    await page.goto("/accounts/everyday");
    const everyday = accounts.find((a) => a.id === "everyday")!;
    const rows = await transactionRows(page);
    expect(rows).toHaveLength(everyday.transactions.length);

    for (const r of rows) {
      expect(r.date).toMatch(/^\d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/);
      expect(r.description.length).toBeGreaterThan(0);
      expect(r.amount).toMatch(/^[+-]\$[\d,]+\.\d{2}$/);
      expect(r.balance).toMatch(AUD);
    }

    const times = rows.map((r) => parseDisplayDate(r.date));
    expect(times).toEqual([...times].sort((a, b) => b - a));

    // AC13: every ISO date in the data appears in DD MMM YYYY form, in order.
    const expected = [...everyday.transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((t) => isoToDisplay(t.date));
    expect(rows.map((r) => r.date)).toEqual(expected);

    await expect(page.getByText("All amounts in AUD")).toBeVisible();
  });

  test("AC8: money-in is '+' and green; money-out is '-' and default text colour", async ({ page }) => {
    let sawIn = false;
    let sawOut = false;
    for (const a of accounts) {
      await page.goto(`/accounts/${a.id}`);
      for (const r of await transactionRows(page)) {
        const amountColour = await color(r.amountCell);
        if (r.amount.startsWith("+")) {
          sawIn = true;
          const { hue, chroma } = await hueAndChroma(page, amountColour);
          expect(chroma, `${a.id} ${r.description} colour ${amountColour}`).toBeGreaterThan(0.2);
          expect(hue, `${a.id} ${r.description} colour ${amountColour}`).toBeGreaterThanOrEqual(90);
          expect(hue, `${a.id} ${r.description} colour ${amountColour}`).toBeLessThanOrEqual(170);
        } else {
          sawOut = true;
          expect(r.amount.startsWith("-")).toBe(true);
          // Same colour as the description text next to it — i.e. not highlighted.
          expect(amountColour).toBe(await color(r.descriptionCell));
        }
      }
    }
    expect(sawIn && sawOut).toBe(true);
  });

  test("AC8: money-in stays distinct in dark mode", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto("/accounts/everyday");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    const rows = await transactionRows(page);
    const moneyIn = rows.find((r) => r.amount.startsWith("+"))!;
    const moneyOut = rows.find((r) => r.amount.startsWith("-"))!;
    const { hue } = await hueAndChroma(page, await color(moneyIn.amountCell));
    expect(hue).toBeGreaterThanOrEqual(90);
    expect(hue).toBeLessThanOrEqual(170);
    expect(await color(moneyOut.amountCell)).toBe(await color(moneyOut.descriptionCell));
  });

  test("AC12: no run of six or more digits in the DOM of any account page", async ({ page }) => {
    for (const p of ["/", ...accounts.map((a) => `/accounts/${a.id}`)]) {
      await page.goto(p);
      // Visible text plus every accessible-name / title attribute a screen reader could expose.
      const exposed = await page.evaluate(() =>
        [
          document.body.innerText,
          ...Array.from(document.querySelectorAll("[aria-label],[title],[alt]")).flatMap((el) =>
            ["aria-label", "title", "alt"].map((a) => el.getAttribute(a) ?? "")
          ),
        ].join("\n")
      );
      expect(exposed, p).not.toMatch(/\d{6,}/);
    }
  });
});

test.describe("unknown account id", () => {
  for (const p of ["/accounts/mystery", "/accounts/EVERYDAY", "/accounts/everyday%20"]) {
    test(`AC10: ${p} renders app/not-found.tsx with 404 status`, async ({ page }) => {
      const res = await page.goto(p);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
      await expect(page.getByRole("link", { name: "Return to Home" })).toHaveAttribute("href", "/");
      await expect(page.getByText("Transactions")).toHaveCount(0);
    });
  }
});

test.describe("header on every page", () => {
  for (const p of ["/", "/accounts/everyday", "/changelog", "/accounts/mystery"]) {
    test(`AC11: ${p} has Northline Bank, Accounts and Changelog links`, async ({ page }) => {
      await page.goto(p);
      const header = page.getByRole("banner");
      await expect(header).toBeVisible();
      await expect(header.getByRole("link", { name: "Northline Bank", exact: true })).toHaveAttribute("href", "/");
      const nav = header.getByRole("navigation");
      await expect(nav.getByRole("link", { name: "Accounts", exact: true })).toHaveAttribute("href", "/");
      await expect(nav.getByRole("link", { name: "Changelog", exact: true })).toHaveAttribute("href", "/changelog");
    });
  }

  test("header links navigate", async ({ page }) => {
    await page.goto("/accounts/savings");
    await page.getByRole("banner").getByRole("link", { name: "Changelog", exact: true }).click();
    await expect(page).toHaveURL(/\/changelog$/);
    await page.getByRole("banner").getByRole("link", { name: "Accounts", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Hello, Alex")).toBeVisible();
  });
});

test.describe("changelog unchanged", () => {
  const newestFirst = [...changelog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  test("AC15: /changelog lists every entry newest first", async ({ page }) => {
    const res = await page.goto("/changelog");
    expect(res?.status()).toBe(200);
    const feed = page.locator('[role="feed"]');
    await expect(feed.locator("h2")).toHaveText(newestFirst.map((e) => e.title));
  });

  test("AC15: /changelog year and text filters still work via the URL", async ({ page }) => {
    const target = newestFirst[newestFirst.length - 1];
    await page.goto(`/changelog?q=${encodeURIComponent(target.title)}`);
    await expect(page.locator('[role="feed"] h2')).toHaveText([target.title]);

    await page.goto("/changelog?q=zzzz-no-such-entry");
    await expect(page.locator('[role="feed"] h2')).toHaveCount(0);
    await expect(page.getByText("No entries match.")).toBeVisible();

    const year = newestFirst[0].date.slice(0, 4);
    await page.goto(`/changelog?year=${year}`);
    await expect(page.locator('[role="feed"] h2')).toHaveText(
      newestFirst.filter((e) => e.date.startsWith(year)).map((e) => e.title)
    );
  });

  test("AC15: /changelog.xml has the same channel metadata and items in data order", async ({ request }) => {
    const res = await request.get("/changelog.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("application/xml; charset=utf-8");
    const xml = await res.text();

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>')).toBe(true);
    expect(xml).toContain("<title>Pixie Sandbox Changelog</title>");
    expect(xml).toContain("<link>https://pixie-sandbox-site.vercel.app/changelog</link>");
    expect(xml).toContain("<description>Updates and improvements to the Pixie sandbox site.</description>");

    const items = [...xml.matchAll(/<item>\s*<title>([\s\S]*?)<\/title>\s*<description>([\s\S]*?)<\/description>\s*<pubDate>([\s\S]*?)<\/pubDate>/g)].map(
      ([, title, description, date]) => ({ title, description, date })
    );
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    expect(items).toEqual(
      changelog.map((e) => ({
        title: ("breaking" in e && e.breaking ? "[Breaking] " : "") + esc(e.title),
        description: esc(e.description),
        date: e.date,
      }))
    );
  });
});

test.describe("branding", () => {
  function walk(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
      const full = path.join(dir, d.name);
      return d.isDirectory() ? walk(full) : [full];
    });
  }

  // Published ANZ brand blues; the palette must not reuse them.
  const ANZ_HEXES = ["#004165", "#007dba", "#0072ac", "#00a9e0"];

  test("AC16: public assets contain no ANZ logo or wordmark", () => {
    for (const f of walk(path.join(ROOT, "public"))) {
      expect(path.basename(f)).not.toMatch(/anz/i);
      if (f.endsWith(".svg")) expect(fs.readFileSync(f, "utf8"), f).not.toMatch(/\bANZ\b/i);
    }
  });

  test("AC16: no source file uses an ANZ brand colour", () => {
    const files = ["app", "components", "lib", "data", "public"]
      .flatMap((d) => walk(path.join(ROOT, d)))
      .filter((f) => /\.(tsx?|css|json|svg)$/.test(f));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const text = fs.readFileSync(f, "utf8").toLowerCase();
      for (const hex of ANZ_HEXES) expect(text.includes(hex), `${hex} in ${f}`).toBe(false);
    }
  });

  test("AC16: no rendered page shows the ANZ name or an ANZ image", async ({ page }) => {
    for (const p of ["/", ...accounts.map((a) => `/accounts/${a.id}`), "/changelog", "/accounts/mystery"]) {
      await page.goto(p);
      expect(await page.locator("body").innerText(), p).not.toMatch(/\bANZ\b/i);
      await expect(page.locator('img[src*="anz" i], img[alt*="anz" i], svg[aria-label*="anz" i]')).toHaveCount(0);
    }
  });
});

test.describe("primary-blue palette", () => {
  const css = fs.readFileSync(path.join(ROOT, "app", "globals.css"), "utf8");
  const block = (selector: string) =>
    css.match(new RegExp(`(^|\\n)${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`))?.[2] ?? "";

  test("AC17: globals.css defines --primary-blue for light (:root) and dark (.dark)", () => {
    const light = block(":root").match(/--primary-blue:\s*(#[0-9a-f]{6})/i)?.[1];
    const dark = block(".dark").match(/--primary-blue:\s*(#[0-9a-f]{6})/i)?.[1];
    expect(light).toBeDefined();
    expect(dark).toBeDefined();
    expect(light).not.toBe(dark);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`AC17: header, links and account-card accents resolve through --primary-blue (${theme})`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
      await page.goto("/");
      const varValue = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--primary-blue").trim()
      );
      const resolved = await page.evaluate((v) => {
        const el = document.createElement("span");
        el.style.color = v;
        document.body.appendChild(el);
        const c = getComputedStyle(el).color;
        el.remove();
        return c;
      }, varValue);

      // Active nav link (Accounts on /) uses the primary blue.
      const activeNav = page.getByRole("banner").getByRole("navigation").getByRole("link", { name: "Accounts", exact: true });
      expect(await color(activeNav)).toBe(resolved);

      // Every account card's accent bar is painted with the primary blue.
      const accents = page.locator('main a[href^="/accounts/"] > div[aria-hidden="true"]');
      await expect(accents).toHaveCount(3);
      for (let i = 0; i < 3; i++) {
        expect(await accents.nth(i).evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(resolved);
      }

      // The site-name link uses the palette too (its --primary-blue-text sibling variable).
      const siteName = page.getByRole("banner").getByRole("link", { name: "Northline Bank", exact: true });
      const { hue } = await hueAndChroma(page, await color(siteName));
      expect(hue).toBeGreaterThanOrEqual(200);
      expect(hue).toBeLessThanOrEqual(240);
    });
  }
});
