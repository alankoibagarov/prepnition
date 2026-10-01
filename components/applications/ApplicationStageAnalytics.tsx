"use client";

import { InterviewType } from "@/generated/prisma/enums";
import { flattenInterviews } from "@/app/helpers/dashboard";
import { capitalize } from "@/app/helpers/string";
import type { Application } from "@/types/interview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const INTERVIEW_TYPES = Object.values(InterviewType);

type TypeMetrics = {
  type: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
};

function calculateTypeMetrics(
  applications: Application[],
): TypeMetrics[] {
  const interviews = flattenInterviews(applications);
  const map: Record<string, { total: number; passed: number; failed: number }> =
    {};

  for (const type of INTERVIEW_TYPES) {
    map[type] = { total: 0, passed: 0, failed: 0 };
  }

  for (const interview of interviews) {
    const bucket = map[interview.type];
    if (!bucket) continue;
    bucket.total += 1;
    if (interview.status === "PASSED") bucket.passed += 1;
    if (interview.status === "FAILED") bucket.failed += 1;
  }

  return INTERVIEW_TYPES.map((type) => {
    const { total, passed, failed } = map[type];
    const decided = passed + failed;
    const passRate = decided > 0 ? Math.round((passed / decided) * 100) : 0;
    return { type, total, passed, failed, passRate };
  }).filter((m) => m.total > 0);
}

function calculateCompanyMetrics(applications: Application[]) {
  const companyMap: Record<
    string,
    { total: number; offers: number; interviews: number }
  > = {};

  for (const app of applications) {
    const name = app.company?.name ?? "Unknown";
    if (!companyMap[name]) {
      companyMap[name] = { total: 0, offers: 0, interviews: 0 };
    }
    companyMap[name].total += 1;
    if (app.status === "OFFER") companyMap[name].offers += 1;
    companyMap[name].interviews += app.interviews?.length ?? 0;
  }

  return Object.entries(companyMap)
    .map(([company, stats]) => ({
      company,
      ...stats,
      offerRate:
        stats.total > 0 ? Math.round((stats.offers / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export default function ApplicationStageAnalytics({
  applications,
  loading,
}: {
  applications: Application[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div>Loading analytics…</div>
        </CardContent>
      </Card>
    );
  }

  const typeMetrics = calculateTypeMetrics(applications);
  const companyMetrics = calculateCompanyMetrics(applications);
  const topCompanies = companyMetrics.slice(0, 3);

  const bestType = typeMetrics.reduce(
    (prev, current) =>
      current.passRate > prev.passRate ? current : prev,
    typeMetrics[0] ?? { type: "N/A", passRate: 0 },
  );

  const worstType = typeMetrics.reduce(
    (prev, current) =>
      current.passRate < prev.passRate ? current : prev,
    typeMetrics[0] ?? { type: "N/A", passRate: 0 },
  );

  const bestCompany = companyMetrics.reduce(
    (prev, current) =>
      current.offerRate > prev.offerRate ? current : prev,
    companyMetrics[0] ?? { company: "N/A", offerRate: 0, total: 0 },
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interview Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {typeMetrics.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No interview data yet.
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Best Type
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {capitalize(bestType.type)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {bestType.passRate}% pass rate
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="text-sm font-medium text-muted-foreground">
                  Worst Type
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {capitalize(worstType.type)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {worstType.passRate}% pass rate
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {typeMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pass Rate by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {typeMetrics.map((metric) => (
                <div
                  key={metric.type}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm font-medium">
                    {capitalize(metric.type)}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted h-2 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${metric.passRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold min-w-12 text-right">
                      {metric.passRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Companies</CardTitle>
        </CardHeader>
        <CardContent>
          {topCompanies.length === 0 ? (
            <div className="text-sm text-muted-foreground">No data</div>
          ) : (
            <div className="space-y-3">
              {topCompanies.map((company) => (
                <div key={company.company} className="space-y-1">
                  <div className="text-sm font-medium">{company.company}</div>
                  <div className="text-xs text-muted-foreground">
                    {company.total} applications · {company.interviews}{" "}
                    interviews · {company.offerRate}% offer rate
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {companyMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Best Performing Company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold">{bestCompany.company}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {bestCompany.total} applications
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground">
                Offer Rate
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {bestCompany.offerRate}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
