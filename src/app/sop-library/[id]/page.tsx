import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate, initials } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sop = await prisma.sop.findUnique({ where: { id }, include: { owner: true } });

  if (!sop) notFound();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Link
        href="/sop-library"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> SOP Library
      </Link>

      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent-ink">
            {sop.category}
          </span>
          {sop.status === "draft" && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
              Draft
            </span>
          )}
        </div>

        <div className="mb-2 flex items-start gap-2.5">
          <FileText size={22} className="mt-1 shrink-0 text-accent" />
          <h1 className="text-2xl font-semibold text-ink">{sop.title}</h1>
        </div>

        {sop.summary && <p className="mb-4 text-[15px] text-ink-soft">{sop.summary}</p>}

        <div className="mb-6 flex items-center gap-2 border-b border-line pb-4 text-[12.5px] text-muted">
          {sop.owner && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ backgroundColor: sop.owner.avatarColor }}
            >
              {initials(sop.owner.name)}
            </span>
          )}
          <span>{sop.owner?.name ?? "Unassigned"}</span>
          <span>·</span>
          <span>Updated {formatDate(sop.updatedAt)}</span>
        </div>

        <div className="rounded-lg border border-line bg-surface p-5">
          <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-ink-soft">
            {sop.content}
          </pre>
        </div>
      </div>
    </div>
  );
}
