import ApplicationsTable from "@/components/applications/ApplicationsTable";

export default function ApplicationsPage() {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Applications</h1>
      <ApplicationsTable />
    </section>
  );
}
