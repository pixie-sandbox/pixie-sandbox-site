import { getAccounts } from '@/lib/accounts';
import AccountCard from '@/components/AccountCard';

/**
 * Accounts overview — home page (/).
 *
 * Greets the fictional customer Alex Taylor and lists their three accounts:
 * Everyday, Savings, and Credit card.
 *
 * Remains a synchronous server component so it can be rendered directly
 * in Jest tests via @testing-library/react (SWE constraint).
 */
export default function HomePage() {
  const accounts = getAccounts();

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950">
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
          Hello, Alex
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </main>
    </div>
  );
}
