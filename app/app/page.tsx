"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { filterApplicationsByDateRange } from "@/app/helpers/dashboard";
import { useApplications } from "@/app/hooks/useApplications";
import ApplicationFunnel from "@/components/applications/ApplicationFunnel";
import ApplicationStageAnalytics from "@/components/applications/ApplicationStageAnalytics";
import MainPageFilters from "@/components/mainPage/MainPageFilters";
import RecentApplications from "@/components/mainPage/RecentApplications";
import StatusSummaryCards from "@/components/mainPage/StatusSummaryCards";
import UpcomingInterviews from "@/components/mainPage/UpcomingInterviews";

export default function AppHome() {
  const { applications, loading } = useApplications();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filteredApplications = useMemo(
    () => filterApplicationsByDateRange(applications, dateRange),
    [applications, dateRange],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <MainPageFilters dateRange={dateRange} onDateRangeChange={setDateRange} />

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
