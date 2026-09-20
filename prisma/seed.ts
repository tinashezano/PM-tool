import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AVATAR_COLORS = ["#2F6F5A", "#9C5A1E", "#3B5BA5", "#7A4CA0", "#B0473E"];

async function main() {
  await prisma.task.deleteMany();
  await prisma.workItem.deleteMany();
  await prisma.client.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.engagementTemplate.deleteMany();
  await prisma.sop.deleteMany();
  await prisma.onboardingTask.deleteMany();
  await prisma.onboardingTemplate.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all(
    [
      { name: "Ravi Shah", email: "ravi@solepractice.example", role: "partner", status: "active" },
      { name: "Priya Nair", email: "priya@solepractice.example", role: "account_manager", status: "active" },
      { name: "Test User", email: "org7@gmail.com", role: "admin", status: "active" },
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

  const sops = [
    {
      title: "New client onboarding checklist",
      category: "Client Onboarding",
      summary: "What to do the moment a deal moves to Onboarding, end to end.",
      content:
        "1. Confirm the signed proposal and QuickBooks invoice are attached to the deal.\n" +
        "2. Create the client record in PM-Tool (auto-created when the deal reaches Onboarding).\n" +
        "3. Apply the matching engagement template to generate work items.\n" +
        "4. Send the client a welcome email with the document request list.\n" +
        "5. Set up the client in QuickBooks if they don't already exist.\n" +
        "6. Assign an account manager and confirm the first review date.",
      ownerId: ravi.id,
    },
    {
      title: "Individual tax return checklist",
      category: "Compliance & Tax",
      summary: "Standard steps for preparing and lodging an individual return.",
      content:
        "1. Collect prior year return and this year's source documents.\n" +
        "2. Reconcile income statements (PAYG, dividends, interest, rental).\n" +
        "3. Apply eligible deductions and check substantiation.\n" +
        "4. Prepare the draft return and run the ATO pre-lodgement check.\n" +
        "5. Send draft to the client for review and sign-off.\n" +
        "6. Lodge with the ATO and file the confirmation.",
      ownerId: priya.id,
    },
    {
      title: "Monthly bookkeeping close",
      category: "Bookkeeping",
      summary: "Month-end routine for clients on a recurring bookkeeping engagement.",
      content:
        "1. Reconcile all bank and credit card feeds.\n" +
        "2. Code uncategorised transactions.\n" +
        "3. Review and clear the suspense account.\n" +
        "4. Reconcile accounts receivable and payable.\n" +
        "5. Prepare month-end management reports.\n" +
        "6. Send reports to the client with a short commentary.",
      ownerId: priya.id,
    },
    {
      title: "Overdue invoice follow-up",
      category: "Billing & Collections",
      summary: "Escalation sequence for invoices unpaid past terms.",
      content:
        "1. Day 1 overdue: automated reminder email.\n" +
        "2. Day 7: personal email from the account manager.\n" +
        "3. Day 14: phone call and offer a payment plan if needed.\n" +
        "4. Day 30: partner review before any service pause.\n" +
        "5. Log every step in the client's notes.",
      ownerId: ravi.id,
    },
    {
      title: "New starter IT & access setup",
      category: "IT & Security",
      summary: "Accounts and access every new hire needs before day one.",
      content:
        "1. Create the Google Workspace account and add to the right groups.\n" +
        "2. Provision QuickBooks / Xero access at the correct permission level.\n" +
        "3. Add to PM-Tool with the correct role.\n" +
        "4. Issue a password manager seat and enforce MFA.\n" +
        "5. Confirm device and VPN setup with IT.",
      ownerId: testUser.id,
      status: "published",
    },
    {
      title: "Staff exit checklist",
      category: "HR & People",
      summary: "Draft — offboarding steps when someone leaves the firm.",
      content:
        "1. Confirm last working day and handover plan with their manager.\n" +
        "2. Reassign their open work items and client relationships.\n" +
        "3. Revoke Google Workspace, QuickBooks and PM-Tool access on their last day.\n" +
        "4. Collect any firm equipment.\n" +
        "5. Remove from payroll and update HR records.",
      ownerId: ravi.id,
      status: "draft",
    },
  ];

  await Promise.all(sops.map((s) => prisma.sop.create({ data: s })));

  const onboardingTemplate = await prisma.onboardingTemplate.create({
    data: {
      name: "Standard staff onboarding",
      taskTitles: JSON.stringify([
        "Sign employment contract",
        "Set up Google Workspace account",
        "Complete WHS & compliance induction",
        "Get QuickBooks / Xero access",
        "Shadow a client discovery call",
        "Meet the team",
      ]),
    },
  });

  const onboardingTaskTitles: string[] = JSON.parse(onboardingTemplate.taskTitles);

  const newStarter = await prisma.user.create({
    data: {
      name: "Jordan Lee",
      email: "jordan.lee@solepractice.example",
      avatarColor: AVATAR_COLORS[3],
      role: "staff",
      status: "onboarding",
      startDate: days(5),
      managerId: ravi.id,
    },
  });

  await Promise.all(
    onboardingTaskTitles.map((title, i) =>
      prisma.onboardingTask.create({
        data: {
          userId: newStarter.id,
          templateId: onboardingTemplate.id,
          title,
          done: i < 2,
        },
      })
    )
  );

  await prisma.user.create({
    data: {
      name: "Amina Farouk",
      email: "amina.farouk@solepractice.example",
      avatarColor: AVATAR_COLORS[4],
      role: "staff",
      status: "invited",
      startDate: days(14),
      managerId: priya.id,
    },
  });

  console.log(
    `Seeded ${users.length + 2} users, ${createdDeals.length} deals, 1 client, 1 work item, ${sops.length} SOPs, 1 onboarding checklist.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
