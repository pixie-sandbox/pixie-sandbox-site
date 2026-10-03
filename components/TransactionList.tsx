import type { Transaction } from '@/lib/accounts';
import { formatMoney } from '@/lib/formatMoney';
import { formatDate } from '@/lib/formatDate';

type Props = {
  transactions: Transaction[];
  /** Label to show above the table. Used for screen-reader context. */
  accountName: string;
};

/**
 * Renders a list of transactions sorted newest first.
 *
 * Each row shows:
 * - Date formatted as DD MMM YYYY (DTS-04 §1)
 * - Description
 * - Signed amount: '+' prefix and green colour for money in; '-' prefix and
 *   default text colour for money out. Both sign and colour are used so the
 *   distinction does not rely on colour alone (WCAG 2.1 AA).
 * - Balance after the transaction in AUD
 *
 * An 'All amounts in AUD' note appears below the table heading.
 */
export default function TransactionList({ transactions, accountName }: Props) {
  // Transactions arrive sorted newest-first from the page.
  return (
    <section aria-labelledby="transactions-heading">
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <h2
          id="transactions-heading"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Transactions
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          All amounts in AUD
        </p>
      </div>

      <div className="overflow-x-auto">
        <table
          className="w-full text-sm border-collapse"
          aria-label={`Transactions for ${accountName}`}
        >
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 text-left">
              <th
                scope="col"
                className="py-2 pr-4 font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap"
              >
                Date
              </th>
              <th
                scope="col"
                className="py-2 pr-4 font-medium text-zinc-500 dark:text-zinc-400"
              >
                Description
              </th>
              <th
                scope="col"
                className="py-2 pr-4 font-medium text-zinc-500 dark:text-zinc-400 text-right whitespace-nowrap"
              >
                Amount
              </th>
              <th
                scope="col"
                className="py-2 font-medium text-zinc-500 dark:text-zinc-400 text-right whitespace-nowrap"
              >
                Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, index) => {
              const isMoneyIn = txn.amount > 0;
              return (
                <tr
                  key={index}
                  className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                >
                  <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {formatDate(txn.date)}
                  </td>
                  <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">
                    {txn.description}
                  </td>
                  <td
                    className={[
                      'py-3 pr-4 text-right font-medium tabular-nums whitespace-nowrap',
                      isMoneyIn
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-zinc-700 dark:text-zinc-300',
                    ].join(' ')}
                  >
                    {formatMoney(txn.amount, true)}
                  </td>
                  <td className="py-3 text-right font-medium tabular-nums whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                    {formatMoney(txn.balance_after)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
