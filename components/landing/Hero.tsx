import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div className="max-w-xl">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Build interview-ready engineers, faster.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Prep candidates with realistic interviews, feedback and analytics —
          all in one place. Ship better hiring decisions with less effort.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/app"
            className={cn(buttonVariants(), "w-full sm:w-auto")}
          >
            Get started
          </Link>
          <Link
            href="#features"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full sm:w-auto",
            )}
          >
            See features
          </Link>
        </div>
      </div>

      <div className="order-first lg:order-last">
        <div className="relative h-64 w-full sm:h-80 lg:h-96">
          <div className="absolute -left-4 -top-6 rounded-2xl bg-white/60 p-3 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
              alt="Product mockup"
              width={900}
              height={600}
              className="rounded-xl object-cover"
            />
          </div>

          <div className="absolute right-0 bottom-0 w-36 sm:w-48 rounded-lg bg-white/60 p-2 shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
              alt="Thumbnail"
              width={320}
              height={200}
              className="rounded-md object-cover"
            />
          </div>

          <div className="absolute -right-6 -bottom-8 hidden md:block w-40 rounded-lg bg-white/60 p-2 shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1581092277855-0d4b3f8b8d3b?auto=format&fit=crop&w=800&q=80"
              alt="Small mock"
              width={320}
              height={200}
              className="rounded-md object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
