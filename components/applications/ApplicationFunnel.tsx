"use client";

import { capitalize } from "@/app/helpers/string";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationStatus } from "@/generated/prisma/enums";
import type { Application } from "@/types/interview";

const PIPELINE_STAGES = [
  ApplicationStatus.DRAFT,
  ApplicationStatus.ACTIVE,
  ApplicationStatus.OFFER,
] as const;

const TERMINAL_STAGES = [
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
] as const;

function countEverReached(
  applications: Application[],
  targetStatus: ApplicationStatus,
): number {
  const targetIndex = PIPELINE_STAGES.indexOf(
    targetStatus as (typeof PIPELINE_STAGES)[number],
  );

  return applications.filter((app) => {
    const seen = new Set<string>([app.status]);
    for (const h of app.history ?? []) {
      const before = h.changes?.status?.before;
      const after = h.changes?.status?.after;
      if (before) seen.add(String(before));
      if (after) seen.add(String(after));
    }

    if (seen.has(targetStatus)) return true;

    if (targetIndex >= 0) {
      const currentIndex = PIPELINE_STAGES.indexOf(
        app.status as (typeof PIPELINE_STAGES)[number],
      );
      if (currentIndex >= targetIndex) return true;
    }

    return false;
  }).length;
}

export default function ApplicationFunnel({
  applications,
  loading,
}: {
  applications: Application[];
  loading: boolean;
}) {
  const pipelineCounts = PIPELINE_STAGES.map((stage) =>
    countEverReached(applications, stage),
  );

  const terminalCounts = TERMINAL_STAGES.map(
    (stage) => applications.filter((a) => a.status === stage).length,
  );

  const baseline = pipelineCounts[0] > 0 ? pipelineCounts[0] : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="flex flex-col gap-4">
            {PIPELINE_STAGES.map((stage, idx) => {
              const count = pipelineCounts[idx];
              const prev = idx === 0 ? count : pipelineCounts[idx - 1];
              const conversion =
                idx === 0
                  ? 100
                  : prev > 0
                    ? Math.round((count / prev) * 100)
                    : 0;
              const relative = Math.round((count / baseline) * 100);

              return (
                <div key={stage} className="flex flex-col items-center w-full">
                  <div className="text-center mb-2 px-2">
                    <span className="text-sm font-medium text-muted-foreground block">
                      {capitalize(stage)}
                    </span>
                  </div>
                  <div className="w-full max-w-2xl px-2">
                    <div className="mx-auto w-full bg-muted h-8 rounded-full overflow-hidden">
                      <div
                        className="h-8 bg-primary rounded-full mx-auto"
                        style={{ width: `${relative}%` }}
                        aria-hidden
                      />
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-sm font-semibold">{count}</div>
                    <div className="text-xs text-muted-foreground">
                      {conversion}% from previous stage
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="border-t pt-3 mt-2">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Drop-offs
              </div>
              <div className="flex gap-6">
                {TERMINAL_STAGES.map((stage, idx) => (
                  <div key={stage} className="text-center">
                    <div className="text-sm text-muted-foreground">
                      {capitalize(stage)}
                    </div>
                    <div className="text-lg font-semibold">
                      {terminalCounts[idx]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Total applications: {applications.length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
