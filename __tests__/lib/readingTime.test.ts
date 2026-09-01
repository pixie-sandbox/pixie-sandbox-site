import { calculateReadingTime } from '@/lib/readingTime';

/**
 * Generates a string containing exactly `n` words.
 */
function makeWords(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i + 1}`).join(' ');
}

describe('calculateReadingTime', () => {
  // AC3: 0 words → '1 min read' (minimum enforced)
  it('AC3: returns "1 min read" for an empty description', () => {
    expect(calculateReadingTime('')).toBe('1 min read');
  });

  // AC3: 0 words via whitespace-only string
  it('AC3: returns "1 min read" for a whitespace-only description', () => {
    expect(calculateReadingTime('   ')).toBe('1 min read');
  });

  // AC2: 10 words → '1 min read' (10/200 = 0.05, ceil = 1, min = 1)
  it('AC2: returns "1 min read" for a 10-word description', () => {
    expect(calculateReadingTime(makeWords(10))).toBe('1 min read');
  });

  // Boundary: 11 words → '1 min read' (11/200 = 0.055, ceil = 1)
  it('returns "1 min read" for an 11-word description', () => {
    expect(calculateReadingTime(makeWords(11))).toBe('1 min read');
  });

  // AC1: 450 words → '3 min read' (450/200 = 2.25, ceil = 3)
  it('AC1: returns "3 min read" for a 450-word description', () => {
    expect(calculateReadingTime(makeWords(450))).toBe('3 min read');
  });

  // Exact boundary: 200 words → '1 min read' (200/200 = 1, ceil = 1)
  it('returns "1 min read" for exactly 200 words', () => {
    expect(calculateReadingTime(makeWords(200))).toBe('1 min read');
  });

  // Just over: 201 words → '2 min read' (201/200 = 1.005, ceil = 2)
  it('returns "2 min read" for 201 words', () => {
    expect(calculateReadingTime(makeWords(201))).toBe('2 min read');
  });

  // Extra whitespace should not affect word count
  it('handles descriptions with extra whitespace between words', () => {
    const description = 'word1  word2   word3'; // 3 words with irregular spacing
    expect(calculateReadingTime(description)).toBe('1 min read');
  });
});
