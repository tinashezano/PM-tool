import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Inbound lead intake — PRD step 1 ("Lead submits enquiry").
 * Point the website enquiry form (directly, or via Zapier/Make) at this
 * endpoint. Every call is logged to IntegrationEvent before the Deal is
 * created, so a bad payload is still auditable.
 *
 * Expected JSON body:
 * { name, email, phone?, company?, message?, source? }
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  let body: Record<string, unknown> = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    await prisma.integrationEvent.create({
      data: {
        source: "lead-intake",
        eventType: "lead.received",
        payload: raw.slice(0, 5000),
        processedStatus: "error:invalid_json",
      },
    });
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const event = await prisma.integrationEvent.create({
    data: {
      source: "lead-intake",
      eventType: "lead.received",
      payload: JSON.stringify(body).slice(0, 5000),
      processedStatus: "received",
    },
  });

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!name && !email) {
    await prisma.integrationEvent.update({
      where: { id: event.id },
      data: { processedStatus: "error:missing_name_or_email" },
    });
    return NextResponse.json(
      { error: "at least one of name or email is required" },
      { status: 400 }
    );
  }

  const lastInStage = await prisma.deal.findFirst({
    where: { stage: "new_enquiry" },
    orderBy: { stageOrder: "desc" },
  });

  const deal = await prisma.deal.create({
    data: {
      title: name ? `${name} — new enquiry` : `New enquiry — ${email}`,
      contactName: name || null,
      contactEmail: email || null,
      contactPhone: typeof body.phone === "string" ? body.phone : null,
      companyName: typeof body.company === "string" ? body.company : null,
      notes: typeof body.message === "string" ? body.message : null,
      source: "website_form",
      stage: "new_enquiry",
      stageOrder: (lastInStage?.stageOrder ?? -1) + 1,
      priority: "medium",
    },
  });

  await prisma.integrationEvent.update({
    where: { id: event.id },
    data: { processedStatus: `processed:deal:${deal.id}` },
  });

  return NextResponse.json({ deal }, { status: 201 });
}
