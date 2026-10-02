import { ArrowUpRight, Layers3 } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#08090d]/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-white"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950 shadow-lg shadow-cyan-950/40">
            <Layers3 className="size-4" aria-hidden="true" />
          </span>
          Prepnition
        </Link>

        <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <a href="#gallery" className="transition-colors hover:text-white">
            Product
          </a>
          <a
            href="#for-specialists"
            className="transition-colors hover:text-white"
          >
            For specialists
          </a>
          <a href="#open-source" className="transition-colors hover:text-white">
            Open source
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "hidden text-slate-300 hover:bg-white/[0.06] hover:text-white sm:inline-flex",
            )}
          >
            Sign in
          </Link>
          <Link
            href="/app"
            className={cn(
              buttonVariants(),
              "ml-1 gap-2 rounded-full bg-cyan-300 px-4 text-slate-950 hover:bg-cyan-200",
            )}
          >
            Get started <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
