import { BarChart3, MessageSquareText, Video } from "lucide-react";

export default function Features() {
  const items = [
    {
      title: "Interview practice",
      desc: "Prepare for upcoming interviews with a structured practice routine.",
      icon: Video,
    },
    {
      title: "Learn from every round",
      desc: "Capture notes and feedback so you can see what to strengthen next.",
      icon: MessageSquareText,
    },
    {
      title: "Job search analytics",
      desc: "Understand your application progress and keep every opportunity organized.",
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.title}
          className="group rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-200/20 hover:bg-white/[0.055] sm:p-7"
        >
          <div className="flex size-11 items-center justify-center rounded-xl border border-cyan-200/10 bg-cyan-300/[0.08] text-cyan-200 transition group-hover:bg-cyan-300/[0.14]">
            <it.icon className="size-5" aria-hidden="true" />
          </div>
          <h3 className="mt-6 text-base font-semibold text-white">
            {it.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{it.desc}</p>
        </div>
      ))}
    </div>
  );
}
