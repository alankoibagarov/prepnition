import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-sm border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          Prepnition
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
          <a href="#testimonials" className="hover:text-foreground">
            Testimonials
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "hidden sm:inline-flex",
            )}
          >
            Sign in
          </Link>
          <Link href="/app" className={cn(buttonVariants(), "ml-2")}>
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
