import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from "@/lib/constants";

export async function GET() {
  const employees = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      manager: true,
      onboardingTasks: true,
    },
  });
  return NextResponse.json({ employees });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!name || !email) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 });
  }

  const role = EMPLOYEE_ROLES.some((r) => r.id === body.role) ? body.role : "staff";
  const status = EMPLOYEE_STATUSES.some((s) => s.id === body.status) ? body.status : "onboarding";

  const employee = await prisma.user.create({
    data: {
      name,
      email,
      role,
      status,
      startDate: body.startDate ? new Date(body.startDate) : null,
      managerId: body.managerId || null,
    },
  });

  if (status === "onboarding") {
    const template = await prisma.onboardingTemplate.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (template) {
      const taskTitles: string[] = JSON.parse(template.taskTitles);
      await prisma.onboardingTask.createMany({
        data: taskTitles.map((title) => ({
          userId: employee.id,
          templateId: template.id,
          title,
        })),
      });
      await prisma.integrationEvent.create({
        data: {
          source: "pm-tool",
          eventType: "employee.onboarding_started",
          payload: JSON.stringify({ employeeId: employee.id, templateId: template.id }),
          processedStatus: "processed",
        },
      });
    }
  }

  const withTasks = await prisma.user.findUnique({
    where: { id: employee.id },
    include: { manager: true, onboardingTasks: true },
  });

  return NextResponse.json({ employee: withTasks }, { status: 201 });
}
