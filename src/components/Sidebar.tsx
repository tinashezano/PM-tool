"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Play, Pause, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [tracking, setTracking] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 border-r border-line bg-surface transition-[width] duration-150 ${
        collapsed ? "w-[68px]" : "w-[248px]"
      }`}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-line">
        {!collapsed && (
          <Link href="/deals" className="flex items-center gap-2 font-semibold text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white text-sm font-bold">
              P
            </span>
            <span className="text-[15px] tracking-tight">PM Tool</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-muted hover:text-ink rounded-md p-1.5 hover:bg-line-soft transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {section.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href.split("?")[0] &&
                  (item.href.split("?")[0] !== "/deals" || !item.href.includes("view=table"));
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors ${
                        active
                          ? "bg-accent-soft text-accent-ink font-medium"
                          : "text-ink-soft hover:bg-line-soft hover:text-ink"
                      }`}
                    >
                      <Icon size={17} className={active ? "text-accent" : "text-muted group-hover:text-ink-soft"} />
                      {!collapsed && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                      {!collapsed && item.badge ? (
                        <span className="rounded-full bg-warn px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3 space-y-3">
        <button
          onClick={() => setTracking((t) => !t)}
          className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-[13px] font-mono transition-colors ${
            tracking
              ? "border-accent-soft-line bg-accent-soft text-accent-ink"
              : "border-line text-ink-soft hover:bg-line-soft"
          }`}
        >
          {tracking ? <Pause size={14} /> : <Play size={14} />}
          {!collapsed && <span>00:00:00</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2 px-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">
              TU
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-ink">Test User</div>
              <div className="truncate text-[11px] text-muted">org7@gmail.com</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
