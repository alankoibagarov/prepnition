"use client";

import { endOfDay, format, isSameDay, startOfDay, subDays } from "date-fns";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { capitalize } from "@/app/helpers/string";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarRange } from "@/components/ui/rangeCalendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ApplicationStatus } from "@/generated/prisma/enums";
import type { Application } from "@/types/interview";

const APPLICATION_STATUSES = Object.values(ApplicationStatus);

const DATE_PRESETS = [
  { label: "Today", days: 1 },
  { label: "Last week", days: 7 },
  { label: "Last month", days: 30 },
  { label: "Last year", days: 365 },
] as const;

function formatDateRange(range: DateRange | undefined): string {
  if (!range?.from) return "All time";
  if (!range.to) return format(range.from, "PPP");
  return `${format(range.from, "PPP")} – ${format(range.to, "PPP")}`;
}

function getPresetDateRange(
  days: number,
  now = new Date(),
): { from: Date; to: Date } {
  const to = endOfDay(now);
  return {
    from: startOfDay(subDays(now, days - 1)),
    to,
  };
}

function matchesPreset(range: DateRange | undefined, days: number): boolean {
  if (!range?.from || !range.to) return false;
  const preset = getPresetDateRange(days);
  return isSameDay(range.from, preset.from) && isSameDay(range.to, preset.to);
}

function isApplicationStatus(value: string): value is ApplicationStatus {
  return APPLICATION_STATUSES.some((status) => status === value);
}

export default function MainPageFilters({
  applications,
  dateRange,
  onDateRangeChange,
  status,
  onStatusChange,
  companyId,
  onCompanyChange,
}: {
  applications: Application[];
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  status: ApplicationStatus | undefined;
  onStatusChange: (status: ApplicationStatus | undefined) => void;
  companyId: string | undefined;
  onCompanyChange: (companyId: string | undefined) => void;
}) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const companies = useMemo(
    () =>
      Array.from(
        new Map(
          applications.map((application) => [
            application.company.id,
            application.company.name,
          ]),
        ),
      )
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [applications],
  );

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 xl:flex-row xl:flex-wrap xl:items-end">
        <Field className="w-full xl:min-w-0 xl:flex-1">
          <FieldLabel htmlFor="date-range-filter">
            Choose a date range
          </FieldLabel>
          <div className="flex flex-wrap items-center gap-1.5">
            <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
              <PopoverTrigger
                id="date-range-filter"
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full justify-between sm:w-80",
                })}
              >
                {formatDateRange(dateRange)}
                <ChevronDownIcon />
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <CalendarRange
                  dateRange={dateRange}
                  onDateRangeChange={onDateRangeChange}
                />
              </PopoverContent>
            </Popover>
            {DATE_PRESETS.map(({ label, days }) => (
              <Button
                key={label}
                type="button"
                size="sm"
                variant={
                  matchesPreset(dateRange, days) ? "secondary" : "outline"
                }
                aria-pressed={matchesPreset(dateRange, days)}
                onClick={() => {
                  onDateRangeChange(getPresetDateRange(days));
                  setOpenCalendar(false);
                }}
              >
                {label}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!dateRange?.from}
              onClick={() => {
                onDateRangeChange(undefined);
                setOpenCalendar(false);
              }}
            >
              <XIcon />
              Clear dates
            </Button>
          </div>
        </Field>
        <Field className="w-full xl:w-52">
          <FieldLabel htmlFor="application-status-filter">Status</FieldLabel>
          <Select
            value={status ?? "ALL"}
            onValueChange={(value) => {
              if (value === "ALL") {
                onStatusChange(undefined);
              } else if (value && isApplicationStatus(value)) {
                onStatusChange(value);
              }
            }}
          >
            <SelectTrigger id="application-status-filter" className="w-full">
              {status ? capitalize(status) : "All statuses"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {APPLICATION_STATUSES.map((applicationStatus) => (
                <SelectItem key={applicationStatus} value={applicationStatus}>
                  {capitalize(applicationStatus)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field className="w-full xl:w-52">
          <FieldLabel htmlFor="company-filter">Company</FieldLabel>
          <Select
            value={companyId ?? "ALL"}
            onValueChange={(value) =>
              onCompanyChange(value && value !== "ALL" ? value : undefined)
            }
          >
            <SelectTrigger id="company-filter" className="w-full">
              {companies.find((company) => company.id === companyId)?.name ??
                "All companies"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </CardContent>
    </Card>
  );
}
