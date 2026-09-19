import '@testing-library/jest-dom'
import { render, screen, fireEvent, within } from '@testing-library/react'
import ChangelogFilteredList from '@/components/changelog/ChangelogFilteredList'

const entries = [
  { title: 'a', description: 'x', date: '2026-06-01' },
  { title: 'b', description: 'x', date: '2026-01-10' },
  { title: 'c', description: 'x', date: '2025-11-30' },
]

describe('ChangelogFilteredList – option counts agree with list', () => {
  it('AC5: selecting 2026 renders exactly 2 entries in the list, matching the `2026 (2)` option count', () => {
    // Discriminating: if the counts were derived from a different source than the
    // filter, the option could say "2026 (2)" but the list could show a different number.
    render(<ChangelogFilteredList entries={entries} />)
    const select = screen.getByLabelText(/Filter entries by year/i) as HTMLSelectElement
    // Verify the option text shows the correct count before filtering
    const opt2026 = within(select).getByRole('option', { name: /^2026 \(2\)$/ }) as HTMLOptionElement
    expect(opt2026).toBeInTheDocument()
    // Select 2026 and confirm the list length equals the count in the option
    fireEvent.change(select, { target: { value: '2026' } })
    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(2)
  })

  it('AC8: the existing count paragraph above the filter still reads `3 entries` with no year selected', () => {
    render(<ChangelogFilteredList entries={entries} />)
    expect(screen.getByText(/^3 entries$/)).toBeInTheDocument()
  })
})
