"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { DEAL_STAGES, formatCurrency, type DealPriority, type DealStage } from "@/lib/constants";
import type { DealDTO } from "@/lib/types";
import { DealCard } from "./DealCard";
import { AddDealModal } from "./AddDealModal";

const STAGE_DOT: Record<DealStage, string> = {
  new_enquiry: "#6b7bd6",
  discovery_booked: "#3b82f6",
  discovery_completed: "#3b82f6",
  proposal_required: "#8b5cf6",
  proposal_sent: "#c8542a",
  onboarding: "#2f6f5a",
  won: "#2f6f5a",
  lost: "#94a3b8",
};

export function DealsBoard({ initialDeals }: { initialDeals: DealDTO[] }) {
  const [deals, setDeals] = useState<DealDTO[]>(initialDeals);
  const [search, setSearch] = useState("");
  const [dragDealId, setDragDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);
  const [modalStage, setModalStage] = useState<DealStage | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter((d) =>
      [d.title, d.companyName, d.contactName]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [deals, search]);

  const columns = useMemo(() => {
    return DEAL_STAGES.map((stage) => {
      const items = filtered
        .filter((d) => d.stage === stage.id)
        .sort((a, b) => a.stageOrder - b.stageOrder);
      const forecast = items.reduce((sum, d) => sum + d.valueCents, 0);
      return { ...stage, items, forecast };
    });
  }, [filtered]);

  const totalForecast = deals.reduce((sum, d) => sum + d.valueCents, 0);
  const stageShare = DEAL_STAGES.map((s) => ({
    id: s.id,
    count: deals.filter((d) => d.stage === s.id).length,
  }));
  const totalCount = deals.length || 1;

  async function moveDeal(dealId: string, toStage: DealStage) {
    const prevDeals = deals;
    setDeals((current) =>
      current.map((d) => (d.id === dealId ? { ...d, stage: toStage } : d))
    );
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: toStage }),
      });
      if (!res.ok) throw new Error("failed");
      const { deal } = await res.json();
      setDeals((current) => current.map((d) => (d.id === dealId ? deal : d)));
    } catch {
      setDeals(prevDeals);
    }
  }

  async function createDeal(payload: {
    title: string;
    companyName?: string;
    contactName?: string;
    valueCents: number;
    priority: DealPriority;
    stage: DealStage;
  }) {
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("failed to create deal");
    const { deal } = await res.json();
    setDeals((current) => [...current, deal]);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* header */}
      <div className="shrink-0 border-b border-line bg-surface px-6 pt-5 pb-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-ink">Deals</h1>
            <p className="text-sm text-muted">
              {deals.length} open deal{deals.length === 1 ? "" : "s"} · {formatCurrency(totalForecast)} forecast
            </p>
          </div>
          <button
            onClick={() => setModalStage("new_enquiry")}
            className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-[13px] font-medium text-white hover:opacity-90"
          >
            <Plus size={15} /> Add deal
          </button>
        </div>

        {/* stage share bar */}
        <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-line-soft">
          {stageShare.map((s) =>
            s.count > 0 ? (
              <div
                key={s.id}
                style={{
                  width: `${(s.count / totalCount) * 100}%`,
                  backgroundColor: STAGE_DOT[s.id],
                }}
                title={`${s.count} in ${s.id}`}
              />
            ) : null
          )}
        </div>

        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-line bg-background p-0.5 text-[13px]">
            <button className="rounded-md bg-surface px-3 py-1.5 font-medium text-ink shadow-sm">
              Kanban board
            </button>
            <button className="rounded-md px-3 py-1.5 text-muted hover:text-ink" disabled>
              Table list
            </button>
            <button className="rounded-md px-3 py-1.5 text-muted hover:text-ink" disabled>
              Reports
            </button>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="relative w-56">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search deals…"
                className="w-full rounded-md border border-line bg-background py-1.5 pl-8 pr-3 text-[13px] text-ink outline-none focus:border-accent"
              />
            </div>
            <button className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[13px] text-ink-soft hover:bg-line-soft">
              <SlidersHorizontal size={13} /> Filters
            </button>
            <button className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[13px] text-ink-soft hover:bg-line-soft">
              Recently added <ChevronDown size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* board */}
      <div className="flex flex-1 gap-4 overflow-x-auto p-6">
        {columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStage(col.id);
            }}
            onDragLeave={() => setDragOverStage((s) => (s === col.id ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverStage(null);
              const dealId = e.dataTransfer.getData("text/plain") || dragDealId;
              if (dealId) moveDeal(dealId, col.id);
              setDragDealId(null);
            }}
            className={`flex w-[268px] shrink-0 flex-col rounded-lg border bg-line-soft/40 transition-colors ${
              dragOverStage === col.id ? "border-accent-soft-line bg-accent-soft/60" : "border-transparent"
            }`}
          >
            <div className="px-3 pt-3 pb-2">
              <div className="mb-1 flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: STAGE_DOT[col.id] }}
                />
                <span className="text-[12.5px] font-semibold text-ink">{col.label}</span>
                <span className="text-[12px] text-muted">({col.items.length})</span>
              </div>
              <div className="text-[11px] text-muted">
                Forecast {formatCurrency(col.forecast)}
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-2">
              {col.items.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onOpen={() => {}}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", deal.id);
                    e.dataTransfer.effectAllowed = "move";
                    setDragDealId(deal.id);
                  }}
                />
              ))}
              {col.items.length === 0 && (
                <div className="rounded-md border border-dashed border-line px-3 py-6 text-center text-[12px] text-muted">
                  No deals
                </div>
              )}
            </div>

            <button
              onClick={() => setModalStage(col.id)}
              className="mx-3 mb-3 flex items-center justify-center gap-1 rounded-md border border-dashed border-line py-2 text-[12.5px] text-muted hover:border-accent-soft-line hover:bg-accent-soft hover:text-accent-ink"
            >
              <Plus size={13} /> Add
            </button>
          </div>
        ))}
      </div>

      {modalStage && (
        <AddDealModal
          initialStage={modalStage}
          onClose={() => setModalStage(null)}
          onCreate={createDeal}
        />
      )}
    </div>
  );
}
