import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EMPLOYEE_ROLES, formatDate, initials } from "@/lib/constants";
import { OnboardingChecklist } from "@/components/people/OnboardingChecklist";
import type { OnboardingTaskDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  invited: "bg-sky-50 text-sky-700",
  onboarding: "bg-amber-50 text-amber-700",
  active: "bg-accent-soft text-accent-ink",
  offboarded: "bg-line-soft text-muted",
};

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = await prisma.user.findUnique({
    where: { id },
    include: { manager: true, onboardingTasks: { orderBy: { createdAt: "asc" } } },
  });

  if (!employee) notFound();

  const tasks: OnboardingTaskDTO[] = employee.onboardingTasks.map((t) => ({
    id: t.id,
    userId: t.userId,
    title: t.title,
    done: t.done,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
  }));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Link
        href="/people"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> Team Directory
      </Link>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ backgroundColor: employee.avatarColor }}
          >
            {initials(employee.name)}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-ink">{employee.name}</h1>
            <p className="text-[13px] text-muted">{employee.email}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLES[employee.status]}`}
              >
                {employee.status}
              </span>
              <span className="text-[11px] text-muted">
                {EMPLOYEE_ROLES.find((r) => r.id === employee.role)?.label ?? employee.role}
              </span>
              {employee.manager && (
                <span className="text-[11px] text-muted">· Reports to {employee.manager.name}</span>
              )}
            </div>
          </div>
        </div>

        {employee.startDate && (
          <p className="mb-5 text-[13px] text-ink-soft">
            Start date: <span className="font-medium text-ink">{formatDate(employee.startDate)}</span>
          </p>
        )}

        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
          Onboarding checklist
        </h2>
        <OnboardingChecklist initialTasks={tasks} />
      </div>
    </div>
  );
}
