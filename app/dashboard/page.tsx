import Link from "next/link";
import { LogoutButton } from "@/app/components/LogoutButton";
import { hasRole, requireRole } from "@/lib/auth/permissions";
import { requireAuth } from "@/lib/auth/session";

export default async function Dashboard() {
  const session = await requireAuth();
  const isAdmin = hasRole(session, "admin");

  await requireRole("admin");

  return (
    <div className="flex min-h-full flex-1 flex-col gap-6 bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-zinc-50">
            Dashboard
          </h1>
          <LogoutButton />
        </div>

        <div className="mt-6 rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-zinc-950">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as
          </p>
          <p className="mt-1 text-lg font-medium text-black dark:text-zinc-50">
            {session.email}
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Role:{" "}
            <span className="font-medium text-black dark:text-zinc-50">
              {session.role}
            </span>
          </p>
        </div>

        {isAdmin ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
            <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
              Admin area
            </h2>
            <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
              This section is only visible to users with the admin role.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-zinc-950">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Admin-only content is hidden for your role.
            </p>
          </div>
        )}

        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
