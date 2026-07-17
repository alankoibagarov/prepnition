import InterviewFunnel from "@/components/interviews/InterviewFunnel";
import MainPageFilters from "@/components/mainPage/MainPageFilters";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AppHome() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <MainPageFilters />
      <div className="grid grid-cols-2 gap-6 bg-background">
        <InterviewFunnel />

        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40">
          <CardHeader>
            <CardTitle className="text-emerald-900 dark:text-emerald-100">
              Admin area
            </CardTitle>
            <CardDescription className="text-emerald-800 dark:text-emerald-200">
              This section is only visible to users with the admin role.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
