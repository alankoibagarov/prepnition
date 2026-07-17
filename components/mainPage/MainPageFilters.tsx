"use client";

import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarRange } from "@/components/ui/rangeCalendar";

export default function MainPageFilters() {
  const [openCalendar, setOpenCalendar] = useState(false);

  return (
    <Card className="">
      <CardContent className="">
        <Field>
          <FieldLabel htmlFor="date-picker-optional">
            Choose a date range
          </FieldLabel>
          <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
            <PopoverTrigger className={buttonVariants({ variant: "outline" })}>
              {format(new Date(), "PPP")}
              <ChevronDownIcon />
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <CalendarRange />
            </PopoverContent>
          </Popover>
        </Field>
      </CardContent>
    </Card>
  );
}
