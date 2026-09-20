const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const isLocalSqlite = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:');
let prisma;
if (isLocalSqlite) {
  const dbPath = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace('file:', '')
    : path.resolve(__dirname, '..', 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

async function main() {
  const count = await prisma.user.count();
  console.log('Total Users:', count);
}

main()
  .catch(e => console.error('Error:', e))
  .finally(() => prisma.$disconnect());
