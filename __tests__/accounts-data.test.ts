/**
 * Data-integrity tests for data/accounts.json.
 *
 * AC9: The balance shown on the overview equals the balance after the newest
 * transaction on each account's detail page.
 * AC14: Each account has between 10 and 15 transactions, all with plausible
 * ISO dates within the last three months.
 */
import accounts from '@/data/accounts.json';

type Transaction = { date: string; description: string; amount: number; balance_after: number };
type Account = {
  id: string;
  name: string;
  masked_number: string;
  balance: number;
  interest_rate?: number;
  credit_limit?: number;
  transactions: Transaction[];
};

const data = accounts as Account[];

describe('data/accounts.json — structural invariants', () => {
  it('contains exactly three accounts', () => {
    expect(data).toHaveLength(3);
    const ids = data.map((a) => a.id);
    expect(ids).toContain('everyday');
    expect(ids).toContain('savings');
    expect(ids).toContain('credit-card');
  });

  it('masked_number contains only the last four digits — no run of 6+ digits', () => {
    for (const account of data) {
      // Discriminating: a full account number like "1234567890" would match \d{6,}
      expect(account.masked_number).not.toMatch(/\d{6,}/);
      // Must end with exactly 4 digits
      expect(account.masked_number).toMatch(/\d{4}$/);
    }
  });
});

describe('data/accounts.json — AC9: overview balance equals newest-transaction balance', () => {
  for (const account of data) {
    it(`account "${account.name}" balance matches newest transaction balance_after`, () => {
      // Sort descending to get newest transaction
      const sorted = [...account.transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const newestBalance = sorted[0].balance_after;
      // Discriminating: comparing account.balance to the NEWEST transaction,
      // not the oldest or an average — a data entry mistake would fail here.
      expect(account.balance).toBeCloseTo(newestBalance, 2);
    });
  }
});

describe('data/accounts.json — AC14: transaction count and date range', () => {
  // Today is 2026-09-27; three months back is 2026-06-27
  const threeMonthsAgo = new Date('2026-06-27');
  const today = new Date('2026-09-27');

  for (const account of data) {
    it(`account "${account.name}" has 10–15 transactions`, () => {
      // Discriminating: 9 or 16 transactions would fail; 12 is the target
      expect(account.transactions.length).toBeGreaterThanOrEqual(10);
      expect(account.transactions.length).toBeLessThanOrEqual(15);
    });

    it(`account "${account.name}" all transaction dates are within the last three months`, () => {
      for (const txn of account.transactions) {
        const txnDate = new Date(txn.date);
        expect(txnDate.getTime()).toBeGreaterThanOrEqual(threeMonthsAgo.getTime());
        expect(txnDate.getTime()).toBeLessThanOrEqual(today.getTime());
      }
    });

    it(`account "${account.name}" descriptions contain no internal tracking references (PCP-02)`, () => {
      // Discriminating: a description like 'PAY-1234 payment' would match
      for (const txn of account.transactions) {
        expect(txn.description).not.toMatch(/[A-Z]+-\d+/);
      }
    });
  }
});

describe('data/accounts.json — account-specific fields', () => {
  it('Savings account has interest_rate of 4.5', () => {
    const savings = data.find((a) => a.id === 'savings');
    expect(savings?.interest_rate).toBe(4.5);
  });

  it('Credit card account has a credit_limit', () => {
    const cc = data.find((a) => a.id === 'credit-card');
    expect(cc?.credit_limit).toBeDefined();
    expect(typeof cc?.credit_limit).toBe('number');
  });

  it('Everyday account has no interest_rate or credit_limit', () => {
    const everyday = data.find((a) => a.id === 'everyday');
    expect(everyday?.interest_rate).toBeUndefined();
    expect(everyday?.credit_limit).toBeUndefined();
  });
});
