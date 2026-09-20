import { prisma } from "./lib/prisma";

async function main() {
  const count = await prisma.user.count();
  console.log("Total Users:", count);
}

main()
  .catch((e) => {
    console.error("Error counting users:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
