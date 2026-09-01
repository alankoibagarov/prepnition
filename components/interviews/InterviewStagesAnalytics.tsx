"use client";

import { useEffect, useState } from "react";
import { capitalize } from "@/app/helpers/string";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Interview } from "@/types/interview";

const MAIN_STAGES = [
  "APPLICATION",
  "SCREENING",
  "TECHNICAL",
  "MANAGERIAL",
  "OFFER",
] as const;

type StageMetrics = {
  stage: string;
  total: number;
  passedToNext: number;
  rejectedOrDropped: number;
  conversionRate: number;
};

type CompanyStageMetrics = {
  [stage: string]: {
    count: number;
    successCount: number;
    successRate: number;
  };
};

type CompanyMetrics = {
  company: string;
  totalInterviews: number;
  successCount: number;
  successRate: number;
  stageMetrics: CompanyStageMetrics;
};

type StageTimingMetrics = {
  stage: string;
  avgDaysInStage: number;
  minDaysInStage: number;
  maxDaysInStage: number;
  interviewsAnalyzed: number;
};

export default function InterviewStagesAnalytics() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/protected/interviews");
        const data = await res.json();
        if (mounted) setInterviews(data.interviews ?? []);
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

  const calculateStageMetrics = (): StageMetrics[] => {
    const stageMap: Record<
      string,
      { total: number; passedToNext: number; rejectedOrDropped: number }
    > = {};

    MAIN_STAGES.forEach((s) => {
      stageMap[s] = { total: 0, passedToNext: 0, rejectedOrDropped: 0 };
    });

    interviews.forEach((interview) => {
      const history = interview.history ?? [];
      const sorted = [...history].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      const seenStages = new Set<string>();
      sorted.forEach((h) => {
        if (h?.changes?.status?.after) {
          seenStages.add(String(h.changes.status.after));
        }
      });
      if (
        MAIN_STAGES.includes(interview.status as (typeof MAIN_STAGES)[number])
      ) {
        seenStages.add(interview.status);
      }

      seenStages.forEach((stage) => {
        if (stageMap[stage]) {
          stageMap[stage].total += 1;
        }
      });

      const currentStageIndex = MAIN_STAGES.indexOf(
        interview.status as (typeof MAIN_STAGES)[number],
      );
      if (currentStageIndex >= 0) {
        stageMap[interview.status].passedToNext += 1;
      } else if (
        interview.status === "REJECTED" ||
        interview.status === "WITHDRAWN"
      ) {
        const lastMainStage = MAIN_STAGES.find(
          (s) =>
            sorted.some(
              (h) =>
                (h.changes.status as { after?: unknown } | undefined)?.after ===
                s,
            ) || interview.status === s,
        );
        if (lastMainStage) {
          stageMap[lastMainStage].rejectedOrDropped += 1;
        }
      }
    });

    return MAIN_STAGES.map((stage) => {
      const { total, passedToNext } = stageMap[stage];
      const rejectedOrDropped = stageMap[stage].rejectedOrDropped;
      const conversionRate =
        total > 0 ? Math.round((passedToNext / total) * 100) : 0;

      return {
        stage,
        total,
        passedToNext,
        rejectedOrDropped,
        conversionRate,
      };
    });
  };

  const calculateCompanyMetrics = (): CompanyMetrics[] => {
    const companyMap: Record<string, CompanyMetrics> = {};

    interviews.forEach((interview) => {
      const company = interview.company || "Unknown";
      if (!companyMap[company]) {
        companyMap[company] = {
          company,
          totalInterviews: 0,
          successCount: 0,
          successRate: 0,
          stageMetrics: {},
        };
      }

      companyMap[company].totalInterviews += 1;

      if (interview.status === "OFFER") {
        companyMap[company].successCount += 1;
      }

      if (!companyMap[company].stageMetrics[interview.status]) {
        companyMap[company].stageMetrics[interview.status] = {
          count: 0,
          successCount: 0,
          successRate: 0,
        };
      }

      companyMap[company].stageMetrics[interview.status].count += 1;
      if (interview.status === "OFFER") {
        companyMap[company].stageMetrics[interview.status].successCount += 1;
      }
    });

    Object.values(companyMap).forEach((company) => {
      company.successRate =
        company.totalInterviews > 0
          ? Math.round((company.successCount / company.totalInterviews) * 100)
          : 0;
    });

    return Object.values(companyMap).sort(
      (a, b) => b.totalInterviews - a.totalInterviews,
    );
  };

  const calculateStageTimingMetrics = (): StageTimingMetrics[] => {
    const timingMap: Record<
      string,
      { durations: number[]; interviewsAnalyzed: number }
    > = {};

    MAIN_STAGES.forEach((s) => {
      timingMap[s] = { durations: [], interviewsAnalyzed: 0 };
    });

    interviews.forEach((interview) => {
      const history = interview.history ?? [];
      const sorted = [...history].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      const stageEnteredAt: Record<string, Date> = {};

      sorted.forEach((h) => {
        if (h?.changes?.status?.after) {
          const stage = String(h.changes.status.after);
          stageEnteredAt[stage] = new Date(h.createdAt);
        }
      });

      MAIN_STAGES.forEach((stage) => {
        if (stageEnteredAt[stage]) {
          const enterDate = stageEnteredAt[stage];
          const nextStageIndex = MAIN_STAGES.indexOf(stage) + 1;
          const nextStage =
            nextStageIndex < MAIN_STAGES.length
              ? MAIN_STAGES[nextStageIndex]
              : null;

          let exitDate: Date | null = null;

          if (nextStage && stageEnteredAt[nextStage]) {
            exitDate = stageEnteredAt[nextStage];
          } else if (interview.status === stage) {
            exitDate = new Date(interview.updatedAt);
          }

          if (exitDate) {
            const durationMs = exitDate.getTime() - enterDate.getTime();
            const durationDays = durationMs / (1000 * 60 * 60 * 24);
            timingMap[stage].durations.push(durationDays);
            timingMap[stage].interviewsAnalyzed += 1;
          }
        }
      });
    });

    return MAIN_STAGES.map((stage) => {
      const { durations, interviewsAnalyzed } = timingMap[stage];
      if (durations.length === 0) {
        return {
          stage,
          avgDaysInStage: 0,
          minDaysInStage: 0,
          maxDaysInStage: 0,
          interviewsAnalyzed: 0,
        };
      }

      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const min = Math.min(...durations);
      const max = Math.max(...durations);

      return {
        stage,
        avgDaysInStage: Math.round(avg * 10) / 10,
        minDaysInStage: Math.round(min * 10) / 10,
        maxDaysInStage: Math.round(max * 10) / 10,
        interviewsAnalyzed,
      };
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div>Loading analytics…</div>
        </CardContent>
      </Card>
    );
  }

  const stageMetrics = calculateStageMetrics();
  const companyMetrics = calculateCompanyMetrics();
  const timingMetrics = calculateStageTimingMetrics();

  const worstStage = stageMetrics.reduce((prev, current) =>
    current.conversionRate < prev.conversionRate ? current : prev,
  );
  const bestStage = stageMetrics.reduce((prev, current) =>
    current.conversionRate > prev.conversionRate ? current : prev,
  );

  const topCompanies = companyMetrics.slice(0, 3);
  const bestPerformingCompany = companyMetrics.reduce(
    (prev, current) =>
      current.successRate > prev.successRate ? current : prev,
    companyMetrics[0] || { company: "N/A", successRate: 0 },
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {/* Stage Performance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stage Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Best Stage
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {capitalize(bestStage.stage)}
              </div>
              <div className="text-sm text-muted-foreground">
                {bestStage.conversionRate}% conversion rate
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="text-sm font-medium text-muted-foreground">
                Worst Stage
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {capitalize(worstStage.stage)}
              </div>
              <div className="text-sm text-muted-foreground">
                {worstStage.conversionRate}% conversion rate
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stage Conversion Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversion Rates by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stageMetrics.map((metric) => (
                <div
                  key={metric.stage}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm font-medium">
                    {capitalize(metric.stage)}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted h-2 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${metric.conversionRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold min-w-12 text-right">
                      {metric.conversionRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Average Time per Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Time per Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {timingMetrics.map((metric) => (
                <div key={metric.stage} className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    {capitalize(metric.stage)}
                  </div>
                  <div className="text-lg font-bold">
                    {metric.avgDaysInStage.toFixed(1)} days
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metric.interviewsAnalyzed} analyzed
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCompanies.length > 0 ? (
              topCompanies.map((company) => (
                <div key={company.company} className="space-y-1">
                  <div className="text-sm font-medium">{company.company}</div>
                  <div className="text-xs text-muted-foreground">
                    {company.totalInterviews} interviews • {company.successRate}
                    % success rate
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Best Performing Company */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Best Performing Company</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-2xl font-bold">
              {bestPerformingCompany.company}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {bestPerformingCompany.totalInterviews} interviews
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="text-sm font-medium text-muted-foreground">
              Success Rate
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {bestPerformingCompany.successRate}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Success Breakdown */}
      {companyMetrics.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">All Companies Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {companyMetrics.map((company) => (
                <div
                  key={company.company}
                  className="space-y-1 p-3 bg-muted rounded"
                >
                  <div className="text-sm font-medium truncate">
                    {company.company}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {company.totalInterviews} interviews
                  </div>
                  <div className="text-lg font-bold">
                    {company.successCount}/{company.totalInterviews}
                  </div>
                  <div className="text-xs font-semibold text-primary">
                    {company.successRate}% success
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
