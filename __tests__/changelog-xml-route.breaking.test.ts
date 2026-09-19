/**
 * @jest-environment node
 *
 * Tests for the breaking-change behaviour of the RSS route handler.
 */
import { GET } from '@/app/changelog.xml/route';

jest.mock('@/data/changelog.json', () => [
  { title: 'Widget renamed', description: 'The widget API is now the gadget API.', date: '2026-09-02T00:00:00.000Z', breaking: true },
  { title: 'Copy tweak', description: 'Refined the wording on the pricing table.', date: '2026-09-01T00:00:00.000Z' },
]);

describe('/changelog.xml — breaking entries', () => {
  it('prefixes the RSS <title> with [Breaking] for a breaking entry (AC4)', async () => {
    const res = await GET();
    const body = await res.text();
    expect(body).toMatch(/<title>\[Breaking\] Widget renamed<\/title>/);
  });

  it('emits <category>breaking</category> inside the item for a breaking entry (AC5)', async () => {
    const res = await GET();
    const body = await res.text();
    const allItems = Array.from(body.matchAll(/<item>[\s\S]*?<\/item>/g));
    const breakingItem = allItems.find((m) => m[0].includes('<title>[Breaking] Widget renamed</title>'));
    expect(breakingItem).toBeDefined();
    expect(breakingItem![0]).toMatch(/<category>breaking<\/category>/);
  });

  it('does not prefix or categorise a non-breaking entry (AC6)', async () => {
    const res = await GET();
    const body = await res.text();
    // Match each <item>…</item> individually, then find the Copy tweak one.
    const allItems = Array.from(body.matchAll(/<item>[\s\S]*?<\/item>/g));
    const copyTweakItem = allItems.find((m) => m[0].includes('<title>Copy tweak</title>'));
    expect(copyTweakItem).toBeDefined();
    expect(copyTweakItem![0]).not.toMatch(/\[Breaking\]/);
    expect(copyTweakItem![0]).not.toMatch(/<category>breaking<\/category>/);
  });
});
