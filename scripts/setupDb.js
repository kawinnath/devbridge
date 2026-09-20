const fs = require('fs');
const path = require('path');

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Manually parse .env.local if it exists to get the DATABASE_URL
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\s]+)["']?/);
    if (match) {
      process.env.DATABASE_URL = match[1];
      break;
    }
  }
}

// Only use sqlite if DATABASE_URL explicitly starts with file:
const isLocalSqlite = 
  process.env.DATABASE_URL && 
  process.env.DATABASE_URL.startsWith('file:');

const expectedProvider = isLocalSqlite ? 'sqlite' : 'postgresql';

// Regex to find provider and datasource db block
const datasourceRegex = /datasource db\s*\{[\s\S]*?\}/;

const newDatasource = `datasource db {
  provider = "${expectedProvider}"
}`;

if (datasourceRegex.test(schemaContent)) {
  schemaContent = schemaContent.replace(datasourceRegex, newDatasource);
  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
  console.log(`[DB Setup] Updated datasource block with provider "${expectedProvider}"`);
} else {
  console.warn('[DB Setup] Could not find datasource db block in schema.prisma');
}
