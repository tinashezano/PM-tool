import { prisma } from "@/lib/prisma";
import { PeopleDirectory } from "@/components/people/PeopleDirectory";
import type { EmployeeDTO } from "@/lib/types";
import type { EmployeeRole, EmployeeStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { manager: true },
  });

  const employees: EmployeeDTO[] = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatarColor: u.avatarColor,
    role: u.role as EmployeeRole,
    status: u.status as EmployeeStatus,
    startDate: u.startDate ? u.startDate.toISOString() : null,
    managerId: u.managerId,
    manager: u.manager
      ? { id: u.manager.id, name: u.manager.name, avatarColor: u.manager.avatarColor }
      : null,
    createdAt: u.createdAt.toISOString(),
  }));

  return <PeopleDirectory initialEmployees={employees} />;
}
