import { prisma } from "../lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
    }
  });
  console.log("Users in database:");
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
