"use client";

import {
  Building2,
  ExternalLink,
  Pencil,
  Plus,
  RefreshCw,
  Trash,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { CompanyOption } from "@/components/applications/CompanySelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Company = CompanyOption & {
  _count: { jobs: number };
};

type CompanyModalProps = {
  company: Company | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

function CompanyModal({ company, onClose, onSaved }: CompanyModalProps) {
  const [name, setName] = useState(company?.name ?? "");
  const [url, setUrl] = useState(company?.url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        company
          ? `/api/protected/companies/${company.id}`
          : "/api/protected/companies",
        {
          method: company ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, url }),
        },
      );
      const data: { error?: string } = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save company");
      }
      await onSaved();
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save company",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="fixed inset-0 border-none bg-black/40 p-0"
        onClick={onClose}
        disabled={saving}
        aria-label="Close company form"
      />
      <Card
        className="z-50 w-full max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-modal-title"
      >
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 id="company-modal-title" className="text-lg font-semibold">
              {company ? "Edit company" : "Add company"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter the company name and website.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <label
              htmlFor="company-name"
              className="block space-y-1.5 text-sm font-medium"
            >
              Company name
              <Input
                id="company-name"
                autoFocus
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Company name"
              />
            </label>
            <label
              htmlFor="company-url"
              className="block space-y-1.5 text-sm font-medium"
            >
              Website
              <Input
                id="company-url"
                required
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
              />
            </label>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : company ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteCompanyModal({
  company,
  onClose,
  onDeleted,
}: {
  company: Company;
  onClose: () => void;
  onDeleted: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function deleteCompany() {
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/protected/companies/${company.id}`, {
        method: "DELETE",
      });
      const data: { error?: string } = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete company");
      }
      await onDeleted();
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to delete company",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="fixed inset-0 border-none bg-black/40 p-0"
        onClick={onClose}
        disabled={deleting}
        aria-label="Close delete confirmation"
      />
      <Card
        className="z-50 w-full max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-company-title"
      >
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 id="delete-company-title" className="text-lg font-semibold">
              Delete company
            </h2>
            <p className="text-sm text-muted-foreground">
              Delete {company.name}? Existing jobs and applications will be
              kept, but this company will no longer be available for new jobs.
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={deleteCompany}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete company"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CompaniesTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalCompany, setModalCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const reload = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/protected/companies?search=${encodeURIComponent(search)}`,
          { signal },
        );
        const data: { companies?: Company[]; error?: string } =
          await response.json();
        if (!response.ok || !data.companies) {
          throw new Error(data.error ?? "Unable to load companies");
        }
        setCompanies(data.companies);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError")
          return;
        setError(
          cause instanceof Error ? cause.message : "Unable to load companies",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => void reload(controller.signal), 200);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [reload]);

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              type="search"
              aria-label="Search companies"
              placeholder="Search companies..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="sm:max-w-xs"
            />
            <div className="flex gap-2">
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus />
                Add company
              </Button>
              <Button
                variant="outline"
                onClick={() => void reload()}
                disabled={loading}
                aria-label="Refresh companies"
              >
                <RefreshCw />
                Refresh
              </Button>
            </div>
          </div>
          {error && (
            <div
              className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <span>{error}</span>
              <Button
                onClick={() => void reload()}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Company</th>
                  <th className="pb-2 font-medium">Website</th>
                  <th className="pb-2 font-medium">Jobs</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-t">
                    <td className="py-3 font-medium">
                      <span className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground" />
                        {company.name}
                      </span>
                    </td>
                    <td className="py-3">
                      <a
                        className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                        href={company.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="max-w-56 truncate">{company.url}</span>
                        <ExternalLink className="size-3.5 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3">{company._count.jobs}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setModalCompany(company)}
                        >
                          <Pencil />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setCompanyToDelete(company)}
                        >
                          <Trash />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && companies.length === 0 && !error && (
                  <tr>
                    <td
                      colSpan={4}
                      className="border-t py-10 text-center text-muted-foreground"
                    >
                      {search
                        ? "No companies match your search."
                        : "No companies yet. Add one to get started."}
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="border-t py-10 text-center text-muted-foreground"
                    >
                      Loading companies...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {createModalOpen && (
        <CompanyModal
          company={null}
          onClose={() => setCreateModalOpen(false)}
          onSaved={reload}
        />
      )}
      {modalCompany && (
        <CompanyModal
          key={modalCompany.id}
          company={modalCompany}
          onClose={() => setModalCompany(null)}
          onSaved={reload}
        />
      )}
      {companyToDelete && (
        <DeleteCompanyModal
          company={companyToDelete}
          onClose={() => setCompanyToDelete(null)}
          onDeleted={reload}
        />
      )}
    </>
  );
}
