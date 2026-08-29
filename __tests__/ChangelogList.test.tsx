import { render, screen } from '@testing-library/react';
import ChangelogList from '@/components/changelog/ChangelogList';

const entries = [
  {
    title: 'Custom 404 Page',
    description: 'Added a custom 404 page.',
    date: '2026-08-29T00:00:00.000Z',
  },
  {
    title: 'Back-to-Top Control',
    description: 'Added a back-to-top button.',
    date: '2026-08-22T00:00:00.000Z',
  },
  {
    title: 'Dark Mode Toggle',
    description: 'Introduced a theme toggle.',
    date: '2026-08-15T00:00:00.000Z',
  },
  {
    title: 'Footer',
    description: 'Added a site-wide footer.',
    date: '2026-08-08T00:00:00.000Z',
  },
];

describe('ChangelogList', () => {
  it('AC1: renders all entries', () => {
    render(<ChangelogList entries={entries} />);
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });

  it('AC1: renders titles for all entries', () => {
    render(<ChangelogList entries={entries} />);
    for (const entry of entries) {
      expect(screen.getByRole('heading', { name: entry.title })).toBeInTheDocument();
    }
  });

  it('AC1: renders entries in the supplied order (newest first)', () => {
    render(<ChangelogList entries={entries} />);
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[0]).toHaveTextContent('Custom 404 Page');
    expect(headings[1]).toHaveTextContent('Back-to-Top Control');
    expect(headings[2]).toHaveTextContent('Dark Mode Toggle');
    expect(headings[3]).toHaveTextContent('Footer');
  });

  it('AC1: renders a landmark with an accessible label', () => {
    render(<ChangelogList entries={entries} />);
    expect(screen.getByRole('feed', { name: /changelog entries/i })).toBeInTheDocument();
  });

  it('AC2: each entry has a tooltip with the absolute date', () => {
    render(<ChangelogList entries={entries} />);
    const tooltips = screen.getAllByRole('tooltip');
    expect(tooltips).toHaveLength(4);
  });

  it('AC1: renders no articles when entries array is empty', () => {
    render(<ChangelogList entries={[]} />);
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});
