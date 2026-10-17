"use client";

import { useCallback, useEffect, useState } from "react";
import type { Application } from "@/types/interview";

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/protected/applications");
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : `Failed to load applications (HTTP ${res.status})`;
        throw new Error(message);
      }
      const data = await res.json();
      setApplications(data.applications ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { applications, loading, error, reload };
}
