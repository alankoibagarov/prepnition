"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/app/store/useAppStore";
import { Button } from "@/components/ui/button";

export function Counter() {
  const { count, increment } = useAppStore();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/hello");
      const data = await res.json();
      setMessage(data.message);
    }
    load();
  }, []);

  return (
    <Button type="button" variant="secondary" onClick={increment}>
      Click me! Count: {count}
      {message ? ` API says: ${message}` : " API request failed"}
    </Button>
  );
}
