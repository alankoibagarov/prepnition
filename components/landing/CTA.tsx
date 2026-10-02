import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CTA() {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-cyan-200/15 bg-[#101722] px-6 py-14 text-center sm:px-10 sm:py-20">
      <div className="absolute -left-20 -top-40 -z-10 size-96 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -bottom-52 -right-16 -z-10 size-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="mx-auto max-w-2xl">
        <div className="mx-auto mb-5 flex size-11 items-center justify-center rounded-2xl border border-cyan-200/15 bg-cyan-300/[0.08] text-cyan-200">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Make your next career move with confidence.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
          Start organizing your search and preparing for what comes next.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/app"
            className={cn(
              buttonVariants(),
              "h-11 gap-2 rounded-full bg-cyan-300 px-5 text-slate-950 hover:bg-cyan-200",
            )}
          >
            Get started for free
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
