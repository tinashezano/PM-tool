import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  if (typeof body.done !== "boolean") {
    return NextResponse.json({ error: "done (boolean) is required" }, { status: 400 });
  }

  const task = await prisma.onboardingTask
    .update({ where: { id }, data: { done: body.done } })
    .catch(() => null);

  if (!task) return NextResponse.json({ error: "not found" }, { status: 404 });

  const remaining = await prisma.onboardingTask.count({
    where: { userId: task.userId, done: false },
  });
  if (remaining === 0) {
    const employee = await prisma.user.findUnique({ where: { id: task.userId } });
    if (employee?.status === "onboarding") {
      await prisma.user.update({ where: { id: task.userId }, data: { status: "active" } });
      await prisma.integrationEvent.create({
        data: {
          source: "pm-tool",
          eventType: "employee.onboarding_completed",
          payload: JSON.stringify({ employeeId: task.userId }),
          processedStatus: "processed",
        },
      });
    }
  }

  return NextResponse.json({ task });
}
