import JobsTable from "@/components/jobs/JobsTable";

export default function JobsPage() {
  return (
    <section className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Jobs</h1>
      <JobsTable />
    </section>
  );
}
