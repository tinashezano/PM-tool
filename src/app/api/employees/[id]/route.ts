import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EMPLOYEE_STATUSES } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const employee = await prisma.user.findUnique({
    where: { id },
    include: { manager: true, onboardingTasks: { orderBy: { createdAt: "asc" } } },
  });
  if (!employee) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ employee });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.role === "string") data.role = body.role;
  if (EMPLOYEE_STATUSES.some((s) => s.id === body.status)) data.status = body.status;
  if (typeof body.startDate === "string") data.startDate = new Date(body.startDate);

  const employee = await prisma.user
    .update({
      where: { id },
      data,
      include: { manager: true, onboardingTasks: true },
    })
    .catch(() => null);

  if (!employee) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ employee });
}
