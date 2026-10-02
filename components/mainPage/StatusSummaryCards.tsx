"use client";

import { capitalize } from "@/app/helpers/string";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationStatus } from "@/generated/prisma/enums";
import type { Application } from "@/types/interview";

const STATUS_ORDER: ApplicationStatus[] = [
  ApplicationStatus.ACTIVE,
  ApplicationStatus.OFFER,
  ApplicationStatus.DRAFT,
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
];

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.ACTIVE]: "text-blue-600 dark:text-blue-400",
  [ApplicationStatus.OFFER]: "text-green-600 dark:text-green-400",
  [ApplicationStatus.DRAFT]: "text-muted-foreground",
  [ApplicationStatus.REJECTED]: "text-red-600 dark:text-red-400",
  [ApplicationStatus.WITHDRAWN]: "text-orange-600 dark:text-orange-400",
};

export default function StatusSummaryCards({
  applications,
  loading,
}: {
  applications: Application[];
  loading: boolean;
}) {
  const counts = STATUS_ORDER.reduce<Record<string, number>>((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  for (const app of applications) {
    if (counts[app.status] !== undefined) {
      counts[app.status] += 1;
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STATUS_ORDER.map((status) => (
          <Card key={status}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Loading…</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {STATUS_ORDER.map((status) => (
        <Card key={status}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {capitalize(status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${STATUS_COLORS[status]}`}>
              {counts[status]}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
