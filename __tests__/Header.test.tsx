import { render, screen, within, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';

let mockPathname = '/';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

const SIGNED_IN = 'Signed in as Alex Taylor';

function renderAt(pathname: string) {
  cleanup();
  mockPathname = pathname;
  render(
    <ThemeProvider>
      <Header />
    </ThemeProvider>
  );
  return screen.getByRole('banner');
}

describe('Header signed-in strip', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('AC1: shows the signed-in text on the Accounts overview, with no digits and no heading', () => {
    const banner = renderAt('/');
    expect(banner).toHaveTextContent(SIGNED_IN);
    expect(banner.textContent ?? '').not.toMatch(/\d/);
    expect(within(banner).queryByRole('heading')).toBeNull();
  });

  it.each(['/accounts/everyday', '/accounts/savings', '/accounts/credit-card'])(
    'AC2: shows the signed-in text on %s',
    (path) => {
      expect(renderAt(path)).toHaveTextContent(SIGNED_IN);
    }
  );

  it('AC3: hides the strip on /changelog while it shows on a banking page', () => {
    expect(renderAt('/accounts/savings')).toHaveTextContent(SIGNED_IN);
    expect(renderAt('/changelog')).not.toHaveTextContent('Signed in as');
  });

  it.each([
    '/accounts/mystery',
    '/accounts/EVERYDAY',
    '/accounts',
    '/accounts/everyday/extra',
    '/no-such-page',
  ])('AC4: hides the strip on %s while it shows on /accounts/everyday', (path) => {
    expect(renderAt('/accounts/everyday')).toHaveTextContent(SIGNED_IN);
    expect(renderAt(path)).not.toHaveTextContent('Signed in as');
  });

  it('AC5: the strip sits inside the single banner, before the site name', () => {
    renderAt('/');
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    const banner = screen.getByRole('banner');
    const strip = within(banner).getByText(/Signed in as/);
    const siteName = within(banner).getByRole('link', { name: 'Northline Bank' });
    expect(strip.compareDocumentPosition(siteName) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('AC6: offers no sign-out and adds no links or buttons to the header', () => {
    const banner = renderAt('/');
    expect(banner).toHaveTextContent(SIGNED_IN);
    expect(within(banner).queryByRole('link', { name: /sign ?out|log ?out/i })).toBeNull();
    expect(within(banner).queryByRole('button', { name: /sign ?out|log ?out/i })).toBeNull();
    expect(within(banner).getAllByRole('link').map((l) => (l.textContent ?? '').trim())).toEqual([
      'Northline Bank',
      'Accounts',
      'Changelog',
    ]);
    expect(within(banner).getAllByRole('button')).toHaveLength(1);
  });

  it('shows and hides the strip as the path changes without remounting (client-side navigation)', () => {
    cleanup();
    mockPathname = '/accounts/savings';
    const tree = () => (
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    );
    const { rerender } = render(tree());
    const banner = screen.getByRole('banner');
    expect(banner).toHaveTextContent(SIGNED_IN);

    mockPathname = '/changelog';
    rerender(tree());
    expect(screen.getByRole('banner')).toBe(banner);
    expect(banner).not.toHaveTextContent('Signed in as');

    mockPathname = '/';
    rerender(tree());
    expect(screen.getByRole('banner')).toBe(banner);
    expect(banner).toHaveTextContent(SIGNED_IN);
  });
});
