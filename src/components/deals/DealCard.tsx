"use client";

import type { DragEvent } from "react";
import { Building2, CheckCircle2, PhoneCall } from "lucide-react";
import { formatCurrency, formatDate, initials } from "@/lib/constants";
import type { DealDTO } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";

function isDueSoon(dueDate: string | null) {
  if (!dueDate) return false;
  const diffDays = (new Date(dueDate).getTime() - Date.now()) / 86400000;
  return diffDays <= 5;
}

export function DealCard({
  deal,
  onDragStart,
  onOpen,
}: {
  deal: DealDTO;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onOpen: () => void;
}) {
  const dueSoon = isDueSoon(deal.dueDate);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      className="group cursor-grab rounded-lg border border-line bg-surface p-3 shadow-sm transition-all hover:border-accent-soft-line hover:shadow-md active:cursor-grabbing"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <PriorityBadge priority={deal.priority} />
        <span className="text-[10.5px] text-muted">{formatDate(deal.createdAt)}</span>
      </div>

      <div className="mb-1 text-[13.5px] font-semibold text-ink">{deal.title}</div>
      <div className="mb-2 text-[12px] text-ink-soft">{formatCurrency(deal.valueCents)}</div>

      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-line-soft px-2 py-0.5 text-[10.5px] font-medium text-ink-soft">
          WIN {deal.winProbability}%
        </span>
      </div>

      {deal.companyName && (
        <div className="mb-1.5 flex items-center gap-1.5 text-[12px] text-ink-soft">
          <Building2 size={13} className="shrink-0 text-muted" />
          <span className="truncate">{deal.companyName}</span>
        </div>
      )}

      {deal.contactName && (
        <div className="mb-2.5 flex items-center gap-1.5 text-[12px] text-ink-soft">
          <span
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
            style={{ backgroundColor: deal.owner?.avatarColor ?? "#2F6F5A" }}
          >
            {initials(deal.contactName)}
          </span>
          <span className="truncate">{deal.contactName}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line-soft pt-2 text-[11px]">
        <span className="flex items-center gap-1 text-muted">
          <CheckCircle2 size={13} className={deal.proposalCount > 0 ? "text-accent" : "text-line"} />
          {deal.proposalCount > 0 ? `${deal.proposalCount} proposal` : "No proposal"}
        </span>
        {deal.dueDate && (
          <span
            className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium ${
              dueSoon ? "bg-warn-soft text-warn" : "text-muted"
            }`}
          >
            <PhoneCall size={12} />
            {formatDate(deal.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
