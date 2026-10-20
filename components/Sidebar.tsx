"use client";

import {
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  FileText,
  Home,
  Library,
} from "lucide-react";
// import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { capitalize } from "@/app/helpers/string";
import { LogoutButton } from "@/components/landing/LogoutButton";
import type { AuthUser } from "@/types/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function Sidebar({ session }: { session: AuthUser }) {
  const pathname = usePathname();
  const [librariesOpen, setLibrariesOpen] = useState(false);

  const items = [
    { href: "/app", label: "Home", icon: Home },
    { href: "/app/applications", label: "Applications", icon: FileText },
  ];
  const libraryItems = [
    { href: "/app/companies", label: "Companies", icon: Building2 },
    { href: "/app/jobs", label: "Jobs", icon: BriefcaseBusiness },
  ];
  const isActive = (href: string) =>
    href === "/app"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  const librariesActive = libraryItems.some((item) => isActive(item.href));

  return (
    <>
      {/* Desktop left sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:w-50 md:flex md:flex-col md:gap-4 md:py-6 md:px-3 border-r border-sidebar-border bg-sidebar overflow-hidden h-screen justify-between">
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
              const active = isActive(it.href);
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
            <div>
              <button
                type="button"
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-ring transition-colors ${
                  librariesActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/40"
                }`}
                aria-expanded={librariesOpen}
                aria-controls="desktop-libraries-panel"
                onClick={() => setLibrariesOpen((open) => !open)}
              >
                <Library className="w-5 h-5" aria-hidden />
                <span>Libraries</span>
                <ChevronDown
                  className={`ml-auto h-4 w-4 transition-transform ${
                    librariesOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>
              <div
                id="desktop-libraries-panel"
                hidden={!librariesOpen}
                className="pt-1"
              >
                {libraryItems.map((it) => {
                  const Icon = it.icon;
                  const active = isActive(it.href);
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={`flex items-center gap-3 rounded-md py-2 pl-11 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-sidebar-ring transition-colors ${
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
              </div>
            </div>
          </nav>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardDescription>Signed in as</CardDescription>
            {/* <CardTitle>
              <Image
                src={session.avatarUrl || "/profile.png"}
                alt={"Avatar"}
                width={75}
                height={75}
                className="object-cover rounded rounded-full"
              />
            </CardTitle> */}
            {(session.firstName || session.lastName) && (
              <CardTitle>
                {capitalize(session.firstName)} {capitalize(session.lastName)}
              </CardTitle>
            )}
            <CardTitle>{session.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <LogoutButton />
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Bottom"
        className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] -translate-x-1/2 flex-col gap-2 rounded-xl border border-sidebar-border bg-sidebar/95 px-4 py-2 backdrop-blur-md md:hidden max-w-2xl"
      >
        <div className="flex items-center justify-between">
          {items.map((it) => {
            const Icon = it.icon;
            const active = isActive(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex flex-col items-center gap-1 rounded-md px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-ring ${
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
          <button
            type="button"
            className={`flex flex-col items-center gap-1 rounded-md px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-ring ${
              librariesActive
                ? "text-sidebar-primary bg-sidebar-primary/8"
                : "text-sidebar-foreground/90"
            }`}
            aria-expanded={librariesOpen}
            aria-controls="mobile-libraries-panel"
            onClick={() => setLibrariesOpen((open) => !open)}
          >
            <Library className="w-5 h-5" aria-hidden />
            <span className="flex items-center gap-1 leading-3">
              Libraries
              <ChevronDown
                className={`h-3 w-3 transition-transform ${
                  librariesOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </span>
          </button>
        </div>
        <div
          id="mobile-libraries-panel"
          hidden={!librariesOpen}
          className="border-t border-sidebar-border pt-2"
        >
          <div className="grid grid-cols-2 gap-2">
            {libraryItems.map((it) => {
              const Icon = it.icon;
              const active = isActive(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sidebar-ring ${
                    active
                      ? "text-sidebar-primary bg-sidebar-primary/8"
                      : "text-sidebar-foreground/90"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
