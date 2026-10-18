import CompaniesTable from "@/components/companies/CompaniesTable";

export default function CompaniesPage() {
  return (
    <section className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Companies</h1>
        <p className="text-sm text-muted-foreground">
          Manage the companies linked to your job applications.
        </p>
      </div>
      <CompaniesTable />
    </section>
  );
}
