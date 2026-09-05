"use client";
import { Plus, RefreshCw, TableOfContents, Trash } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Application } from "@/types/interview";
import DeleteInterviewModal from "./DeleteApplicationModal";

export default function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/protected/applications");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setApplications(data.applications ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function openDeleteModal(id: string) {
    setSelectedForDelete(id);
    setDeleteModalOpen(true);
  }

  async function deleteInterview(id: string) {
    try {
      const res = await fetch(`/api/protected/applications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Not found");
      setDeleteModalOpen(false);
      load();
    } catch (e) {
      console.error(e);
      // fallback: close modal if error
      setDeleteModalOpen(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex gap-4">
          <Button disabled={loading} variant="outline">
            <Plus />
            Add Application
          </Button>
          <Button onClick={() => load()} disabled={loading} variant="outline">
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
              {applications.map((application, index) => (
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
                    {application.interviews
                      ? new Date(
                          application.interviews?.[0]?.scheduledAt || "",
                        ).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-2">{application.status}</td>
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
              ))}
              {applications.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={6}
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

      <DeleteInterviewModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        applicationId={selectedForDelete}
        onDelete={deleteInterview}
      />
    </Card>
  );
}
