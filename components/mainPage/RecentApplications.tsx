"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationStatus } from "@/generated/prisma/enums";
import type { Application } from "@/types/interview";

function getStatusVariant(status: ApplicationStatus) {
  switch (status) {
    case ApplicationStatus.ACTIVE:
      return "default" as const;
    case ApplicationStatus.OFFER:
      return "success" as const;
    case ApplicationStatus.REJECTED:
    case ApplicationStatus.WITHDRAWN:
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export default function RecentApplications({
  applications,
  loading,
}: {
  applications: Application[];
  loading: boolean;
}) {
  const recent = applications.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Applications</CardTitle>
        <Link
          href="/app/applications"
          className={buttonVariants({ size: "sm", variant: "ghost" })}
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No applications yet.{" "}
            <Link href="/app/applications" className="underline">
              Add one
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {app.job?.title ?? "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {app.company?.name ?? "—"} ·{" "}
                    {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={getStatusVariant(app.status)}>
                  {app.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
