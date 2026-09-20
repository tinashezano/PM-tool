"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { SOP_CATEGORIES } from "@/lib/constants";

export function NewSopModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    category: string;
    summary?: string;
    content: string;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(SOP_CATEGORIES[0]);
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and procedure steps are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        title: title.trim(),
        category,
        summary: summary.trim() || undefined,
        content: content.trim(),
      });
      onClose();
    } catch {
      setError("Couldn't save the SOP. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4">
      <div className="w-full max-w-lg rounded-xl border border-line bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink">New SOP</h2>
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
            <label htmlFor="sop-title" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
              Title
            </label>
            <input
              id="sop-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New client onboarding checklist"
              className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="sop-category" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
              Category
            </label>
            <select
              id="sop-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              {SOP_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sop-summary" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
              One-line summary
            </label>
            <input
              id="sop-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What this procedure is for, in a sentence"
              className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="sop-content" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
              Procedure steps
            </label>
            <textarea
              id="sop-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder={"1. First step\n2. Next step\n3. ..."}
              className="w-full resize-y rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
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
              {submitting ? "Saving…" : "Save SOP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
