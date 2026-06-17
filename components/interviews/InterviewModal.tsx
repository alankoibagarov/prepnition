"use client";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Interview } from "@/types/interview";
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
  });

  const hasAnyChanges = Object.keys(modalForm).some(
    (key) =>
      modalForm[key as keyof typeof modalForm] !==
      interview?.[key as keyof Interview],
  );

  useEffect(() => {
    setModalForm({
      title: interview?.title ?? "",
      position: interview?.position ?? "",
      company: interview?.company ?? "",
      notes: interview?.notes ?? "",
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
      <Card className={cn("z-50 max-w-6xl w-full mx-4")}>
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
                  </FieldSet>
                  <FieldSeparator />
                  <FieldSet className="flex flex-col gap-4 md:flex-row">
                    <FieldGroup className="max-w-xs flex-row">
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
                            if (interview?.scheduledAt) {
                              const date = new Date(interview.scheduledAt);
                              const [hours, minutes] = time.split(":");
                              date.setHours(parseInt(hours), parseInt(minutes));
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
                          {interview?.createdAt ?? ""}
                        </p>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="timezone-picker-optional">
                          Last Updated:
                        </FieldLabel>
                        <p className="text-sm text-muted-foreground">
                          {interview?.updatedAt ?? ""}
                        </p>
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                </FieldGroup>
              </form>
            </div>
            <Separator orientation="vertical" className="hidden md:block" />
            <div className="space-y-2 flex-1">
              <strong>History:</strong>
              <div>
                Updates:
                <div>123</div>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-end gap-2 p-4">
            {hasAnyChanges && (
              <Button variant="default" onClick={() => onSubmit(modalForm)}>
                Submit Changes
              </Button>
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
