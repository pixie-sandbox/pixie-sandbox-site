import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAccountById, VALID_ACCOUNT_IDS } from '@/lib/accounts';
import { formatMoney } from '@/lib/formatMoney';
import TransactionList from '@/components/TransactionList';

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Account detail page — /accounts/<id>.
 *
 * Shows the account name, masked number, balance, and transactions list.
 * Unknown ids call notFound() to render the existing 404 page (SEC-01 §3:
 * the URL segment is validated against the fixed whitelist VALID_ACCOUNT_IDS
 * before use).
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const account = getAccountById(id);
  if (!account) return { title: 'Account not found' };
  return { title: `${account.name} — Northline Bank` };
}

export default async function AccountPage({ params }: Props) {
  // AUTHENTICATION IS INTENTIONALLY ABSENT. Northline Bank is a demo with
  // entirely fictional data, and the spec rules out any sign-in flow. Do not
  // copy this route for real account data as-is: if this ever serves real
  // data, add a session/auth check HERE — before the whitelist validation
  // below — and return notFound() (not 403) for unauthenticated requests so
  // the existence of an account is not disclosed.
  const { id } = await params;

  // Validate against the fixed whitelist before any further use (SEC-01 §3).
  if (!(VALID_ACCOUNT_IDS as readonly string[]).includes(id)) {
    notFound();
  }

  const account = getAccountById(id);
  if (!account) {
    notFound();
  }

  // Sort transactions newest first for display.
  const transactions = [...account.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const isCreditCard = account.id === 'credit-card';

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950">
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">
        {/* Account summary */}
        <div className="mb-8 p-6 rounded-xl bg-white dark:bg-zinc-900 border border-[var(--primary-blue-light)] shadow-sm">
          <div className="h-1 w-12 rounded-full bg-[var(--primary-blue)] mb-4" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {account.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 mb-4">
            {account.masked_number}
          </p>

          {isCreditCard ? (
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Owing</p>
                <p className="text-2xl font-bold text-[var(--primary-blue-text)] dark:text-[var(--primary-blue-text)] mt-0.5">
                  {formatMoney(account.balance)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Credit limit</p>
                <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">
                  {formatMoney(account.credit_limit ?? 0)}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Balance</p>
              <p className="text-3xl font-bold text-[var(--primary-blue-text)] dark:text-[var(--primary-blue-text)] mt-0.5">
                {formatMoney(account.balance)}
              </p>
              {account.interest_rate !== undefined && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {account.interest_rate.toFixed(2)}% p.a.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Transactions */}
        <TransactionList
          transactions={transactions}
          accountName={account.name}
        />
      </main>
    </div>
  );
}
