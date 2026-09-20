import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const name = process.argv[2] || "Admin User";
  const email = process.argv[3] || "admin@devbridge.com";
  const password = process.argv[4] || "admin123";

  console.log(`Seeding Admin: ${name} (${email})...`);

  // Ensure Admin table exists and create record
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Clean up existing admin with same email if exists
    const existing = await prisma.admin.findUnique({
      where: { email }
    });

    if (existing) {
      await prisma.admin.delete({
        where: { email }
      });
      console.log(`Deleted existing admin record for ${email}.`);
    }

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN"
      }
    });

    console.log(`✅ Admin created successfully: ID=${admin.id}`);
  } catch (err) {
    console.error("❌ Failed to seed admin:", err);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
