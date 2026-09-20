"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { EMPLOYEE_ROLES, type EmployeeRole } from "@/lib/constants";

export function AddEmployeeModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    email: string;
    role: EmployeeRole;
    startDate?: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<EmployeeRole>("staff");
  const [startDate, setStartDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        name: name.trim(),
        email: email.trim(),
        role,
        startDate: startDate || undefined,
      });
      onClose();
    } catch {
      setError("Couldn't add this person. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink">Add team member</h2>
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
            <label htmlFor="emp-name" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
              Full name
            </label>
            <input
              id="emp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="emp-email" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
              Email
            </label>
            <input
              id="emp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="emp-role" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
                Role
              </label>
              <select
                id="emp-role"
                value={role}
                onChange={(e) => setRole(e.target.value as EmployeeRole)}
                className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              >
                {EMPLOYEE_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="emp-start" className="mb-1 block text-[12.5px] font-medium text-ink-soft">
                Start date
              </label>
              <input
                id="emp-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          <p className="text-[12px] text-muted">
            New team members start in <strong className="text-ink-soft">Onboarding</strong> — the
            standard onboarding checklist is applied automatically.
          </p>

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
              {submitting ? "Adding…" : "Add & start onboarding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
