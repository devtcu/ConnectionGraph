"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Graph" },
  { href: "/ingest", label: "Add a job" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link href="/" className="app-brand">
          <span className="app-brand-mark">CG</span>
          CareerGraph
        </Link>
        <nav className="app-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`app-nav-link${pathname === item.href ? " active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="app-sidebar-foot">Deterministic relevance scoring, evidence-cited discovery.</div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <span className="app-topbar-title">
            {NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "CareerGraph"}
          </span>
          <span className="app-topbar-pill">Local prototype</span>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
