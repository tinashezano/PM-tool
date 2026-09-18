"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { DEAL_PRIORITIES, DEAL_STAGES, type DealPriority, type DealStage } from "@/lib/constants";

export function AddDealModal({
  initialStage,
  onClose,
  onCreate,
}: {
  initialStage: DealStage;
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    companyName?: string;
    contactName?: string;
    valueCents: number;
    priority: DealPriority;
    stage: DealStage;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [value, setValue] = useState("");
  const [priority, setPriority] = useState<DealPriority>("low");
  const [stage, setStage] = useState<DealStage>(initialStage);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Deal name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        title: title.trim(),
        companyName: companyName.trim() || undefined,
        contactName: contactName.trim() || undefined,
        valueCents: Math.round((parseFloat(value) || 0) * 100),
        priority,
        stage,
      });
      onClose();
    } catch {
      setError("Couldn't create the deal. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink">Add deal</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-line-soft hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div>
            <label htmlFor="deal-title" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
              Deal name
            </label>
            <input
              id="deal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nguyen Family Trust — tax return"
              className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="deal-company" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
                Company
              </label>
              <input
                id="deal-company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label htmlFor="deal-contact" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
                Contact
              </label>
              <input
                id="deal-contact"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="deal-value" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
                Value ($)
              </label>
              <input
                id="deal-value"
                type="number"
                min="0"
                step="1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label htmlFor="deal-priority" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
                Priority
              </label>
              <select
                id="deal-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as DealPriority)}
                className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              >
                {DEAL_PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="deal-stage" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
              Stage
            </label>
            <select
              id="deal-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as DealStage)}
              className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              {DEAL_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-[12.5px] text-rose-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3.5 py-2 text-[13px] font-medium text-ink-soft hover:bg-line-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-accent px-3.5 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
