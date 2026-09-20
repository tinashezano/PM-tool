import { prisma } from "@/lib/prisma";
import { SopLibrary } from "@/components/sops/SopLibrary";
import type { SopDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SopLibraryPage() {
  const rows = await prisma.sop.findMany({
    orderBy: { updatedAt: "desc" },
    include: { owner: true },
  });

  const sops: SopDTO[] = rows.map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    summary: s.summary,
    content: s.content,
    status: s.status as "draft" | "published",
    ownerId: s.ownerId,
    owner: s.owner
      ? { id: s.owner.id, name: s.owner.name, avatarColor: s.owner.avatarColor }
      : null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <SopLibrary initialSops={sops} />;
}
