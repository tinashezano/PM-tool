import type { DealPriority } from "@/lib/constants";

const STYLES: Record<DealPriority, string> = {
  low: "bg-sky-50 text-sky-700 border-sky-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
};

const LABELS: Record<DealPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function PriorityBadge({ priority }: { priority: DealPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-medium leading-none ${STYLES[priority]}`}
    >
      {LABELS[priority]}
    </span>
  );
}
