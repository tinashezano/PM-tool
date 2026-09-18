import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AVATAR_COLORS = ["#2F6F5A", "#9C5A1E", "#3B5BA5", "#7A4CA0", "#B0473E"];

async function main() {
  await prisma.task.deleteMany();
  await prisma.workItem.deleteMany();
  await prisma.client.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.engagementTemplate.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all(
    [
      { name: "Ravi Shah", email: "ravi@solepractice.example" },
      { name: "Priya Nair", email: "priya@solepractice.example" },
      { name: "Test User", email: "org7@gmail.com" },
    ].map((u, i) =>
      prisma.user.create({ data: { ...u, avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length] } })
    )
  );
  const [ravi, priya, testUser] = users;

  const days = (n: number) => new Date(Date.now() + n * 86400000);

  const deals: {
    title: string;
    companyName?: string;
    contactName?: string;
    valueCents: number;
    winProbability: number;
    priority: "low" | "medium" | "high";
    stage: string;
    stageOrder: number;
    proposalCount: number;
    dueDate?: Date;
    ownerId: string;
  }[] = [
    { title: "ATM & Co import review", companyName: "A.T.M & CO PTY LTD", contactName: "Test User", valueCents: 0, winProbability: 23, priority: "low", stage: "new_enquiry", stageOrder: 0, proposalCount: 0, dueDate: days(11), ownerId: testUser.id },
    { title: "Quick bookkeeping setup", companyName: "Vardar Holdings", contactName: "Irina Shayk", valueCents: 2000, winProbability: 23, priority: "high", stage: "new_enquiry", stageOrder: 1, proposalCount: 1, dueDate: days(25), ownerId: ravi.id },
    { title: "PRA Co tax structuring", companyName: "PRA CO PTY LTD", contactName: "Test User", valueCents: 0, winProbability: 25, priority: "low", stage: "discovery_booked", stageOrder: 0, proposalCount: 0, dueDate: days(13), ownerId: testUser.id },
    { title: "Lilly - annual accounts", companyName: "PRA CO PTY LTD", contactName: "Test User", valueCents: 0, winProbability: 25, priority: "low", stage: "discovery_booked", stageOrder: 1, proposalCount: 0, dueDate: days(24), ownerId: testUser.id },
    { title: "Leo - new business setup", companyName: "PRA CO PTY LTD", contactName: "Test User", valueCents: 0, winProbability: 25, priority: "low", stage: "discovery_booked", stageOrder: 2, proposalCount: 0, dueDate: days(27), ownerId: testUser.id },
    { title: "Test deal - BAS lodgement", companyName: "J & E Company Co", contactName: "Test User", valueCents: 0, winProbability: 23, priority: "medium", stage: "discovery_completed", stageOrder: 0, proposalCount: 0, dueDate: days(2), ownerId: testUser.id },
    { title: "Jimmy - trust return", companyName: "THE TRUSTEE FOR NEW", contactName: "Test User", valueCents: 0, winProbability: 25, priority: "low", stage: "proposal_required", stageOrder: 0, proposalCount: 1, dueDate: days(30), ownerId: testUser.id },
    { title: "Sikaa deal - migration", companyName: "Sole Link", contactName: "Saurabh Sikka", valueCents: 0, winProbability: 55, priority: "high", stage: "proposal_required", stageOrder: 1, proposalCount: 0, dueDate: days(27), ownerId: priya.id },
    { title: "Yuvi - monthly bookkeeping", companyName: "THE TRUSTEE FOR NEW", contactName: "Test User", valueCents: 0, winProbability: 25, priority: "low", stage: "proposal_sent", stageOrder: 0, proposalCount: 1, dueDate: days(29), ownerId: testUser.id },
    { title: "Test Gaurav - annual review", companyName: "Sole Link", contactName: "Test User", valueCents: 10000, winProbability: 10, priority: "medium", stage: "proposal_sent", stageOrder: 1, proposalCount: 1, dueDate: days(2), ownerId: testUser.id },
  ];

  const createdDeals = await Promise.all(
    deals.map((d) => prisma.deal.create({ data: d }))
  );

  const wonDeal = createdDeals[createdDeals.length - 1];

  const template = await prisma.engagementTemplate.create({
    data: {
      name: "Annual Accounts + Tax Return",
      serviceLine: "Compliance",
      taskTitles: JSON.stringify([
        "Collect source documents",
        "Prepare financial statements",
        "Prepare tax return",
        "Client review & sign-off",
        "Lodge with ATO",
      ]),
    },
  });

  const client = await prisma.client.create({
    data: {
      dealId: wonDeal.id,
      name: wonDeal.companyName ?? wonDeal.title,
      billingContact: wonDeal.contactName,
      status: "active",
      accountManagerId: ravi.id,
    },
  });

  const taskTitles: string[] = JSON.parse(template.taskTitles);
  const workItem = await prisma.workItem.create({
    data: {
      clientId: client.id,
      templateId: template.id,
      title: template.name,
      status: "not_started",
      assigneeId: ravi.id,
      dueDate: days(21),
    },
  });

  await Promise.all(
    taskTitles.map((title) =>
      prisma.task.create({ data: { workItemId: workItem.id, title } })
    )
  );

  console.log(`Seeded ${users.length} users, ${createdDeals.length} deals, 1 client, 1 work item.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
