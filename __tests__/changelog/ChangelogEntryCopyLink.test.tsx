import { act, fireEvent, render, screen } from '@testing-library/react';
import ChangelogEntry from '@/components/changelog/ChangelogEntry';
import CopyButton from '@/components/ui/CopyButton';
import { slugify } from '@/lib/slugify';

// ── slugify unit tests ──────────────────────────────────────────────────────

describe('slugify', () => {
  it('lowercases the title', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('AC1: converts "New Feature Released!" to "new-feature-released"', () => {
    expect(slugify('New Feature Released!')).toBe('new-feature-released');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz');
  });

  it('strips characters that are not alphanumeric or spaces', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('collapses consecutive spaces into a single hyphen', () => {
    expect(slugify('hello  world')).toBe('hello-world');
  });

  it('collapses consecutive hyphens into a single hyphen', () => {
    expect(slugify('foo--bar')).toBe('foo-bar');
  });

  it('trims leading and trailing whitespace', () => {
    expect(slugify('  hello  ')).toBe('hello');
  });

  it('returns an empty string for a title made entirely of special characters', () => {
    expect(slugify('!!!')).toBe('');
  });

  it('handles a single word', () => {
    expect(slugify('Changelog')).toBe('changelog');
  });
});

// ── ChangelogEntry integration tests ───────────────────────────────────────

const entry = {
  title: 'New Feature Released!',
  description: 'A brand new feature has been shipped.',
  date: '2026-08-01T00:00:00.000Z',
};

describe('ChangelogEntry — copy link (AC1)', () => {
  let writeText: jest.Mock;

  beforeEach(() => {
    writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });
  });

  it('AC1: h2 title has an id matching the slugified title', () => {
    render(<ChangelogEntry entry={entry} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveAttribute('id', 'new-feature-released');
  });

  it('AC1: clicking the copy button writes a URL ending in "#new-feature-released" to the clipboard', async () => {
    render(<ChangelogEntry entry={entry} />);
    const button = screen.getByRole('button', { name: /copy permalink/i });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    const writtenUrl: string = writeText.mock.calls[0][0];
    expect(writtenUrl).toMatch(/#new-feature-released$/);
  });
});

// ── CopyButton unit tests ───────────────────────────────────────────────────

describe('CopyButton', () => {
  let writeText: jest.Mock;

  beforeEach(() => {
    writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('AC3: renders with an aria-label describing its purpose', () => {
    render(<CopyButton slug="test-entry" />);
    const button = screen.getByRole('button', { name: /copy permalink/i });
    expect(button).toHaveAttribute('aria-label', 'Copy permalink to this entry');
  });

  it('AC3: button is a focusable element (screen-reader accessible)', () => {
    render(<CopyButton slug="test-entry" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('AC2: displays "Copied" immediately after the button is clicked', async () => {
    jest.useFakeTimers();
    render(<CopyButton slug="test-entry" />);
    const button = screen.getByRole('button');

    expect(button).toHaveTextContent('Link');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveTextContent('Copied');
  });

  it('AC2: reverts button label to "Link" after approximately 2 seconds', async () => {
    jest.useFakeTimers();
    render(<CopyButton slug="test-entry" />);
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveTextContent('Copied');

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(button).toHaveTextContent('Link');
  });

  it('writes a URL containing the correct hash fragment to the clipboard', async () => {
    render(<CopyButton slug="my-entry" />);
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    const writtenUrl: string = writeText.mock.calls[0][0];
    expect(writtenUrl).toMatch(/#my-entry$/);
  });

  it('uses a muted zinc text class for styling', () => {
    render(<CopyButton slug="test-entry" />);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/text-zinc/);
  });
});
