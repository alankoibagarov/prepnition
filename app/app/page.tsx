import Link from "next/link";
import { LogoutButton } from "@/app/components/LogoutButton";
import InterviewFunnel from "@/components/interviews/InterviewFunnel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasRole } from "@/lib/auth/permissions";
import { requireAuth } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export default async function AppHome() {
  const session = await requireAuth();
  const isAdmin = hasRole(session, "admin");

  return (
    <div className="flex min-h-full flex-1 flex-col gap-6 bg-background px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "link" }),
            "mt-6 inline-flex",
          )}
        >
          Back to home
        </Link>
        <LogoutButton />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardDescription>Signed in as</CardDescription>
          <CardTitle>{session.email}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Badge variant="secondary">{session.role}</Badge>
          </div>
        </CardContent>
      </Card>

      <InterviewFunnel />

      {isAdmin ? (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40">
          <CardHeader>
            <CardTitle className="text-emerald-900 dark:text-emerald-100">
              Admin area
            </CardTitle>
            <CardDescription className="text-emerald-800 dark:text-emerald-200">
              This section is only visible to users with the admin role.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Admin-only content is hidden for your role.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
