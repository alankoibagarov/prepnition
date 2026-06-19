import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Counter } from "./components/Counter";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background font-sans">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between px-16 py-32 sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <Card className="mt-8 w-full border-none bg-transparent shadow-none ring-0">
          <CardHeader className="items-center px-0 text-center sm:items-start sm:text-left">
            <CardTitle className="max-w-xs text-3xl leading-10 tracking-tight">
              To get started, edit the page.tsx file.
            </CardTitle>
            <CardDescription className="max-w-md text-lg leading-8">
              Looking for a starting point or more instructions? Head over to{" "}
              <a
                href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Templates
              </a>{" "}
              or the{" "}
              <a
                href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Learning
              </a>{" "}
              center.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-0 sm:flex-row">
            <Link href="/app" className={cn(buttonVariants(), "md:w-[158px]")}>
              Dashboard
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "md:w-[158px]",
              )}
            >
              Sign in
            </Link>
          </CardContent>
        </Card>
        <Counter />
      </main>
    </div>
  );
}
