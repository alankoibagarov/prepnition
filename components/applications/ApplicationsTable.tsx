"use client";
import { Plus, RefreshCw, TableOfContents, Trash } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { useApplications } from "@/app/hooks/useApplications";
import CompanySelector, {
  type CompanyOption,
} from "@/components/applications/CompanySelector";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationStatus } from "@/generated/prisma/enums";
import type { Application } from "@/types/interview";
import { Badge } from "../ui/badge";
import DeleteInterviewModal from "./DeleteApplicationModal";
import JobAutocomplete, { type JobAutocompleteOption } from "./JobAutocomplete";

type JobOption = JobAutocompleteOption;

type NewJobForm = {
  title: string;
  description: string;
  location: string;
  salary: string;
};

const emptyNewJob: NewJobForm = {
  title: "",
  description: "",
  location: "",
  salary: "",
};

function getNextInterview(application: Application) {
  return (
    application.interviews
      ?.filter((interview) => {
        if (!interview.scheduledAt) return false;
        const timestamp = new Date(interview.scheduledAt).getTime();
        return timestamp >= Date.now();
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt ?? 0).getTime() -
          new Date(b.scheduledAt ?? 0).getTime(),
      )[0] ?? null
  );
}

export default function ApplicationsTable() {
  const { applications, loading, error, reload } = useApplications();
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [availableJobs, setAvailableJobs] = useState<JobOption[]>([]);
  const [jobSearch, setJobSearch] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobMode, setJobMode] = useState<"existing" | "new">("existing");
  const [newJob, setNewJob] = useState<NewJobForm>(emptyNewJob);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(
    null,
  );
  const [creatingApplication, setCreatingApplication] = useState(false);
  const [addError, setAddError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!addModalOpen || jobMode !== "existing") return;

    const controller = new AbortController();
    async function loadJobs() {
      setAddError("");
      setAvailableJobs([]);
      try {
        const response = await fetch(
          `/api/protected/jobs?search=${encodeURIComponent(jobSearch)}`,
          { signal: controller.signal },
        );
        const data: { jobs?: JobOption[]; error?: string } =
          await response.json();
        if (!response.ok || !data.jobs) {
          throw new Error(data.error ?? "Unable to load jobs");
        }
        setAvailableJobs(data.jobs);
        setSelectedJobId((current) =>
          data.jobs?.some((job) => job.id === current) ? current : "",
        );
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }
        setAddError(
          cause instanceof Error ? cause.message : "Unable to load jobs",
        );
        setAvailableJobs([]);
        setSelectedJobId("");
      } finally {
        if (!controller.signal.aborted) setJobsLoading(false);
      }
    }

    setJobsLoading(true);
    const timeout = setTimeout(loadJobs, 200);
    return () => {
      clearTimeout(timeout);
      controller.abort();
      setJobsLoading(false);
    };
  }, [addModalOpen, jobMode, jobSearch]);

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredApplications = applications.filter((application) => {
    const nextInterview = getNextInterview(application);
    const searchableValues = [
      application.job?.title ?? "—",
      application.company?.name ?? "—",
      application.createdAt
        ? new Date(application.createdAt).toLocaleString()
        : "—",
      nextInterview?.scheduledAt
        ? new Date(nextInterview.scheduledAt).toLocaleString()
        : "—",
      application.status,
    ];

    return searchableValues.some((value) =>
      value.toLocaleLowerCase().includes(normalizedSearch),
    );
  });

  async function openDeleteModal(id: string) {
    setSelectedForDelete(id);
    setDeleteModalOpen(true);
  }

  function openAddModal() {
    setJobMode("existing");
    setNewJob(emptyNewJob);
    setSelectedCompany(null);
    setJobSearch("");
    setAvailableJobs([]);
    setSelectedJobId("");
    setAddModalOpen(true);
    setAddError("");
  }

  async function createApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let requestBody:
      | { jobId: string }
      | { newJob: NewJobForm & { companyId: string } };
    if (jobMode === "existing") {
      if (!selectedJobId) return;
      requestBody = { jobId: selectedJobId };
    } else {
      if (!selectedCompany) {
        setAddError("Choose a company for this job");
        return;
      }
      requestBody = {
        newJob: { ...newJob, companyId: selectedCompany.id },
      };
    }

    setCreatingApplication(true);
    setAddError("");
    try {
      const response = await fetch("/api/protected/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Unable to create application");
      }
      setAddModalOpen(false);
      await reload();
    } catch (error) {
      setAddError(
        error instanceof Error ? error.message : "Unable to create application",
      );
    } finally {
      setCreatingApplication(false);
    }
  }

  async function deleteInterview(id: string) {
    try {
      const res = await fetch(`/api/protected/applications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Not found");
      setDeleteModalOpen(false);
      reload();
    } catch (e) {
      console.error(e);
      // fallback: close modal if error
      setDeleteModalOpen(false);
    }
  }

  function getApplicationStatus(applicationStatus: ApplicationStatus) {
    switch (applicationStatus) {
      case ApplicationStatus.ACTIVE:
        return "default";
      case ApplicationStatus.OFFER:
        return "success";
      case ApplicationStatus.REJECTED:
      case ApplicationStatus.WITHDRAWN:
        return "destructive";
      default:
        return "secondary";
    }
  }

  return (
    <Card>
      <CardContent>
        {error && (
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <span>{error}</span>
            <Button
              onClick={() => reload()}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        )}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            type="search"
            aria-label="Search applications"
            placeholder="Search applications..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:max-w-sm"
          />
          <div className="flex justify-end gap-4">
            <Button
              disabled={loading || jobsLoading}
              onClick={openAddModal}
              variant="outline"
            >
              <Plus />
              Add Application
            </Button>
            <Button
              onClick={() => reload()}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw />
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-2">#</th>
                <th className="pb-2">Title</th>
                <th className="pb-2">Company</th>
                <th className="pb-2">Created</th>
                <th className="pb-2">Next Interview</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application, index) => {
                const nextInterview = getNextInterview(application);
                return (
                  <tr key={application.id} className="border-t">
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">{application.job?.title ?? "—"}</td>
                    <td className="py-2">{application.company?.name ?? "—"}</td>
                    <td className="py-2">
                      {application.createdAt
                        ? new Date(application.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-2">
                      {nextInterview?.scheduledAt
                        ? new Date(nextInterview.scheduledAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-2">
                      <Badge variant={getApplicationStatus(application.status)}>
                        {application.status}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Link
                          className={buttonVariants({
                            size: "sm",
                            variant: "outline",
                          })}
                          href={`/app/applications/${application.id}`}
                          title="Details"
                        >
                          <TableOfContents />
                          Details
                        </Link>
                        <Button
                          className="cursor-pointer"
                          size="sm"
                          onClick={() => openDeleteModal(application.id)}
                          variant="outline"
                          title="Delete"
                        >
                          <Trash />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredApplications.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 text-center text-sm text-muted-foreground"
                  >
                    {applications.length === 0
                      ? 'No Applications found. Click "Add Application" to create one.'
                      : "No applications match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-application-title"
        >
          <button
            type="button"
            className="fixed inset-0 border-none bg-black/40 p-0"
            onClick={() => setAddModalOpen(false)}
            aria-label="Close dialog"
          />
          <Card className="z-50 mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader>
              <CardTitle id="add-application-title">Add application</CardTitle>
              <CardDescription>
                Choose an existing job or create a new job to start tracking an
                application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createApplication} className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={jobMode === "existing" ? "default" : "outline"}
                    onClick={() => setJobMode("existing")}
                  >
                    Existing job
                  </Button>
                  <Button
                    type="button"
                    variant={jobMode === "new" ? "default" : "outline"}
                    onClick={() => {
                      setAddError("");
                      setJobMode("new");
                    }}
                  >
                    New job
                  </Button>
                </div>
                {jobMode === "existing" ? (
                  <div className="space-y-2">
                    <JobAutocomplete
                      id="existing-job"
                      label="Search existing jobs"
                      placeholder="Search jobs..."
                      jobs={availableJobs}
                      value={
                        availableJobs.find((job) => job.id === selectedJobId) ??
                        null
                      }
                      inputValue={jobSearch}
                      loading={jobsLoading}
                      emptyMessage={
                        jobSearch.trim()
                          ? "No jobs match your search."
                          : "No jobs are available yet. Select New job to add one."
                      }
                      onInputValueChange={(value) => {
                        setJobSearch(value);
                        setSelectedJobId("");
                        setAddError("");
                      }}
                      onSelect={(job) => setSelectedJobId(job.id)}
                    />
                  </div>
                ) : (
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="new-application-company">
                        Company
                      </FieldLabel>
                      <CompanySelector
                        id="new-application-company"
                        value={selectedCompany}
                        onChange={setSelectedCompany}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="new-application-title">
                        Job title
                      </FieldLabel>
                      <Input
                        id="new-application-title"
                        required
                        value={newJob.title}
                        onChange={(event) =>
                          setNewJob({ ...newJob, title: event.target.value })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="new-application-description">
                        Description
                      </FieldLabel>
                      <Textarea
                        id="new-application-description"
                        required
                        value={newJob.description}
                        onChange={(event) =>
                          setNewJob({
                            ...newJob,
                            description: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="new-application-location">
                          Location
                        </FieldLabel>
                        <Input
                          id="new-application-location"
                          required
                          value={newJob.location}
                          onChange={(event) =>
                            setNewJob({
                              ...newJob,
                              location: event.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="new-application-salary">
                          Salary
                        </FieldLabel>
                        <Input
                          id="new-application-salary"
                          required
                          value={newJob.salary}
                          onChange={(event) =>
                            setNewJob({
                              ...newJob,
                              salary: event.target.value,
                            })
                          }
                        />
                      </Field>
                    </div>
                  </FieldGroup>
                )}
                {addError && (
                  <p className="text-sm text-destructive">{addError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      (jobMode === "existing" && jobsLoading) ||
                      creatingApplication ||
                      (jobMode === "existing" &&
                        (!selectedJobId || availableJobs.length === 0)) ||
                      (jobMode === "new" && !selectedCompany)
                    }
                  >
                    {creatingApplication ? "Adding..." : "Add application"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <DeleteInterviewModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        applicationId={selectedForDelete}
        onDelete={deleteInterview}
      />
    </Card>
  );
}
