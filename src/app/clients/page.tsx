import { prisma } from "@/lib/prisma";
import { formatDate, initials } from "@/lib/constants";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { workItems: true },
  });

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Users size={18} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-ink">Clients</h1>
          <p className="text-sm text-muted">
            Clients created automatically once a deal is won in the pipeline.
          </p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">
          No clients yet. Move a deal to <strong className="text-ink">Onboarding</strong> in
          the pipeline to create one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-line-soft text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">Billing contact</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Work items</th>
                <th className="px-4 py-2.5 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">
                        {initials(c.name)}
                      </span>
                      <span className="font-medium text-ink">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{c.billingContact ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-ink">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{c.workItems.length}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
