import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const sop = await prisma.sop.findUnique({ where: { id }, include: { owner: true } });
  if (!sop) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ sop });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.category === "string") data.category = body.category;
  if (typeof body.content === "string") data.content = body.content;
  if (typeof body.summary === "string") data.summary = body.summary;
  if (["draft", "published"].includes(body.status)) data.status = body.status;

  const sop = await prisma.sop
    .update({ where: { id }, data, include: { owner: true } })
    .catch(() => null);

  if (!sop) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ sop });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.sop.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
