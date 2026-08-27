import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CTA() {
  return (
    <div className="mt-12 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 p-8 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <h3 className="text-2xl font-bold">Ready to hire better, faster?</h3>
        <p className="mt-2 text-sm opacity-90">
          Start a free trial and see the impact on your hiring funnel.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/app" className={cn(buttonVariants(), "inline-flex")}>
            Start free trial
          </Link>
        </div>
      </div>
    </div>
  );
}
