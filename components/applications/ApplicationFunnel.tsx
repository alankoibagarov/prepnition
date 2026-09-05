"use client";

import { useEffect, useState } from "react";
import { capitalize } from "@/app/helpers/string";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Interview } from "@/types/interview";

const STAGES = [
  "APPLICATION",
  "SCREENING",
  "TECHNICAL",
  "MANAGERIAL",
  "OFFER",
] as const;

export default function ApplicationFunnel() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/protected/applications");
        const data = await res.json();
        if (mounted) setInterviews(data.applications ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const totals = STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = 0;
    return acc;
  }, {});

  interviews.forEach((i) => {
    if (totals[i.status] !== undefined) totals[i.status]++;
  });

  // Compute transition counts using history: for each interview, reconstruct statuses seen over time
  const everSeenCounts: number[] = STAGES.map(() => 0);

  interviews.forEach((i) => {
    const history = i.history ?? [];
    const sorted = [...history].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const seen: string[] = [];
    const seenSet = new Set<string>();

    for (const h of sorted) {
      if (h?.changes?.status) {
        const before = h.changes.status.before as string | undefined;
        const after = h.changes.status.after as string | undefined;
        if (before) {
          seenSet.add(before);
          if (!seen.length || seen[seen.length - 1] !== before)
            seen.push(before);
        }
        if (after) {
          seenSet.add(after);
          if (!seen.length || seen[seen.length - 1] !== after) seen.push(after);
        }
      }
    }

    // include current status if not present
    seenSet.add(i.status as string);
    if (!seen.length || seen[seen.length - 1] !== i.status)
      seen.push(i.status as string);

    // mark ever-seen
    for (let idx = 0; idx < STAGES.length; idx++) {
      if (seenSet.has(STAGES[idx] as string)) everSeenCounts[idx] += 1;
    }
  });

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Interview funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="flex flex-col gap-4">
            {STAGES.map((stage, idx) => {
              const count = everSeenCounts[idx] ?? 0;
              const prev = idx === 0 ? count : everSeenCounts[idx - 1];
              const conversion =
                idx === 0
                  ? 100
                  : prev > 0
                    ? Math.round((count / prev) * 100)
                    : 0;
              const baseline = everSeenCounts[0] > 0 ? everSeenCounts[0] : 1;
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
                    <div className="text-sm font-semibold">
                      {everSeenCounts[idx]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {conversion}% from previous stage
                    </div>
                  </div>
                </div>
              );
            })}

            <p className="text-sm text-muted-foreground">
              Total interviews: {interviews.length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
