import type { DateRange } from "react-day-picker";
import type { ApplicationStatus } from "@/generated/prisma/enums";
import type { Application, ApplicationInterview } from "@/types/interview";

export function isWithinDateRange(
  dateStr: string | null | undefined,
  range: DateRange | undefined,
): boolean {
  if (!range?.from) return true;
  if (!dateStr) return false;

  const date = new Date(dateStr);
  const from = new Date(range.from);
  from.setHours(0, 0, 0, 0);

  if (date < from) return false;

  if (range.to) {
    const to = new Date(range.to);
    to.setHours(23, 59, 59, 999);
    if (date > to) return false;
  }

  return true;
}

export function filterApplications(
  applications: Application[],
  range: DateRange | undefined,
  status?: ApplicationStatus,
  companyId?: string,
): Application[] {
  return applications.filter(
    (app) =>
      isWithinDateRange(app.createdAt, range) &&
      (!status || app.status === status) &&
      (!companyId || app.company.id === companyId),
  );
}

export type UpcomingInterview = ApplicationInterview & {
  applicationId: string;
  companyName: string;
  jobTitle: string;
};

export function getUpcomingInterviews(
  applications: Application[],
  range?: DateRange | undefined,
): UpcomingInterview[] {
  const now = Date.now();
  const upcoming: UpcomingInterview[] = [];

  for (const app of applications) {
    for (const interview of app.interviews ?? []) {
      if (!interview.scheduledAt) continue;
      if (interview.status !== "SCHEDULED") continue;
      if (new Date(interview.scheduledAt).getTime() < now) continue;
      if (range?.from && !isWithinDateRange(interview.scheduledAt, range))
        continue;

      upcoming.push({
        ...interview,
        applicationId: app.id,
        companyName: app.company?.name ?? "Unknown",
        jobTitle: app.job?.title ?? "—",
      });
    }
  }

  return upcoming.sort(
    (a, b) =>
      new Date(a.scheduledAt ?? 0).getTime() -
      new Date(b.scheduledAt ?? 0).getTime(),
  );
}

export function flattenInterviews(
  applications: Application[],
): (ApplicationInterview & { applicationId: string; companyName: string })[] {
  const result: (ApplicationInterview & {
    applicationId: string;
    companyName: string;
  })[] = [];

  for (const app of applications) {
    for (const interview of app.interviews ?? []) {
      result.push({
        ...interview,
        applicationId: app.id,
        companyName: app.company?.name ?? "Unknown",
      });
    }
  }

  return result;
}
