const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables from .env.local
const envLocalPath = path.resolve(__dirname, '../.env.local');
let databaseUrl = 'file:./dev.db';

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\s]+)["']?/);
    if (match) {
      databaseUrl = match[1];
      break;
    }
  }
}

// If databaseUrl is the default neon placeholder, fallback to sqlite
if (databaseUrl.includes('user:password@host/dbname')) {
  databaseUrl = 'file:./dev.db';
}

console.log(`[DB Push] Using DATABASE_URL="${databaseUrl}"`);

try {
  // Execute prisma db push with DATABASE_URL set in env
  execSync('npx prisma db push', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl
    }
  });
  console.log('[DB Push] Database synchronized successfully!');
} catch (err) {
  console.error('[DB Push] Error executing prisma db push:', err.message);
  process.exit(1);
}
