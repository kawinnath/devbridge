const Database = require('better-sqlite3');
const path = require('path');

// Determine the SQLite database file path (dev.db is at project root)
const dbPath = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace('file:', '')
  : path.resolve(__dirname, '..', 'prisma', 'dev.db');

const db = new Database(dbPath);
const row = db.prepare('SELECT COUNT(*) as count FROM "User"').get();
console.log('Total Users:', row.count);
