import {
  BarChart3,
  CalendarDays,
  Check,
  CircleHelp,
  MoreHorizontal,
  Search,
} from "lucide-react";

export default function Gallery() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11141c] lg:col-span-2">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
            <BarChart3 className="size-4 text-cyan-200" aria-hidden="true" />
            Application overview
          </div>
          <MoreHorizontal
            className="size-4 text-slate-500"
            aria-hidden="true"
          />
        </div>
        <div className="grid gap-5 p-4 sm:grid-cols-[1fr_0.8fr] sm:p-6">
          <div>
            <p className="text-[10px] text-slate-500">Application progress</p>
            <div className="mt-4 space-y-3">
              {[
                {
                  label: "Applied",
                  count: "24",
                  width: "w-full",
                  color: "bg-cyan-300",
                },
                {
                  label: "Interviewing",
                  count: "16",
                  width: "w-2/3",
                  color: "bg-blue-400",
                },
                {
                  label: "Offers",
                  count: "08",
                  width: "w-1/3",
                  color: "bg-violet-400",
                },
              ].map((stage) => (
                <div key={stage.label}>
                  <div className="mb-1.5 flex justify-between text-[10px]">
                    <span className="text-slate-400">{stage.label}</span>
                    <span className="text-slate-300">{stage.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full ${stage.width} ${stage.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[10px] text-slate-500">
              Applications this month
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
              12
              <span className="ml-1 text-lg text-slate-500"> roles</span>
            </p>
            <div className="mt-5 flex h-12 items-end gap-1">
              {[40, 58, 45, 76, 54, 88, 67, 100, 74, 91].map((height) => (
                <div
                  key={height}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-600 to-cyan-300"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11141c]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
            <CalendarDays
              className="size-4 text-violet-200"
              aria-hidden="true"
            />
            Next interviews
          </div>
          <span className="rounded-full bg-cyan-300/10 px-2 py-0.5 text-[9px] text-cyan-200">
            Coming up
          </span>
        </div>
        <div className="space-y-3 p-4">
          {[
            {
              name: "Frontend Engineer",
              company: "Delta Data",
              time: "10:30 AM",
              initials: "DD",
            },
            {
              name: "Product Designer",
              company: "Northstar",
              time: "1:00 PM",
              initials: "N",
            },
            {
              name: "Platform Engineer",
              company: "Brightside",
              time: "3:30 PM",
              initials: "B",
            },
          ].map((interview) => (
            <div
              key={interview.name}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400/20 to-cyan-300/20 text-[9px] font-semibold text-cyan-100">
                {interview.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium text-slate-200">
                  {interview.name}
                </p>
                <p className="mt-0.5 text-[9px] text-slate-500">
                  {interview.company} · {interview.time}
                </p>
              </div>
              <Check className="size-3.5 text-emerald-300" aria-hidden="true" />
            </div>
          ))}
        </div>
        <div className="mx-4 mb-4 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-[9px] text-slate-500">
          Your personal interview schedule
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-4 lg:col-span-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200">
          <CircleHelp className="size-4" aria-hidden="true" />
        </span>
        <p className="text-xs leading-5 text-slate-400">
          Keep your job-search progress and interview notes connected in one
          clear view.
        </p>
        <Search
          className="ml-auto hidden size-4 shrink-0 text-slate-600 sm:block"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
