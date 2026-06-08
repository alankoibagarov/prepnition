"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/app/store/useAppStore";

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
    <button type="button" onClick={increment}>
      Click me! Count:
      {count}
      {message ? ` API says: ${message}` : " API request failed"}
    </button>
  );
}
