"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Interview } from "@/types/interview";
import { Textarea } from "../ui/textarea";

export default function InterviewModal({
  open,
  onClose,
  interview,
}: {
  open: boolean;
  onClose: () => void;
  interview: Interview | null;
}) {
  const [notes, setNotes] = useState<string>(interview?.notes ?? "");

  function onChangeNotes(notes: string) {
    setNotes(notes);
    console.log("Update notes:", notes);
  }

  useEffect(() => {
    setNotes(interview?.notes ?? "");
  }, [interview?.notes]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="fixed inset-0 bg-black/40 border-none p-0"
        onClick={onClose}
        aria-label="Close modal"
      />
      <Card className={cn("z-50 max-w-2xl w-full mx-4")}>
        <CardHeader>
          <CardTitle>{interview?.title ?? "Interview"}</CardTitle>
          <CardDescription>
            {interview?.company} — {interview?.position}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>Scheduled:</strong>{" "}
              {interview?.scheduledAt
                ? new Date(interview.scheduledAt).toLocaleString()
                : "—"}
            </div>
            <div>
              <strong>Status:</strong> {interview?.status}
            </div>
            <div>
              <strong>Score:</strong> {interview?.score ?? "—"}
            </div>
            <div>
              <strong>Notes:</strong>
              <div className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {interview?.notes ?? ""}
              </div>
              <Textarea
                placeholder="Type your notes here..."
                value={notes}
                onInput={(e) => onChangeNotes(e.currentTarget.value)}
              />
            </div>
          </div>
        </CardContent>
        <div className="flex justify-end gap-2 p-4">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
