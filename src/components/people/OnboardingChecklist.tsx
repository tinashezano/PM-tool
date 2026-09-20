"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { formatDate } from "@/lib/constants";
import type { OnboardingTaskDTO } from "@/lib/types";

export function OnboardingChecklist({ initialTasks }: { initialTasks: OnboardingTaskDTO[] }) {
  const [tasks, setTasks] = useState<OnboardingTaskDTO[]>(initialTasks);

  async function toggle(task: OnboardingTaskDTO) {
    const nextDone = !task.done;
    setTasks((current) => current.map((t) => (t.id === task.id ? { ...t, done: nextDone } : t)));
    try {
      const res = await fetch(`/api/onboarding-tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: nextDone }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setTasks((current) => current.map((t) => (t.id === task.id ? { ...t, done: task.done } : t)));
    }
  }

  if (tasks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line p-4 text-center text-[13px] text-muted">
        No onboarding checklist on file for this person.
      </p>
    );
  }

  const done = tasks.filter((t) => t.done).length;
  const allDone = done === tasks.length;

  return (
    <div>
      {allDone && (
        <div className="mb-3 rounded-md bg-accent-soft px-3 py-2 text-[12.5px] font-medium text-accent-ink">
          All done — onboarding complete.
        </div>
      )}
      <div className="mb-3 flex items-center justify-between text-[12.5px] text-muted">
        <span>
          {done} of {tasks.length} complete
        </span>
        <span className="font-medium text-ink-soft">
          {Math.round((done / tasks.length) * 100)}%
        </span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-line-soft">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${(done / tasks.length) * 100}%` }}
        />
      </div>

      <ul className="space-y-1.5">
        {tasks.map((task) => (
          <li key={task.id}>
            <button
              onClick={() => toggle(task)}
              className="flex w-full items-center gap-2.5 rounded-md border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:border-accent-soft-line"
            >
              <span
                className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border ${
                  task.done ? "border-accent bg-accent text-white" : "border-line"
                }`}
                style={{ height: 18, width: 18 }}
              >
                {task.done && <Check size={12} strokeWidth={3} />}
              </span>
              <span className={`flex-1 text-[13px] ${task.done ? "text-muted line-through" : "text-ink"}`}>
                {task.title}
              </span>
              {task.dueDate && (
                <span className="text-[11px] text-muted">{formatDate(task.dueDate)}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
