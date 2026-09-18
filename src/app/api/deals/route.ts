import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEAL_STAGES } from "@/lib/constants";

export async function GET() {
  const deals = await prisma.deal.findMany({
    orderBy: [{ stage: "asc" }, { stageOrder: "asc" }],
    include: { owner: true },
  });
  return NextResponse.json({ deals });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const stage = DEAL_STAGES.some((s) => s.id === body.stage) ? body.stage : "new_enquiry";

  const lastInStage = await prisma.deal.findFirst({
    where: { stage },
    orderBy: { stageOrder: "desc" },
  });

  const deal = await prisma.deal.create({
    data: {
      title,
      companyName: body.companyName || null,
      contactName: body.contactName || null,
      contactEmail: body.contactEmail || null,
      contactPhone: body.contactPhone || null,
      valueCents: Number.isFinite(body.valueCents) ? Math.max(0, Math.round(body.valueCents)) : 0,
      winProbability: Number.isFinite(body.winProbability) ? body.winProbability : 20,
      priority: ["low", "medium", "high"].includes(body.priority) ? body.priority : "low",
      source: body.source || "manual",
      stage,
      stageOrder: (lastInStage?.stageOrder ?? -1) + 1,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      ownerId: body.ownerId || null,
    },
    include: { owner: true },
  });

  return NextResponse.json({ deal }, { status: 201 });
}
