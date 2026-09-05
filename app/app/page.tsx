"use client";
// import InterviewFunnel from "@/components/interviews/InterviewFunnel";
// import InterviewStagesAnalytics from "@/components/interviews/InterviewStagesAnalytics";
import MainPageFilters from "@/components/mainPage/MainPageFilters";

export default function AppHome() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <MainPageFilters />
      <div className="grid grid-cols-2 gap-6 bg-background">
        {/* <InterviewFunnel />
        <InterviewStagesAnalytics /> */}
      </div>
    </div>
  );
}
