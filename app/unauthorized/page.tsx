import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-4 dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Unauthorized
      </h1>
      <p className="max-w-md text-center text-zinc-600 dark:text-zinc-400">
        You are signed in, but your account does not have permission to view
        this page.
      </p>
      <Link
        href="/dashboard"
        className="rounded-full border border-solid border-black/[.08] px-5 py-2 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
