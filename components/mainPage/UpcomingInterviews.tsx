"use client";

import Link from "next/link";
import { getUpcomingInterviews } from "@/app/helpers/dashboard";
import { capitalize } from "@/app/helpers/string";
import type { Application } from "@/types/interview";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DateRange } from "react-day-picker";

export default function UpcomingInterviews({
  applications,
  loading,
  dateRange,
}: {
  applications: Application[];
  loading: boolean;
  dateRange?: DateRange;
}) {
  const upcoming = getUpcomingInterviews(applications, dateRange);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : upcoming.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No upcoming interviews scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {interview.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {interview.companyName} · {interview.jobTitle} ·{" "}
                    {capitalize(interview.type)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {interview.scheduledAt
                      ? new Date(interview.scheduledAt).toLocaleString()
                      : "—"}
                  </div>
                </div>
                <Link
                  href={`/app/applications/${interview.applicationId}`}
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
