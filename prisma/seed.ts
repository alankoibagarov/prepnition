import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";

const DEMO_PASSWORD = "password";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function seed() {
  // Clear existing data
  await prisma.session.deleteMany();
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
        status: "COMPLETED",
        notes: "Onsite, focused on React and accessibility.",
        score: 8,
      },
      {
        userId: demoUser.id,
        title: "Backend Coding Challenge",
        company: "Beta Inc",
        companyUrl: "https://www.beta.com",
        position: "Backend Engineer",
        scheduledAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "PLANNED",
        notes: "Take-home challenge",
        score: null,
      },
      {
        userId: demoUser.id,
        title: "Product Engineer Screen",
        company: "Gamma Labs",
        position: "Product Engineer",
        scheduledAt: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "SCHEDULED",
        notes: "30m phone screen.",
        score: null,
      },
      {
        userId: demoUser.id,
        title: "Data Engineer Interview",
        company: "Delta Data",
        position: "Data Engineer",
        scheduledAt: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "PLANNED",
        notes: "SQL & ETL topics.",
        score: null,
      },
      {
        userId: demoUser.id,
        title: "Mobile Engineer Pairing",
        company: "Epsilon Mobile",
        position: "Mobile Engineer",
        scheduledAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "COMPLETED",
        notes: "Pairing exercise on iOS.",
        score: 7,
      },
      {
        userId: demoUser.id,
        title: "DevOps Interview",
        company: "Zeta Ops",
        position: "DevOps Engineer",
        scheduledAt: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "SCHEDULED",
        notes: "Kubernetes and infra.",
        score: null,
      },
      {
        userId: demoUser.id,
        title: "Fullstack Take-home",
        company: "Theta Works",
        position: "Fullstack Engineer",
        scheduledAt: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "PLANNED",
        notes: "48h take-home project.",
        score: null,
      },
      {
        userId: demoUser.id,
        title: "Security Interview",
        company: "Iota Secure",
        position: "Security Engineer",
        scheduledAt: new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: "PLANNED",
        notes: "Threat modeling discussion.",
        score: null,
      },
      {
        userId: demoUser.id,
        title: "SRE Culture Fit",
        company: "Kappa Reliability",
        position: "SRE",
        scheduledAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: "COMPLETED",
        notes: "Culture fit and incident response.",
        score: 6,
      },
      {
        userId: demoUser.id,
        title: "Engineering Manager Interview",
        company: "Lambda Lead",
        position: "Engineering Manager",
        scheduledAt: new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: "SCHEDULED",
        notes: "Leadership and org design.",
        score: null,
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
      const statuses: Array<any> = [
        "PLANNED",
        "SCHEDULED",
        "COMPLETED",
        "CANCELLED",
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
        const score = status === "COMPLETED" ? 6 + (i % 4) : null;
        out.push({
          userId,
          title,
          company,
          position,
          scheduledAt,
          status,
          notes: `Auto-generated seed interview #${i + 1}`,
          score,
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
      const statuses: Array<any> = [
        "PLANNED",
        "SCHEDULED",
        "COMPLETED",
        "CANCELLED",
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
        const score = status === "COMPLETED" ? 6 + (i % 4) : null;
        out.push({
          userId,
          title,
          company,
          position,
          scheduledAt,
          status,
          notes: `Auto-generated admin seed interview #${i + 1}`,
          score,
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
