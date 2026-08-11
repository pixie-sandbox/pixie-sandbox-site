export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-6 px-8 border-t border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto max-w-3xl flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <span>&copy; {year}</span>
        <span>&middot;</span>
        <a
          href="https://github.com/pixie-sandbox/pixie-sandbox-site"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View the Pixie sandbox site source code on GitHub"
          className="font-medium text-zinc-950 dark:text-zinc-50 hover:underline"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
