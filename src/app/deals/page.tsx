import { prisma } from "@/lib/prisma";
import { DealsBoard } from "@/components/deals/DealsBoard";
import type { DealDTO } from "@/lib/types";
import type { DealPriority, DealStage } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const rows = await prisma.deal.findMany({
    orderBy: [{ stage: "asc" }, { stageOrder: "asc" }],
    include: { owner: true },
  });

  const deals: DealDTO[] = rows.map((d) => ({
    id: d.id,
    title: d.title,
    companyName: d.companyName,
    contactName: d.contactName,
    contactEmail: d.contactEmail,
    contactPhone: d.contactPhone,
    valueCents: d.valueCents,
    winProbability: d.winProbability,
    priority: d.priority as DealPriority,
    source: d.source,
    stage: d.stage as DealStage,
    stageOrder: d.stageOrder,
    proposalCount: d.proposalCount,
    dueDate: d.dueDate ? d.dueDate.toISOString() : null,
    ownerId: d.ownerId,
    owner: d.owner
      ? { id: d.owner.id, name: d.owner.name, avatarColor: d.owner.avatarColor }
      : null,
    createdAt: d.createdAt.toISOString(),
  }));

  return <DealsBoard initialDeals={deals} />;
}
