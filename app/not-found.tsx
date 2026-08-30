import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-6 py-32 px-16 text-center bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          Page not found
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Check the URL or head back to the homepage.
        </p>
        <Link
          href="/"
          className="flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Return to Home
        </Link>
      </main>
    </div>
  );
}
