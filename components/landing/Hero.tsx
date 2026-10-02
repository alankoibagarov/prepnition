import {
  ArrowDown,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CirclePlay,
  Clock3,
  MoreHorizontal,
  Search,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="relative grid gap-14 pb-20 pt-14 sm:pb-28 sm:pt-20 lg:min-h-[680px] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-12">
      <div className="pointer-events-none absolute -left-56 top-0 -z-10 size-[30rem] rounded-full bg-cyan-500/[0.08] blur-[120px]" />
      <div className="relative z-10 max-w-xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 text-xs font-medium text-cyan-100">
          <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_2px_rgba(103,232,249,0.6)]" />
          Your job search, in focus
        </div>
        <h1 className="text-4xl font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
          Prepare with confidence.
          <span className="mt-1 block bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            Make your next move.
          </span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
          Track every opportunity, prepare for interviews, and learn from your
          progress — all in one place built for your job search.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/app"
            className={cn(
              buttonVariants(),
              "h-11 gap-2 rounded-full bg-cyan-300 px-5 text-slate-950 hover:bg-cyan-200",
            )}
          >
            Get started <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="#features"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 gap-2 rounded-full border-white/10 bg-white/[0.03] px-5 text-slate-200 hover:bg-white/[0.08] hover:text-white",
            )}
          >
            <CirclePlay className="size-4" aria-hidden="true" />
            Explore features
          </Link>
        </div>
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
          <Check className="size-4 text-cyan-300" aria-hidden="true" />
          Free and open source · Start in minutes
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-2xl lg:ml-auto">
        <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-cyan-400/10 via-blue-500/[0.06] to-indigo-500/10 blur-2xl" />
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#11141c] shadow-2xl shadow-black/50 ring-1 ring-white/[0.04]">
          <div className="flex h-12 items-center justify-between border-b border-white/[0.07] px-4 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
                <Layers3Icon />
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Prepnition
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="hidden sm:inline">My job search</span>
              <span className="size-6 rounded-full bg-gradient-to-br from-violet-400 to-cyan-300" />
            </div>
          </div>

          <div className="grid min-h-[330px] grid-cols-[58px_1fr] sm:min-h-[410px] sm:grid-cols-[172px_1fr]">
            <aside className="border-r border-white/[0.07] p-2 sm:p-4">
              <div className="mb-6 hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-2 text-[10px] text-slate-500 sm:flex">
                <Search className="size-3.5" aria-hidden="true" />
                Search...
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 rounded-lg bg-cyan-300/10 px-2 py-2 text-[11px] font-medium text-cyan-100 sm:justify-start">
                  <BarChart3 className="size-4 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">Overview</span>
                </div>
                <div className="flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-[11px] text-slate-500 sm:justify-start">
                  <BriefcaseBusiness
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">Applications</span>
                </div>
                <div className="flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-[11px] text-slate-500 sm:justify-start">
                  <CalendarDays
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">Interviews</span>
                </div>
              </div>
              <div className="mt-8 hidden border-t border-white/[0.07] pt-4 sm:block">
                <p className="px-2 text-[9px] font-medium uppercase tracking-wider text-slate-600">
                  Focus area
                </p>
                <div className="mt-3 flex items-center gap-2 px-2 text-[10px] text-slate-500">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Software engineering
                </div>
              </div>
            </aside>

            <div className="min-w-0 p-3 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white sm:text-base">
                    Good morning, Alex
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                    Here&apos;s your job search overview
                  </p>
                </div>
                <div className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-[10px] text-slate-400 sm:flex">
                  Last 30 days{" "}
                  <ArrowDown className="size-3" aria-hidden="true" />
                </div>
                <MoreHorizontal
                  className="size-5 text-slate-500 sm:hidden"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
                {[
                  {
                    label: "Applications",
                    value: "12",
                    color: "text-cyan-200",
                  },
                  {
                    label: "Interviews",
                    value: "08",
                    color: "text-violet-200",
                  },
                  {
                    label: "Offers",
                    value: "03",
                    color: "text-emerald-200",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 sm:p-3.5"
                  >
                    <p className="text-[9px] text-slate-500 sm:text-[10px]">
                      {stat.label}
                    </p>
                    <p
                      className={`mt-1 text-lg font-semibold sm:text-2xl ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 sm:mt-4 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-slate-200 sm:text-xs">
                      Application activity
                    </p>
                    <p className="mt-1 text-[9px] text-slate-500">
                      Your search over time
                    </p>
                  </div>
                  <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-[9px] font-medium text-emerald-300">
                    +18.4%
                  </span>
                </div>
                <div className="mt-4 flex h-20 items-end gap-1.5 sm:h-28 sm:gap-2">
                  {[34, 51, 42, 68, 53, 76, 60, 88, 70, 94, 72, 84].map(
                    (height) => (
                      <div
                        key={height}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-600/70 to-cyan-300/80"
                        style={{ height: `${height}%` }}
                      />
                    ),
                  )}
                </div>
                <div className="mt-2 flex justify-between text-[8px] text-slate-600">
                  <span>WEEK 01</span>
                  <span>WEEK 02</span>
                  <span>WEEK 03</span>
                  <span>WEEK 04</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 sm:mt-4 sm:p-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-400/10 text-violet-200">
                    <Clock3 className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-medium text-slate-200 sm:text-[11px]">
                      Senior Frontend Engineer
                    </p>
                    <p className="mt-0.5 text-[9px] text-slate-500">
                      Technical interview · Today, 2:30 PM
                    </p>
                  </div>
                </div>
                <span className="ml-2 rounded-md border border-white/[0.08] px-2 py-1 text-[8px] text-slate-400">
                  Upcoming
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-white/10 bg-[#141923] p-3 shadow-2xl shadow-black/40 sm:block lg:-left-10">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
              <Check className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-medium text-slate-200">
                Feedback submitted
              </p>
              <p className="mt-0.5 text-[9px] text-slate-500">
                Scorecard saved just now
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Layers3Icon() {
  return <BarChart3 className="size-4" aria-hidden="true" />;
}
