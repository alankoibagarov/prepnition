"use client";

import { Combobox } from "@base-ui/react/combobox";
import { Check } from "lucide-react";

export type JobAutocompleteOption = {
  id: string;
  title: string;
  company: {
    name: string;
  };
};

type JobAutocompleteProps<T extends JobAutocompleteOption> = {
  id: string;
  label: string;
  placeholder: string;
  jobs: readonly T[];
  value: T | null;
  inputValue: string;
  loading?: boolean;
  emptyMessage: string;
  getDescription?: (job: T) => string;
  onInputValueChange: (value: string) => void;
  onSelect: (job: T) => void;
};

function getJobLabel(job: JobAutocompleteOption) {
  return `${job.title} — ${job.company.name}`;
}

export default function JobAutocomplete<T extends JobAutocompleteOption>({
  id,
  label,
  placeholder,
  jobs,
  value,
  inputValue,
  loading = false,
  emptyMessage,
  getDescription,
  onInputValueChange,
  onSelect,
}: JobAutocompleteProps<T>) {
  return (
    <Combobox.Root<T>
      items={jobs}
      filteredItems={jobs}
      value={value}
      inputValue={value ? getJobLabel(value) : inputValue}
      itemToStringLabel={getJobLabel}
      itemToStringValue={(job) => job.id}
      autoHighlight
      onInputValueChange={(nextValue, details) => {
        if (details.reason === "input-change") {
          onInputValueChange(nextValue);
        }
      }}
      onValueChange={(job) => {
        if (job) onSelect(job);
      }}
    >
      <Combobox.Input
        id={id}
        aria-label={label}
        placeholder={placeholder}
        className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
      />
      <Combobox.Portal>
        <Combobox.Positioner
          side="bottom"
          sideOffset={4}
          className="z-[60] w-(--anchor-width)"
        >
          <Combobox.Popup className="max-h-60 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
            <Combobox.List>
              {jobs.map((job, index) => (
                <Combobox.Item
                  key={job.id}
                  value={job}
                  index={index}
                  className="flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <Combobox.ItemIndicator className="flex size-4 shrink-0 items-center justify-center">
                    <Check className="size-4" />
                  </Combobox.ItemIndicator>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {getJobLabel(job)}
                    </span>
                    {getDescription && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {getDescription(job)}
                      </span>
                    )}
                  </span>
                </Combobox.Item>
              ))}
            </Combobox.List>
            {loading ? (
              <div
                role="status"
                className="px-2 py-1.5 text-sm text-muted-foreground"
              >
                Searching jobs...
              </div>
            ) : (
              jobs.length === 0 && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              )
            )}
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
