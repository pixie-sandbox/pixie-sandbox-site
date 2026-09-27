import Link from 'next/link';
import type { Account } from '@/lib/accounts';
import { formatMoney } from '@/lib/formatMoney';

type Props = {
  account: Account;
};

/**
 * Displays a single account summary card on the accounts overview page.
 *
 * - Shows account name, masked number, and balance.
 * - Savings: shows interest rate as 'X.XX% p.a.'
 * - Credit card: shows amount owing and credit limit (instead of generic balance).
 * - Links to the account detail page at /accounts/<id>.
 *
 * Only the last four digits of the account number are rendered (SEC-01 §4).
 */
export default function AccountCard({ account }: Props) {
  const isCreditCard = account.id === 'credit-card';

  return (
    <Link
      href={`/accounts/${account.id}`}
      className="block rounded-xl border border-[var(--primary-blue-light)] bg-white dark:bg-zinc-900 p-5 shadow-sm hover:shadow-md hover:border-[var(--primary-blue)] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-blue)]"
      aria-label={`${account.name} — ${account.masked_number}`}
    >
      {/* Top accent bar */}
      <div className="h-1 w-12 rounded-full bg-[var(--primary-blue)] mb-4" aria-hidden="true" />

      {/* Account name and masked number */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {account.name}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {account.masked_number}
          </p>
        </div>
      </div>

      {/* Balance / credit card details */}
      {isCreditCard ? (
        <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex justify-between gap-2">
            <span>Owing</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {formatMoney(account.balance)}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Credit limit</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {formatMoney(account.credit_limit ?? 0)}
            </span>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-2xl font-bold text-[var(--primary-blue-text)] dark:text-[var(--primary-blue-text)]">
            {formatMoney(account.balance)}
          </p>
          {account.interest_rate !== undefined && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {account.interest_rate.toFixed(2)}% p.a.
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
