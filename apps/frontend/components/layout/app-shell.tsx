"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { apiClient } from "@/lib/api/client";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

const navigation = [
  { href: "/app", label: "Home", match: "/app" },
  { href: "/supplements", label: "Supplements", match: "/supplements" },
  { href: "/analyses/history", label: "Analyses", match: "/analyses" },
  { href: "/support/inquiries", label: "Support", match: "/support" },
];

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen, toggleMobileNav } = useUiStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await apiClient("/api/v1/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white lg:hidden"
              onClick={toggleMobileNav}
              type="button"
            >
              메뉴
            </button>
            <Link href="/app" className="text-xl font-semibold tracking-tight text-white">
              WellTrack
            </Link>
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/supplements/new/manual"
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Quick Register
            </Link>
            <Link
              href="/analyses/new/preview"
              className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Start Analysis
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">{user.email}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {user.role} / {user.status}
              </p>
            </div>
            <button
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              disabled={isLoggingOut}
              onClick={handleLogout}
              type="button"
            >
              {isLoggingOut ? "로그아웃 중..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 w-72 border-r border-white/10 bg-slate-950/95 p-6 transition lg:static lg:w-auto lg:border-r-0 lg:bg-transparent lg:p-0",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Navigation
            </span>
            <button
              className="rounded-full border border-white/10 px-3 py-2 text-xs text-white"
              onClick={() => setMobileNavOpen(false)}
              type="button"
            >
              닫기
            </button>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.match}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-white text-slate-950"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {mobileNavOpen ? (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-10 bg-slate-950/50 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
            type="button"
          />
        ) : null}

        <main className="relative z-0 min-w-0">{children}</main>
      </div>
    </div>
  );
}
