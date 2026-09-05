import type { Metadata } from "next";
import changelog from "@/data/changelog.json";
import ChangelogList from "@/components/changelog/ChangelogList";

export const metadata: Metadata = {
  title: "Changelog",
  description: "A record of updates to the Pixie sandbox site.",
};

/**
 * /changelog — lists all site updates in descending chronological order.
 * Content is sourced from data/changelog.json.
 */
export default function ChangelogPage() {
  // Sort newest-first; the JSON source order is not relied upon.
  const entries = [...changelog].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const entryCount = changelog.length;
  const entryLabel = entryCount === 1 ? "1 entry" : `${entryCount} entries`;

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col py-16 px-16 bg-white dark:bg-black">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Changelog
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {entryLabel}
          </p>
          <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
            A record of updates to this site.
          </p>
        </header>
        <ChangelogList entries={entries} />
      </main>
    </div>
  );
}
