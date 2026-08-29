import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import {
  ApplicationStatus,
  InterviewStatus,
  InterviewType,
  PrismaClient,
} from "../generated/prisma/client";

const DEMO_PASSWORD = "password";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function seed() {
  await prisma.user.deleteMany();
  await prisma.companies.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const demoUser = await prisma.user.create({
    data: {
      email: "user@demo.com",
      firstName: "Demo",
      lastName: "User",
      avatarUrl:
        "https://img.magnific.com/premium-psd/man-with-scarf-around-his-neck-black-square-left_1322068-25397.jpg?semt=ais_hybrid&w=740&q=80",
      passwordHash,
    },
  });
  console.log(`✓ Created user: ${demoUser.email}`);

  const demoProfile = await prisma.candidateProfiles.create({
    data: { userId: demoUser.id },
  });
  console.log(`✓ Created candidate profile: ${demoProfile.id}`);

  const companySeeds = [
    {
      name: "Acme Corp",
      url: "https://www.acme.com",
      jobs: [
        {
          title: "Frontend Engineer",
          description:
            "Build accessible React interfaces for Acme's customer portal.",
          location: "San Francisco, CA",
          salary: "$140k–$170k",
        },
        {
          title: "Engineering Manager",
          description: "Lead a product engineering team and shape org design.",
          location: "Remote",
          salary: "$180k–$210k",
        },
      ],
    },
    {
      name: "Beta Inc",
      url: "https://www.beta.com",
      jobs: [
        {
          title: "Backend Engineer",
          description:
            "Design APIs and data pipelines in a high-throughput backend.",
          location: "New York, NY",
          salary: "$150k–$180k",
        },
      ],
    },
    {
      name: "Gamma Labs",
      url: "https://www.gammalabs.io",
      jobs: [
        {
          title: "Product Engineer",
          description: "Ship full-stack features close to product and design.",
          location: "Austin, TX",
          salary: "$135k–$165k",
        },
      ],
    },
    {
      name: "Delta Data",
      url: "https://www.deltadata.io",
      jobs: [
        {
          title: "Data Engineer",
          description: "Own SQL, ETL, and warehouse reliability.",
          location: "Remote",
          salary: "$145k–$175k",
        },
      ],
    },
    {
      name: "Epsilon Mobile",
      url: "https://www.epsilonmobile.com",
      jobs: [
        {
          title: "Mobile Engineer",
          description: "Pair on iOS features and platform quality.",
          location: "Seattle, WA",
          salary: "$140k–$170k",
        },
      ],
    },
    {
      name: "Zeta Ops",
      url: "https://www.zetaops.com",
      jobs: [
        {
          title: "DevOps Engineer",
          description: "Kubernetes, CI, and production infrastructure.",
          location: "Denver, CO",
          salary: "$150k–$180k",
        },
      ],
    },
    {
      name: "Theta Works",
      url: "https://www.thetaworks.com",
      jobs: [
        {
          title: "Fullstack Engineer",
          description: "Own take-home-style product work end to end.",
          location: "Remote",
          salary: "$130k–$160k",
        },
      ],
    },
    {
      name: "Iota Secure",
      url: "https://www.iotasecure.com",
      jobs: [
        {
          title: "Security Engineer",
          description: "Threat modeling, reviews, and secure defaults.",
          location: "Boston, MA",
          salary: "$155k–$185k",
        },
      ],
    },
    {
      name: "Kappa Reliability",
      url: "https://www.kappareliability.com",
      jobs: [
        {
          title: "SRE",
          description: "Incident response, SLOs, and culture of reliability.",
          location: "Chicago, IL",
          salary: "$150k–$180k",
        },
      ],
    },
    {
      name: "Lambda Lead",
      url: "https://www.lambdalead.com",
      jobs: [
        {
          title: "Engineering Manager",
          description:
            "Leadership interviews covering org design and coaching.",
          location: "Remote",
          salary: "$175k–$205k",
        },
      ],
    },
  ] as const;

  const createdJobs: { id: string; title: string; companyName: string }[] = [];

  for (const company of companySeeds) {
    const created = await prisma.companies.create({
      data: {
        name: company.name,
        url: company.url,
        jobs: {
          create: company.jobs.map((job) => ({ ...job })),
        },
      },
      include: { jobs: true },
    });

    for (const job of created.jobs) {
      createdJobs.push({
        id: job.id,
        title: job.title,
        companyName: created.name,
      });
    }
  }
  console.log(
    `✓ Created ${companySeeds.length} companies and ${createdJobs.length} jobs`,
  );

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const applicationSeeds: {
    jobTitle: string;
    companyName: string;
    status: ApplicationStatus;
    appliedAt: Date | null;
    closedAt: Date | null;
    notes: string;
    interviews: {
      type: InterviewType;
      title: string;
      scheduledAt: Date | null;
      durationMinutes: number | null;
      status: InterviewStatus;
      notes: string;
    }[];
  }[] = [
    {
      jobTitle: "Frontend Engineer",
      companyName: "Acme Corp",
      status: ApplicationStatus.ACTIVE,
      appliedAt: new Date(now - 21 * day),
      closedAt: null,
      notes: "Onsite loop focused on React and accessibility.",
      interviews: [
        {
          type: InterviewType.HR,
          title: "Recruiter screen",
          scheduledAt: new Date(now - 18 * day),
          durationMinutes: 30,
          status: InterviewStatus.PASSED,
          notes: "Compensation aligned.",
        },
        {
          type: InterviewType.TECHNICAL,
          title: "Frontend Engineer Interview",
          scheduledAt: new Date(now - 14 * day),
          durationMinutes: 60,
          status: InterviewStatus.PASSED,
          notes: "Strong on accessibility.",
        },
        {
          type: InterviewType.MANAGERIAL,
          title: "Hiring manager",
          scheduledAt: new Date(now + 3 * day),
          durationMinutes: 45,
          status: InterviewStatus.SCHEDULED,
          notes: "Team fit conversation.",
        },
      ],
    },
    {
      jobTitle: "Backend Engineer",
      companyName: "Beta Inc",
      status: ApplicationStatus.ACTIVE,
      appliedAt: new Date(now - 5 * day),
      closedAt: null,
      notes: "Take-home challenge in progress.",
      interviews: [
        {
          type: InterviewType.TECHNICAL,
          title: "Backend Coding Challenge",
          scheduledAt: new Date(now + 7 * day),
          durationMinutes: 90,
          status: InterviewStatus.SCHEDULED,
          notes: "Take-home plus live review.",
        },
      ],
    },
    {
      jobTitle: "Product Engineer",
      companyName: "Gamma Labs",
      status: ApplicationStatus.DRAFT,
      appliedAt: null,
      closedAt: null,
      notes: "30m phone screen — not submitted yet.",
      interviews: [
        {
          type: InterviewType.HR,
          title: "Product Engineer Screen",
          scheduledAt: new Date(now + 2 * day),
          durationMinutes: 30,
          status: InterviewStatus.SCHEDULED,
          notes: "Informational screen.",
        },
      ],
    },
    {
      jobTitle: "Data Engineer",
      companyName: "Delta Data",
      status: ApplicationStatus.ACTIVE,
      appliedAt: new Date(now - 2 * day),
      closedAt: null,
      notes: "SQL & ETL topics.",
      interviews: [
        {
          type: InterviewType.TECHNICAL,
          title: "Data Engineer Interview",
          scheduledAt: new Date(now + 30 * day),
          durationMinutes: 60,
          status: InterviewStatus.SCHEDULED,
          notes: "Warehouse design.",
        },
      ],
    },
    {
      jobTitle: "Mobile Engineer",
      companyName: "Epsilon Mobile",
      status: ApplicationStatus.REJECTED,
      appliedAt: new Date(now - 20 * day),
      closedAt: new Date(now - 2 * day),
      notes: "Pairing exercise on iOS.",
      interviews: [
        {
          type: InterviewType.TECHNICAL,
          title: "Mobile Engineer Pairing",
          scheduledAt: new Date(now - 3 * day),
          durationMinutes: 75,
          status: InterviewStatus.FAILED,
          notes: "Missed a few platform APIs.",
        },
      ],
    },
    {
      jobTitle: "DevOps Engineer",
      companyName: "Zeta Ops",
      status: ApplicationStatus.ACTIVE,
      appliedAt: new Date(now - 8 * day),
      closedAt: null,
      notes: "Kubernetes and infra.",
      interviews: [
        {
          type: InterviewType.TECHNICAL,
          title: "DevOps Interview",
          scheduledAt: new Date(now + 3 * day),
          durationMinutes: 60,
          status: InterviewStatus.SCHEDULED,
          notes: "Cluster troubleshooting.",
        },
      ],
    },
    {
      jobTitle: "Fullstack Engineer",
      companyName: "Theta Works",
      status: ApplicationStatus.WITHDRAWN,
      appliedAt: new Date(now - 12 * day),
      closedAt: new Date(now - 1 * day),
      notes: "Withdrew after competing offer.",
      interviews: [
        {
          type: InterviewType.OTHER,
          title: "Fullstack Take-home",
          scheduledAt: new Date(now + 5 * day),
          durationMinutes: null,
          status: InterviewStatus.CANCELLED,
          notes: "48h take-home cancelled.",
        },
      ],
    },
    {
      jobTitle: "Security Engineer",
      companyName: "Iota Secure",
      status: ApplicationStatus.ACTIVE,
      appliedAt: new Date(now - 4 * day),
      closedAt: null,
      notes: "Threat modeling discussion.",
      interviews: [
        {
          type: InterviewType.TECHNICAL,
          title: "Security Interview",
          scheduledAt: new Date(now + 10 * day),
          durationMinutes: 60,
          status: InterviewStatus.SCHEDULED,
          notes: "STRIDE walkthrough.",
        },
        {
          type: InterviewType.BIAS,
          title: "Work-sample review",
          scheduledAt: new Date(now + 12 * day),
          durationMinutes: 45,
          status: InterviewStatus.SCHEDULED,
          notes: "Blind review of a past write-up.",
        },
      ],
    },
    {
      jobTitle: "SRE",
      companyName: "Kappa Reliability",
      status: ApplicationStatus.REJECTED,
      appliedAt: new Date(now - 15 * day),
      closedAt: new Date(now - 1 * day),
      notes: "Culture fit and incident response.",
      interviews: [
        {
          type: InterviewType.MANAGERIAL,
          title: "SRE Culture Fit",
          scheduledAt: new Date(now - 1 * day),
          durationMinutes: 45,
          status: InterviewStatus.MISSED,
          notes: "Candidate missed the call.",
        },
      ],
    },
    {
      jobTitle: "Engineering Manager",
      companyName: "Lambda Lead",
      status: ApplicationStatus.OFFER,
      appliedAt: new Date(now - 40 * day),
      closedAt: null,
      notes: "Leadership and org design — verbal offer.",
      interviews: [
        {
          type: InterviewType.HR,
          title: "Recruiter intro",
          scheduledAt: new Date(now - 35 * day),
          durationMinutes: 30,
          status: InterviewStatus.PASSED,
          notes: "Process overview.",
        },
        {
          type: InterviewType.MANAGERIAL,
          title: "Engineering Manager Interview",
          scheduledAt: new Date(now - 14 * day),
          durationMinutes: 60,
          status: InterviewStatus.PASSED,
          notes: "Strong org-design answers.",
        },
      ],
    },
    {
      jobTitle: "Engineering Manager",
      companyName: "Acme Corp",
      status: ApplicationStatus.DRAFT,
      appliedAt: null,
      closedAt: null,
      notes: "Considering a parallel EM track at Acme.",
      interviews: [],
    },
  ];

  let interviewCount = 0;

  for (const seedApp of applicationSeeds) {
    const job = createdJobs.find(
      (j) =>
        j.title === seedApp.jobTitle && j.companyName === seedApp.companyName,
    );
    if (!job) {
      throw new Error(
        `Missing job ${seedApp.jobTitle} at ${seedApp.companyName}`,
      );
    }

    const application = await prisma.applications.create({
      data: {
        profileId: demoProfile.id,
        jobId: job.id,
        status: seedApp.status,
        appliedAt: seedApp.appliedAt,
        closedAt: seedApp.closedAt,
        notes: seedApp.notes,
        interviews: {
          create: seedApp.interviews,
        },
        histories: {
          create: {
            userId: demoUser.id,
            action: "seeded",
            changes: {
              status: seedApp.status,
              jobId: job.id,
            },
          },
        },
      },
    });

    interviewCount += seedApp.interviews.length;
    console.log(`✓ Created application ${application.id} (${job.title})`);
  }

  console.log(
    `✓ Created ${applicationSeeds.length} applications and ${interviewCount} interviews`,
  );
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
