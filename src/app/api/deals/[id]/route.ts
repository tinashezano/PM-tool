import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEAL_STAGES } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) {
    return NextResponse.json({ error: "deal not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.companyName === "string") data.companyName = body.companyName;
  if (typeof body.contactName === "string") data.contactName = body.contactName;
  if (["low", "medium", "high"].includes(body.priority)) data.priority = body.priority;
  if (Number.isFinite(body.valueCents)) data.valueCents = Math.max(0, Math.round(body.valueCents));
  if (Number.isFinite(body.winProbability)) data.winProbability = body.winProbability;
  if (Number.isFinite(body.stageOrder)) data.stageOrder = body.stageOrder;

  let movedToOnboarding = false;
  if (typeof body.stage === "string" && DEAL_STAGES.some((s) => s.id === body.stage)) {
    data.stage = body.stage;
    movedToOnboarding = body.stage === "onboarding" && deal.stage !== "onboarding";
    if (!Number.isFinite(body.stageOrder)) {
      const lastInStage = await prisma.deal.findFirst({
        where: { stage: body.stage, NOT: { id } },
        orderBy: { stageOrder: "desc" },
      });
      data.stageOrder = (lastInStage?.stageOrder ?? -1) + 1;
    }
  }

  const updated = await prisma.deal.update({
    where: { id },
    data,
    include: { owner: true },
  });

  if (movedToOnboarding) {
    const existingClient = await prisma.client.findUnique({ where: { dealId: id } });
    if (!existingClient) {
      await prisma.client.create({
        data: {
          dealId: id,
          name: updated.companyName || updated.title,
          billingContact: updated.contactName,
          accountManagerId: updated.ownerId,
          status: "active",
        },
      });
      await prisma.integrationEvent.create({
        data: {
          source: "pm-tool",
          eventType: "deal.moved_to_onboarding",
          payload: JSON.stringify({ dealId: id }),
          processedStatus: "processed",
        },
      });
    }
  }

  return NextResponse.json({ deal: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.deal.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
