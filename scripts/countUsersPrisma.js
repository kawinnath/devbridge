const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count();
    console.log('Total Users:', count);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('Error:', e);
});
