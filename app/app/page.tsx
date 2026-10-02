"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { filterApplications } from "@/app/helpers/dashboard";
import { useApplications } from "@/app/hooks/useApplications";
import ApplicationFunnel from "@/components/applications/ApplicationFunnel";
import ApplicationStageAnalytics from "@/components/applications/ApplicationStageAnalytics";
import MainPageFilters from "@/components/mainPage/MainPageFilters";
import RecentApplications from "@/components/mainPage/RecentApplications";
import StatusSummaryCards from "@/components/mainPage/StatusSummaryCards";
import UpcomingInterviews from "@/components/mainPage/UpcomingInterviews";
import type { ApplicationStatus } from "@/generated/prisma/enums";

export default function AppHome() {
  const { applications, loading } = useApplications();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [status, setStatus] = useState<ApplicationStatus | undefined>(
    undefined,
  );
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);

  const filteredApplications = useMemo(
    () => filterApplications(applications, dateRange, status, companyId),
    [applications, dateRange, status, companyId],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <MainPageFilters
        applications={applications}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        status={status}
        onStatusChange={setStatus}
        companyId={companyId}
        onCompanyChange={setCompanyId}
      />

      <StatusSummaryCards
        applications={filteredApplications}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationFunnel
          applications={filteredApplications}
          loading={loading}
        />
        <ApplicationStageAnalytics
          applications={filteredApplications}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingInterviews
          applications={filteredApplications}
          loading={loading}
          dateRange={dateRange}
        />
        <RecentApplications
          applications={filteredApplications}
          loading={loading}
        />
      </div>
    </div>
  );
}
