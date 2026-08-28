import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { ApplicationStatus, PrismaClient } from "../generated/prisma/client";

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
      avatarUrl:
        "https://img.magnific.com/premium-psd/man-with-scarf-around-his-neck-black-square-left_1322068-25397.jpg?semt=ais_hybrid&w=740&q=80",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
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

  // Create demo applications for the demo users (keep the original 10 for the first demo user, then add extras)
  const demoUser = createdUsers[0];

  const demoProfile = {
    userId: demoUser.id,
  };

  const createdProfile = await prisma.candidateProfiles.create({
    data: demoProfile,
  });

  if (createdProfile) {
    // Original 10 mock applications for demo user (kept for backward compatibility)
    const now = Date.now();
    const applications = [
      {
        profileId: createdProfile.id,
        title: "Frontend Engineer Interview",
        company: "Acme Corp",
        companyUrl: "https://www.acme.com",
        position: "Frontend Engineer",
        scheduledAt: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: ApplicationStatus.CREATED,
        notes: "Onsite, focused on React and accessibility.",
      },
      {
        profileId: createdProfile.id,
        title: "Backend Coding Challenge",
        company: "Beta Inc",
        companyUrl: "https://www.beta.com",
        position: "Backend Engineer",
        scheduledAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: ApplicationStatus.CREATED,
        notes: "Take-home challenge",
      },
      {
        profileId: createdProfile.id,
        title: "Product Engineer Screen",
        company: "Gamma Labs",
        position: "Product Engineer",
        scheduledAt: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: ApplicationStatus.CREATED,
        notes: "30m phone screen.",
      },
      {
        profileId: createdProfile.id,
        title: "Data Engineer Interview",
        company: "Delta Data",
        position: "Data Engineer",
        scheduledAt: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: ApplicationStatus.CREATED,
        notes: "SQL & ETL topics.",
      },
      {
        profileId: createdProfile.id,
        title: "Mobile Engineer Pairing",
        company: "Epsilon Mobile",
        position: "Mobile Engineer",
        scheduledAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: ApplicationStatus.CREATED,
        notes: "Pairing exercise on iOS.",
      },
      {
        profileId: createdProfile.id,
        title: "DevOps Interview",
        company: "Zeta Ops",
        position: "DevOps Engineer",
        scheduledAt: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: ApplicationStatus.CREATED,
        notes: "Kubernetes and infra.",
      },
      {
        profileId: createdProfile.id,
        title: "Fullstack Take-home",
        company: "Theta Works",
        position: "Fullstack Engineer",
        scheduledAt: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: ApplicationStatus.CREATED,
        notes: "48h take-home project.",
      },
      {
        profileId: createdProfile.id,
        title: "Security Interview",
        company: "Iota Secure",
        position: "Security Engineer",
        scheduledAt: new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: ApplicationStatus.CREATED,
        notes: "Threat modeling discussion.",
      },
      {
        profileId: createdProfile.id,
        title: "SRE Culture Fit",
        company: "Kappa Reliability",
        position: "SRE",
        scheduledAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: ApplicationStatus.CREATED,
        notes: "Culture fit and incident response.",
      },
      {
        profileId: createdProfile.id,
        title: "Engineering Manager Interview",
        company: "Lambda Lead",
        position: "Engineering Manager",
        scheduledAt: new Date(now + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: ApplicationStatus.CREATED,
        notes: "Leadership and org design.",
      },
    ];

    await prisma.applications.createMany({ data: applications });
    console.log(`✓ Created demo applications for ${createdProfile.id}`);

    // Helper to generate N mock applications for a given user
    const generateMockApplicationsForUser = (
      profileId: string,
      count: number,
    ) => {
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
      const statuses: Array<ApplicationStatus> = [
        ApplicationStatus.CREATED,
        ApplicationStatus.APPLICATION,
        ApplicationStatus.SCREENING,
        ApplicationStatus.TECHNICAL,
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
          profileId,
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
    const extraForDemo = generateMockApplicationsForUser(createdProfile.id, 30);
    if (extraForDemo.length) {
      await prisma.applications.createMany({ data: extraForDemo });
      console.log(
        `✓ Created ${extraForDemo.length} extra demo applications for ${createdProfile.id}`,
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
