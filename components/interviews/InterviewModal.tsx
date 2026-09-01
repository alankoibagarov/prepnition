"use client";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { capitalize } from "@/app/helpers/string";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type Interview, InterviewStatus } from "@/types/interview";
import { Calendar } from "../ui/calendar";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "../ui/field";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

export default function InterviewModal({
  open,
  onClose,
  onSubmit,
  interview,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (updates: Partial<Interview>) => void;
  interview: Interview | null;
}) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [modalForm, setModalForm] = useState({
    title: interview?.title ?? "",
    position: interview?.position ?? "",
    company: interview?.company ?? "",
    notes: interview?.notes ?? "",
    status: interview?.status ?? InterviewStatus.DRAFT,
  });

  const hasAnyChanges = Object.keys(modalForm).some(
    (key) =>
      interview !== null &&
      modalForm[key as keyof typeof modalForm] !==
        interview?.[key as keyof Interview],
  );

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return format(date, "PPPpp");
  };

  const interviewStatuses = Object.values(InterviewStatus).map((status) => ({
    value: status,
    label: capitalize(status),
  }));

  function onReset() {
    setModalForm({
      title: interview?.title ?? "",
      position: interview?.position ?? "",
      company: interview?.company ?? "",
      notes: interview?.notes ?? "",
      status: interview?.status ?? InterviewStatus.DRAFT,
    });
  }

  useEffect(() => {
    setModalForm({
      title: interview?.title ?? "",
      position: interview?.position ?? "",
      company: interview?.company ?? "",
      notes: interview?.notes ?? "",
      status: interview?.status ?? InterviewStatus.DRAFT,
    });
  }, [interview]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="fixed inset-0 bg-black/40 border-none p-0"
        onClick={onClose}
        aria-label="Close modal"
      />
      <Card
        className={cn("z-50 max-w-7xl max-h-full w-full mx-4 overflow-y-auto")}
      >
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="space-y-2 flex-2">
              <form>
                <FieldGroup>
                  <FieldSet>
                    <Field>
                      <FieldLabel>Title:</FieldLabel>
                      <Input
                        value={modalForm.title}
                        onChange={(e) => {
                          setModalForm({
                            ...modalForm,
                            title: e.currentTarget.value,
                          });
                        }}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Position:</FieldLabel>
                      <Input
                        value={modalForm.position}
                        onChange={(e) => {
                          setModalForm({
                            ...modalForm,
                            position: e.currentTarget.value,
                          });
                        }}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Company:</FieldLabel>
                      <Input
                        value={modalForm.company}
                        onChange={(e) => {
                          setModalForm({
                            ...modalForm,
                            company: e.currentTarget.value,
                          });
                        }}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Status:</FieldLabel>
                      <Select
                        value={modalForm.status}
                        onValueChange={(value) => {
                          setModalForm({
                            ...modalForm,
                            status: value as InterviewStatus,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <div className="flex items-center">
                            {interviewStatuses.find(
                              (s) => s.value === modalForm.status,
                            )?.label ?? "Select status"}
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {interviewStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Notes:</FieldLabel>
                      <Textarea
                        value={modalForm.notes}
                        onChange={(e) => {
                          setModalForm({
                            ...modalForm,
                            notes: e.currentTarget.value,
                          });
                        }}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Company:</FieldLabel>
                      <Input
                        value={modalForm.company}
                        onChange={(e) => {
                          setModalForm({
                            ...modalForm,
                            company: e.currentTarget.value,
                          });
                        }}
                      />
                    </Field>
                  </FieldSet>
                  <FieldSeparator />
                  <FieldSet className="flex flex-col gap-4 md:flex-row">
                    <FieldGroup className="flex-row">
                      <Field>
                        <FieldLabel htmlFor="date-picker-optional">
                          Next Interview Date
                        </FieldLabel>
                        <Popover
                          open={openCalendar}
                          onOpenChange={setOpenCalendar}
                        >
                          <PopoverTrigger
                            className={buttonVariants({ variant: "outline" })}
                          >
                            {interview?.scheduledAt
                              ? format(new Date(interview.scheduledAt), "PPP")
                              : "Select date"}
                            <ChevronDownIcon />
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={
                                interview?.scheduledAt
                                  ? new Date(interview.scheduledAt)
                                  : undefined
                              }
                              captionLayout="dropdown"
                              defaultMonth={date}
                              onSelect={(date) => {
                                setDate(date);
                                setOpenCalendar(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </Field>
                      <Field className="w-32">
                        <FieldLabel htmlFor="time-picker-optional">
                          Time
                        </FieldLabel>
                        <Input
                          value={
                            interview?.scheduledAt
                              ? new Date(
                                  interview.scheduledAt,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: false,
                                })
                              : ""
                          }
                          onChange={(e) => {
                            const time = e.currentTarget.value;
                            if (interview?.scheduledAt && time) {
                              const date = new Date(interview.scheduledAt);
                              const [hours, minutes] = time.split(":");
                              date.setHours(
                                Number.parseInt(hours, 10),
                                Number.parseInt(minutes, 10),
                              );
                              setDate(date);
                            }
                          }}
                          type="time"
                          id="time-picker-optional"
                          step="1"
                          defaultValue="10:30:00"
                          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                      </Field>
                    </FieldGroup>
                    <Separator
                      orientation="vertical"
                      className="hidden md:block"
                    />
                    <FieldGroup className="max-w-xs flex-row">
                      <Field>
                        <FieldLabel>Created:</FieldLabel>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(interview?.createdAt)}
                        </p>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="timezone-picker-optional">
                          Last Updated:
                        </FieldLabel>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(interview?.updatedAt)}
                        </p>
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                </FieldGroup>
              </form>
            </div>
            <Separator orientation="vertical" className="hidden md:block" />
            {interview && (
              <div className="space-y-2 flex-1 flex flex-col">
                <strong className="">History:</strong>
                <div className="max-h-[70dvh] overflow-auto">
                  {interview?.history && interview.history.length > 0 ? (
                    interview.history.map((h) => (
                      <div key={h.id} className="mb-2 p-2 border rounded">
                        <div className="flex justify-between text-sm">
                          <div className="font-medium">{h.action}</div>
                          <div className="text-muted-foreground">
                            {formatDate(h.createdAt)}
                          </div>
                        </div>
                        <div className="mt-1 text-xs">
                          {Object.entries(h.changes).map(([field, val]) => {
                            const change = val as
                              | { before?: unknown; after?: unknown }
                              | undefined;

                            return (
                              <div key={field}>
                                <strong>{capitalize(field)}:</strong>{" "}
                                {String(change?.before ?? "—")} →{" "}
                                {String(change?.after ?? "—")}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No history
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <div
            className={
              "flex gap-2 p-4 " +
              (hasAnyChanges ? "justify-between" : " justify-end")
            }
          >
            {hasAnyChanges && (
              <div className="flex gap-2">
                <Button variant="default" onClick={() => onSubmit(modalForm)}>
                  Submit Changes
                </Button>
                <Button variant="outline" onClick={() => onReset()}>
                  Reset Changes
                </Button>
              </div>
            )}

            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
