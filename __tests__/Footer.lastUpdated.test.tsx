import { render, screen } from '@testing-library/react'

// Stub BackToTop so that jest.resetModules() in the AC3 test does not cause a
// React-version mismatch: the real BackToTop uses useState/useEffect which must
// share the same React instance as @testing-library/react's renderer. Stubbing it
// here registers a factory that persists across jest.resetModules().
jest.mock('@/components/BackToTop', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('@/data/changelog.json', () => [
  { title: 'New Feature Released', description: 'Desc', date: '2026-08-29T00:00:00.000Z' },
  { title: 'Earlier Entry', description: 'Desc', date: '2026-01-15T00:00:00.000Z' },
])

import Footer from '@/components/Footer'

describe('Footer – last updated timestamp', () => {
  it('AC1: renders Last updated: 29 Aug 2026 for the most recent entry', () => {
    render(<Footer />)
    expect(screen.getByText(/Last updated: 29 Aug 2026/i)).toBeInTheDocument()
  })

  it('AC2: shows the most recent date, not an older entry', () => {
    render(<Footer />)
    expect(screen.queryByText(/15 Jan 2026/i)).not.toBeInTheDocument()
    expect(screen.getByText(/29 Aug 2026/i)).toBeInTheDocument()
  })

  it('AC4: timestamp row is inside the footer contentinfo landmark', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent('Last updated: 29 Aug 2026')
  })
})

describe('Footer – AC3: empty changelog', () => {
  it('omits the Last updated row when changelog has no entries', async () => {
    jest.resetModules()
    jest.doMock('@/data/changelog.json', () => [])
    const { default: FooterEmpty } = await import('@/components/Footer')
    render(<FooterEmpty />)
    expect(screen.queryByText(/Last updated/i)).not.toBeInTheDocument()
  })
})
