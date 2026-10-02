import { Layers3 } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#08090d] py-8">
      <div className="mx-auto max-w-7xl px-5 text-sm text-slate-500 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
              <Layers3 className="size-3.5" aria-hidden="true" />
            </span>
            <span className="font-medium">Prepnition</span>
            <span className="ml-1 text-slate-600">
              © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="transition-colors hover:text-slate-200"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-slate-200"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
