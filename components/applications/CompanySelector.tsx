"use client";

import { Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type CompanyOption = {
  id: string;
  name: string;
  url: string;
};

export default function CompanySelector({
  value,
  onChange,
  id,
}: {
  value: CompanyOption | null;
  onChange: (company: CompanyOption) => void;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || creating) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/protected/companies?search=${encodeURIComponent(search)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Unable to load companies");
        const data: { companies?: CompanyOption[] } = await response.json();
        setCompanies(data.companies ?? []);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }
        setError(
          cause instanceof Error ? cause.message : "Unable to load companies",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [creating, open, search]);

  async function createCompany(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/protected/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url }),
      });
      const data: { company?: CompanyOption; error?: string } =
        await response.json();
      if (!response.ok || !data.company) {
        throw new Error(data.error ?? "Unable to create company");
      }
      onChange(data.company);
      setName("");
      setUrl("");
      setSearch("");
      setCreating(false);
      setOpen(false);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to create company",
      );
    } finally {
      setSaving(false);
    }
  }

  function chooseCompany(company: CompanyOption) {
    onChange(company);
    setSearch("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        aria-expanded={open}
        className={`${buttonVariants({ variant: "outline" })} w-full justify-start`}
      >
        {value?.name ?? "Choose a company"}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        {creating ? (
          <form onSubmit={createCompany} className="space-y-3">
            <p className="font-medium">Create company</p>
            <Input
              autoFocus
              required
              placeholder="Company name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              required
              type="url"
              placeholder="Company URL"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreating(false)}
              >
                Back
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <Input
              autoFocus
              role="combobox"
              aria-expanded={open}
              aria-controls="company-options"
              placeholder="Search companies..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div
              id="company-options"
              role="listbox"
              aria-label="Companies"
              className="max-h-52 space-y-1 overflow-y-auto"
            >
              {companies.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  role="option"
                  aria-selected={value?.id === company.id}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  onClick={() => chooseCompany(company)}
                >
                  <Check
                    className={`size-4 ${value?.id === company.id ? "opacity-100" : "opacity-0"}`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {company.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {company.url}
                    </span>
                  </span>
                </button>
              ))}
              {!loading && companies.length === 0 && !error && (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">
                  No companies found.
                </p>
              )}
              {loading && (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">
                  Searching...
                </p>
              )}
            </div>
            <Button
              className="w-full justify-start"
              type="button"
              variant="ghost"
              onClick={() => {
                setError("");
                setCreating(true);
              }}
            >
              <Plus />
              Create a company
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
