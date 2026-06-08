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

  for (const user of demoUsers) {
    await prisma.user.create({
      data: user,
    });
    console.log(`✓ Created user: ${user.email}`);
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
