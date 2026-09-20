import { defineConfig } from "prisma/config";
import fs from "fs";
import path from "path";

const DEFAULT_NEON_URL = "postgresql://neondb_owner:npg_e1rlbnEoDLA7@ep-raspy-cloud-azjlesj3.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
    return process.env.DATABASE_URL;
  }
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\s]+)["']?/);
      if (match && match[1]) {
        return match[1];
      }
    }
  }
  return DEFAULT_NEON_URL;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: getDatabaseUrl(),
  },
});
