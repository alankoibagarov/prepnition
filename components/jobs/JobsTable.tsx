"use client";

import { BriefcaseBusiness, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import CompanySelector, {
  type CompanyOption,
} from "@/components/applications/CompanySelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  company: CompanyOption;
  createdAt: string;
};

type JobForm = {
  title: string;
  description: string;
  location: string;
  salary: string;
};

type ModalState =
  | { type: "create" }
  | { type: "edit"; job: Job }
  | { type: "delete"; job: Job }
  | null;

const emptyForm: JobForm = {
  title: "",
  description: "",
  location: "",
  salary: "",
};

export default function JobsTable() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState<JobForm>(emptyForm);
  const [company, setCompany] = useState<CompanyOption | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/protected/jobs?search=${encodeURIComponent(search)}&refresh=${refresh}`,
          { signal: controller.signal },
        );
        const data: { jobs?: Job[]; error?: string } = await response.json();
        if (!response.ok || !data.jobs) {
          throw new Error(data.error ?? "Unable to load jobs");
        }
        setJobs(data.jobs);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }
        setError(
          cause instanceof Error ? cause.message : "Unable to load jobs",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, refresh]);

  function openCreate() {
    setForm(emptyForm);
    setCompany(null);
    setError("");
    setModal({ type: "create" });
  }

  function openEdit(job: Job) {
    setForm({
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary,
    });
    setCompany(job.company);
    setError("");
    setModal({ type: "edit", job });
  }

  async function saveJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!company) {
      setError("Choose a company for this job");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const isEditing = modal?.type === "edit";
      const response = await fetch(
        isEditing
          ? `/api/protected/jobs/${modal.job.id}`
          : "/api/protected/jobs",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, companyId: company.id }),
        },
      );
      const data: { job?: Job; error?: string } = await response.json();
      if (!response.ok || !data.job) {
        throw new Error(data.error ?? "Unable to save job");
      }
      setModal(null);
      setRefresh((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save job");
    } finally {
      setSaving(false);
    }
  }

  async function deleteJob(job: Job) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/protected/jobs/${job.id}`, {
        method: "DELETE",
      });
      const data: { error?: string } = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete job");
      }
      setModal(null);
      setRefresh((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete job");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              aria-label="Search jobs"
              className="sm:max-w-sm"
              placeholder="Search jobs..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button onClick={openCreate} variant="outline">
              <Plus aria-hidden />
              Add job
            </Button>
          </div>

          {error && !modal && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2">Job</th>
                  <th className="pb-2">Company</th>
                  <th className="pb-2">Location</th>
                  <th className="pb-2">Salary</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t">
                    <td className="py-2">
                      <p className="font-medium">{job.title}</p>
                      <p className="max-w-xs truncate text-muted-foreground">
                        {job.description}
                      </p>
                    </td>
                    <td className="py-2">{job.company.name}</td>
                    <td className="py-2">{job.location}</td>
                    <td className="py-2">{job.salary}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button
                          aria-label={`Edit ${job.title}`}
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(job)}
                        >
                          <Pencil aria-hidden />
                          Edit
                        </Button>
                        <Button
                          aria-label={`Delete ${job.title}`}
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setError("");
                            setModal({ type: "delete", job });
                          }}
                        >
                          <Trash2 aria-hidden />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && jobs.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-sm text-muted-foreground"
                    >
                      <BriefcaseBusiness className="mx-auto mb-2 size-6 text-muted-foreground" />
                      <p className="font-medium">No jobs found</p>
                      <p className="mt-1 text-muted-foreground">
                        Add a job to keep your opportunities organized.
                      </p>
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-sm text-muted-foreground"
                    >
                      Loading jobs...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="fixed inset-0 bg-black/40"
            onClick={() => !saving && setModal(null)}
          />
          <Card
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-modal-title"
            className="z-50 my-auto w-full max-w-xl"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle id="job-modal-title">
                  {modal.type === "create"
                    ? "Add job"
                    : modal.type === "edit"
                      ? "Edit job"
                      : "Delete job"}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {modal.type === "delete"
                    ? `Delete “${modal.job.title}”? Its applications will be kept, and this job will no longer appear in active job lists.`
                    : "Enter the job details and choose its company."}
                </p>
              </div>
              <Button
                aria-label="Close dialog"
                disabled={saving}
                size="icon"
                variant="ghost"
                onClick={() => setModal(null)}
              >
                <X aria-hidden />
              </Button>
            </CardHeader>
            {modal.type === "delete" ? (
              <>
                {error && (
                  <p role="alert" className="px-6 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <CardContent className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    disabled={saving}
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={saving}
                    onClick={() => deleteJob(modal.job)}
                  >
                    {saving ? "Deleting..." : "Delete job"}
                  </Button>
                </CardContent>
              </>
            ) : (
              <form onSubmit={saveJob}>
                <CardContent className="space-y-4">
                  <label
                    htmlFor="job-title"
                    className="block space-y-1.5 text-sm font-medium"
                  >
                    Title
                    <Input
                      id="job-title"
                      required
                      autoFocus
                      value={form.title}
                      onChange={(event) =>
                        setForm({ ...form, title: event.target.value })
                      }
                    />
                  </label>
                  <label
                    htmlFor="job-description"
                    className="block space-y-1.5 text-sm font-medium"
                  >
                    Description
                    <Textarea
                      id="job-description"
                      required
                      rows={3}
                      value={form.description}
                      onChange={(event) =>
                        setForm({ ...form, description: event.target.value })
                      }
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label
                      htmlFor="job-location"
                      className="block space-y-1.5 text-sm font-medium"
                    >
                      Location
                      <Input
                        id="job-location"
                        required
                        value={form.location}
                        onChange={(event) =>
                          setForm({ ...form, location: event.target.value })
                        }
                      />
                    </label>
                    <label
                      htmlFor="job-salary"
                      className="block space-y-1.5 text-sm font-medium"
                    >
                      Salary
                      <Input
                        id="job-salary"
                        required
                        value={form.salary}
                        onChange={(event) =>
                          setForm({ ...form, salary: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <div className="space-y-1.5 text-sm font-medium">
                    <p>Company</p>
                    <CompanySelector value={company} onChange={setCompany} />
                  </div>
                  {error && (
                    <p role="alert" className="text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={saving}
                      onClick={() => setModal(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving
                        ? "Saving..."
                        : modal.type === "edit"
                          ? "Save changes"
                          : "Add job"}
                    </Button>
                  </div>
                </CardContent>
              </form>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
