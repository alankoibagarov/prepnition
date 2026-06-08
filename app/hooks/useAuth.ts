"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "@/types/auth";

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          if (isMounted) {
            setState({ user: null, isLoading: false, error: null });
          }
          return;
        }

        const data = await response.json();
        if (isMounted) {
          setState({ user: data.user, isLoading: false, error: null });
        }
      } catch {
        if (isMounted) {
          setState({
            user: null,
            isLoading: false,
            error: "Failed to load session",
          });
        }
      }
    }

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
