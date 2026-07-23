"use client";

import { FileText, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/app/components/LogoutButton";
import { capitalize } from "@/app/helpers/string";
import type { AuthUser } from "@/types/auth";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function Sidebar({ session }: { session: AuthUser }) {
  const pathname = usePathname();

  const items = [
    { href: "/app", label: "Home", icon: Home },
    { href: "/app/interviews", label: "Interviews", icon: FileText },
  ];

  return (
    <>
      {/* Desktop left sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:w-56 md:flex md:flex-col md:gap-4 md:py-6 md:px-3 border-r border-sidebar-border bg-sidebar overflow-hidden h-screen justify-between">
        {/* Logo / brand */}
        <div>
          <div className="px-3 pb-4">
            <Link href="/app" className="flex items-center gap-3 px-2 py-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold">
                P
              </span>
              <span className="text-lg font-semibold text-sidebar-foreground">
                Prepnition
              </span>
            </Link>
          </div>

          <nav aria-label="Main" className="flex flex-col gap-1 px-3">
            {items.map((it) => {
              const Icon = it.icon;
              const active = pathname === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-ring transition-colors ${
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/40"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden />
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardDescription>Signed in as</CardDescription>
            <CardTitle>
              {session.firstName} {session.lastName}
            </CardTitle>
            <CardTitle>{session.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <Badge variant="secondary">{capitalize(session.role)}</Badge>
              <LogoutButton />
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Bottom"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl rounded-xl bg-sidebar/95 backdrop-blur-md border border-sidebar-border px-4 py-2 flex items-center justify-between md:hidden"
      >
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-ring ${
                active
                  ? "text-sidebar-primary bg-sidebar-primary/8"
                  : "text-sidebar-foreground/90"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden />
              <span className="leading-3">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
