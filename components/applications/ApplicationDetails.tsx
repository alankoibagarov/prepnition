"use client";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Interview = {
  id: string;
  type: string;
  title: string;
  scheduledAt: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
type Application = {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    salary: string;
  };
  company: { id: string; name: string; url: string };
  interviews: Interview[];
  histories: {
    id: string;
    action: string;
    changes: Record<string, unknown>;
    createdAt: string;
  }[];
};
type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  company: { id: string; name: string; url: string };
};

const statuses = ["DRAFT", "ACTIVE", "REJECTED", "WITHDRAWN", "OFFER"];
const interviewTypes = ["TECHNICAL", "MANAGERIAL", "HR", "BIAS", "OTHER"];
const interviewStatuses = [
  "SCHEDULED",
  "PASSED",
  "FAILED",
  "CANCELLED",
  "MISSED",
];
const dateInput = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";
const displayDate = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "Not set";
const label = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ApplicationDetails({ id }: { id: string }) {
  const [application, setApplication] = useState<Application | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [interviewForm, setInterviewForm] = useState<Record<string, string>>(
    {},
  );
  const [editingInterview, setEditingInterview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobSearch, setJobSearch] = useState("");
  const [jobMode, setJobMode] = useState<"existing" | "new">("existing");
  const [selectedJobId, setSelectedJobId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/protected/applications/${id}`);
      if (!response.ok)
        throw new Error(
          response.status === 404
            ? "Application not found"
            : "Unable to load application",
        );
      const data = await response.json();
      setApplication(data.application);
      const item = data.application as Application;
      setForm({
        status: item.status,
        notes: item.notes ?? "",
        title: item.job.title,
        description: item.job.description,
        location: item.job.location,
        salary: item.job.salary,
        companyName: item.company.name,
        companyUrl: item.company.url,
      });
      setSelectedJobId(item.job.id);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load application",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (jobMode !== "existing") return;
    const controller = new AbortController();
    fetch(`/api/protected/jobs?search=${encodeURIComponent(jobSearch)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load jobs");
        const data = await response.json();
        setJobs(data.jobs ?? []);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError")
          return;
        setError(
          cause instanceof Error ? cause.message : "Unable to load jobs",
        );
      });
    return () => controller.abort();
  }, [jobMode, jobSearch]);

  function setValue(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }
  async function saveApplication(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch(`/api/protected/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.status,
        notes: form.notes || null,
        ...(jobMode === "existing"
          ? { jobId: selectedJobId }
          : {
              newJob: {
                title: form.title,
                description: form.description,
                location: form.location,
                salary: form.salary,
                companyName: form.companyName,
                companyUrl: form.companyUrl,
              },
            }),
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Unable to save application");
    } else await load();
    setSaving(false);
  }
  function startInterview(interview?: Interview) {
    setEditingInterview(interview?.id ?? "new");
    setInterviewForm(
      interview
        ? {
            type: interview.type,
            title: interview.title,
            scheduledAt: dateInput(interview.scheduledAt),
            status: interview.status,
            notes: interview.notes ?? "",
          }
        : {
            type: "TECHNICAL",
            title: "",
            scheduledAt: "",
            status: "SCHEDULED",
            notes: "",
          },
    );
  }
  async function saveInterview(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      type: interviewForm.type,
      title: interviewForm.title,
      scheduledAt: interviewForm.scheduledAt
        ? new Date(interviewForm.scheduledAt).toISOString()
        : null,
      status: interviewForm.status,
      notes: interviewForm.notes || null,
    };
    const endpoint =
      editingInterview === "new"
        ? `/api/protected/applications/${id}/interviews`
        : `/api/protected/applications/${id}/interviews/${editingInterview}`;
    const response = await fetch(endpoint, {
      method: editingInterview === "new" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Unable to save interview");
    } else {
      setEditingInterview(null);
      await load();
    }
    setSaving(false);
  }
  async function deleteInterview(interviewId: string) {
    if (!window.confirm("Delete this interview?")) return;
    const response = await fetch(
      `/api/protected/applications/${id}/interviews/${interviewId}`,
      { method: "DELETE" },
    );
    if (response.ok) await load();
    else setError("Unable to delete interview");
  }

  function parseHistoryChanges(changes: Record<string, unknown>) {
    if (!changes) return "No changes recorded";
    return Object.entries(changes)
      .map(([key, value]) => {
        if (
          typeof value === "object" &&
          value !== null &&
          "before" in value &&
          "after" in value
        ) {
          const before = value.before ?? "null";
          const after = value.after ?? "null";

          if (key === "jobId") {
            const beforeJob = jobs.find((job) => job.id === before);
            const afterJob = jobs.find((job) => job.id === after);
            return `${key}: ${beforeJob?.title ?? before} → ${afterJob?.title ?? after}`;
          }
          return `${key}: ${before} → ${after}`;
        }

        if (key === "jobId") {
          const job = jobs.find((job) => job.id === value);

          return `${key}: ${job?.title}`;
        }
        return `${key}: ${value}`;
      })
      .join("\n");
  }

  if (loading)
    return <p className="p-6 text-muted-foreground">Loading application...</p>;
  if (!application)
    return (
      <p className="p-6 text-destructive">{error || "Application not found"}</p>
    );
  return (
    <section className="space-y-6 p-6">
      <div>
        <p className="text-sm text-muted-foreground">Application management</p>
        <h1 className="text-3xl font-semibold">{application.job.title}</h1>
        <p className="text-muted-foreground">
          {application.company.name} · {application.job.location}
        </p>
      </div>
      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <form onSubmit={saveApplication} className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-5">
            <h2 className="text-lg font-medium">Application</h2>
            <FieldGroup>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select
                  value={form.status}
                  onValueChange={(value) => setValue("status", value ?? "")}
                >
                  <SelectTrigger className="w-full">
                    {label(form.status)}
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((value) => (
                      <SelectItem key={value} value={value}>
                        {label(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Notes</FieldLabel>
                <Textarea
                  className="h-48"
                  value={form.notes}
                  onChange={(event) => setValue("notes", event.target.value)}
                />
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={saving}>
              <Save />
              {saving ? "Saving..." : "Save application"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium">Job</h2>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={jobMode === "existing" ? "default" : "outline"}
                  onClick={() => setJobMode("existing")}
                >
                  Existing job
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={jobMode === "new" ? "default" : "outline"}
                  onClick={() => setJobMode("new")}
                >
                  New job
                </Button>
              </div>
            </div>
            {jobMode === "existing" ? (
              <FieldSet>
                <Field>
                  <FieldLabel htmlFor="job-search">Search jobs</FieldLabel>
                  <Input
                    id="job-search"
                    placeholder="Search title, company, or salary"
                    value={jobSearch}
                    onChange={(event) => setJobSearch(event.target.value)}
                  />
                </Field>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {jobs.map((job) => (
                    <button
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedJobId === job.id ? "border-primary bg-primary/10" : "hover:bg-muted"}`}
                      key={job.id}
                      type="button"
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setForm((current) => ({
                          ...current,
                          title: job.title,
                          description: job.description,
                          location: job.location,
                          salary: job.salary,
                          companyName: job.company.name,
                          companyUrl: job.company.url,
                        }));
                      }}
                    >
                      <span className="block font-medium">{job.title}</span>
                      <span className="block text-sm text-muted-foreground">
                        {job.company.name} · {job.salary}
                      </span>
                    </button>
                  ))}
                  {jobs.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No jobs found.
                    </p>
                  )}
                </div>
              </FieldSet>
            ) : (
              <FieldSet>
                <Field>
                  <FieldLabel>Job title</FieldLabel>
                  <Input
                    value={form.title}
                    onChange={(event) => setValue("title", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      setValue("description", event.target.value)
                    }
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Location</FieldLabel>
                    <Input
                      value={form.location}
                      onChange={(event) =>
                        setValue("location", event.target.value)
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Salary</FieldLabel>
                    <Input
                      value={form.salary}
                      onChange={(event) =>
                        setValue("salary", event.target.value)
                      }
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Company name</FieldLabel>
                  <Input
                    value={form.companyName}
                    onChange={(event) =>
                      setValue("companyName", event.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Company URL</FieldLabel>
                  <Input
                    type="url"
                    value={form.companyUrl}
                    onChange={(event) =>
                      setValue("companyUrl", event.target.value)
                    }
                  />
                </Field>
              </FieldSet>
            )}
          </CardContent>
        </Card>
      </form>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Interview history</h2>
            <Button onClick={() => startInterview()}>
              <Plus />
              Add interview
            </Button>
          </div>
          {editingInterview && (
            <form
              onSubmit={saveInterview}
              className="grid gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-2"
            >
              <Field>
                <FieldLabel>Title</FieldLabel>
                <Input
                  required
                  value={interviewForm.title}
                  onChange={(event) =>
                    setInterviewForm({
                      ...interviewForm,
                      title: event.target.value,
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Select
                  value={interviewForm.type}
                  onValueChange={(value) =>
                    setInterviewForm({ ...interviewForm, type: value ?? "" })
                  }
                >
                  <SelectTrigger className="w-full">
                    {label(interviewForm.type)}
                  </SelectTrigger>
                  <SelectContent>
                    {interviewTypes.map((value) => (
                      <SelectItem key={value} value={value}>
                        {label(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select
                  value={interviewForm.status}
                  onValueChange={(value) =>
                    setInterviewForm({ ...interviewForm, status: value ?? "" })
                  }
                >
                  <SelectTrigger className="w-full">
                    {label(interviewForm.status)}
                  </SelectTrigger>
                  <SelectContent>
                    {interviewStatuses.map((value) => (
                      <SelectItem key={value} value={value}>
                        {label(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Scheduled</FieldLabel>
                <Input
                  type="datetime-local"
                  value={interviewForm.scheduledAt}
                  onChange={(event) =>
                    setInterviewForm({
                      ...interviewForm,
                      scheduledAt: event.target.value,
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Notes</FieldLabel>
                <Textarea
                  value={interviewForm.notes}
                  onChange={(event) =>
                    setInterviewForm({
                      ...interviewForm,
                      notes: event.target.value,
                    })
                  }
                />
              </Field>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  <Save />
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingInterview(null)}
                >
                  <X />
                  Cancel
                </Button>
              </div>
            </form>
          )}
          {application.interviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No interviews recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {application.interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{interview.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {label(interview.type)} · {label(interview.status)} ·{" "}
                      {displayDate(interview.scheduledAt)}
                    </p>
                    {interview.notes && (
                      <p className="mt-1 text-sm">{interview.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      title="Edit interview"
                      onClick={() => startInterview(interview)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      title="Delete interview"
                      onClick={() => deleteInterview(interview.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-medium">Change history</h2>
          {application.histories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No changes recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {application.histories.map((history) => (
                <div
                  key={history.id}
                  className="border-l-2 border-primary pl-3"
                >
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <strong>{label(history.action)}</strong>
                    <time className="text-muted-foreground">
                      {displayDate(history.createdAt)}
                    </time>
                  </div>
                  <pre className="mt-1 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                    {parseHistoryChanges(history.changes)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
