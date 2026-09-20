"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users2 } from "lucide-react";
import { EMPLOYEE_ROLES, formatDate, initials, type EmployeeRole } from "@/lib/constants";
import type { EmployeeDTO } from "@/lib/types";
import { AddEmployeeModal } from "./AddEmployeeModal";

const STATUS_STYLES: Record<string, string> = {
  invited: "bg-sky-50 text-sky-700",
  onboarding: "bg-amber-50 text-amber-700",
  active: "bg-accent-soft text-accent-ink",
  offboarded: "bg-line-soft text-muted",
};

function roleLabel(role: EmployeeRole) {
  return EMPLOYEE_ROLES.find((r) => r.id === role)?.label ?? role;
}

export function PeopleDirectory({ initialEmployees }: { initialEmployees: EmployeeDTO[] }) {
  const [employees, setEmployees] = useState<EmployeeDTO[]>(initialEmployees);
  const [modalOpen, setModalOpen] = useState(false);

  async function createEmployee(payload: {
    name: string;
    email: string;
    role: EmployeeRole;
    startDate?: string;
  }) {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("failed to create employee");
    const { employee } = await res.json();
    setEmployees((current) => [employee, ...current]);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Users2 size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Team Directory</h1>
            <p className="text-sm text-muted">
              {employees.length} people at the firm.{" "}
              <Link href="/people/onboarding" className="text-accent underline">
                View onboarding
              </Link>
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-[13px] font-medium text-white hover:opacity-90"
        >
          <Plus size={15} /> Add team member
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-line-soft text-left text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Manager</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Start date</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-b border-line-soft last:border-0 hover:bg-line-soft/40">
                <td className="px-4 py-3">
                  <Link href={`/people/${e.id}`} className="flex items-center gap-2.5">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                      style={{ backgroundColor: e.avatarColor }}
                    >
                      {initials(e.name)}
                    </span>
                    <span>
                      <span className="block font-medium text-ink">{e.name}</span>
                      <span className="block text-[11.5px] text-muted">{e.email}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">{roleLabel(e.role)}</td>
                <td className="px-4 py-3 text-ink-soft">{e.manager?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[e.status]}`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(e.startDate) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && <AddEmployeeModal onClose={() => setModalOpen(false)} onCreate={createEmployee} />}
    </div>
  );
}
