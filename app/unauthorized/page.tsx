import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 bg-background px-4">
      <h1 className="text-2xl font-semibold">Unauthorized</h1>
      <p className="max-w-md text-center text-muted-foreground">
        You are signed in, but your account does not have permission to view
        this page.
      </p>
      <Link href="/app" className={cn(buttonVariants({ variant: "outline" }))}>
        Back to dashboard
      </Link>
    </div>
  );
}
