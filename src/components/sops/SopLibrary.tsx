"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, BookOpen, FileText } from "lucide-react";
import { formatDate, initials } from "@/lib/constants";
import type { SopDTO } from "@/lib/types";
import { NewSopModal } from "./NewSopModal";

export function SopLibrary({ initialSops }: { initialSops: SopDTO[] }) {
  const [sops, setSops] = useState<SopDTO[]>(initialSops);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(sops.map((s) => s.category));
    return Array.from(set).sort();
  }, [sops]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sops.filter((s) => {
      if (category && s.category !== category) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        (s.summary ?? "").toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q)
      );
    });
  }, [sops, search, category]);

  async function createSop(payload: {
    title: string;
    category: string;
    summary?: string;
    content: string;
  }) {
    const res = await fetch("/api/sops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("failed to create sop");
    const { sop } = await res.json();
    setSops((current) => [sop, ...current]);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <BookOpen size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">SOP Library</h1>
            <p className="text-sm text-muted">
              {sops.length} procedure{sops.length === 1 ? "" : "s"} the firm follows, in one place.
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-[13px] font-medium text-white hover:opacity-90"
        >
          <Plus size={15} /> New SOP
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SOPs…"
            className="w-full rounded-md border border-line bg-surface py-1.5 pl-8 pr-3 text-[13px] text-ink outline-none focus:border-accent"
          />
        </div>
        <button
          onClick={() => setCategory(null)}
          className={`rounded-full px-3 py-1 text-[12px] font-medium ${
            category === null ? "bg-ink text-white" : "bg-line-soft text-ink-soft hover:bg-line"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium ${
              category === c ? "bg-ink text-white" : "bg-line-soft text-ink-soft hover:bg-line"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">
          No SOPs match. Try a different search, or{" "}
          <button onClick={() => setModalOpen(true)} className="font-medium text-accent underline">
            add one
          </button>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sop) => (
            <Link
              key={sop.id}
              href={`/sop-library/${sop.id}`}
              className="group flex flex-col rounded-lg border border-line bg-surface p-4 shadow-sm transition-all hover:border-accent-soft-line hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-medium text-accent-ink">
                  {sop.category}
                </span>
                {sop.status === "draft" && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-medium text-amber-700">
                    Draft
                  </span>
                )}
              </div>
              <div className="mb-1.5 flex items-start gap-2">
                <FileText size={15} className="mt-0.5 shrink-0 text-muted" />
                <h3 className="text-[13.5px] font-semibold text-ink group-hover:text-accent-ink">
                  {sop.title}
                </h3>
              </div>
              {sop.summary && (
                <p className="mb-3 line-clamp-2 flex-1 text-[12.5px] text-ink-soft">{sop.summary}</p>
              )}
              <div className="mt-auto flex items-center justify-between border-t border-line-soft pt-2.5 text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  {sop.owner && (
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
                      style={{ backgroundColor: sop.owner.avatarColor }}
                    >
                      {initials(sop.owner.name)}
                    </span>
                  )}
                  {sop.owner?.name ?? "Unassigned"}
                </span>
                <span>Updated {formatDate(sop.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {modalOpen && <NewSopModal onClose={() => setModalOpen(false)} onCreate={createSop} />}
    </div>
  );
}
