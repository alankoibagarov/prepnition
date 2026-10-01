"use client";

import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarRange } from "@/components/ui/rangeCalendar";

function formatDateRange(range: DateRange | undefined): string {
  if (!range?.from) return "All time";
  if (!range.to) return format(range.from, "PPP");
  return `${format(range.from, "PPP")} – ${format(range.to, "PPP")}`;
}

export default function MainPageFilters({
  dateRange,
  onDateRangeChange,
}: {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}) {
  const [openCalendar, setOpenCalendar] = useState(false);

  return (
    <Card>
      <CardContent>
        <Field>
          <FieldLabel htmlFor="date-picker-optional">
            Choose a date range
          </FieldLabel>
          <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
            <PopoverTrigger className={buttonVariants({ variant: "outline" })}>
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
        </Field>
      </CardContent>
    </Card>
  );
}
