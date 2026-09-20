import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sops = await prisma.sop.findMany({
    orderBy: { updatedAt: "desc" },
    include: { owner: true },
  });
  return NextResponse.json({ sops });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!title || !category || !content) {
    return NextResponse.json(
      { error: "title, category and content are required" },
      { status: 400 }
    );
  }

  const sop = await prisma.sop.create({
    data: {
      title,
      category,
      content,
      summary: typeof body.summary === "string" ? body.summary.trim() || null : null,
      status: body.status === "draft" ? "draft" : "published",
      ownerId: body.ownerId || null,
    },
    include: { owner: true },
  });

  return NextResponse.json({ sop }, { status: 201 });
}
