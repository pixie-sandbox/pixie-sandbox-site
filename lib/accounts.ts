/**
 * Accounts data for the Northline Bank demo.
 *
 * AUTHENTICATION IS INTENTIONALLY ABSENT. Every account and transaction in
 * data/accounts.json is fictional, and the site deliberately behaves as if a
 * fictional customer (Alex Taylor) is always signed in. These helpers return
 * data to any caller. If this code is ever extended to real account data,
 * access must be gated by a session/auth check in the calling route before
 * any id validation or lookup happens — this module is not a security
 * boundary.
 */
import accountsData from '@/data/accounts.json';

export type Transaction = {
  date: string;         // ISO 8601 date, YYYY-MM-DD
  description: string;  // customer-facing merchant/description
  amount: number;       // signed; positive = money in, negative = money out
  balance_after: number; // AUD; for credit-card, the amount owing after the txn
};

export type Account = {
  id: 'everyday' | 'savings' | 'credit-card';
  name: 'Everyday' | 'Savings' | 'Credit card';
  masked_number: string;   // e.g. '•••• 4821'; last four digits only
  balance: number;         // AUD; for credit-card, the amount currently owing
  interest_rate?: number;  // percent p.a., savings only (e.g. 4.5)
  credit_limit?: number;   // AUD, credit-card only (e.g. 10000)
  transactions: Transaction[];
};

/** The fixed set of valid account slugs. Used for URL validation (SEC-01 §3). */
export const VALID_ACCOUNT_IDS: ReadonlyArray<Account['id']> = [
  'everyday',
  'savings',
  'credit-card',
];

/** Returns all accounts from the data file. */
export function getAccounts(): Account[] {
  return accountsData as Account[];
}

/**
 * Returns the account matching `id`, or null if it does not exist.
 * The caller is responsible for validating the id against VALID_ACCOUNT_IDS
 * before calling notFound() (SEC-01 §3).
 */
export function getAccountById(id: string): Account | null {
  const accounts = getAccounts();
  return accounts.find((a) => a.id === id) ?? null;
}
