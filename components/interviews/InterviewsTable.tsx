"use client";
import { Plus, RefreshCw, TableOfContents, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Interview } from "@/types/interview";
import DeleteInterviewModal from "./DeleteInterviewModal";
import InterviewModal from "./InterviewModal";

export default function InterviewsTable() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Interview | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/protected/interviews");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setInterviews(data.interviews ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function openInterview(id: string) {
    try {
      const res = await fetch(`/api/protected/interviews/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setSelected(
        data.interview
          ? { ...data.interview, history: data.history ?? [] }
          : null,
      );
      setModalOpen(true);
    } catch (e) {
      console.error(e);
      // fallback: close modal if error
      setSelected(null);
      setModalOpen(false);
    }
  }

  async function openDeleteModal(id: string) {
    setSelectedForDelete(id);
    setDeleteModalOpen(true);
  }

  async function openAddInterview() {
    try {
      setSelected(null);
      setModalOpen(true);
    } catch (e) {
      console.error(e);
      // fallback: close modal if error
      setSelected(null);
      setModalOpen(false);
    }
  }

  async function deleteInterview(id: string) {
    try {
      const res = await fetch(`/api/protected/interviews/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Not found");
      setSelected(null);
      setDeleteModalOpen(false);
      load();
    } catch (e) {
      console.error(e);
      // fallback: close modal if error
      setSelected(null);
      setDeleteModalOpen(false);
    }
  }

  async function updateInterview(id: string, updates: Partial<Interview>) {
    try {
      const res = await fetch(`/api/protected/interviews/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setSelected(
        data.interview
          ? { ...data.interview, history: data.history ?? [] }
          : null,
      );
      load();
    } catch (e) {
      console.error(e);
      // fallback: close modal if error
      setSelected(null);
      setModalOpen(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4 justify-end">
          <Button
            onClick={() => openAddInterview()}
            disabled={loading}
            variant="outline"
          >
            <Plus />
            Add Interview
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
                <th className="pb-2">Position</th>
                <th className="pb-2">Scheduled</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((i, index) => (
                <tr key={i.id} className="border-t">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">{i.title}</td>
                  <td className="py-2">{i.company ?? "—"}</td>
                  <td className="py-2">{i.position ?? "—"}</td>
                  <td className="py-2">
                    {i.scheduledAt
                      ? new Date(i.scheduledAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-2">{i.status}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <Button
                        className="cursor-pointer"
                        size="sm"
                        onClick={() => openInterview(i.id)}
                        variant="outline"
                        title="View Details"
                      >
                        <TableOfContents />
                      </Button>
                      <Button
                        className="cursor-pointer"
                        size="sm"
                        onClick={() => openDeleteModal(i.id)}
                        variant="outline"
                        title="Delete"
                      >
                        <Trash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {interviews.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 text-center text-sm text-muted-foreground"
                  >
                    No interviews
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <InterviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(modalForm) => {
          updateInterview(selected?.id ?? "", modalForm);
        }}
        interview={selected}
      />

      <DeleteInterviewModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        interviewId={selectedForDelete}
        onDelete={deleteInterview}
      />
    </Card>
  );
}
