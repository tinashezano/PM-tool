import Link from "next/link";
import { UserPlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EMPLOYEE_ROLES, formatDate, initials } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const employees = await prisma.user.findMany({
    where: { status: "onboarding" },
    orderBy: { createdAt: "desc" },
    include: { onboardingTasks: true },
  });

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <UserPlus size={18} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-ink">Onboarding</h1>
          <p className="text-sm text-muted">
            {employees.length} new starter{employees.length === 1 ? "" : "s"} working through their
            checklist.
          </p>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">
          Nobody&rsquo;s onboarding right now. Add a team member from the{" "}
          <Link href="/people" className="font-medium text-accent underline">
            directory
          </Link>{" "}
          to start a checklist.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((e) => {
            const total = e.onboardingTasks.length;
            const done = e.onboardingTasks.filter((t) => t.done).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <Link
                key={e.id}
                href={`/people/${e.id}`}
                className="flex flex-col rounded-lg border border-line bg-surface p-4 shadow-sm transition-all hover:border-accent-soft-line hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                    style={{ backgroundColor: e.avatarColor }}
                  >
                    {initials(e.name)}
                  </span>
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink">{e.name}</div>
                    <div className="text-[11.5px] text-muted">
                      {EMPLOYEE_ROLES.find((r) => r.id === e.role)?.label ?? e.role}
                    </div>
                  </div>
                </div>

                <div className="mb-1.5 flex items-center justify-between text-[11.5px] text-muted">
                  <span>
                    {done} of {total} tasks done
                  </span>
                  <span className="font-medium text-ink-soft">{pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-line-soft">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {e.startDate && (
                  <div className="mt-3 border-t border-line-soft pt-2.5 text-[11px] text-muted">
                    Starts {formatDate(e.startDate)}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
