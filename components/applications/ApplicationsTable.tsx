"use client";
import { Plus, RefreshCw, TableOfContents, Trash } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useApplications } from "@/app/hooks/useApplications";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApplicationStatus } from "@/generated/prisma/enums";
import type { Application } from "@/types/interview";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import CompanySelector, { type CompanyOption } from "./CompanySelector";
import DeleteInterviewModal from "./DeleteApplicationModal";

type JobOption = {
  id: string;
  title: string;
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
  const { applications, loading, reload } = useApplications();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [availableJobs, setAvailableJobs] = useState<JobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(
    null,
  );
  const [jobsLoading, setJobsLoading] = useState(false);
  const [creatingApplication, setCreatingApplication] = useState(false);
  const [addError, setAddError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string | null>(
    null,
  );

  async function openDeleteModal(id: string) {
    setSelectedForDelete(id);
    setDeleteModalOpen(true);
  }

  async function openAddModal() {
    setAddModalOpen(true);
    setJobsLoading(true);
    setAddError("");
    try {
      const response = await fetch("/api/protected/jobs");
      if (!response.ok) throw new Error("Unable to load jobs");
      const data = await response.json();
      const jobs = data.jobs as JobOption[];
      setAvailableJobs(jobs);
      setSelectedJobId((current) =>
        jobs.some((job) => job.id === current) ? current : (jobs[0]?.id ?? ""),
      );
    } catch (error) {
      setAddError(
        error instanceof Error ? error.message : "Unable to load jobs",
      );
    } finally {
      setJobsLoading(false);
    }
  }

  async function createApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedJobId || !selectedCompany) return;

    setCreatingApplication(true);
    setAddError("");
    try {
      const response = await fetch("/api/protected/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJobId,
          companyId: selectedCompany.id,
        }),
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
        <div className="mb-4 flex gap-4">
          <Button
            disabled={loading || jobsLoading}
            onClick={openAddModal}
            variant="outline"
          >
            <Plus />
            Add Application
          </Button>
          <Button onClick={() => reload()} disabled={loading} variant="outline">
            <RefreshCw />
            Refresh
          </Button>
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
              {applications.map((application, index) => {
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
              {applications.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 text-center text-sm text-muted-foreground"
                  >
                    No Applications found. Click "Add Application" to create
                    one.
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
          <Card className="z-50 mx-4 w-full max-w-lg">
            <CardHeader>
              <CardTitle id="add-application-title">Add application</CardTitle>
              <CardDescription>
                Choose a company and job to start tracking an application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createApplication} className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="application-company"
                  >
                    Company
                  </label>
                  <CompanySelector
                    id="application-company"
                    value={selectedCompany}
                    onChange={setSelectedCompany}
                  />
                </div>
                {jobsLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading jobs...
                  </p>
                ) : availableJobs.length > 0 ? (
                  <Select
                    value={selectedJobId}
                    onValueChange={(value) => setSelectedJobId(value ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      {availableJobs.find((job) => job.id === selectedJobId)
                        ?.title ?? "Choose a job"}
                    </SelectTrigger>
                    <SelectContent>
                      {availableJobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No jobs are available yet.
                  </p>
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
                      jobsLoading ||
                      creatingApplication ||
                      !selectedJobId ||
                      !selectedCompany ||
                      availableJobs.length === 0
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
