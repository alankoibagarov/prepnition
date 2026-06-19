import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { InterviewStatus, PrismaClient } from "../generated/prisma/client";

const DEMO_PASSWORD = "password";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function seed() {
  // Clear existing data
  await prisma.user.deleteMany();

  // Create demo users
  const demoUsers = [
    {
      email: "user@demo.com".toLowerCase(),
      firstName: "Demo",
      lastName: "User",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      role: "user",
    },
    {
      email: "admin@demo.com".toLowerCase(),
      firstName: "Demo",
      lastName: "Admin",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      role: "admin",
    },
  ];

  const createdUsers = [] as any[];
  for (const user of demoUsers) {
    const created = await prisma.user.create({
      data: user,
    });
    createdUsers.push(created);
    console.log(`✓ Created user: ${user.email}`);
  }

  // Create demo interviews for the demo users (keep the original 10 for the first demo user, then add extras)
  const demoUser = createdUsers[0];
  const adminUser = createdUsers[1];

  if (demoUser) {
    // Original 10 mock interviews for demo user (kept for backward compatibility)
    const now = Date.now();
    const interviews = [
      {
        userId: demoUser.id,
        title: "Frontend Engineer Interview",
        company: "Acme Corp",
        companyUrl: "https://www.acme.com",
        position: "Frontend Engineer",
        scheduledAt: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: InterviewStatus.CREATED,
        notes: "Onsite, focused on React and accessibility.",
      },
      {
        userId: demoUser.id,
        title: "Backend Coding Challenge",
        company: "Beta Inc",
        companyUrl: "https://www.beta.com",
        position: "Backend Engineer",
        scheduledAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: InterviewStatus.CREATED,
        notes: "Take-home challenge",
      },
      {
        userId: demoUser.id,
        title: "Product Engineer Screen",
        company: "Gamma Labs",
        position: "Product Engineer",
        scheduledAt: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: InterviewStatus.CREATED,
        notes: "30m phone screen.",
      },
      {
        userId: demoUser.id,
        title: "Data Engineer Interview",
        company: "Delta Data",
        position: "Data Engineer",
        scheduledAt: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: InterviewStatus.CREATED,
        notes: "SQL & ETL topics.",
      },
      {
        userId: demoUser.id,
        title: "Mobile Engineer Pairing",
        company: "Epsilon Mobile",
        position: "Mobile Engineer",
        scheduledAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: InterviewStatus.CREATED,
        notes: "Pairing exercise on iOS.",
      },
      {
        userId: demoUser.id,
        title: "DevOps Interview",
        company: "Zeta Ops",
        position: "DevOps Engineer",
        scheduledAt: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: InterviewStatus.CREATED,
        notes: "Kubernetes and infra.",
      },
      {
        userId: demoUser.id,
        title: "Fullstack Take-home",
        company: "Theta Works",
        position: "Fullstack Engineer",
        scheduledAt: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: InterviewStatus.CREATED,
        notes: "48h take-home project.",
      },
      {
        userId: demoUser.id,
        title: "Security Interview",
        company: "Iota Secure",
        position: "Security Engineer",
        scheduledAt: new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: InterviewStatus.CREATED,
        notes: "Threat modeling discussion.",
      },
      {
        userId: demoUser.id,
        title: "SRE Culture Fit",
        company: "Kappa Reliability",
        position: "SRE",
        scheduledAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: InterviewStatus.CREATED,
        notes: "Culture fit and incident response.",
      },
      {
        userId: demoUser.id,
        title: "Engineering Manager Interview",
        company: "Lambda Lead",
        position: "Engineering Manager",
        scheduledAt: new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: InterviewStatus.CREATED,
        notes: "Leadership and org design.",
      },
    ];

    await prisma.interview.createMany({ data: interviews });
    console.log(`✓ Created demo interviews for ${demoUser.email}`);

    // Helper to generate N mock interviews for a given user
    const generateMockInterviewsForUser = (userId: string, count: number) => {
      const companies = [
        "Orion Tech",
        "Nebula Systems",
        "Vertex Labs",
        "Apex Solutions",
        "Summit Soft",
        "Pioneer AI",
        "Horizon Works",
        "Cobalt Corp",
        "Atlas Services",
        "Nimbus Inc",
      ];
      const positions = [
        "Frontend Engineer",
        "Backend Engineer",
        "Fullstack Engineer",
        "Data Engineer",
        "Mobile Engineer",
        "DevOps Engineer",
        "Security Engineer",
        "Product Engineer",
        "SRE",
        "Engineering Manager",
      ];
      const statuses: Array<InterviewStatus> = [
        InterviewStatus.CREATED,
        InterviewStatus.APPLICATION,
        InterviewStatus.SCREENING,
        InterviewStatus.TECHNICAL,
      ];
      const out: any[] = [];
      for (let i = 0; i < count; i++) {
        const company = companies[i % companies.length];
        const position = positions[i % positions.length];
        const title = `${position} Interview (${company})`;
        // spread dates across +/- 45 days
        const offsetDays = i - Math.floor(count / 2);
        const scheduledAt = new Date(
          now + offsetDays * 2 * 24 * 60 * 60 * 1000,
        ).toISOString();
        const status = statuses[i % statuses.length];
        out.push({
          userId,
          title,
          company,
          position,
          scheduledAt,
          status,
          notes: `Auto-generated seed interview #${i + 1}`,
        });
      }
      return out;
    };

    // Create 30 extra interviews for the demo user
    const extraForDemo = generateMockInterviewsForUser(demoUser.id, 30);
    if (extraForDemo.length) {
      await prisma.interview.createMany({ data: extraForDemo });
      console.log(
        `✓ Created ${extraForDemo.length} extra demo interviews for ${demoUser.email}`,
      );
    }
  }

  // Create 30 demo interviews for admin user as well
  if (adminUser) {
    const now = Date.now();
    const generateMockInterviewsForUser = (userId: string, count: number) => {
      const companies = [
        "Orion Tech",
        "Nebula Systems",
        "Vertex Labs",
        "Apex Solutions",
        "Summit Soft",
        "Pioneer AI",
        "Horizon Works",
        "Cobalt Corp",
        "Atlas Services",
        "Nimbus Inc",
      ];
      const positions = [
        "Frontend Engineer",
        "Backend Engineer",
        "Fullstack Engineer",
        "Data Engineer",
        "Mobile Engineer",
        "DevOps Engineer",
        "Security Engineer",
        "Product Engineer",
        "SRE",
        "Engineering Manager",
      ];
      const statuses: Array<InterviewStatus> = [
        InterviewStatus.CREATED,
        InterviewStatus.APPLICATION,
        InterviewStatus.SCREENING,
        InterviewStatus.TECHNICAL,
      ];
      const out: any[] = [];
      for (let i = 0; i < count; i++) {
        const company = companies[i % companies.length];
        const position = positions[i % positions.length];
        const title = `${position} Interview (${company})`;
        // spread dates across +/- 45 days
        const offsetDays = i - Math.floor(count / 2);
        const scheduledAt = new Date(
          now + offsetDays * 2 * 24 * 60 * 60 * 1000,
        ).toISOString();
        const status = statuses[i % statuses.length];
        out.push({
          userId,
          title,
          company,
          position,
          scheduledAt,
          status,
          notes: `Auto-generated admin seed interview #${i + 1}`,
        });
      }
      return out;
    };

    const extraForAdmin = generateMockInterviewsForUser(adminUser.id, 30);
    if (extraForAdmin.length) {
      await prisma.interview.createMany({ data: extraForAdmin });
      console.log(
        `✓ Created ${extraForAdmin.length} demo interviews for ${adminUser.email}`,
      );
    }
  }

  console.log("✓ Database seeded successfully");
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
