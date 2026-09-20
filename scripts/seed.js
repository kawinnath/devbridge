// Seed script to create a default admin user for DevBridge
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";

async function main() {
  const email = "admin@devbridge.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin user already exists.");
    return;
  }
  const password = await hashPassword("AdminPass123!");
  await prisma.user.create({
    data: {
      email,
      name: "Admin",
      password,
      role: "ADMIN",
      trustScore: 100,
      verificationBadge: true,
      profile: {
        create: {
          subscription: "PREMIUM",
        },
      },
    },
  });
  console.log("Admin user created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
