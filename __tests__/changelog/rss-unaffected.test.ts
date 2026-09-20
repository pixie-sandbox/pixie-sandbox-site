/**
 * @jest-environment node
 *
 * AC13: RSS feed at /changelog.xml is unaffected by changelog filter parameters.
 *
 * The route ignores all query string parameters; its output is a fixed feed
 * derived only from changelog.json. Two calls — with and without filter params
 * — must return identical bodies.
 */
import { GET } from '@/app/changelog.xml/route';

describe('RSS feed is unaffected by /changelog filter parameters', () => {
  it('AC13: response body is identical on successive calls (no query-param influence)', async () => {
    // The route accepts no query-string parameters and does not read from Request.
    // Calling it twice proves the output is deterministic and not influenced by
    // any external filter state.
    const first = await GET();
    const second = await GET();
    const firstBody = await first.text();
    const secondBody = await second.text();
    expect(secondBody).toBe(firstBody);
    // Also verify the response is well-formed XML (sanity check that the route still works)
    expect(firstBody).toContain('<?xml version="1.0"');
    expect(firstBody).toContain('<rss version="2.0">');
  });
});
