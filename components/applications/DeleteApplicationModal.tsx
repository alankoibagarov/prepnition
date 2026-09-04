"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DeleteApplicationModal({
  open,
  onClose,
  onDelete,
  applicationId,
}: {
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  applicationId: string | null;
}) {
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
          <CardTitle>Delete Application</CardTitle>
          <CardDescription>
            Are you sure you want to delete this application? This action cannot
            be undone.
          </CardDescription>
        </CardHeader>
        <div className="flex justify-end gap-2 p-4">
          <Button
            variant="destructive"
            onClick={() => applicationId && onDelete(applicationId)}
          >
            Delete
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
