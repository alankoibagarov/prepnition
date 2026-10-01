"use client";

import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";

export function CalendarRange({
  dateRange,
  onDateRangeChange,
}: {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}) {
  return (
    <Calendar
      mode="range"
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={onDateRangeChange}
      numberOfMonths={2}
      className="rounded-lg border"
    />
  );
}
